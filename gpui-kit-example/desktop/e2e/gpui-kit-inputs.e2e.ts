import { afterAll, expect, test } from 'vitest';
import { expect as desktopExpect } from '@react-native-gpui/testing';
import { closeApp, launch } from './launch';

afterAll(async () => {
  await closeApp();
});

test('gpui-kit inputs: checkbox, radio and switch report their state', async () => {
  const app = await launch('GPUIKitInputsFixture');
  await desktopExpect(app.getByTestId('inputs-checkbox')).toBeVisible(60000);
  await app.getByTestId('inputs-checkbox').click();
  await desktopExpect(app.getByTestId('inputs-checkbox-state')).toHaveText(
    'checkbox true',
  );
  await app.getByTestId('inputs-radio').click();
  await desktopExpect(app.getByTestId('inputs-radio-state')).toHaveText(
    'radio true',
  );
  await app.getByTestId('inputs-switch').click();
  await desktopExpect(app.getByTestId('inputs-switch-state')).toHaveText(
    'switch true',
  );
});

test('gpui-kit inputs: rating and slider report a value from a press', async () => {
  const app = await launch('GPUIKitInputsFixture');
  await desktopExpect(app.getByTestId('inputs-rating')).toBeVisible(60000);
  await app.getByTestId('inputs-rating').click();
  const [rating] = await app.getByTestId('inputs-rating-state').all();
  expect(rating.text).toMatch(/^rating [1-5]$/);
  await app.getByTestId('inputs-slider').click();
  const [slider] = await app.getByTestId('inputs-slider-state').all();
  expect(slider.text).toMatch(/^slider -?\d+(\.\d+)?$/);
  expect(slider.text).not.toBe('slider 30');
});

test('gpui-kit inputs: text inputs are controlled and report typing', async () => {
  const app = await launch('GPUIKitInputsFixture');
  await desktopExpect(app.getByTestId('inputs-textarea')).toBeVisible(60000);
  await app.getByTestId('inputs-textarea').click();
  for (const key of 'hi') await app.press(key);
  await desktopExpect(app.getByTestId('inputs-textarea-state')).toHaveText(
    'textarea [hi]',
  );
  await app.getByTestId('inputs-number').click();
  await app.press('End');
  await app.press('7');
  await desktopExpect(app.getByTestId('inputs-number-state')).toHaveText(
    'number [57]',
  );
  await app.getByTestId('inputs-otp').click();
  for (const key of '1234') await app.press(key);
  await desktopExpect(app.getByTestId('inputs-otp-state')).toHaveText(
    'otp [1234] complete 1',
  );
});
