import { afterAll, expect, test } from 'vitest';
import { expect as desktopExpect } from '@react-native-gpui/testing';
import { closeApp, launch } from './launch';

let app: Awaited<ReturnType<typeof launch>>;

afterAll(async () => {
  await closeApp();
});

test('the spellcheck module checks, suggests and keeps the user dictionary', async () => {
  app = await launch('GPUISpellcheckFixture');
  await desktopExpect(app.getByText('done ok')).toBeVisible(30000);
  const tree = JSON.stringify(await app.tree());
  for (const expected of [
    'languages ok',
    'check ok',
    'checkLanguage ok',
    'utf16 ok',
    'suggest ok',
    'learn ok',
    'learned ok',
    'forget ok',
    'ignore ok',
  ]) {
    expect(tree).toContain(expected);
  }
  expect(tree).not.toContain('BAD');
  expect(tree).not.toContain('FAILED');
});
