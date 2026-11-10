import { PNG } from 'pngjs';
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

test.each(['stack', 'native-stack'])(
  '%s supports consecutive pushes and BackHandler pops',
  async scenario => {
    await launch('NavigationFixture', scenario);
    await app.getByText('Open details').click();
    await desktopExpect(app.getByTestId('Details 1-title')).toBeVisible();
    await app.getByText('Open next detail').click();
    await desktopExpect(app.getByTestId('Details 2-title')).toBeVisible();
    await app.press('escape');
    await app.waitForIdle();
    await desktopExpect(app.getByTestId('Details 1-title')).toBeVisible();
    await app.press('escape');
    await app.waitForIdle();
    await desktopExpect(app.getByTestId('Home-title')).toBeVisible();
  },
);

test('tabs preserve text input and list scroll while switching', async () => {
  await launch('NavigationFixture', 'tabs');
  await app.getByRole('tab', { name: 'List' }).click();
  const input = app.getByTestId('navigation-list-input');
  await input.clear();
  await input.type('Retained tab state');
  await app.getByTestId('navigation-list').scroll(0, -400);
  await app.getByRole('tab', { name: 'Home' }).click();
  await desktopExpect(app.getByTestId('Home-title')).toBeVisible();
  await app.getByRole('tab', { name: 'List' }).click();
  await desktopExpect(input).toHaveValue('Retained tab state');
  expect(app.readLogs()).toContain('scroll offset=400');
});

test('drawer closes through BackHandler and keeps route content clickable', async () => {
  await launch('NavigationFixture', 'drawer');
  await app.getByRole('button', { name: 'Show navigation menu' }).click();
  await app.getByRole('button', { name: 'List' }).click();
  await desktopExpect(app.getByText('Long list + input')).toBeVisible();
  await app.getByRole('button', { name: 'Show navigation menu' }).click();
  await app.press('mod-[');
  await app.waitForIdle();
  await app.getByTestId('navigation-list-input').type(' drawer');
  await desktopExpect(app.getByTestId('navigation-list-input')).toContainText(
    'drawer',
  );
});

test.each([
  'native-stack-modal',
  'native-stack-transparent-modal',
  'native-stack-hidden',
])('%s preserves underlying screen and dismisses', async scenario => {
  await launch('NavigationFixture', scenario);
  await app.getByText('Open details').click();
  await desktopExpect(app.getByTestId('Details 1-title')).toBeVisible();
  await app.press('escape');
  await app.waitForIdle();
  await desktopExpect(app.getByTestId('Home-title')).toBeVisible();
});

test("the module's back button pops the stack", async () => {
  // `native-stack-native-back` is the one scenario that does not replace the
  // back button with a JS `headerLeft`, so a click on `‹` can only reach the
  // button the module paints. The other scenarios would pass this test with the
  // button missing entirely.
  await launch('NavigationFixture', 'native-stack-native-back');
  await app.getByText('Open details').click();
  await desktopExpect(app.getByTestId('Details 1-title')).toBeVisible();
  // There is no React node for a painted button, so the click goes by position:
  // the module puts it at the header's left edge, 56x56, below the window's top
  // inset. y = 40 is inside it with no inset and with a transparent title bar's.
  await app.mouseDown({ x: 28, y: 40 });
  await app.mouseUp({ x: 28, y: 40 });
  await app.waitForIdle();
  // The navigator answers `onHeaderBackButtonClicked` by dispatching a pop, and
  // React Native declares that event on `RNSScreen`. A dispatch to the header
  // config is dropped, so nothing pops and this screen stays.
  await desktopExpect(app.getByTestId('Home-title')).toBeVisible();
  await desktopExpect(app.getByTestId('Details 1-title')).toBeHidden();
});

test('a modal sheet paints a backdrop and a sheet over the screen underneath', async () => {
  await launch('NavigationFixture', 'native-stack-modal');
  await app.getByText('Open details').click();
  await desktopExpect(app.getByTestId('Details 1-title')).toBeVisible();
  // The sheet is painted inside the screen, so the test driver's frames — which
  // report the Yoga origin — cannot see where it landed. Read the pixels instead.
  if (!app.captureSupported) return;
  const image = PNG.sync.read(await app.screenshot());
  const pixel = (x: number, y: number) => {
    const offset = (image.width * y + x) * 4;
    return {
      r: image.data[offset],
      g: image.data[offset + 1],
      b: image.data[offset + 2],
    };
  };
  // The sheet is centred in the screen and capped at 760x640, so the middle of
  // the capture is inside it whatever the window size. It paints 0xff171923.
  const centre = pixel(
    Math.floor(image.width / 2),
    Math.floor(image.height / 2),
  );
  expect(Math.abs(centre.r - 0x17)).toBeLessThanOrEqual(0x0a);
  expect(Math.abs(centre.g - 0x19)).toBeLessThanOrEqual(0x0a);
  expect(Math.abs(centre.b - 0x23)).toBeLessThanOrEqual(0x0a);
  // A corner is outside the sheet. What it holds differs by platform — the
  // menu bar on Linux, the window frame on Windows — so this asserts that it is
  // *not* the sheet rather than naming a colour, which is enough to fail a
  // window that painted one flat colour.
  const corner = pixel(4, 4);
  const differs =
    Math.abs(corner.r - centre.r) > 0x10 ||
    Math.abs(corner.g - centre.g) > 0x10 ||
    Math.abs(corner.b - centre.b) > 0x10;
  expect(differs).toBe(true);
});

