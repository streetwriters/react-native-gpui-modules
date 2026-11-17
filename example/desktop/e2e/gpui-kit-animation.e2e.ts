import path from 'node:path';
import { PNG } from 'pngjs';
import { afterAll, expect, test } from 'vitest';
import { launchApp, type DesktopApp } from '@react-native-gpui/testing';
import { bundle } from './launch';

let app: DesktopApp | undefined;

afterAll(async () => {
  await app?.close();
});

/** Kit springs and tooltip delays need frames, which a window that is not shown never gets. */
const launchShown = async (module: string) => {
  await app?.close();
  app = await launchApp({
    bundle,
    env: {
      RN_GPUI_MODULE: module,
      RN_GPUI_BUNDLE: bundle,
      RN_GPUI_DEV_PORT: '1',
      RN_GPUI_WINDOW_STATE: path.resolve(`.local/e2e-${module}-animated.json`),
    },
    logFile: process.env.RN_GPUI_E2E_LOG,
    disableAnimations: false,
    offscreen: false,
  });
  await app.setWindowSize(1024, 768);
  return app;
};

const red = async (target: DesktopApp) => {
  const png = PNG.sync.read(await target.screenshot());
  let count = 0;
  for (let at = 0; at < png.data.length; at += 4) {
    if (png.data[at] > 200 && png.data[at + 1] < 60 && png.data[at + 2] < 60) {
      count++;
    }
  }
  return count;
};

const until = async (check: () => Promise<boolean>, ms = 5000) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (await check()) return true;
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  return false;
};

test('animation: a collapsible reveals its content with its spring running', async () => {
  const shown = await launchShown('GPUIKitSlotsFixture');
  await shown.getByTestId('slots-collapsible-trigger').click();
  expect(await until(async () => (await red(shown)) > 50)).toBe(true);
});

test('animation: a tooltip shows React Native content after its hover delay', async () => {
  const shown = await launchShown('GPUIKitPrimitivesFixture');
  const [match] = await shown.getByTestId('prim-tooltip').all();
  const at = {
    x: match.frame.x + match.frame.width / 2,
    y: match.frame.y + match.frame.height / 2,
  };
  const before = await red(shown);
  await shown.mouseMove({ x: at.x - 6, y: at.y });
  await shown.mouseMove(at);
  expect(await until(async () => (await red(shown)) > before + 30, 6000)).toBe(
    true,
  );
});

test('animation: a button tooltip shows its text after its hover delay', async () => {
  const shown = await launchShown('GPUIKitPrimitivesFixture');
  const [match] = await shown.getByTestId('prim-button-small').all();
  const at = {
    x: match.frame.x + match.frame.width / 2,
    y: match.frame.y + match.frame.height / 2,
  };
  const before = (await shown.screenshot()).toString('base64');
  await shown.mouseMove({ x: at.x - 4, y: at.y });
  await shown.mouseMove(at);
  expect(
    await until(
      async () => (await shown.screenshot()).toString('base64') !== before,
      6000,
    ),
  ).toBe(true);
});
