import path from 'node:path';
import { PNG } from 'pngjs';
import { afterAll, expect, test } from 'vitest';
import { launchApp, type DesktopApp } from '@react-native-gpui/testing';
import { bundle } from './launch';

let app: DesktopApp | undefined;

afterAll(async () => {
  await app?.close();
});

/**
 * Kit springs need frames, which a window that is not shown never gets. A
 * tooltip only needs its delay and a draw, which a hidden window does on every
 * screenshot, so its specs stay hidden and leave the focus where it is.
 */
const launchShown = async (module: string, offscreen = false) => {
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
    offscreen,
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
  const shown = await launchShown('GPUIKitPrimitivesFixture', true);
  const [trigger] = await shown.getByTestId('prim-tooltip').all();
  const at = {
    x: trigger.frame.x + trigger.frame.width / 2,
    y: trigger.frame.y + trigger.frame.height / 2,
  };
  const before = await red(shown);
  await shown.mouseMove({ x: at.x - 6, y: at.y });
  await shown.mouseMove(at);
  expect(await until(async () => (await red(shown)) > before + 30, 6000)).toBe(
    true,
  );
  const [content] = await shown.getByTestId('prim-tooltip-content').all();
  expect(content.frame.width).toBeGreaterThan(20);
  const gap = Math.min(
    Math.abs(content.frame.y - (trigger.frame.y + trigger.frame.height)),
    Math.abs(trigger.frame.y - (content.frame.y + content.frame.height)),
  );
  expect(gap).toBeLessThan(40);
  expect(Math.abs(content.frame.x - trigger.frame.x)).toBeLessThan(
    trigger.frame.width + 80,
  );
});

/** The bounding box, in points, of the pixels that differ between two captures. */
const changed = (
  a: Buffer,
  b: Buffer,
  scale: number,
  skip: { x: number; y: number; width: number; height: number },
) => {
  const [pa, pb] = [PNG.sync.read(a), PNG.sync.read(b)];
  let box: { x0: number; y0: number; x1: number; y1: number } | null = null;
  for (let y = 0; y < Math.min(pa.height, pb.height); y++)
    for (let x = 0; x < Math.min(pa.width, pb.width); x++) {
      const [px, py] = [x / scale, y / scale];
      if (
        px >= skip.x - 2 &&
        px <= skip.x + skip.width + 2 &&
        py >= skip.y - 2 &&
        py <= skip.y + skip.height + 2
      )
        continue;
      const i = (y * pa.width + x) * 4;
      const j = (y * pb.width + x) * 4;
      if (
        Math.abs(pa.data[i] - pb.data[j]) +
          Math.abs(pa.data[i + 1] - pb.data[j + 1]) >
        60
      ) {
        box = box ?? { x0: x, y0: y, x1: x, y1: y };
        box = {
          x0: Math.min(box.x0, x),
          y0: Math.min(box.y0, y),
          x1: Math.max(box.x1, x),
          y1: Math.max(box.y1, y),
        };
      }
    }
  return (
    box && {
      x0: box.x0 / scale,
      y0: box.y0 / scale,
      x1: box.x1 / scale,
      y1: box.y1 / scale,
    }
  );
};

test('animation: a button tooltip shows its text after its hover delay', async () => {
  // A button's tooltip shows only in the active window, so this one is shown.
  const shown = await launchShown('GPUIKitPrimitivesFixture');
  const [button] = await shown.getByTestId('prim-button-small').all();
  const at = {
    x: button.frame.x + button.frame.width / 2,
    y: button.frame.y + button.frame.height / 2,
  };
  const before = await shown.screenshot();
  const scale = PNG.sync.read(before).width / 1024;
  await shown.mouseMove({ x: at.x - 4, y: at.y });
  await shown.mouseMove(at);
  let box: ReturnType<typeof changed> = null;
  expect(
    await until(async () => {
      const now = await shown.screenshot();
      box = changed(before, now, scale, button.frame);
      return box != null && box.x1 - box.x0 > 60;
    }, 6000),
  ).toBe(true);
  const area = box!;
  // The text box sits beside the button (above or below it), about as wide as
  // "Plain tooltip text" at the tooltip's type.
  expect(area.x1 - area.x0).toBeGreaterThan(60);
  expect(area.x1 - area.x0).toBeLessThan(260);
  const below = area.y0 - (button.frame.y + button.frame.height);
  const above = button.frame.y - area.y1;
  expect(Math.min(Math.abs(below), Math.abs(above))).toBeLessThan(40);
});
