import { afterAll, expect, test } from 'vitest';
import { expect as desktopExpect } from '@react-native-gpui/testing';
import { closeApp, launch } from './launch';

let app: Awaited<ReturnType<typeof launch>>;

afterAll(async () => {
  await closeApp();
});

test('the notifications module shows, schedules, repeats and cancels', async () => {
  app = await launch('GPUINotificationsFixture');
  await desktopExpect(app.getByTestId('notifications-title')).toContainText(
    'Notifications',
  );
  await desktopExpect(app.getByText('settings ok')).toBeVisible(20000);
  const tree = JSON.stringify(await app.tree());
  for (const expected of [
    'permission ok',
    'show ok',
    'generatedId ok',
    'scheduled ok',
    'fired ok',
    'oneShotRemoved ok',
    'pastRejected ok',
    'repeat ok',
    'cancelScheduled ok',
    'cancel ok',
    'cancelAll ok',
    'displayed ok',
    'initialEvent ok',
  ]) {
    expect(tree).toContain(expected);
  }
  expect(tree).not.toContain('BAD');
  expect(tree).not.toContain('FAILED');
  expect(tree).not.toContain('TIMEOUT');
});
