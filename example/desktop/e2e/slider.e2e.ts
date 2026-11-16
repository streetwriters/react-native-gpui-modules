import { afterAll, expect, test } from 'vitest';
import { expect as desktopExpect } from '@react-native-gpui/testing';
import { closeApp, launch } from './launch';

afterAll(async () => {
  await closeApp();
});

test('slider renders its value and a press on the track changes it', async () => {
  const app = await launch('GPUISliderFixture');
  await desktopExpect(app.getByTestId('slider-value')).toBeVisible(60000);
  await desktopExpect(app.getByText('value: 25')).toBeVisible();
  await app.getByTestId('slider').click();
  await desktopExpect(app.getByText('events: start,complete')).toBeVisible();
  const [value] = await app.getByTestId('slider-value').all();
  expect(value.text).not.toBe('value: 25');
});

test('arrow keys move a focused slider by one step', async () => {
  const app = await launch('GPUISliderFixture');
  await desktopExpect(app.getByTestId('slider-value')).toBeVisible(60000);
  await app.getByTestId('slider').click();
  const [before] = await app.getByTestId('slider-value').all();
  await app.press('right');
  const start = Number(before.text?.replace('value: ', ''));
  await desktopExpect(app.getByText(`value: ${start + 1}`)).toBeVisible();
  await app.press('home');
  await desktopExpect(app.getByText('value: 0')).toBeVisible();
});
