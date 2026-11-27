import { PNG } from 'pngjs';
import { afterAll, expect, test } from 'vitest';
import { expect as desktopExpect } from '@react-native-gpui/testing';
import { closeApp, launch } from './launch';

afterAll(async () => {
  await closeApp();
});

const log = (app: Awaited<ReturnType<typeof launch>>) =>
  app.getByTestId('mixed-log');

test('mixed views: RN views, kit views and RN views inside kit views sit next to each other', async () => {
  const app = await launch('GPUIKitMixedFixture');
  await desktopExpect(app.getByTestId('mixed-kit-button')).toBeVisible(60000);
  await app.getByTestId('mixed-kit-button').click();
  await app.getByTestId('mixed-rn-pressable').click();
  await app.getByTestId('mixed-kit-children-text').click();
  await desktopExpect(log(app)).toHaveText('log kit,rn,child,');
});

test('mixed views: RN content in the title, body and footer slots of a kit view takes presses', async () => {
  const app = await launch('GPUIKitMixedFixture');
  await desktopExpect(app.getByTestId('mixed-title')).toBeVisible(60000);
  await desktopExpect(app.getByTestId('mixed-body-text')).toBeVisible();
  await app.getByTestId('mixed-body-pressable').click();
  await app.getByTestId('mixed-footer-button').click();
  await app.getByTestId('mixed-body-checkbox').click();
  await desktopExpect(log(app)).toHaveText('log body,footer,checkbox:true,');
});

test('mixed views: a kit view in a slot of a kit view in a slot of a kit view works', async () => {
  const app = await launch('GPUIKitMixedFixture');
  await desktopExpect(app.getByTestId('mixed-nested-switch')).toBeVisible(
    60000,
  );
  await desktopExpect(app.getByTestId('mixed-nested-text')).toBeVisible();
  await app.getByTestId('mixed-nested-switch').click();
  await desktopExpect(app.getByTestId('mixed-nested-state')).toHaveText(
    'nested true',
  );
});

test('mixed views: slots of a description list, a marker and an empty state hold RN content', async () => {
  const app = await launch('GPUIKitMixedFixture');
  await desktopExpect(app.getByTestId('mixed-description-button')).toBeVisible(
    60000,
  );
  await desktopExpect(app.getByTestId('mixed-marker-text')).toBeVisible();
  await desktopExpect(app.getByTestId('mixed-empty-description')).toBeVisible();
  await app.getByTestId('mixed-description-button').click();
  await app.getByTestId('mixed-empty-action').click();
  await desktopExpect(log(app)).toHaveText('log described,add,');
});

test('mixed views: slotted kit views are drawn (not blank) and RN content sits inside their frame', async () => {
  const app = await launch('GPUIKitMixedFixture');
  await desktopExpect(app.getByTestId('mixed-group')).toBeVisible(60000);
  const png = PNG.sync.read(await app.getByTestId('mixed-group').screenshot());
  const first = png.data.readUInt32LE(0);
  let different = 0;
  for (let at = 0; at < png.data.length; at += 4) {
    if (png.data.readUInt32LE(at) !== first) different++;
  }
  expect(different).toBeGreaterThan(500);
  const [group] = await app.getByTestId('mixed-group').all();
  const [body] = await app.getByTestId('mixed-body-text').all();
  expect(body.frame.x).toBeGreaterThanOrEqual(group.frame.x);
  expect(body.frame.y + body.frame.height).toBeLessThanOrEqual(
    group.frame.y + group.frame.height,
  );
});
