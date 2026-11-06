import { afterAll, beforeAll, test } from 'vitest';
import {
  launchApp,
  expect as desktopExpect,
  type DesktopApp,
} from '@react-native-gpui/testing';

let app: DesktopApp;

beforeAll(async () => {
  app = await launchApp({
    disableAnimations: true,
    timeout: 120000,
    logFile: process.env.RN_GPUI_E2E_LOG,
  });
});

afterAll(async () => {
  await app.close();
});

test('every module check passes', async () => {
  await desktopExpect(app.getByTestId('summary')).toHaveText('PASS');
});
