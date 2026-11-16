import { afterAll, test } from 'vitest';
import { expect as desktopExpect } from '@react-native-gpui/testing';
import { closeApp, launch } from './launch';

afterAll(async () => {
  await closeApp();
});

test('picker shows the selected item and selecting one from its menu changes it', async () => {
  const app = await launch('GPUIPickerFixture');
  await desktopExpect(app.getByText('language: js')).toBeVisible(60000);
  await app.getByTestId('picker').click();
  await app.getByText('Rust').click();
  await desktopExpect(app.getByText('language: rust')).toBeVisible();
});
