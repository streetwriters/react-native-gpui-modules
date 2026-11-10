import { afterAll, expect, test } from 'vitest';
import {
  expect as desktopExpect,
  type DesktopApp,
} from '@react-native-gpui/testing';
import { closeApp, launch as start } from './launch';

let app: DesktopApp;

async function launch(
  module: string,
  scenario?: string,
  initialProps: Record<string, unknown> = {},
  options: { offscreen?: boolean } = {},
) {
  app = await start(module, scenario, initialProps, options);
  return app;
}

afterAll(closeApp);

async function expectCaptureSmoke() {
  if (!app.captureSupported) return;
  expect((await app.screenshot()).length).toBeGreaterThan(1000);
}

test('font loading registers Inter and renders alongside system weights', async () => {
  await launch('GPUIFontFixture');
  await desktopExpect(app.getByTestId('font-load-status')).toContainText(
    'Inter loaded',
  );
  for (const weight of [400, 600, 800]) {
    await desktopExpect(app.getByTestId(`system-font-${weight}`)).toBeVisible();
    await desktopExpect(app.getByTestId(`inter-font-${weight}`)).toBeVisible();
    const [system, inter] = await Promise.all([
      app.query('testID', `system-font-${weight}`, true),
      app.query('testID', `inter-font-${weight}`, true),
    ]);
    const systemProps = (await app.getProps(system[0].tag)) as {
      paragraphFragments: { fontFamily: string; fontWeight: number }[];
    };
    const interProps = (await app.getProps(inter[0].tag)) as typeof systemProps;
    expect(systemProps.paragraphFragments[0].fontWeight).toBe(weight);
    expect(interProps.paragraphFragments[0].fontFamily).toBe('Inter');
    expect(interProps.paragraphFragments[0].fontWeight).toBe(weight);
  }
  await expectCaptureSmoke();
});
