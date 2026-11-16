import { afterAll, test } from 'vitest';
import { expect as desktopExpect } from '@react-native-gpui/testing';
import { closeApp, launch } from './launch';

afterAll(async () => {
  await closeApp();
});

test('calendar renders and pressing a day reports it', async () => {
  const app = await launch('GPUICalendarsFixture');
  await desktopExpect(app.getByTestId('calendar')).toBeVisible(60000);
  await app.getByText('20').click();
  await desktopExpect(app.getByText('pressed: 2026-11-20')).toBeVisible();
});
