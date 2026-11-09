import { execFileSync } from 'node:child_process';
import { afterAll, beforeAll, expect, test } from 'vitest';
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

function threads(pid: number) {
  const lines = execFileSync('ps', ['-M', '-p', String(pid)]).toString().trim().split('\n');
  return lines.length - 1;
}

function sockets(pid: number) {
  try {
    const output = execFileSync('lsof', ['-nP', '-a', '-p', String(pid), '-iTCP']).toString();
    return output.split('\n').filter(line => line.includes(`:${new URL(server.url).port}`)).length;
  } catch {
    return 0;
  }
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

test('eventsource: closing 50 connections returns threads and sockets to baseline', async () => {
  const pid = app.pid!;
  const baseline = { threads: threads(pid), sockets: sockets(pid) };
  await app.getByTestId('nav-eventsource-churn').click();
  await desktopExpect(app.getByTestId('summary')).toHaveText('PASS', 60000);
  const deadline = Date.now() + 2000;
  let now = { threads: threads(pid), sockets: sockets(pid) };
  while (
    (now.threads > baseline.threads + 2 || now.sockets > baseline.sockets) &&
    Date.now() < deadline
  ) {
    await wait(100);
    now = { threads: threads(pid), sockets: sockets(pid) };
  }
  expect(now.sockets).toBeLessThanOrEqual(baseline.sockets);
  expect(now.threads).toBeLessThanOrEqual(baseline.threads + 2);
}, 90000);
