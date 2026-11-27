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
    if (png.data[at] > 200 && png.data[at + 1] < 60 && png.data[at + 2] < 60)
      count++;
  }
  return count;
};

const open = async (scenario: string, first: string) => {
  const app = await launch('GPUIKitGapsFixture', scenario);
  await desktopExpect(app.getByTestId(first)).toBeVisible(60000);
  return app;
};

test('gaps: renderToken draws an inserted token with React Native content', async () => {
  const app = await open('token', 'gaps-input');
  await app.getByTestId('gaps-insert').click();
  await settle(app);
  await desktopExpect(app.getByTestId('gaps-token-t1')).toBeVisible();
  expect(await red(app, 'gaps-input')).toBeGreaterThan(100);
});

test('gaps: validation rejects an edit in Rust and reports why', async () => {
  const app = await open('validation', 'gaps-input');
  await app.getByTestId('gaps-good').click();
  await settle(app);
  await app.getByTestId('gaps-bad').click();
  await settle(app);
  await desktopExpect(app.getByTestId('gaps-log')).toHaveText(
    'log change ab;fail ab9:letters only;',
  );
});

test('gaps: holdSelection moves focus to the adapter handle and back', async () => {
  const app = await open('selection', 'gaps-input');
  await app.getByTestId('gaps-hold').click();
  await settle(app);
  await desktopExpect(app.getByTestId('gaps-log')).toContainText('held true');
  await app.getByTestId('gaps-release').click();
  await settle(app);
  await desktopExpect(app.getByTestId('gaps-log')).toContainText('held false');
});

test('gaps: scrollbarStyle draws the scrollbar in its colors', async () => {
  const app = await open('scrollbar', 'gaps-textarea');
  await settle(app);
  expect(await red(app, 'gaps-textarea')).toBeGreaterThan(300);
});

test('gaps: the code editor takes a highlight theme and editor colors', async () => {
  const app = await open('editor', 'gaps-editor');
  await settle(app);
  expect(await red(app, 'gaps-editor')).toBeGreaterThan(5000);
  expect(await red(app, 'gaps-editor-plain')).toBe(0);
});

test('gaps: a settings entry of kind field is a kit field with RN content', async () => {
  const app = await open('settings', 'gaps-settings');
  await desktopExpect(app.getByTestId('gaps-field')).toBeVisible();
  expect(await red(app, 'gaps-settings')).toBeGreaterThan(500);
});

test('gaps: a JS recognizer and JS audio drive a speech session', async () => {
  const app = await open('speech', 'gaps-speech');
  await app.getByTestId('gaps-start').click();
  await settle(app);
  await desktopExpect(app.getByTestId('gaps-log')).toContainText(
    'recognizer 16000',
  );
  await desktopExpect(app.getByTestId('gaps-log')).toContainText('audio 1');
  await app.getByTestId('gaps-audio').click();
  await app.getByTestId('gaps-phrase').click();
  await settle(app);
  await app.getByTestId('gaps-stop').click();
  await settle(app);
  await desktopExpect(app.getByTestId('gaps-log')).toContainText('finish');
  await desktopExpect(app.getByTestId('gaps-log')).toContainText('audiostop');
  await app.getByTestId('gaps-finish').click();
  await settle(app);
  await desktopExpect(app.getByTestId('gaps-log')).toContainText(
    'transcript hello|true',
  );
  await desktopExpect(app.getByTestId('gaps-log')).toContainText('end');
});

test('gaps: a dock layout dumps with panel keys and restores the same panels', async () => {
  const app = await open('dock', 'gaps-panel-editor');
  await settle(app);
  await desktopExpect(app.getByTestId('gaps-log')).toContainText('layout true');
  await app.getByTestId('gaps-restore').click();
  await settle(app);
  await desktopExpect(app.getByTestId('gaps-panel-editor')).toBeVisible();
  await desktopExpect(app.getByTestId('gaps-panel-files')).toBeVisible();
});

test('gaps: a questionnaire validator keeps an answer that breaks its rules', async () => {
  const app = await open('questionnaire', 'gaps-questions');
  const [match] = await app.getByTestId('gaps-questions').all();
  const at = { x: match.frame.x + 10, y: match.frame.y + 10 };
  await app.mouseMove(at);
  await app.mouseDown(at);
  await app.mouseUp(at);
  await app.press('1');
  await settle(app);
  await app.getByTestId('gaps-next').click();
  await settle(app);
  expect(await app.getByTestId('gaps-log').textContent()).not.toContain(
    'item size',
  );
  await app.press('2');
  await settle(app);
  await app.getByTestId('gaps-next').click();
  await settle(app);
  await desktopExpect(app.getByTestId('gaps-log')).toContainText('item size');
});

test('gaps: a list asks for more rows near its end and reports a dragged row dropped after another', async () => {
  const app = await open('list', 'gaps-list');
  await desktopExpect(app.getByTestId('gaps-log')).toContainText('more;');
  const [list] = await app.getByTestId('gaps-list').all();
  const x = list.frame.x + 40;
  const row = (index: number, part: number) =>
    list.frame.y + 4 + index * 32 + 32 * part;
  await app.mouseMove({ x, y: row(0, 0.5) });
  await app.mouseDown({ x, y: row(0, 0.5) });
  for (const step of [0.6, 0.9, 1.4, 1.9, 2.4, 2.75])
    await app.mouseMove({ x, y: row(0, step) });
  await new Promise(resolve => setTimeout(resolve, 300));
  await app.mouseUp({ x, y: row(0, 2.75) });
  await desktopExpect(app.getByTestId('gaps-log')).toContainText(
    'move 0>2 after;',
  );
});

test('gaps: a data table reports sorting, selection, column moves and menus, and loads more rows', async () => {
  const app = await open('table', 'gaps-table');
  const log = app.getByTestId('gaps-log');
  const [table] = await app.getByTestId('gaps-table').all();
  const at = (x: number, y: number) => ({
    x: table.frame.x + x,
    y: table.frame.y + y,
  });
  const tap = async (id: string) => {
    const [node] = await app.getByTestId(id).all();
    await press(
      node.frame.x + node.frame.width / 2 - table.frame.x,
      node.frame.y + node.frame.height / 2 - table.frame.y,
    );
  };
  const press = async (x: number, y: number) => {
    await app.mouseMove(at(x, y));
    await app.mouseDown(at(x, y));
    await new Promise(resolve => setTimeout(resolve, 100));
    await app.mouseUp(at(x, y));
    await app.waitForIdle();
    await new Promise(resolve => setTimeout(resolve, 300));
  };
  await press(30, 16);
  await desktopExpect(log).toContainText('col 0;');
  await press(102, 16);
  await desktopExpect(log).toContainText('sort 0 descending;');
  await press(150, 33 + 32 * 2 + 16);
  await desktopExpect(log).toContainText('cell 2:1;');
  await tap('gaps-select');
  await desktopExpect(log).toContainText('cell 3:2;');
  await tap('gaps-clear');
  await desktopExpect(log).toContainText('clear;');
  const from = at(250, 16);
  await app.mouseMove(from);
  await app.mouseDown(from);
  for (const x of [230, 200, 150, 60]) await app.mouseMove(at(x, 16));
  await app.mouseUp(at(60, 16));
  await app.waitForIdle();
  await desktopExpect(log).toContainText('move 2>0;');
  await tap('gaps-scroll');
  await desktopExpect(log).toContainText('scrolled;');
  await desktopExpect(log).toContainText('more;');
});
