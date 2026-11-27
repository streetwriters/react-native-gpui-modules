import { PNG } from 'pngjs';
import { afterAll, expect, test } from 'vitest';
import { expect as desktopExpect } from '@react-native-gpui/testing';
import { closeApp, launch } from './launch';

afterAll(async () => {
  await closeApp();
});

type App = Awaited<ReturnType<typeof launch>>;

const red = async (app: App, testID: string) => {
  const png = PNG.sync.read(await app.getByTestId(testID).screenshot());
  let count = 0;
  for (let at = 0; at < png.data.length; at += 4) {
    if (
      png.data[at] > 150 &&
      png.data[at] > png.data[at + 1] + 80 &&
      png.data[at] > png.data[at + 2] + 80
    )
      count++;
  }
  return count;
};

const pause = () => new Promise(resolve => setTimeout(resolve, 700));

test('coverage: plot primitives draw bars, arcs, radar and sankey', async () => {
  const app = await launch('GPUIKitCoverageFixture');
  await desktopExpect(app.getByTestId('cov-plot-bar')).toBeVisible(60000);
  await pause();
  for (const kind of ['bar', 'pie', 'donut', 'radar', 'sankey'])
    expect(await red(app, `cov-plot-${kind}`), kind).toBeGreaterThan(200);
});

test('coverage: an action name shows its keybinding and input slots draw', async () => {
  const app = await launch('GPUIKitCoverageFixture');
  await desktopExpect(app.getByTestId('cov-kbd-action')).toBeVisible(60000);
  await pause();
  const kbd = PNG.sync.read(
    await app.getByTestId('cov-kbd-action').screenshot(),
  );
  const first = kbd.data.readUInt32LE(0);
  let painted = 0;
  for (let at = 0; at < kbd.data.length; at += 4)
    if (kbd.data.readUInt32LE(at) !== first) painted++;
  expect(painted).toBeGreaterThan(20);
  for (const id of ['cov-input-slots', 'cov-probe-group', 'cov-probe-marker'])
    expect(await red(app, id), id).toBeGreaterThan(10);
});

test('coverage: style refinements reach the kit parts', async () => {
  const app = await launch('GPUIKitCoverageFixture');
  await desktopExpect(app.getByTestId('cov-group-box')).toBeVisible(60000);
  await pause();
  for (const id of [
    'cov-group-box',
    'cov-marker',
    'cov-breadcrumb',
    'cov-accordion',
  ])
    expect(await red(app, id), id).toBeGreaterThan(10);
});
