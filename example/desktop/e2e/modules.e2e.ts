import { afterAll, beforeAll, test } from 'vitest';
import {
  launchApp,
  expect as desktopExpect,
  type DesktopApp,
} from '@react-native-gpui/testing';

const modules = ['quick-sqlite', 'sodium', 'mmkv', 'gzip', 'crypto', 'keychain'];

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

test.each(modules)('%s: every check passes', async name => {
  await app.getByTestId(`nav-${name}`).click();
  await desktopExpect(app.getByTestId('summary')).toHaveText('PASS');
});
