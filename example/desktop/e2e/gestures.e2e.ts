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

async function poll(check: () => Promise<boolean>, timeout = 5000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await check()) return;
  }
  throw new Error('Native probe condition did not become true');
}

test('native gestures update UI worklets while JS is busy', async () => {
  await launch('GestureFixture');
  const tap = (await app.query('testID', 'gesture-tap', true))[0];
  const hold = (await app.query('testID', 'gesture-hold', true))[0];
  const busy = (await app.query('testID', 'gesture-busy', true))[0];
  await app.click(busy.tag);
  await poll(async () => app.readLogs().includes('[gesture] JS blocked begin'));
  await app.click(tap.tag);
  await poll(
    async () =>
      ((await app.getProps(tap.tag)) as { opacity: number }).opacity === 0.5,
    1000,
  );
  expect(
    (await app.idleStatus()).busySources.some(source => source.source === 'js'),
  ).toBe(true);
  await app.waitForIdle();
  const point = { x: hold.frame.x + 40, y: hold.frame.y + 30 };
  await app.mouseDown(point);
  try {
    await poll(
      async () =>
        ((await app.getProps(hold.tag)) as { opacity: number }).opacity === 0.5,
    );
  } finally {
    await app.mouseUp(point);
  }
  await app.waitForIdle();
  const before = (await app.query('testID', 'gesture-pan', true))[0];
  await app
    .getByTestId('gesture-pan')
    .dragTo(app.getByTestId('gesture-target'));
  const after = (await app.query('testID', 'gesture-pan', true))[0];
  expect(after.frame.x).toBeGreaterThan(before.frame.x + 100);
  expect(after.frame.y).toBeGreaterThan(before.frame.y + 30);
});
