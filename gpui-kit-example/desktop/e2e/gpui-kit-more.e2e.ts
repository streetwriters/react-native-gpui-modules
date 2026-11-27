import { PNG } from 'pngjs';
import { afterAll, expect, test } from 'vitest';
import { expect as desktopExpect } from '@react-native-gpui/testing';
import { closeApp, launch } from './launch';

afterAll(async () => {
  await closeApp();
});

type App = Awaited<ReturnType<typeof launch>>;

const pause = () => new Promise(resolve => setTimeout(resolve, 800));

const redPixels = async (app: App) => {
  const png = PNG.sync.read(await app.screenshot());
  let red = 0;
  for (let at = 0; at < png.data.length; at += 4) {
    if (png.data[at] > 180 && png.data[at + 1] < 80 && png.data[at + 2] < 80) {
      red++;
    }
  }
  return red;
};

const tap = async (app: App, testID: string, fx: number, dy: number) => {
  const [match] = await app.getByTestId(testID).all();
  const at = {
    x: match.frame.x + match.frame.width * fx,
    y: match.frame.y + dy,
  };
  await app.mouseMove(at);
  await app.mouseDown(at);
  await app.mouseUp(at);
};

test('more: an input group takes text and holds RN content in its addon', async () => {
  const app = await launch('GPUIKitMoreFixture');
  await desktopExpect(app.getByTestId('more-input-group-end')).toBeVisible(
    60000,
  );
  await tap(app, 'more-input-group', 0.4, 18);
  await app.press('5');
  await desktopExpect(app.getByTestId('more-log')).toHaveText(
    'log theme:false,ig:5,',
  );
});

test('more: a sidebar holds RN content and reports the pressed item', async () => {
  const app = await launch('GPUIKitMoreFixture');
  await desktopExpect(app.getByTestId('more-sidebar-header')).toBeVisible(
    60000,
  );
  await tap(app, 'more-sidebar', 0.4, 100);
  await pause();
  const [log] = await app.getByTestId('more-log').all();
  expect(log.text).toMatch(/side:\d/);
});

test('more: a chart draws its data in the given colour', async () => {
  const app = await launch('GPUIKitMoreFixture');
  await desktopExpect(app.getByTestId('more-chart')).toBeVisible(60000);
  await pause();
  expect(await redPixels(app)).toBeGreaterThan(200);
});

test('more: the theme switches the kit to dark and reports it', async () => {
  const app = await launch('GPUIKitMoreFixture');
  await desktopExpect(app.getByTestId('more-dark')).toBeVisible(60000);
  const before = await app.screenshot();
  await app.getByTestId('more-dark').click();
  await pause();
  expect(Buffer.compare(before, await app.screenshot())).not.toBe(0);
  const [log] = await app.getByTestId('more-log').all();
  expect(log.text).toMatch(/theme:true/);
});

test('more: a form places RN and kit controls in its fields', async () => {
  const app = await launch('GPUIKitMoreFixture');
  await desktopExpect(app.getByTestId('more-form-control')).toBeVisible(60000);
  await app.getByTestId('more-form-button').click();
  const [log] = await app.getByTestId('more-log').all();
  expect(log.text).toMatch(/submit/);
});
