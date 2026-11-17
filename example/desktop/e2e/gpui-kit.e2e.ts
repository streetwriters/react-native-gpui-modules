import { PNG } from 'pngjs';
import { afterAll, beforeAll, expect, test } from 'vitest';
import {
  launchApp,
  expect as desktopExpect,
  type DesktopApp,
} from '@react-native-gpui/testing';

let app: DesktopApp;

beforeAll(async () => {
  app = await launchApp({
    disableAnimations: true,
    timeout: 180000,
    logFile: process.env.RN_GPUI_E2E_LOG,
  });
});

afterAll(async () => {
  await app.close();
});

test('gpui-kit: a Button renders and reports presses', async () => {
  await app.getByTestId('nav-gpui-kit').click();
  await desktopExpect(app.getByTestId('kit-presses')).toHaveText('presses 0');
  await app.getByTestId('kit-button').click();
  await desktopExpect(app.getByTestId('kit-presses')).toHaveText('presses 1');
  await app.getByTestId('kit-button-disabled').click();
  await desktopExpect(app.getByTestId('kit-presses')).toHaveText('presses 1');
  await desktopExpect(app.getByTestId('kit-button-child-text')).toBeVisible();
  await app.getByTestId('kit-button-child-text').click();
  await desktopExpect(app.getByTestId('kit-presses')).toHaveText('presses 11');
});

test('gpui-kit: an Input is controlled from JS and reports typing', async () => {
  await app.getByTestId('nav-gpui-kit').click();
  await app.getByTestId('kit-input').click();
  for (const key of 'hello world') await app.press(key === ' ' ? 'Space' : key);
  await desktopExpect(app.getByTestId('kit-input-text')).toHaveText(
    'text [hello world] submits 0',
  );
  await app.getByTestId('kit-input-set').click();
  await desktopExpect(app.getByTestId('kit-input-text')).toHaveText(
    'text [external] submits 0',
  );
  await app.getByTestId('kit-input').click();
  await app.press('!');
  await desktopExpect(app.getByTestId('kit-input-text')).toHaveText(
    'text [external!] submits 0',
  );
  await app.press('Enter');
  await desktopExpect(app.getByTestId('kit-input-text')).toHaveText(
    'text [external!] submits 1',
  );
});

test('gpui-kit: the primitives render and the interactive ones report', async () => {
  await app.getByTestId('nav-gpui-kit').click();
  for (const id of [
    'kit-label',
    'kit-icon',
    'kit-badge',
    'kit-tag',
    'kit-avatar',
    'kit-spinner',
    'kit-link',
    'kit-skeleton',
    'kit-progress',
    'kit-progress-circle',
    'kit-shimmer',
    'kit-alert',
    'kit-toggle',
  ]) {
    await desktopExpect(app.getByTestId(id)).toBeVisible();
  }
  await app.getByTestId('kit-link').click();
  await desktopExpect(app.getByTestId('kit-presses')).toHaveText('presses 111');
  await app.getByTestId('kit-toggle').click();
  await desktopExpect(app.getByTestId('kit-toggle-state')).toHaveText(
    'toggled true',
  );
});

test('gpui-kit: a color prop reaches the kit (a red Progress is red)', async () => {
  await app.getByTestId('nav-gpui-kit').click();
  const png = PNG.sync.read(
    await app.getByTestId('kit-progress-red').screenshot(),
  );
  let red = 0;
  for (let at = 0; at < png.data.length; at += 4) {
    if (png.data[at] > 200 && png.data[at + 1] < 60 && png.data[at + 2] < 60)
      red++;
  }
  expect(red).toBeGreaterThan(50);
});

test('gpui-kit: an icon name prop draws the kit icon', async () => {
  await app.getByTestId('nav-gpui-kit').click();
  const withIcon = PNG.sync.read(
    await app.getByTestId('kit-button-icon').screenshot(),
  );
  const dark = (png: PNG) => {
    let count = 0;
    for (let at = 0; at < png.data.length; at += 4)
      if (png.data[at] < 100 && png.data[at + 1] < 100) count++;
    return count;
  };
  expect(dark(withIcon)).toBeGreaterThan(40);
});
