import { afterAll, expect, test } from 'vitest';
import { expect as desktopExpect } from '@react-native-gpui/testing';
import { closeApp, launch } from './launch';

afterAll(async () => {
  await closeApp();
});

async function textOf(app: Awaited<ReturnType<typeof launch>>, testID: string) {
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

test('MMKV stores values, encrypts, isolates instances and notifies listeners', async () => {
  const app = await launch('GPUIMmkvFixture');
  await desktopExpect(app.getByTestId('mmkv-run')).toBeVisible(120000);
  await app.getByTestId('mmkv-run').click();
  await desktopExpect(app.getByTestId('mmkv-string')).toBeVisible(15000);

  expect(await textOf(app, 'mmkv-string')).toBe('string: hello');
  expect(await textOf(app, 'mmkv-number')).toBe('number: 42.5');
  expect(await textOf(app, 'mmkv-boolean')).toBe('boolean: true');
  expect(await textOf(app, 'mmkv-buffer')).toBe('buffer: 1,2,3,250');
  expect(await textOf(app, 'mmkv-contains')).toBe('contains: true false');
  expect(await textOf(app, 'mmkv-keys')).toBe('keys: bool,buf,num,str');
  expect(await textOf(app, 'mmkv-removed')).toBe('removed: true undefined');
  expect(await textOf(app, 'mmkv-length')).toBe('length: 3');
  await waitFor(async () =>
    (await textOf(app, 'mmkv-listener').catch(() => '')).startsWith(
      'listener: str,num,bool,buf',
    ),
  );
  expect(await textOf(app, 'mmkv-cleared')).toBe('cleared: 0 false');
  expect(await textOf(app, 'mmkv-encrypted')).toBe('encrypted: true value');
  expect(await textOf(app, 'mmkv-isolated')).toBe('isolated: undefined');
});

test('MMKV values survive a relaunch', async () => {
  let app = await launch('GPUIMmkvFixture');
  await desktopExpect(app.getByTestId('mmkv-run')).toBeVisible(60000);
  await app.getByTestId('mmkv-persist-clear').click();
  await desktopExpect(app.getByText('persisted undefined')).toBeVisible();
  await app.getByTestId('mmkv-persist-write').click();
  await desktopExpect(app.getByText('persisted across launches')).toBeVisible();

  app = await launch('GPUIMmkvFixture');
  await desktopExpect(app.getByTestId('mmkv-run')).toBeVisible(60000);
  await app.getByTestId('mmkv-persist-read').click();
  await desktopExpect(app.getByText('persisted across launches')).toBeVisible();
  await app.getByTestId('mmkv-persist-clear').click();
  await desktopExpect(app.getByText('persisted undefined')).toBeVisible();
});
