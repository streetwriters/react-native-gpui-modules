import { PNG } from 'pngjs';
import { afterAll, expect, test } from 'vitest';
import { expect as desktopExpect } from '@react-native-gpui/testing';
import { closeApp, launch } from './launch';

type App = Awaited<ReturnType<typeof launch>>;

afterAll(async () => {
  await closeApp();
});

const settle = async (app: App) => {
  await app.waitForIdle();
  await new Promise(resolve => setTimeout(resolve, 600));
  await app.waitForIdle();
};

const red = async (app: App, testID?: string) => {
  const png = PNG.sync.read(
    await (testID ? app.getByTestId(testID).screenshot() : app.screenshot()),
  );
  let count = 0;
  for (let at = 0; at < png.data.length; at += 4) {
    if (png.data[at] > 200 && png.data[at + 1] < 60 && png.data[at + 2] < 60) {
      count++;
    }
  }
  return count;
};

test('tools: history pushes, steps back and forward, and clears', async () => {
  const app = await launch('GPUIKitToolsFixture');
  await desktopExpect(app.getByTestId('tools-history')).toBeVisible(60000);
  await app.getByTestId('tools-push-a').click();
  await app.getByTestId('tools-push-b').click();
  await desktopExpect(app.getByTestId('tools-history')).toHaveText(
    'history b|true|false|2|push',
  );
  await app.getByTestId('tools-back').click();
  await desktopExpect(app.getByTestId('tools-history')).toHaveText(
    'history a|false|true|2|back',
  );
  await app.getByTestId('tools-forward').click();
  await desktopExpect(app.getByTestId('tools-history')).toHaveText(
    'history b|true|false|2|forward',
  );
  await app.getByTestId('tools-clear').click();
  await desktopExpect(app.getByTestId('tools-history')).toHaveText(
    'history null|false|false|0|clear',
  );
});

test('tools: a virtual list scrolls to an item and a searchable list filters', async () => {
  const app = await launch('GPUIKitToolsFixture');
  await desktopExpect(app.getByTestId('tools-vrow-0')).toBeVisible(60000);
  await app.getByTestId('tools-jump').click();
  await settle(app);
  await desktopExpect(app.getByTestId('tools-vrow-500')).toBeVisible();

  const before = await red(app, 'tools-search');
  expect(before).toBeGreaterThan(30);
  const [match] = await app.getByTestId('tools-search').all();
  const at = { x: match.frame.x + 40, y: match.frame.y + 16 };
  await app.mouseMove(at);
  await app.mouseDown(at);
  await app.mouseUp(at);
  for (const key of ['b', 'a', 'n']) await app.press(key);
  await settle(app);
  const after = await red(app, 'tools-search');
  expect(after).toBeGreaterThan(10);
  expect(after).toBeLessThan(before);
});

test('tools: plot primitives, a speech input and the inspector draw', async () => {
  const app = await launch('GPUIKitToolsFixture');
  await desktopExpect(app.getByTestId('tools-plot')).toBeVisible(60000);
  expect(await red(app, 'tools-plot')).toBeGreaterThan(100);
  const speech = PNG.sync.read(
    await app.getByTestId('tools-speech').screenshot(),
  );
  const first = speech.data.readUInt32LE(0);
  let painted = 0;
  for (let at = 0; at < speech.data.length; at += 4) {
    if (speech.data.readUInt32LE(at) !== first) painted++;
  }
  expect(painted).toBeGreaterThan(30);
  const closed = await app.screenshot();
  await app.getByTestId('tools-inspector').click();
  await settle(app);
  expect((await app.screenshot()).equals(closed)).toBe(false);
});
