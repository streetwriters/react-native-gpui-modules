import { afterAll, expect, test } from 'vitest';
import { expect as desktopExpect } from '@react-native-gpui/testing';
import { closeApp, launch } from './launch';

type App = Awaited<ReturnType<typeof launch>>;

afterAll(async () => {
  await closeApp();
});

async function tagOf(app: App, testID: string) {
  const [match] = await app.query('testID', testID, true);
  return match.tag;
}

async function background(app: App, testID: string) {
  const props = await app.getProps(await tagOf(app, testID));
  return (props.backgroundColor ?? 0) >>> 0;
}

async function frameWidth(app: App, testID: string) {
  const [match] = await app.query('testID', testID, true);
  return match.frame.width;
}

async function textOf(app: App, testID: string) {
  const [match] = await app.getByTestId(testID).all();
  return match.text;
}

async function waitFor(check: () => Promise<boolean>, timeout = 5000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await check()) return;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error('Condition did not become true');
}

async function refresh(app: App) {
  await app.getByTestId('unistyles-refresh').click();
}

test('Unistyles themes follow the color scheme without a React render', async () => {
  const app = await launch('GPUIUnistylesFixture');
  await desktopExpect(app.getByTestId('unistyles-box')).toBeVisible(60000);

  // The system scheme of the machine is not known, so pin light first.
  await app.getByTestId('unistyles-light').click();
  await waitFor(
    async () => (await background(app, 'unistyles-box')) === 0xffffffff,
  );
  await refresh(app);
  expect(await textOf(app, 'unistyles-themeName')).toBe('light');
  expect(await background(app, 'unistyles-accent')).toBe(0xffff0000);
  expect(Number(await textOf(app, 'unistyles-pixelRatio'))).toBeGreaterThan(0);
  expect(Number(await textOf(app, 'unistyles-fontScale'))).toBeGreaterThan(0);
  expect(Number(await textOf(app, 'unistyles-screenWidth'))).toBeGreaterThan(0);

  await app.getByTestId('unistyles-dark').click();
  await waitFor(
    async () => (await background(app, 'unistyles-box')) === 0xff000000,
  );
  expect(await background(app, 'unistyles-accent')).toBe(0xff00ff00);
  expect(await textOf(app, 'unistyles-themeName')).toBe('light');
  await refresh(app);
  await desktopExpect(app.getByTestId('unistyles-themeName')).toHaveText(
    'dark',
  );

  await app.getByTestId('unistyles-light').click();
  await waitFor(
    async () => (await background(app, 'unistyles-box')) === 0xffffffff,
  );
  expect(await background(app, 'unistyles-accent')).toBe(0xffff0000);

  await app.getByTestId('unistyles-reset').click();
  await refresh(app);
  const system = await textOf(app, 'unistyles-colorScheme');
  await waitFor(
    async () =>
      (await background(app, 'unistyles-box')) ===
      (system === 'dark' ? 0xff000000 : 0xffffffff),
  );
  expect(await textOf(app, 'unistyles-themeName')).toBe(system);
});

test('Unistyles breakpoints follow the window size', async () => {
  const app = await launch('GPUIUnistylesFixture');
  await desktopExpect(app.getByTestId('unistyles-box')).toBeVisible(60000);
  const original = await app.getWindowSize();

  try {
    for (const [width, height, breakpoint, accent] of [
      [500, 600, 'xs', 50],
      [800, 600, 'md', 150],
      [1100, 700, 'lg', 250],
    ] as const) {
      await app.setWindowSize(width, height);
      await waitFor(
        async () => (await frameWidth(app, 'unistyles-accent')) === accent,
      );
      await refresh(app);
      await desktopExpect(app.getByTestId('unistyles-breakpoint')).toHaveText(
        breakpoint,
      );
    }
  } finally {
    await app.setWindowSize(original.width, original.height);
  }
});

test('Unistyles variants apply', async () => {
  const app = await launch('GPUIUnistylesFixture');
  await desktopExpect(app.getByTestId('unistyles-box')).toBeVisible(60000);

  expect(await frameWidth(app, 'unistyles-variant')).toBe(20);
  await app.getByTestId('unistyles-toggle-variant').click();
  await waitFor(
    async () => (await frameWidth(app, 'unistyles-variant')) === 80,
  );
});
