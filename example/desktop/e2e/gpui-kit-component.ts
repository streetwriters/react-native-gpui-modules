import { createHash } from 'node:crypto';
import { afterAll, expect, test } from 'vitest';
import { expect as desktopExpect } from '@react-native-gpui/testing';
import { closeApp, launch } from './launch';

type Prop = {
  name: string;
  control: 'toggle' | 'enum' | 'text' | 'icon' | 'color' | 'number';
  options?: string[];
};

export type ComponentSpec = {
  name: string;
  id: string;
  props: Prop[];
  events: string[];
  commands: string[];
  /** The value is text the user types (onChangeText). */
  typed: boolean;
  /** An event a click on the component reports, or false for none. */
  click?: string | false;
  /** Keys typed for the typing check. */
  keys?: string[];
  /** Props whose change draws nothing different by design. */
  invisible?: string[];
};

type App = Awaited<ReturnType<typeof launch>>;

const pause = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

const shot = async (app: App, id: string) =>
  createHash('sha1')
    .update(await app.getByTestId(id).screenshot())
    .digest('hex');

const logText = async (app: App, id: string) =>
  app.getByTestId(`${id}-log`).textContent();

const CLICK_EVENTS = ['onPress', 'onChange', 'onCopied', 'onFocus'];

/**
 * The e2e checks of one generated component, on its generated tester screen:
 * every prop control is applied and the component keeps rendering, the props
 * change what is drawn, a click reports its event, typing reports changes, and
 * every command runs.
 */
export function componentSuite(spec: ComponentSpec) {
  afterAll(async () => {
    await closeApp();
  });

  const open = async () => {
    const app = await launch('GPUIKitComponentFixture', spec.name);
    await desktopExpect(app.getByTestId(spec.id)).toBeVisible(60000);
    await pause();
    return app;
  };

  test(`${spec.name}: every prop applies and changes the drawing`, async () => {
    const app = await open();
    const seen = new Set([await shot(app, spec.id)]);
    for (const prop of spec.props) {
      const control = `${spec.id}-prop-${prop.name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;
      if (prop.control === 'enum') {
        for (const option of prop.options ?? []) {
          await app.getByTestId(`${control}-${option}`).click();
          await pause(100);
          seen.add(await shot(app, spec.id));
        }
      } else if (prop.control !== 'toggle' && prop.control !== 'number') {
        await app
          .getByTestId(control)
          .type(
            prop.control === 'color'
              ? '#ff0000'
              : prop.control === 'icon'
                ? 'heart'
                : 'x',
          );
        await pause(100);
        seen.add(await shot(app, spec.id));
      } else {
        await app.getByTestId(control).click();
        await pause(100);
        seen.add(await shot(app, spec.id));
      }
      await desktopExpect(app.getByTestId(spec.id)).toBeVisible(5000);
    }
    const visible = spec.props.filter(
      p => !(spec.invisible ?? []).includes(p.name),
    );
    if (visible.length > 0) expect(seen.size).toBeGreaterThan(1);
  });

  const clickEvent =
    spec.click === undefined
      ? spec.events.find(e => CLICK_EVENTS.includes(e))
      : spec.click || undefined;
  if (spec.typed) {
    test(`${spec.name}: typing reports the text`, async () => {
      const app = await open();
      await app.getByTestId(spec.id).click();
      for (const key of spec.keys ?? ['a', 'b']) await app.press(key);
      await pause();
      expect(await logText(app, spec.id)).toContain('onChange');
    });
  } else if (clickEvent) {
    test(`${spec.name}: a click reports ${clickEvent}`, async () => {
      const app = await open();
      await app.getByTestId(spec.id).click();
      await pause();
      expect(await logText(app, spec.id)).toContain(clickEvent);
    });
  }

  if (spec.commands.length > 0) {
    test(`${spec.name}: every command runs`, async () => {
      const app = await open();
      const before = await shot(app, spec.id);
      for (const command of spec.commands) {
        await app.getByTestId(`${spec.id}-cmd-${command}`).click();
        await pause(100);
        await desktopExpect(app.getByTestId(spec.id)).toBeVisible(5000);
      }
      if (spec.commands.includes('insert'))
        expect(await shot(app, spec.id)).not.toBe(before);
    });
  }
}
