import { PNG } from 'pngjs';
import { afterAll, expect, test } from 'vitest';
import { expect as desktopExpect } from '@react-native-gpui/testing';
import { closeApp, launch } from './launch';

afterAll(async () => {
  await closeApp();
});

type App = Awaited<ReturnType<typeof launch>>;

const frame = async (app: App, testID: string) =>
  (await app.getByTestId(testID).all())[0].frame;

const pixels = async (app: App, testID: string) => {
  const png = PNG.sync.read(await app.getByTestId(testID).screenshot());
  let red = 0;
  let painted = 0;
  const first = png.data.readUInt32LE(0);
  for (let at = 0; at < png.data.length; at += 4) {
    if (
      png.data[at] > 120 &&
      png.data[at] > png.data[at + 1] + 60 &&
      png.data[at] > png.data[at + 2] + 60
    ) {
      red++;
    }
    if (png.data.readUInt32LE(at) !== first) painted++;
  }
  return { red, painted };
};

const pause = () => new Promise(resolve => setTimeout(resolve, 700));

test('primitives: measured components are as wide as their caption and grow with it', async () => {
  const app = await launch('GPUIKitPrimitivesFixture');
  await desktopExpect(app.getByTestId('prim-label')).toBeVisible(60000);
  const ids = [
    'prim-label',
    'prim-tag',
    'prim-link',
    'prim-button',
    'prim-checkbox',
    'prim-radio',
    'prim-switch',
    'prim-toggle',
  ];
  const before: Record<string, number> = {};
  for (const id of ids) before[id] = (await frame(app, id)).width;
  await app.getByTestId('prim-grow').click();
  await pause();
  for (const id of ids) {
    expect((await frame(app, id)).width).toBeGreaterThan(before[id] + 20);
  }
  expect((await frame(app, 'prim-button-small')).height).toBeLessThan(
    (await frame(app, 'prim-button')).height,
  );
});

test('primitives: colour and size props change what is drawn', async () => {
  const app = await launch('GPUIKitPrimitivesFixture');
  await desktopExpect(app.getByTestId('prim-icon')).toBeVisible(60000);
  await pause();
  for (const id of ['prim-icon', 'prim-progress', 'prim-progress-circle']) {
    const { red } = await pixels(app, id);
    expect(red, id).toBeGreaterThan(10);
  }
  for (const id of [
    'prim-badge',
    'prim-avatar',
    'prim-kbd',
    'prim-alert',
    'prim-marker',
    'prim-tag',
    'prim-button',
  ]) {
    const { painted } = await pixels(app, id);
    expect(painted, id).toBeGreaterThan(30);
  }
  expect((await frame(app, 'prim-avatar')).height).toBeGreaterThan(40);
});
