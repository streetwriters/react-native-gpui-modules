import { PNG } from 'pngjs';
import { afterAll, expect, test } from 'vitest';
import { expect as desktopExpect } from '@react-native-gpui/testing';
import { closeApp, launch } from './launch';

afterAll(async () => {
  await closeApp();
});

type App = Awaited<ReturnType<typeof launch>>;

const pause = () => new Promise(resolve => setTimeout(resolve, 700));

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

const log = (app: App) => app.getByTestId('layout-log');

test('layout: a list shows RN rows and reports the confirmed row', async () => {
  const app = await launch('GPUIKitLayoutFixture');
  await desktopExpect(app.getByTestId('layout-list')).toBeVisible(60000);
  expect(await redPixels(app)).toBeGreaterThan(30);
  await tap(app, 'layout-list', 0.3, 16);
  await desktopExpect(log(app)).toHaveText('log list:0,');
});

test('layout: a tree reports the selected node', async () => {
  const app = await launch('GPUIKitLayoutFixture');
  await desktopExpect(app.getByTestId('layout-tree')).toBeVisible(60000);
  await tap(app, 'layout-tree', 0.5, 40);
  await pause();
  const [text] = await log(app).all();
  expect(text.text).toMatch(/tree:/);
});

test('layout: a table shows RN cells, reports the selected row and an RN cell takes presses', async () => {
  const app = await launch('GPUIKitLayoutFixture');
  await desktopExpect(app.getByTestId('layout-table')).toBeVisible(60000);
  await desktopExpect(app.getByTestId('layout-table-rn')).toBeVisible();
  await app.getByTestId('layout-table-rn').click();
  await desktopExpect(log(app)).toHaveText('log cell,');
  await tap(app, 'layout-table', 0.2, 40);
  await pause();
  const [text] = await log(app).all();
  expect(text.text).toMatch(/row:\d/);
});

test('layout: a status bar, a toolbar and a resizable group hold RN content', async () => {
  const app = await launch('GPUIKitLayoutFixture');
  await desktopExpect(app.getByTestId('layout-status-left')).toBeVisible(60000);
  await desktopExpect(app.getByTestId('layout-status-right')).toBeVisible();
  await app.getByTestId('layout-toolbar-item').click();
  await desktopExpect(log(app)).toHaveText('log tool,');
  await desktopExpect(app.getByTestId('layout-panel-0')).toBeVisible();
  await app.getByTestId('layout-panel-1').click();
  await desktopExpect(log(app)).toHaveText('log tool,panel,');
});

test('layout: a carousel shows its first slide', async () => {
  const app = await launch('GPUIKitLayoutFixture');
  await desktopExpect(app.getByTestId('layout-slide-0')).toBeVisible(60000);
  await app.getByTestId('layout-carousel').hover();
  await pause();
  expect(await app.getByTestId('layout-slide-1').count()).toBe(1);
});
