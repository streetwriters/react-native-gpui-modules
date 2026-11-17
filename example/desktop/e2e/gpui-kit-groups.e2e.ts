import { PNG } from 'pngjs';
import { afterAll, expect, test } from 'vitest';
import { expect as desktopExpect } from '@react-native-gpui/testing';
import { closeApp, launch } from './launch';

afterAll(async () => {
  await closeApp();
});

const painted = (png: PNG) => {
  const first = png.data.readUInt32LE(0);
  let different = 0;
  for (let at = 0; at < png.data.length; at += 4) {
    if (png.data.readUInt32LE(at) !== first) different++;
  }
  return different;
};

test('gpui-kit groups: a ButtonGroup reports the pressed index and calls the button', async () => {
  const app = await launch('GPUIKitGroupsFixture');
  await desktopExpect(app.getByTestId('groups-button-group')).toBeVisible(
    60000,
  );
  const [group] = await app.getByTestId('groups-button-group').all();
  await app.mouseDown({
    x: group.frame.x + group.frame.width * 0.5,
    y: group.frame.y + group.frame.height / 2,
  });
  await app.mouseUp({
    x: group.frame.x + group.frame.width * 0.5,
    y: group.frame.y + group.frame.height / 2,
  });
  await desktopExpect(app.getByTestId('groups-button-group-state')).toHaveText(
    'pressed 1',
  );
  await desktopExpect(app.getByTestId('groups-log')).toHaveText('log two,');
});

test('gpui-kit groups: a single ToggleGroup checks one item', async () => {
  const app = await launch('GPUIKitGroupsFixture');
  await desktopExpect(app.getByTestId('groups-toggle-group')).toBeVisible(
    60000,
  );
  const [group] = await app.getByTestId('groups-toggle-group').all();
  const at = {
    x: group.frame.x + group.frame.width * 0.2,
    y: group.frame.y + group.frame.height / 2,
  };
  await app.mouseDown(at);
  await app.mouseUp(at);
  await desktopExpect(app.getByTestId('groups-toggle-group-state')).toHaveText(
    'checked 0',
  );
});

test('gpui-kit groups: an AvatarGroup and Kbd draw', async () => {
  const app = await launch('GPUIKitGroupsFixture');
  await desktopExpect(app.getByTestId('groups-avatar-group')).toBeVisible(
    60000,
  );
  for (const id of [
    'groups-avatar-group',
    'groups-kbd',
    'groups-kbd-outline',
  ]) {
    expect(
      painted(PNG.sync.read(await app.getByTestId(id).screenshot())),
    ).toBeGreaterThan(30);
  }
});

test('gpui-kit groups: a DropdownButton opens its menu and reports the chosen item', async () => {
  const app = await launch('GPUIKitGroupsFixture');
  await desktopExpect(app.getByTestId('groups-dropdown')).toBeVisible(60000);
  const [dropdown] = await app.getByTestId('groups-dropdown').all();
  const action = {
    x: dropdown.frame.x + dropdown.frame.width * 0.3,
    y: dropdown.frame.y + dropdown.frame.height / 2,
  };
  await app.mouseDown(action);
  await app.mouseUp(action);
  await desktopExpect(app.getByTestId('groups-dropdown-state')).toHaveText(
    'actions 1 selected none',
  );
  const caret = {
    x: dropdown.frame.x + dropdown.frame.width - 10,
    y: dropdown.frame.y + dropdown.frame.height / 2,
  };
  await app.mouseDown(caret);
  await app.mouseUp(caret);
  await app.press('down');
  await app.press('enter');
  await desktopExpect(app.getByTestId('groups-dropdown-state')).toHaveText(
    'actions 1 selected 0',
  );
  await desktopExpect(app.getByTestId('groups-log')).toHaveText('log first,');
});

test('gpui-kit groups: the focus command focuses a focusable Button', async () => {
  const app = await launch('GPUIKitGroupsFixture');
  await desktopExpect(app.getByTestId('groups-focus')).toBeVisible(60000);
  await app.getByTestId('groups-focus').click();
  await app.press('enter');
  await desktopExpect(app.getByTestId('groups-log')).toHaveText(
    'log focusable,',
  );
});

const clickAt = async (
  app: Awaited<ReturnType<typeof launch>>,
  testID: string,
  fx: number,
) => {
  const [match] = await app.getByTestId(testID).all();
  const at = {
    x: match.frame.x + match.frame.width * fx,
    y: match.frame.y + match.frame.height / 2,
  };
  await app.mouseDown(at);
  await app.mouseUp(at);
};

test('gpui-kit groups: a Breadcrumb, a Stepper and a Pagination report the pressed index', async () => {
  const app = await launch('GPUIKitGroupsFixture');
  await desktopExpect(app.getByTestId('groups-breadcrumb')).toBeVisible(60000);
  await clickAt(app, 'groups-breadcrumb', 0.5);
  await desktopExpect(app.getByTestId('groups-breadcrumb-state')).toHaveText(
    'crumb 1',
  );
  await clickAt(app, 'groups-stepper', 0.5);
  await desktopExpect(app.getByTestId('groups-stepper-state')).toHaveText(
    'step 1',
  );
  await clickAt(app, 'groups-pagination', 0.54);
  await desktopExpect(app.getByTestId('groups-pagination-state')).toHaveText(
    'page 3',
  );
});

test('gpui-kit groups: a Clipboard copies its value and a Separator draws', async () => {
  const app = await launch('GPUIKitGroupsFixture');
  await desktopExpect(app.getByTestId('groups-clipboard')).toBeVisible(60000);
  const [clipboard] = await app.getByTestId('groups-clipboard').all();
  const at = {
    x: clipboard.frame.x + clipboard.frame.width / 2,
    y: clipboard.frame.y + clipboard.frame.height / 2,
  };
  await app.mouseDown(at);
  await app.mouseUp(at);
  await desktopExpect(app.getByTestId('groups-clipboard-state')).toHaveText(
    'copied copied text',
  );
  expect(await app.clipboardText()).toBe('copied text');
  expect(
    painted(
      PNG.sync.read(await app.getByTestId('groups-separator').screenshot()),
    ),
  ).toBeGreaterThan(20);
});
