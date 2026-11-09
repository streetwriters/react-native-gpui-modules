import { afterAll, beforeAll, test } from 'vitest';
import {
  launchApp,
  expect as desktopExpect,
  type DesktopApp,
} from '@react-native-gpui/testing';
import { startSseServer } from './sse-server';

let app: DesktopApp;
let server: Awaited<ReturnType<typeof startSseServer>>;

beforeAll(async () => {
  server = await startSseServer();
  app = await launchApp({
    disableAnimations: true,
    timeout: 120000,
    logFile: process.env.RN_GPUI_E2E_LOG,
    initialProps: { eventsource: { server: server.url } },
  });
});

afterAll(async () => {
  await app?.close();
  await server?.close();
});

test('eventsource: every check passes', async () => {
  await app.getByTestId('nav-eventsource').click();
  await desktopExpect(app.getByTestId('summary')).toHaveText('PASS', 60000);
}, 90000);
