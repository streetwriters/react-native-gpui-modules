import { afterAll, test } from 'vitest';
import { expect as desktopExpect } from '@react-native-gpui/testing';
import { closeApp, launch } from './launch';

afterAll(async () => {
  await closeApp();
});

test('haptic feedback triggers several types without error', async () => {
  const app = await launch('GPUIHapticFeedbackFixture');
  await desktopExpect(app.getByTestId('haptic-run')).toBeVisible(60000);
  await app.getByTestId('haptic-run').click();
  await desktopExpect(app.getByText('triggered 4')).toBeVisible();
});
