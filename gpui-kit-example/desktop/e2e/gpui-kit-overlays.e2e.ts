import { PNG } from 'pngjs';
import { afterAll, expect, test } from 'vitest';
import { expect as desktopExpect } from '@react-native-gpui/testing';
import { closeApp, launch } from './launch';

const redPixels = async (app: Awaited<ReturnType<typeof launch>>) => {
  const png = PNG.sync.read(await app.screenshot());
  let red = 0;
  for (let at = 0; at < png.data.length; at += 4) {
    if (png.data[at] > 180 && png.data[at + 1] < 80 && png.data[at + 2] < 80) {
      red++;
    }
  }
  return red;
};

const settle = async (app: Awaited<ReturnType<typeof launch>>) => {
  await app.waitForIdle();
  await new Promise(resolve => setTimeout(resolve, 800));
  await app.waitForIdle();
};

afterAll(async () => {
  await closeApp();
});

test('overlays: a NativeRoot without a height is as high as its content', async () => {
  const app = await launch('GPUIKitOverlaysFixture');
  await desktopExpect(app.getByTestId('overlays-auto')).toBeVisible(60000);
  const height = async () =>
    (await app.getByTestId('overlays-auto').all())[0].frame.height;
  const before = await height();
  expect(before).toBeGreaterThan(20);
  await app.getByTestId('overlays-grow').click();
  await desktopExpect(app.getByTestId('overlays-auto-row-1')).toBeVisible();
  expect(await height()).toBeGreaterThan(before + 10);
});

test('overlays: a dialog holds RN and kit content and reports its events', async () => {
  const app = await launch('GPUIKitOverlaysFixture');
  await desktopExpect(app.getByTestId('overlays-open-dialog')).toBeVisible(
    60000,
  );
  await app.getByTestId('overlays-open-dialog').click();
  await desktopExpect(app.getByTestId('overlays-dialog-title')).toBeVisible();
  await settle(app);
  await app.getByTestId('overlays-dialog-body').click();
  await app.getByTestId('overlays-dialog-checkbox').click();
  await desktopExpect(app.getByTestId('overlays-log')).toHaveText(
    'log body,check:true,',
  );
  await app.getByTestId('overlays-dialog-footer').click();
  await desktopExpect(app.getByTestId('overlays-log')).toHaveText(
    'log body,check:true,footer,',
  );
});

test('overlays: a sheet holds RN content', async () => {
  const app = await launch('GPUIKitOverlaysFixture');
  await desktopExpect(app.getByTestId('overlays-open-sheet')).toBeVisible(
    60000,
  );
  await app.getByTestId('overlays-open-sheet').click();
  await desktopExpect(app.getByTestId('overlays-sheet-body')).toBeVisible();
  await settle(app);
  await app.getByTestId('overlays-sheet-body').click();
  await desktopExpect(app.getByTestId('overlays-log')).toHaveText('log sheet,');
});

test('overlays: an alert dialog is drawn when it opens', async () => {
  const app = await launch('GPUIKitOverlaysFixture');
  await desktopExpect(app.getByTestId('overlays-open-alert')).toBeVisible(
    60000,
  );
  const before = await app.screenshot();
  await app.getByTestId('overlays-open-alert').click();
  await settle(app);
  expect(Buffer.compare(before, await app.screenshot())).not.toBe(0);
});

test('overlays: a notification is drawn when it opens', async () => {
  const app = await launch('GPUIKitOverlaysFixture');
  await desktopExpect(app.getByTestId('overlays-open-note')).toBeVisible(60000);
  const before = await app.screenshot();
  await app.getByTestId('overlays-open-note').click();
  await settle(app);
  const after = await app.screenshot();
  expect(Buffer.compare(before, after)).not.toBe(0);
});

