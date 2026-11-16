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

test('AsyncStorage reads, writes, merges and keeps named storages apart', async () => {
  const app = await launch('GPUIAsyncStorageFixture');
  await desktopExpect(app.getByTestId('as-run')).toBeVisible(120000);
  await app.getByTestId('as-run').click();
  await desktopExpect(app.getByTestId('as-get')).toBeVisible(15000);

  expect(await textOf(app, 'as-get')).toBe('get: 1');
  expect(await textOf(app, 'as-missing')).toBe('missing: null');
  expect(await textOf(app, 'as-removed')).toBe('removed: null');
  expect(await textOf(app, 'as-keys')).toBe('keys: k1,k2');
  expect(await textOf(app, 'as-getMany')).toBe(
    'getMany: {"k1":"v1","k3":null}',
  );
  expect(await textOf(app, 'as-legacyGet')).toBe(
    'legacyGet: [["k1","v1"],["k3",null]]',
  );
  expect(JSON.parse((await textOf(app, 'as-merge')).slice(7))).toEqual({
    a: { b: 1, c: 9, e: 4 },
    d: 3,
  });
  expect(await textOf(app, 'as-customGet')).toBe('customGet: custom');
  expect(await textOf(app, 'as-customIsolated')).toBe('customIsolated: null');
  expect(await textOf(app, 'as-customKeys')).toBe('customKeys: c1');
  expect(await textOf(app, 'as-customMany')).toBe(
    'customMany: {"m1":"x","m2":"y","zz":null}',
  );
  expect(await textOf(app, 'as-customRemoved')).toBe('customRemoved: c1,m2');
  expect(await textOf(app, 'as-cleared')).toBe('cleared: 0');
  expect(await textOf(app, 'as-customKept')).toBe('customKept: custom');
});

test('AsyncStorage values survive a relaunch', async () => {
  let app = await launch('GPUIAsyncStorageFixture');
  await desktopExpect(app.getByTestId('as-run')).toBeVisible(60000);
  await app.getByTestId('as-persist-clear').click();
  await desktopExpect(app.getByText('persisted null | null')).toBeVisible();
  await app.getByTestId('as-persist-write').click();
  await desktopExpect(
    app.getByText('persisted default across launches | custom across launches'),
  ).toBeVisible();

  app = await launch('GPUIAsyncStorageFixture');
  await desktopExpect(app.getByTestId('as-run')).toBeVisible(60000);
  await app.getByTestId('as-persist-read').click();
  await desktopExpect(
    app.getByText('persisted default across launches | custom across launches'),
  ).toBeVisible();
  await app.getByTestId('as-persist-clear').click();
  await desktopExpect(app.getByText('persisted null | null')).toBeVisible();
});
