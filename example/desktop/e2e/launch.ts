import path from 'node:path';
import { launchApp, type DesktopApp } from '@react-native-gpui/testing';

let current: DesktopApp | undefined;

export async function launch(
  module: string,
  scenario?: string,
  initialProps: Record<string, unknown> = {},
  { offscreen = true }: { offscreen?: boolean } = {},
) {
  if (current) await current.close();
  current = await launchApp({
    env: {
      RN_GPUI_MODULE: module,
      RN_GPUI_WINDOW_STATE: path.resolve(
        `.local/e2e-${module}-${scenario ?? 'default'}.json`,
      ),
    },
    initialProps: { scenario, ...initialProps },
    disableAnimations: true,
    logFile: process.env.RN_GPUI_E2E_LOG,
    offscreen,
  });
  await current.setWindowSize(1024, 768);
  return current;
}

export function currentApp() {
  return current;
}

export async function closeApp() {
  await current?.close();
  current = undefined;
}
