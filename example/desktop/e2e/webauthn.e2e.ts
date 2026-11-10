import { afterAll, expect, test } from 'vitest';
import { expect as desktopExpect } from '@react-native-gpui/testing';
import { closeApp, launch } from './launch';

let app: Awaited<ReturnType<typeof launch>>;

afterAll(async () => {
  await closeApp();
});

test('the webauthn module registers a resident credential and derives the same PRF secret twice', async () => {
  app = await launch('GPUIWebauthnFixture');
  await desktopExpect(app.getByText('done ok')).toBeVisible(30000);
  const tree = JSON.stringify(await app.tree());
  for (const expected of [
    'available ok',
    'noPin ok',
    'wrongPin ok',
    'register ok',
    'prfSame ok',
    'prfSalt ok',
    'unknown ok',
    'touch ok',
  ]) {
    expect(tree).toContain(expected);
  }
  expect(tree).not.toContain('BAD');
  expect(tree).not.toContain('FAILED');
});
