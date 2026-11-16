import { afterAll, test } from 'vitest';
import {
  type DesktopApp,
  expect as desktopExpect,
} from '@react-native-gpui/testing';
import { closeApp, launch } from './launch';

afterAll(async () => {
  await closeApp();
});

test('keyboard controller screens render and dismiss blurs the focused input', async () => {
  const app = await launch('GPUIKeyboardControllerFixture');
  await desktopExpect(app.getByTestId('kc-root')).toBeVisible(60000);
  await app.getByTestId('kc-input').click();
  await desktopExpect(app.getByText('status: focused')).toBeVisible();
  await app.getByTestId('kc-dismiss').click();
  await desktopExpect(app.getByText('status: blurred')).toBeVisible();
});

// Focus events are reported by a draw, which the driver runs while it waits for idle.
async function waitForStatus(app: DesktopApp, status: string) {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    await app.waitForIdle();
    const [label] = await app.getByTestId('kc-status').all();
    if (label?.text === `status: ${status}`) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`status never became ${status}`);
}

test('setFocusTo moves focus to the next and previous input', async () => {
  const app = await launch('GPUIKeyboardControllerFixture');
  await desktopExpect(app.getByTestId('kc-root')).toBeVisible(60000);
  await app.getByTestId('kc-input').click();
  await waitForStatus(app, 'focused');
  await app.press('enter');
  await waitForStatus(app, 'second focused');
  await app.press('enter');
  await waitForStatus(app, 'focused');
});
