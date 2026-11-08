import { execFileSync } from 'node:child_process';
import { afterAll, beforeAll, expect, test } from 'vitest';
import {
  launchApp,
  expect as desktopExpect,
  type DesktopApp,
} from '@react-native-gpui/testing';

let app: DesktopApp;

beforeAll(async () => {
  app = await launchApp({
    disableAnimations: true,
    timeout: 120000,
    logFile: process.env.RN_GPUI_E2E_LOG,
  });
});

afterAll(async () => {
  await app?.close();
});

function flavour(type: string) {
  return execFileSync(
    'osascript',
    [
      '-l',
      'JavaScript',
      '-e',
      `ObjC.import('AppKit'); const v = $.NSPasteboard.generalPasteboard.stringForType('${type}'); v.isNil() ? '<none>' : ObjC.unwrap(v)`,
    ],
    { encoding: 'utf8' },
  ).trim();
}

test.skipIf(process.platform !== 'darwin')(
  'setRich puts text, HTML and Markdown on the clipboard as one item',
  async () => {
    await app.getByTestId('nav-clipboard').click();
    await desktopExpect(app.getByTestId('summary')).toHaveText('PASS');
    expect(await app.clipboardText()).toBe('Title rich ✓');
    expect(flavour('public.utf8-plain-text')).toBe('Title rich ✓');
    expect(flavour('public.html')).toBe('<h1>Title</h1><p>rich ✓</p>');
    expect(flavour('net.daringfireball.markdown')).toBe('# Title\n\nrich ✓');
  },
);
