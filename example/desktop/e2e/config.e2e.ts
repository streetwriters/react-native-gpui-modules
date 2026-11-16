import { afterAll, test } from 'vitest';
import { expect as desktopExpect } from '@react-native-gpui/testing';
import { closeApp, launch } from './launch';

afterAll(async () => {
  await closeApp();
});

test('react-native-config exposes the values of the example .env file', async () => {
  const app = await launch('GPUIConfigFixture');
  await desktopExpect(app.getByText('GPUI_CONFIG_CHECK: ok')).toBeVisible(
    60000,
  );
});
