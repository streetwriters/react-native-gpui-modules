import crypto from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { execFileSync } from 'node:child_process';
import { PNG } from 'pngjs';
import { afterAll, expect, test } from 'vitest';
import {
  expect as desktopExpect,
  launchApp,
  type DesktopApp,
} from '@react-native-gpui/testing';
import { closeApp, launch } from './launch';

let app: Awaited<ReturnType<typeof launch>>;

afterAll(async () => {
  await closeApp();
});

type Channel = {
  version?: string;
  file?: string;
  body?: Buffer;
  sha512?: string;
  releaseDate?: string;
  noZip?: boolean;
  slow?: boolean;
};

function sha512Base64(data: Buffer) {
  return crypto.createHash('sha512').update(data).digest('base64');
}

async function serveFeed(channels: Record<string, Channel>) {
  const server = http.createServer((request, response) => {
    const url = new URL(request.url ?? '/', 'http://localhost');
    const feed = /^\/feed\/([a-z]+)-mac\.yml$/.exec(url.pathname);
    if (feed) {
      const channel = channels[feed[1]];
      if (!channel) {
        response.statusCode = 404;
        response.end('no such channel');
        return;
      }
      const body = channel.body as Buffer;
      const digest = channel.sha512 ?? sha512Base64(body);
      const files = channel.noZip
        ? `  - url: App-${channel.version}.dmg\n    sha512: ${digest}\n    size: 10\n`
        : `  - url: ${channel.file}\n    sha512: ${digest}\n    size: ${body.length}\n`;
      response.end(
        `version: ${channel.version}\nfiles:\n${files}releaseDate: '${channel.releaseDate ?? '2026-01-02T03:04:05.000Z'}'\n`,
      );
      return;
    }
    const file = /^\/feed\/(.+)$/.exec(url.pathname);
    const owner = Object.values(channels).find(
      c => c.file === decodeURIComponent(file?.[1] ?? ''),
    );
    if (!owner) {
      response.statusCode = 404;
      response.end();
      return;
    }
    const body = owner.body as Buffer;
    response.setHeader('content-length', String(body.length));
    if (!owner.slow) {
      response.end(body);
      return;
    }
    let offset = 0;
    const timer = setInterval(() => {
      if (offset >= body.length) {
        clearInterval(timer);
        response.end();
        return;
      }
      response.write(body.subarray(offset, offset + 65536));
      offset += 65536;
    }, 30);
    response.on('close', () => clearInterval(timer));
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  return {
    url: `http://127.0.0.1:${(server.address() as AddressInfo).port}/feed`,
    close: () =>
      new Promise<void>(resolve => {
        server.closeAllConnections();
        server.close(() => resolve());
      }),
  };
}


test('the updater checks, downloads and verifies updates', async () => {
  const body = crypto.randomBytes(3 * 1024 * 1024);
  const feed = await serveFeed({
    same: { version: '1.0.0', file: 'same.zip', body },
    newer: { version: '1.1.0', file: 'App-1.1.0-mac.zip', body },
    older: { version: '0.9.0', file: 'older.zip', body },
    badsum: {
      version: '1.2.0',
      file: 'bad.zip',
      body,
      sha512: sha512Base64(Buffer.from('other')),
    },
    nozip: { version: '1.5.0', file: 'x.zip', body, noZip: true },
    slow: {
      version: '1.3.0',
      file: 'slow.zip',
      body: crypto.randomBytes(24 * 1024 * 1024),
      slow: true,
    },
  });
  try {
    app = await launch('GPUIUpdaterFixture', undefined, {
      feedUrl: feed.url,
      currentVersion: '1.0.0',
      mode: 'check',
    });
    await desktopExpect(app.getByText('done ok')).toBeVisible(90000);
    const tree = JSON.stringify(await app.tree());
    for (const expected of [
      'version ok',
      'notAvailable ok',
      'available ok',
      'download ok',
      'downgrade ok',
      'checksum ok',
      'noArchive ok',
      'feedError ok',
      'cancel ok',
      'idle ok',
      'install ok',
    ]) {
      expect(tree).toContain(expected);
    }
    expect(tree).not.toContain('BAD');
    expect(tree).not.toContain('FAILED');
  } finally {
    await feed.close();
  }
}, 120000);

test.skipIf(process.platform !== 'darwin')(
  'the updater replaces the app bundle it runs from',
  async () => {
    const binary = process.env.RN_GPUI_TEST_BINARY as string;
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'updater-e2e-'));
    const makeApp = (directory: string, version: string) => {
      const app = path.join(directory, 'Updatable.app');
      fs.mkdirSync(path.join(app, 'Contents/MacOS'), { recursive: true });
      fs.copyFileSync(binary, path.join(app, 'Contents/MacOS/updatable-app'));
      fs.chmodSync(path.join(app, 'Contents/MacOS/updatable-app'), 0o755);
      fs.writeFileSync(
        path.join(app, 'Contents/Info.plist'),
        `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleExecutable</key><string>updatable-app</string>
<key>CFBundleIdentifier</key><string>org.reactnativegpui.updater-e2e</string>
<key>CFBundleName</key><string>Updatable</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>CFBundleShortVersionString</key><string>${version}</string>
<key>CFBundleVersion</key><string>${version}</string>
</dict></plist>`,
      );
      execFileSync('codesign', ['--force', '--sign', '-', app]);
      return app;
    };
    const installed = makeApp(path.join(root, 'installed'), '1.0.0');
    const next = makeApp(path.join(root, 'next'), '2.0.0');
    const archive = path.join(root, 'Updatable-2.0.0-mac.zip');
    execFileSync('ditto', ['-c', '-k', '--keepParent', next, archive]);
    const feed = await serveFeed({
      install: {
        version: '2.0.0',
        file: 'Updatable-2.0.0-mac.zip',
        body: fs.readFileSync(archive),
      },
    });
    const bundle = (process.env.RN_GPUI_TEST_BUNDLE as string);
    let running: DesktopApp | undefined;
    try {
      running = await launchApp({
        executable: path.join(installed, 'Contents/MacOS/updatable-app'),
        bundle,
        env: {
          RN_GPUI_MODULE: 'GPUIUpdaterFixture',
          RN_GPUI_BUNDLE: bundle,
          RN_GPUI_DEV_PORT: '1',
          RN_GPUI_WINDOW_STATE: path.resolve('.local/e2e-updater-install.json'),
        },
        initialProps: { feedUrl: feed.url, mode: 'install' },
        disableAnimations: true,
        offscreen: true,
      });
      await desktopExpect(running.getByText('downloaded')).toBeVisible(60000);
      const version = () =>
        execFileSync(
          '/usr/libexec/PlistBuddy',
          [
            '-c',
            'Print :CFBundleShortVersionString',
            path.join(installed, 'Contents/Info.plist'),
          ],
          { encoding: 'utf8' },
        ).trim();
      expect(version()).toBe('1.0.0');
      running
        .getByTestId('updater-install')
        .click()
        .catch(() => {});
      const deadline = Date.now() + 60000;
      while (version() !== '2.0.0' && Date.now() < deadline) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      expect(version()).toBe('2.0.0');
      expect(fs.existsSync(`${installed}.old`)).toBe(false);
      execFileSync('codesign', ['--verify', '--deep', '--strict', installed]);
    } finally {
      running?.disconnect();
      try {
        execFileSync('pkill', ['-f', root]);
      } catch {
        // Nothing of the relaunched copy is running.
      }
      await feed.close();
      fs.rmSync(root, { recursive: true, force: true });
    }
  },
  180000,
);

