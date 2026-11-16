import { afterAll, expect, test } from 'vitest';
import { expect as desktopExpect } from '@react-native-gpui/testing';
import { closeApp, launch } from './launch';

afterAll(async () => {
  await closeApp();
});

test('linear gradients render under their children', async () => {
  const app = await launch('GPUILinearGradientFixture');
  await desktopExpect(app.getByTestId('gradient')).toBeVisible(60000);
  await desktopExpect(app.getByTestId('gradient-label')).toBeVisible();
  await desktopExpect(app.getByTestId('gradient-stops')).toBeVisible();
  const [surface] = await app.getByTestId('gradient').all();
  expect(surface).toBeDefined();
});
