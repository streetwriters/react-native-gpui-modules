import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, expect, test } from 'vitest';
import { expect as desktopExpect, type DesktopApp } from '@react-native-gpui/testing';
import { closeApp, launch as start } from './launch';

let app: DesktopApp;

async function launch(
  module: string,
  scenario?: string,
  initialProps: Record<string, unknown> = {},
  options: { offscreen?: boolean } = {},
) {
  app = await start(module, scenario, initialProps, options);
  return app;
}

afterAll(closeApp);

async function expectCaptureSmoke() {
  if (!app.captureSupported) return;
  expect((await app.screenshot()).length).toBeGreaterThan(1000);
}

test('the file system module reads, writes and watches real files', async () => {
  await launch('GPUIFileSystemFixture');
  await desktopExpect(app.getByTestId('fs-title')).toBeVisible();
  // Every line the fixture prints is a distinct claim; asserting them individually
  // is what turns "the screen rendered" into "the module worked". The fixture
  // records `BAD`, `MISMATCH`, `TIMEOUT` or `FAILED` in the line itself when a
  // step goes wrong, so the substring check is exact rather than approximate.
  await desktopExpect(app.getByTestId('fs-title')).toContainText('File system');
  const tree = JSON.stringify(await app.tree());
  for (const expected of [
    'text ok',
    'binary ok',
    'stat file size=',
    'readdir bytes.bin,note.txt',
    'recursive ok',
    'sync exists',
    'syncRead ok',
    'enoent ok',
    'handleRead ok',
    'handleWrite ok',
    'writeOffset ok',
    'range ok',
    'rangeCursor ok',
    'watch ok',
    'copy ok',
    'paths ok',
    'dialog ok',
  ]) {
    expect(tree).toContain(expected);
  }
  // A directory link needs the symlink privilege on Windows. Where the platform
  // refuses it, the step is skipped with Node's EPERM, as the fixture documents.
  expect(tree).toMatch(/symlinkDir (ok|skipped EPERM)/u);
  for (const failure of ['MISMATCH', 'BAD', 'TIMEOUT', 'FAILED']) {
    expect(tree).not.toContain(failure);
  }
  await expectCaptureSmoke();
});

test('the file system module downloads, reports progress and aborts', async () => {
  const size = 3 * 1024 * 1024;
  const body = Buffer.alloc(size);
  for (let i = 0; i < size; i += 1) body[i] = i % 251;

  const sockets = new Set<import('node:net').Socket>();
  const server = http.createServer((request, response) => {
    const route = request.url ?? '/';
    if (route === '/file') {
      response.setHeader('content-length', String(size));
      response.end(body);
    } else if (route === '/chunked') {
      response.write(body.subarray(0, size / 2));
      setTimeout(() => response.end(body.subarray(size / 2)), 30);
    } else if (route === '/redirect') {
      response.statusCode = 302;
      response.setHeader('location', '/file');
      response.end();
    } else if (route === '/echo') {
      response.end(
        JSON.stringify({ method: request.method, headers: request.headers }),
      );
    } else if (route === '/short') {
      response.setHeader('content-length', String(size));
      response.write(body.subarray(0, 1000));
      setTimeout(() => response.destroy(), 50);
    } else if (route === '/slow') {
      response.setHeader('content-length', String(size));
      const timer = setInterval(
        () => response.write(body.subarray(0, 16384)),
        40,
      );
      response.on('close', () => clearInterval(timer));
    } else if (route === '/stall') {
      response.setHeader('content-length', String(size));
      response.write(body.subarray(0, 100));
    } else {
      response.statusCode = 404;
      response.end('nothing here');
    }
  });
  server.on('connection', socket => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  try {
    await launch('GPUIDownloadFixture', undefined, { server: url });
    await desktopExpect(app.getByText('done ok')).toBeVisible(60000);
    const tree = JSON.stringify(await app.tree());
    for (const expected of [
      'basic ok',
      'content ok',
      'noPartial ok',
      'progress ok',
      'chunked ok',
      'redirect ok',
      'request ok',
      'httpError ok',
      'keepsExisting ok',
      'incomplete ok',
      'noDirectory ok',
      'abort ok',
      'abortStalled ok',
      'preAborted ok',
    ]) {
      expect(tree).toContain(expected);
    }
    expect(tree).not.toContain('BAD');
    expect(tree).not.toContain('FAILED');
  } finally {
    for (const socket of sockets) socket.destroy();
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
});