test('the image manipulator crops, resizes and encodes, and the result shows as a data URI', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'manipulator-e2e-'));
  const source = path.join(directory, 'quadrants.png');
  const picture = new PNG({ width: 400, height: 300 });
  const colours = [
    [255, 0, 0],
    [0, 255, 0],
    [0, 0, 255],
    [255, 255, 0],
  ];
  for (let y = 0; y < 300; y += 1) {
    for (let x = 0; x < 400; x += 1) {
      const [r, g, b] = colours[(y >= 150 ? 2 : 0) + (x >= 200 ? 1 : 0)];
      picture.data.set([r, g, b, 255], (y * 400 + x) * 4);
    }
  }
  fs.writeFileSync(source, PNG.sync.write(picture));

  const at = async (testID: string, x: number, y: number) => {
    const image = PNG.sync.read(await app.getByTestId(testID).screenshot());
    const px = Math.min(image.width - 1, Math.round(image.width * x));
    const py = Math.min(image.height - 1, Math.round(image.height * y));
    const offset = (py * image.width + px) * 4;
    return Array.from(image.data.subarray(offset, offset + 3));
  };
  const near = (actual: number[], expected: number[], tolerance = 40) =>
    actual.every((value, i) => Math.abs(value - expected[i]) <= tolerance);

  // An image paints once its decode finishes, a moment after its node exists.
  const colour = async (
    testID: string,
    x: number,
    y: number,
    expected: number[],
  ) => {
    const deadline = Date.now() + 5000;
    let actual = await at(testID, x, y);
    while (!near(actual, expected) && Date.now() < deadline) {
      await new Promise(resolve => setTimeout(resolve, 100));
      actual = await at(testID, x, y);
    }
    expect(
      near(actual, expected),
      `${testID} at ${x},${y} is ${actual}, expected ${expected}`,
    ).toBe(true);
  };

  try {
    app = await launch('GPUIImageManipulatorFixture', undefined, { source });
    await desktopExpect(app.getByText('done ok')).toBeVisible(30000);
    const tree = JSON.stringify(await app.tree());
    for (const expected of [
      'size ok',
      'crop ok',
      'resize ok',
      'rotate ok',
      'avatar ok',
      'dataUri ok',
      'errors ok',
    ]) {
      expect(tree).toContain(expected);
    }
    expect(tree).not.toContain('BAD');
    expect(tree).not.toContain('FAILED');

    // The JPEG data URI shows the four quadrants of the cropped square.
    await desktopExpect(app.getByTestId('manipulated-avatar')).toBeVisible();
    await colour('manipulated-avatar', 0.25, 0.25, [255, 0, 0]);
    await colour('manipulated-avatar', 0.75, 0.25, [0, 255, 0]);
    await colour('manipulated-avatar', 0.25, 0.75, [0, 0, 255]);
    await colour('manipulated-avatar', 0.75, 0.75, [255, 255, 0]);

    const red = [255, 0, 0];
    const white = [255, 255, 255];
    // A fixed circle with a panned and zoomed image inside: the image does not
    // leak out of the circle, above it or at its corners.
    await colour('clip-pan', 0.5, 0.5, red);
    await colour('clip-pan', 0.5, 0.2, red);
    await colour('clip-pan', 0.5, 0.15, white);
    await colour('clip-pan', 0.18, 0.18, white);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