test('overlays: a popover paints RN content, takes input and closes', async () => {
  const app = await launch('GPUIKitOverlaysFixture');
  await desktopExpect(app.getByTestId('overlays-popover-trigger')).toBeVisible(
    60000,
  );
  expect(await redPixels(app)).toBe(0);
  await app.getByTestId('overlays-popover-trigger').click();
  await settle(app);
  expect(await redPixels(app)).toBeGreaterThan(40);
  await app.getByTestId('overlays-popover-body').click();
  await app.getByTestId('overlays-popover-checkbox').click();
  await desktopExpect(app.getByTestId('overlays-log')).toHaveText(
    'log open:true,popover,pc:true,',
  );
});

test('overlays: a hover card paints RN content on hover', async () => {
  const app = await launch('GPUIKitOverlaysFixture');
  await desktopExpect(app.getByTestId('overlays-hover-trigger')).toBeVisible(
    60000,
  );
  expect(await redPixels(app)).toBe(0);
  await app.getByTestId('overlays-hover-trigger').hover();
  await settle(app);
  expect(await redPixels(app)).toBeGreaterThan(40);
});

test('overlays: a dropdown menu and a context menu report the chosen item', async () => {
  const app = await launch('GPUIKitOverlaysFixture');
  await desktopExpect(app.getByTestId('overlays-dropdown-trigger')).toBeVisible(
    60000,
  );
  const below = async (testID: string, dy: number) => {
    const [match] = await app.getByTestId(testID).all();
    const at = {
      x: match.frame.x + 20,
      y: match.frame.y + match.frame.height + dy,
    };
    await app.mouseMove(at);
    await app.mouseDown(at);
    await app.mouseUp(at);
  };
  await app.getByTestId('overlays-dropdown-trigger').click();
  await settle(app);
  expect(await redPixels(app)).toBe(0);
  await below('overlays-dropdown-trigger', 16);
  await desktopExpect(app.getByTestId('overlays-log')).toHaveText('log alpha,');
  await app.getByTestId('overlays-context-trigger').rightClick();
  await settle(app);
  const [trigger] = await app.getByTestId('overlays-context-trigger').all();
  const cursor = {
    x: trigger.frame.x + trigger.frame.width / 2,
    y: trigger.frame.y + trigger.frame.height / 2,
  };
  const pick = { x: cursor.x + 30, y: cursor.y + 20 };
  await app.mouseMove(pick);
  await app.mouseDown(pick);
  await app.mouseUp(pick);
  await desktopExpect(app.getByTestId('overlays-log')).toHaveText(
    'log alpha,copy,',
  );
});

test('overlays: a popup menu and a command list take keyboard input', async () => {
  const app = await launch('GPUIKitOverlaysFixture');
  await desktopExpect(app.getByTestId('overlays-command')).toBeVisible(60000);
  await app.getByTestId('overlays-command').click();
  await app.press('s');
  await app.press('enter');
  await desktopExpect(app.getByTestId('overlays-log')).toHaveText(
    'log confirm:1,',
  );
});

test('overlays: keys reach an open dialog, an alert dialog and a dropdown menu', async () => {
  const app = await launch('GPUIKitOverlaysFixture');
  await desktopExpect(app.getByTestId('overlays-open-dialog')).toBeVisible(
    60000,
  );
  await app.getByTestId('overlays-open-dialog').click();
  await settle(app);
  await app.press('escape');
  await desktopExpect(app.getByTestId('overlays-log')).toHaveText('log close,');
  await app.getByTestId('overlays-dropdown-trigger').click();
  await settle(app);
  await app.press('down');
  await app.press('enter');
  await desktopExpect(app.getByTestId('overlays-log')).toHaveText(
    'log close,alpha,',
  );
  await app.getByTestId('overlays-open-alert').click();
  await settle(app);
  await app.press('tab');
  await app.press('enter');
  await desktopExpect(app.getByTestId('overlays-log')).toHaveText(
    'log close,alpha,ok,alert-close,',
  );
});
