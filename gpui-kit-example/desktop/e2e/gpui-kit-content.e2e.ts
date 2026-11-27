import { PNG } from 'pngjs';
import { afterAll, expect, test } from 'vitest';
import { expect as desktopExpect } from '@react-native-gpui/testing';
import { closeApp, launch } from './launch';

afterAll(async () => {
  await closeApp();
});

type App = Awaited<ReturnType<typeof launch>>;

const painted = async (app: App, testID: string) => {
  const png = PNG.sync.read(await app.getByTestId(testID).screenshot());
  const first = png.data.readUInt32LE(0);
  let count = 0;
  for (let at = 0; at < png.data.length; at += 4) {
    if (png.data[at + 0] !== undefined && png.data.readUInt32LE(at) !== first)
      count++;
  }
  return count;
};

test('content: chat, text and code components hold their content', async () => {
  const app = await launch('GPUIKitContentFixture');
  await desktopExpect(app.getByTestId('content-message-body')).toBeVisible(
    60000,
  );
  await desktopExpect(app.getByTestId('content-bubble-body')).toBeVisible();
  await desktopExpect(app.getByTestId('content-scroller-row-0')).toBeVisible();
  for (const id of [
    'content-attachment',
    'content-text',
    'content-diff',
    'content-editor',
  ]) {
    expect(await painted(app, id), id).toBeGreaterThan(50);
  }
});

test('content: charts, grid layout and the scroll area draw', async () => {
  const app = await launch('GPUIKitChartsFixture');
  await desktopExpect(app.getByTestId('content-grid-item-0')).toBeVisible(
    60000,
  );
  await desktopExpect(app.getByTestId('content-scroll-item')).toBeVisible();
  for (const id of [
    'content-candles',
    'content-radar',
    'content-sankey',
    'content-title',
  ]) {
    expect(await painted(app, id), id).toBeGreaterThan(50);
  }
});

test('content: settings draw their entries with React Native controls', async () => {
  const app = await launch('GPUIKitSettingsFixture');
  await desktopExpect(app.getByTestId('settings-toggle')).toBeVisible(60000);
  await desktopExpect(app.getByTestId('settings-language')).toBeVisible();
  expect(await painted(app, 'settings')).toBeGreaterThan(500);
  await app.getByTestId('settings-toggle').click();
  await desktopExpect(app.getByTestId('settings-log')).toHaveText(
    'log toggle,',
  );
});
