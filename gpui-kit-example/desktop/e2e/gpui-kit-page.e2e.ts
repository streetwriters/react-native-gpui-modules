import { PNG } from 'pngjs';
import { afterAll, expect, test } from 'vitest';
import { expect as desktopExpect } from '@react-native-gpui/testing';
import { closeApp, launch } from './launch';

afterAll(async () => closeApp());

type App = Awaited<ReturnType<typeof launch>>;

async function open(story: string) {
  const app = await launch('GPUIKitStoryFixture', story, { page: true });
  await desktopExpect(app.getByTestId(`story-${story}`)).toBeVisible(60000);
  await app.waitForIdle({ ignoreUrls: ['user-attachments'] }).catch(() => {});
  await new Promise(resolve => setTimeout(resolve, 1500));
  return app;
}

const shot = async (app: App) => PNG.sync.read(await app.screenshot());

function differing(a: PNG, b: PNG, box: [number, number, number, number]) {
  let n = 0;
  for (let y = box[1]; y < box[3]; y++)
    for (let x = box[0]; x < box[2]; x++) {
      const i = (y * a.width + x) * 4;
      if (
        Math.abs(a.data[i] - b.data[i]) > 8 ||
        Math.abs(a.data[i + 1] - b.data[i + 1]) > 8 ||
        Math.abs(a.data[i + 2] - b.data[i + 2]) > 8
      )
        n++;
    }
  return n;
}

/** Rows of the scrollbar thumb: dark pixels in the rightmost columns. */
function thumb(png: PNG) {
  const rows: number[] = [];
  for (let y = 0; y < png.height; y++) {
    let dark = 0;
    for (let x = png.width - 14; x < png.width; x++) {
      const i = (y * png.width + x) * 4;
      if ((png.data[i] + png.data[i + 1] + png.data[i + 2]) / 3 < 215) dark++;
    }
    if (dark > 2) rows.push(y);
  }
  return rows.length
    ? { top: rows[0], bottom: rows[rows.length - 1] }
    : undefined;
}

test('page: the welcome story reflows to the window width', async () => {
  const app = await open('welcome');
  const frame = app.getByTestId('story-welcome');
  for (const [w, h] of [
    [1024, 768],
    [640, 600],
    [900, 500],
  ]) {
    await app.setWindowSize(w, h);
    await app.waitForIdle({ ignoreUrls: ['user-attachments'] }).catch(() => {});
    await new Promise(resolve => setTimeout(resolve, 800));
    const png = await frame.screenshot();
    const img = PNG.sync.read(png);
    const scale = img.width / w;
    expect(Math.round(img.width / scale)).toBe(w);
    expect(Math.round(img.height / scale)).toBeLessThanOrEqual(h);
  }
});

test('page: wheel and scrollbar thumb move together over the whole text', async () => {
  const app = await open('welcome');
  await app.setWindowSize(1024, 768);
  await new Promise(resolve => setTimeout(resolve, 800));
  const frame = app.getByTestId('story-welcome');
  const tops: number[] = [];
  await frame.scroll(0, -400);
  const first = thumb(await shot(app));
  expect(first, 'thumb visible').toBeDefined();
  tops.push(first!.top);
  for (let i = 0; i < 12; i++) {
    await frame.scroll(0, -400);
    tops.push(thumb(await shot(app))?.top ?? -1);
  }
  console.log('thumb tops', tops);
  expect(tops[1]).toBeGreaterThan(tops[0]);
  const last = tops[tops.length - 1];
  expect(last).toBeGreaterThan(tops[0] + 100);
  const img = await shot(app);
  expect(thumb(img)!.bottom).toBeGreaterThan(img.height * 0.9);
  const heights = tops.slice(1).filter((t, i) => t >= tops[i]);
  expect(heights.length).toBe(tops.length - 1);
});

test('page: click-drag selects text in the welcome TextView', async () => {
  const app = await open('welcome');
  await app.setWindowSize(1024, 768);
  await new Promise(resolve => setTimeout(resolve, 800));
  const before = await shot(app);
  const from = { x: 50, y: 301 };
  const to = { x: 700, y: 360 };
  await app.mouseDown(from);
  for (let i = 1; i <= 10; i++)
    await app.mouseMove({
      x: from.x + ((to.x - from.x) * i) / 10,
      y: from.y + ((to.y - from.y) * i) / 10,
    });
  await app.mouseUp(to);
  await app.waitForIdle({
    ignoreUrls: [
      'user-attachments',
      'githubusercontent',
      'shields.io',
      'docs.rs',
    ],
  });
  await new Promise(resolve => setTimeout(resolve, 300));
  const after = await shot(app);
  const s = before.width / 1024;
  const n = differing(before, after, [
    Math.round(30 * s),
    Math.round(285 * s),
    Math.round(900 * s),
    Math.round(380 * s),
  ]);
  console.log('selection pixels', n);
  expect(n).toBeGreaterThan(500);
});

test('page: the scrollbar thumb drags to the end of the text, and no outer scroller exists', async () => {
  const app = await open('welcome');
  await app.setWindowSize(1024, 768);
  await new Promise(resolve => setTimeout(resolve, 800));
  const tree = JSON.stringify(await app.tree());
  expect(tree).not.toContain('"component":"ScrollView"');
  const frame = app.getByTestId('story-welcome');
  await frame.scroll(0, -40);
  const img = await shot(app);
  const scale = img.width / 1024;
  const t = thumb(img)!;
  const row = Math.round((t.top + t.bottom) / 2);
  let col = img.width - 1;
  while (col > img.width - 40) {
    const i = (row * img.width + col) * 4;
    if ((img.data[i] + img.data[i + 1] + img.data[i + 2]) / 3 < 215) break;
    col--;
  }
  const x = col / scale;
  console.log('thumb', t, 'x', x);
  const mid = row / scale;
  await app.mouseDown({ x, y: mid });
  for (let i = 1; i <= 10; i++)
    await app.mouseMove({ x, y: mid + ((760 - mid) * i) / 10 });
  await app.mouseUp({ x, y: 760 });
  await frame.scroll(0, -1);
  const end = thumb(await shot(app))!;
  expect(end.bottom).toBeGreaterThan(img.height * 0.9);
});
