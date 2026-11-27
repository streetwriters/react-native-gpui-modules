import { afterAll, expect, test } from 'vitest';
import { expect as desktopExpect } from '@react-native-gpui/testing';
import { closeApp, launch } from './launch';

afterAll(async () => {
  await closeApp();
});

type App = Awaited<ReturnType<typeof launch>>;

const settle = async (app: App) => {
  await app.waitForIdle();
  await new Promise(resolve => setTimeout(resolve, 600));
  await app.waitForIdle();
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

const different = async (app: App, action: () => Promise<void>) => {
  const before = await app.screenshot();
  await action();
  await settle(app);
  return Buffer.compare(before, await app.screenshot()) !== 0;
};

const pause = () => new Promise(resolve => setTimeout(resolve, 900));

const log = (app: App) => app.getByTestId('data-log');

test('data: a select opens its list and reports the chosen item', async () => {
  const app = await launch('GPUIKitDataFixture');
  await desktopExpect(app.getByTestId('data-select')).toBeVisible(60000);
  await tap(app, 'data-select', 0.2, 16);
  await pause();
  await tap(app, 'data-select', 0.2, 32 + 18);
  await desktopExpect(log(app)).toHaveText('log select:Alpha,');
});

test('data: a combobox reports its selection', async () => {
  const app = await launch('GPUIKitDataFixture');
  await desktopExpect(app.getByTestId('data-combobox')).toBeVisible(60000);
  await tap(app, 'data-combobox', 0.2, 16);
  await pause();
  await tap(app, 'data-combobox', 0.2, 32 + 18);
  await desktopExpect(log(app)).toHaveText('log combo:Red,');
});

test('data: tabs show the panel of the selected tab', async () => {
  const app = await launch('GPUIKitDataFixture');
  await desktopExpect(app.getByTestId('data-panel-0')).toBeVisible(60000);
  expect(await app.getByTestId('data-panel-1').count()).toBe(0);
  await tap(app, 'data-tabs-bar', 0.2, 18);
  await desktopExpect(app.getByTestId('data-panel-1')).toBeVisible();
});

test('data: a calendar follows its date prop and reports a pressed day', async () => {
  const app = await launch('GPUIKitDataFixture');
  await desktopExpect(app.getByTestId('data-calendar')).toBeVisible(60000);
  expect(
    await different(app, async () => {
      await app.getByTestId('data-set-date').click();
    }),
  ).toBe(true);
  await tap(app, 'data-calendar', 0.5, 140);
  await settle(app);
  const [text] = await app.getByTestId('data-log').all();
  expect(text.text).toMatch(/cal:\d{4}-\d{2}-\d{2}/);
});

test('data: a date picker, a colour picker and a time field open and edit', async () => {
  const app = await launch('GPUIKitDataFixture');
  await desktopExpect(app.getByTestId('data-date-picker')).toBeVisible(60000);
  expect(
    await different(app, () => tap(app, 'data-date-picker', 0.2, 16)),
  ).toBe(true);
  await app.press('escape');
  await settle(app);
  expect(await different(app, () => tap(app, 'data-color', 0.5, 16))).toBe(
    true,
  );
  await app.press('escape');
  await settle(app);
  await app.getByTestId('data-time').click();
  await app.press('up');
  await settle(app);
  const [value] = await log(app).all();
  expect(value.text).toMatch(/t:\d\d:\d\d:\d\d/);
});
