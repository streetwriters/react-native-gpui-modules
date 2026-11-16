import { afterAll, expect, test } from 'vitest';
import { expect as desktopExpect } from '@react-native-gpui/testing';
import { closeApp, launch } from './launch';

afterAll(async () => {
  await closeApp();
});

async function updateCount(app: Awaited<ReturnType<typeof launch>>) {
  const [match] = await app.getByTestId('nitro-updates').all();
  return Number(match.text.replace('updates ', ''));
}

test('Nitro Hybrid Objects written in C++ run on desktop', async () => {
  const app = await launch('GPUINitroFixture');
  await desktopExpect(app.getByText('add 5')).toBeVisible(60000);
  await desktopExpect(app.getByText('greet hello desktop')).toBeVisible();
  await desktopExpect(app.getByText('addAsync 9')).toBeVisible();
  await desktopExpect(app.getByText('callBack called ping')).toBeVisible();
  await desktopExpect(app.getByText('sumBytes 10')).toBeVisible();
});

test('a Nitro View gets a native surface and its props', async () => {
  const app = await launch('GPUINitroFixture');
  await desktopExpect(app.getByText('add 5')).toBeVisible(60000);
  await desktopExpect(app.getByText('applied #ff0000')).toBeVisible();
  await desktopExpect(app.getByText('native true')).toBeVisible();

  const [surface] = await app.nativeSurfaces();
  expect(surface.testID).toBe('nitro-view');
  expect(surface.bounds?.width).toBeCloseTo(120, 0);
  expect(surface.bounds?.height).toBeCloseTo(80, 0);

  const before = await updateCount(app);
  await app.getByTestId('nitro-toggle').click();
  await desktopExpect(app.getByText('applied #00ff00')).toBeVisible();
  expect(await updateCount(app)).toBeGreaterThan(before);
  await desktopExpect(app.getByText('native true')).toBeVisible();

  if (process.platform === 'darwin') {
    const [after] = await app.nativeSurfaces();
    const [red, green] = after.view?.background ?? [];
    expect(red).toBeCloseTo(0, 1);
    expect(green).toBeCloseTo(1, 1);
  }
});
