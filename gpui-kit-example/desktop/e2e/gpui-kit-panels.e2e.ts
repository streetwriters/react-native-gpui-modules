import { PNG } from 'pngjs';
import { afterAll, expect, test } from 'vitest';
import { expect as desktopExpect } from '@react-native-gpui/testing';
import { closeApp, launch } from './launch';

type App = Awaited<ReturnType<typeof launch>>;

afterAll(async () => {
  await closeApp();
});

const settle = async (app: App) => {
  await app.waitForIdle();
  await new Promise(resolve => setTimeout(resolve, 600));
  await app.waitForIdle();
};

const red = async (app: App, testID: string) => {
  const png = PNG.sync.read(await app.getByTestId(testID).screenshot());
  let count = 0;
  for (let at = 0; at < png.data.length; at += 4) {
    if (png.data[at] > 200 && png.data[at + 1] < 60 && png.data[at + 2] < 60) {
      count++;
    }
  }
  return count;
};

test('panels: a dock holds React Native panels, selects a tab and toggles a dock', async () => {
  const app = await launch('GPUIKitPanelsFixture');
  await desktopExpect(app.getByTestId('panels-editor')).toBeVisible(60000);
  await desktopExpect(app.getByTestId('panels-files')).toBeVisible();
  await desktopExpect(app.getByTestId('panels-output')).toBeVisible();
  const open = await red(app, 'panels-dock');
  expect(open).toBeGreaterThan(100);
  await app.getByTestId('panels-select').click();
  await settle(app);
  await desktopExpect(app.getByTestId('panels-console')).toBeVisible();
  await app.getByTestId('panels-toggle').click();
  await settle(app);
  expect(await red(app, 'panels-dock')).toBeLessThan(open);
});

test('panels: a questionnaire takes shortcut answers, moves on and submits', async () => {
  const app = await launch('GPUIKitPanelsFixture');
  await desktopExpect(app.getByTestId('panels-log')).toBeVisible(60000);
  const [match] = await app.getByTestId('panels-questions').all();
  const at = { x: match.frame.x + 10, y: match.frame.y + 10 };
  await app.mouseMove(at);
  await app.mouseDown(at);
  await app.mouseUp(at);
  await app.press('1');
  await settle(app);
  await desktopExpect(app.getByTestId('panels-log')).toContainText(
    'answer color=red',
  );
  await app.getByTestId('panels-next').click();
  await settle(app);
  await desktopExpect(app.getByTestId('panels-log')).toContainText('item size');
  await app.press('1');
  await settle(app);
  await app.getByTestId('panels-submit').click();
  await settle(app);
  await desktopExpect(app.getByTestId('panels-log')).toContainText('submit');
});
