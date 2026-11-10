import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { afterAll, expect, test } from 'vitest';
import { expect as desktopExpect, launchApp } from '@react-native-gpui/testing';
import { closeApp, launch } from './launch';

let app: Awaited<ReturnType<typeof launch>>;

afterAll(async () => {
  await closeApp();
});

test('the system module controls login items and screen-capture protection', async () => {
  app = await launch('GPUISystemFixture', undefined, {});
  await desktopExpect(app.getByText('done ok')).toBeVisible(30000);
  const tree = JSON.stringify(await app.tree());
  for (const expected of [
    'loginOff ok',
    'loginOn ok',
    'loginReplace ok',
    'loginOffAgain ok',
    'loginTwice ok',
    'protectionOff ok',
    'protectionOn ok',
    'protectionLater ok',
    'protectionOffAgain ok',
    'idleTime ok',
    'badge ok',
    'attention ok',
    'jumpList ok',
  ]) {
    expect(tree).toContain(expected);
  }
  expect(tree).not.toContain('BAD');
  expect(tree).not.toContain('FAILED');
});

test('the system module restarts the app with new arguments', async () => {
  const marker = `restart-${Date.now()}`;
  const running = () =>
    execFileSync('ps', ['-axo', 'pid=,command='], { encoding: 'utf8' })
      .split('\n')
      .filter(line => line.includes(`--restart-marker=${marker}`))
      .map(line => Number(line.trim().split(/\s+/)[0]))
      .filter(pid => pid !== process.pid);

  app = await launch('GPUISystemFixture', undefined, { restartMarker: marker });
  await desktopExpect(app.getByText('done ok')).toBeVisible(30000);
  expect(running()).toHaveLength(0);
  app
    .getByTestId('system-restart')
    .click()
    .catch(() => {});

  const deadline = Date.now() + 20000;
  let started: number[] = [];
  while (Date.now() < deadline && started.length === 0) {
    started = running();
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  for (const pid of started) {
    try {
      process.kill(pid, 'SIGKILL');
    } catch {
      // The copy may already have exited.
    }
  }
  expect(started.length).toBeGreaterThan(0);
});

test('an app started with --hidden opens without showing its window', async () => {
  const visibleWindows = (pid: number) =>
    Number(
      execFileSync(
        'osascript',
        [
          '-l',
          'JavaScript',
          '-e',
          `ObjC.import('CoreGraphics'); const pid = ${pid};
           const list = ObjC.deepUnwrap(ObjC.castRefToObject($.CGWindowListCopyWindowInfo($.kCGWindowListOptionOnScreenOnly, 0)));
           list.filter(w => w.kCGWindowOwnerPID === pid && w.kCGWindowLayer === 0 && w.kCGWindowBounds.Width > 100).length`,
        ],
        { encoding: 'utf8' },
      ).trim(),
    );
  const bundle = (process.env.RN_GPUI_TEST_BUNDLE as string);
  const start = async (args: string[]) =>
    launchApp({
      bundle,
      env: {
        RN_GPUI_MODULE: 'GPUISystemFixture',
        RN_GPUI_BUNDLE: bundle,
        RN_GPUI_DEV_PORT: '1',
        RN_GPUI_WINDOW_STATE: path.resolve('.local/e2e-hidden-start.json'),
      },
      args,
      initialProps: { idle: true },
      disableAnimations: true,
      offscreen: false,
    });

  const shown = await start([]);
  try {
    const deadline = Date.now() + 15000;
    while (visibleWindows(shown.pid as number) !== 1) {
      expect(Date.now()).toBeLessThan(deadline);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  } finally {
    await shown.close();
  }

  const hidden = await start(['--hidden']);
  try {
    await desktopExpect(hidden.getByTestId('system-title')).toBeVisible(30000);
    for (let i = 0; i < 20; i += 1) {
      expect(visibleWindows(hidden.pid as number)).toBe(0);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  } finally {
    await hidden.close();
  }
});
