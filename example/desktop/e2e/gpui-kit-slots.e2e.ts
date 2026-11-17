import { PNG } from 'pngjs';
import { afterAll, expect, test } from 'vitest';
import { expect as desktopExpect } from '@react-native-gpui/testing';
import { closeApp, launch } from './launch';

afterAll(async () => {
  await closeApp();
});

const redPixels = async (
  app: Awaited<ReturnType<typeof launch>>,
  testID: string,
) => {
  const png = PNG.sync.read(await app.getByTestId(testID).screenshot());
  let red = 0;
  for (let at = 0; at < png.data.length; at += 4) {
    if (png.data[at] > 200 && png.data[at + 1] < 60 && png.data[at + 2] < 60) {
      red++;
    }
  }
  return red;
};

test('slots: a collapsible shows its RN content while open and an accordion item holds RN content', async () => {
  const app = await launch('GPUIKitSlotsFixture');
  await desktopExpect(app.getByTestId('slots-collapsible-trigger')).toBeVisible(
    60000,
  );
  expect(await redPixels(app, 'slots-collapsible')).toBe(0);
  await app.getByTestId('slots-collapsible-trigger').click();
  await desktopExpect(app.getByTestId('slots-collapsible-text')).toBeVisible();
  await app.waitForIdle();
  await new Promise(resolve => setTimeout(resolve, 600));
  expect(await redPixels(app, 'slots-collapsible')).toBeGreaterThan(50);
  await desktopExpect(app.getByTestId('slots-accordion-text')).toBeVisible();
  await app.getByTestId('slots-accordion-pressable').click();
  await desktopExpect(app.getByTestId('slots-log')).toHaveText(
    'log accordion,',
  );
});