test('native FullWindowOverlay renders above the application', async () => {
  await launch('NavigationFixture', 'native-stack-overlay');
  await desktopExpect(
    app.getByText('Full window overlay above the app'),
  ).toBeVisible();
  await desktopExpect(
    app.getByText('Navigation content behind overlay'),
  ).toBeVisible();
});

test('mouse back and forward restore stack history', async () => {
  await launch('NavigationFixture', 'stack');
  await app.getByText('Open details').click();
  await app.mouseDown({ x: 10, y: 10 }, { button: 'back' });
  await app.mouseUp({ x: 10, y: 10 }, { button: 'back' });
  await app.waitForIdle();
  expect(app.readLogs()).toContain('[nav] stack state route=Home title=Home');
  await app.mouseDown({ x: 10, y: 10 }, { button: 'forward' });
  await app.mouseUp({ x: 10, y: 10 }, { button: 'forward' });
  await app.waitForIdle();
  await desktopExpect(app.getByTestId('Details 1-title')).toBeVisible();
  expect(app.readLogs()).toContain(
    '[navigation] emitted hardwareForwardPress from mouse button',
  );
});

test('keyboard back and forward survive consecutive route changes', async () => {
  await launch('NavigationFixture', 'stack');
  await app.getByText('Open details').click();
  await app.press('mod-[');
  await app.waitForIdle();
  await app.press('mod-]');
  await app.waitForIdle();
  await desktopExpect(app.getByTestId('Details 1-title')).toBeVisible();
  expect(app.readLogs()).toContain(
    '[navigation] emitted hardwareForwardPress from keyboard',
  );
});

test('native stack slide, none and fade modes finish and pop all routes', async () => {
  await launch('NavigationFixture', 'native-stack');
  await app.setAnimationsEnabled(true);
  await app.getByText('Open details').click();
  for (const id of [2, 3, 4]) {
    await app.getByTestId(`details-${id - 1}-next`).click();
    await desktopExpect(app.getByTestId(`Details ${id}-title`)).toBeVisible();
  }
  for (const id of [3, 2, 1]) {
    await app.press('escape');
    await app.waitForIdle();
    await desktopExpect(app.getByTestId(`Details ${id}-title`)).toBeVisible();
  }
  await app.press('escape');
  await app.waitForIdle();
  await desktopExpect(app.getByTestId('Home-title')).toBeVisible();
  expect(app.readLogs()).toContain(
    '[nav-native] transition end route=Details closing=true',
  );
});

test('one Escape dismisses one screen exactly once', async () => {
  // Escape runs the dismissal animation itself and then tells JavaScript, which
  // pops the screen. When the pop batch arrived, the flag that says "this
  // dismissal already animated" had already been cleared, so the removal ran a
  // second exit from the rest pose: the card came back and left again, and both
  // lifecycle halves fired twice. Count them, against a log that names the tag.
  // The fixture logs a `[nav-native]` pair per transition, which is the part of
  // the dismissal JavaScript observes. The lifecycle events drive those.
  await launch('NavigationFixture', 'native-stack');
  await app.setAnimationsEnabled(true);
  await app.getByText('Open details').click();
  await desktopExpect(app.getByTestId('Details 1-title')).toBeVisible();
  // The push logs its own transition start after the screen is visible.
  await expect
    .poll(() => app.readLogs())
    .toContain('[nav-native] transition end route=Details closing=false');
  const before = app.readLogs().length;
  await app.press('escape');
  await app.waitForIdle();
  await desktopExpect(app.getByTestId('Home-title')).toBeVisible();
  const after = app.readLogs().slice(before);
  const starts = [
    ...after.matchAll(/\[nav-native\] transition start route=Details/gu),
  ];
  const ends = [
    ...after.matchAll(/\[nav-native\] transition end route=Details/gu),
  ];
  expect(starts).toHaveLength(1);
  expect(ends).toHaveLength(1);
  // And the screen really is gone, rather than animating away and back.
  await desktopExpect(app.getByTestId('Details 1-title')).toBeHidden();
});

test('nested stack and modal preserve the tab input and scroll position', async () => {
  await launch('NavigationFixture', 'nested');
  await app.getByRole('tab', { name: 'List' }).click();
  const input = app.getByTestId('navigation-list-input');
  await input.clear();
  await input.type('Nested state');
  await app.getByTestId('navigation-list').scroll(0, -400);
  await app.getByText('Open modal').click();
  await desktopExpect(app.getByTestId('Modal-title')).toBeVisible();
  await app.press('mod-[');
  await app.waitForIdle();
  await desktopExpect(input).toHaveValue('Nested state');
  expect(app.readLogs()).toContain('scroll offset=400');
});
