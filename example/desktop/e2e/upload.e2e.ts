import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, test } from 'vitest';
import {
  launchApp,
  expect as desktopExpect,
  type DesktopApp,
} from '@react-native-gpui/testing';
import { startUploadServer } from './upload-server';

let app: DesktopApp;
let server: Awaited<ReturnType<typeof startUploadServer>>;
let directory: string;

function makeFile(name: string, size: number) {
  const file = path.join(directory, name);
  const bytes = crypto.randomBytes(size);
  fs.writeFileSync(file, bytes);
  return {
    path: file,
    size,
    sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
  };
}

beforeAll(async () => {
  server = await startUploadServer();
  directory = fs.mkdtempSync(path.join(os.tmpdir(), 'upload-e2e-'));
  app = await launchApp({
    disableAnimations: true,
    timeout: 120000,
    logFile: process.env.RN_GPUI_E2E_LOG,
    initialProps: {
      upload: {
        server: server.url,
        small: makeFile('small.bin', 200 * 1024),
        large: makeFile('large.bin', 11 * 1024 * 1024),
      },
    },
  });
});

afterAll(async () => {
  await app?.close();
  await server?.close();
  fs.rmSync(directory, { recursive: true, force: true });
});

test('upload: every check passes', async () => {
  await app.getByTestId('nav-upload').click();
  await desktopExpect(app.getByTestId('summary')).toHaveText('PASS', 90000);
}, 120000);
