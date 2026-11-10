import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import { PNG } from 'pngjs';
import { afterAll, expect, test } from 'vitest';
import { expect as desktopExpect, type DesktopApp } from '@react-native-gpui/testing';
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

const afterAllServers: http.Server[] = [];

afterAll(async () => {
  await closeApp();
  for (const server of afterAllServers) server.close();
});

async function expectCaptureSmoke() {
  if (!app.captureSupported) return;
  expect((await app.screenshot()).length).toBeGreaterThan(1000);
}

const SERVED_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80"><rect width="120" height="80" rx="12" fill="#152238"/><path d="M18 57 43 25l19 21 14-17 26 28" fill="none" stroke="#64d2ff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="88" cy="25" r="6" fill="#ff6584"/></svg>';

test('SVG primitives, SvgXml and remote SvgUri render from an SVG response', async () => {
  const server = http.createServer((_request, response) => {
    response.setHeader('content-type', 'image/svg+xml');
    response.end(SERVED_SVG);
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  afterAllServers.push(server);
  const { port } = server.address() as AddressInfo;
  await launch('GPUISvgFixture', undefined, {
    uri: `http://127.0.0.1:${port}/svg`,
  });
  await desktopExpect(app.getByTestId('svg-title')).toBeVisible();
  await desktopExpect(app.getByTestId('svg-uri-status')).toContainText(
    'Remote SvgUri loaded',
  );
  const tree = JSON.stringify(await app.tree());
  expect(tree).toContain('React Native SVG');
  // The fixture declares every SVG at 180x120. A renderer that returns its
  // element without a box leaves it an unpositioned flow child, and an image with
  // no intrinsic size fills its parent — the SVGs then paint over the label
  // below them. Asserting the frame is what catches that; the test above only
  // proves something was painted.
  const uriImage = (await app.query('testID', 'svg-uri-image', true))[0];
  expect(uriImage?.frame?.width).toBe(180);
  expect(uriImage?.frame?.height).toBe(120);
  await expectCaptureSmoke();
});

test('a filtered SVG keeps its old image while a new colour is drawn, then shows the new one', async () => {
  await launch('GPUISvgFilterFixture');
  await desktopExpect(app.getByTestId('svg-recolor')).toBeVisible();
  // The centre of the square: red, blue, or the white background when nothing
  // is drawn.
  const centre = async () => {
    const image = PNG.sync.read(
      await app.getByTestId('svg-recolor').screenshot(),
    );
    const at = ((image.height >> 1) * image.width + (image.width >> 1)) * 4;
    const [red, green, blue] = [
      image.data[at],
      image.data[at + 1],
      image.data[at + 2],
    ];
    if (red > 200 && green > 200 && blue > 200) return 'blank';
    if (red > 200 && blue < 60) return 'red';
    if (blue > 200 && red < 60) return 'blue';
    return `other ${red},${green},${blue}`;
  };
  let seen = await centre();
  const deadline = Date.now() + 5000;
  while (seen !== 'red' && Date.now() < deadline) {
    await new Promise(resolve => setTimeout(resolve, 20));
    seen = await centre();
  }
  expect(seen).toBe('red');
  await app.getByTestId('svg-recolor-toggle').click();
  const states: Array<string> = [];
  const until = Date.now() + 5000;
  while (Date.now() < until) {
    states.push(await centre());
    if (states.at(-1) === 'blue') break;
    await new Promise(resolve => setTimeout(resolve, 5));
  }
  console.log('svg recolour states', JSON.stringify(states.slice(0, 40)));
  // Never blank in between: the old image stays until the new one is ready.
  expect(states).not.toContain('blank');
  expect(states.at(-1)).toBe('blue');
});

test('an SVG illustration with rotated cards and drop shadows looks like Chrome', async () => {
  const reference = PNG.sync.read(
    fs.readFileSync(
      path.join(__dirname, 'reference', 'chrome-illustration.png'),
    ),
  );
  await launch('GPUISvgFilterFixture');
  await desktopExpect(app.getByTestId('svg-filter')).toBeVisible();
  const count = (image: PNG, level: number) => {
    expect([image.width, image.height]).toEqual([
      reference.width,
      reference.height,
    ]);
    let different = 0;
    for (let i = 0; i < reference.width * reference.height; i += 1) {
      for (let channel = 0; channel < 3; channel += 1) {
        if (
          Math.abs(
            image.data[i * 4 + channel] - reference.data[i * 4 + channel],
          ) > level
        ) {
          different += 1;
          break;
        }
      }
    }
    return different;
  };
  await new Promise(resolve => setTimeout(resolve, 1000));
  const shot = await app.getByTestId('svg-filter').screenshot();
  fs.writeFileSync(
    process.env.SVG_FILTER_OUT ?? os.tmpdir() + '/svg-filter.png',
    shot,
  );
  const image = PNG.sync.read(shot);
  console.log(
    'svg illustration mismatches',
    JSON.stringify({ over2: count(image, 2), over8: count(image, 8) }),
  );
  expect(count(image, 8)).toBeLessThanOrEqual(300);
});

test('an SVG icon has the same antialiased edge and place as Chrome draws', async () => {
  // The references are what Chrome draws at a device scale of 2 on #f7f7f7: the
  // Material "star outline" at 16 CSS pixels, and the arrow-left icon at 15 CSS
  // pixels centred in a 20 pixel button, where Chrome snaps the icon to a whole
  // CSS pixel.
  const read = (name: string) =>
    PNG.sync.read(fs.readFileSync(path.join(__dirname, 'reference', name)));
  const cases: Array<[string, PNG]> = [
    ['svg-edge-fixed', read('chrome-star-16.png')],
    ['svg-edge-stretched', read('chrome-star-16.png')],
    ['svg-edge-centered', read('chrome-arrow-centered.png')],
    ['svg-edge-centered-stretched', read('chrome-arrow-centered.png')],
    ['svg-edge-search', read('chrome-search-15.png')],
    ['svg-edge-search-transform', read('chrome-search-transform.png')],
  ];
  await launch('GPUISvgEdgeFixture');
  const mismatches: Record<string, number> = {};
  for (const [testID, reference] of cases) {
    await desktopExpect(app.getByTestId(testID)).toBeVisible();
    const count = (image: PNG) => {
      expect([image.width, image.height]).toEqual([
        reference.width,
        reference.height,
      ]);
      let different = 0;
      for (let i = 0; i < reference.width * reference.height; i += 1) {
        for (let channel = 0; channel < 3; channel += 1) {
          if (
            Math.abs(
              image.data[i * 4 + channel] - reference.data[i * 4 + channel],
            ) > 2
          ) {
            different += 1;
            break;
          }
        }
      }
      return different;
    };
    // The icon paints a moment after its node exists.
    const deadline = Date.now() + 5000;
    let different = count(
      PNG.sync.read(await app.getByTestId(testID).screenshot()),
    );
    while (different > 20 && Date.now() < deadline) {
      await new Promise(resolve => setTimeout(resolve, 150));
      different = count(
        PNG.sync.read(await app.getByTestId(testID).screenshot()),
      );
    }
    mismatches[testID] = different;
  }
  // Pixels more than two levels away from Chrome's.
  console.log('svg edge mismatches', JSON.stringify(mismatches));
  expect(Math.max(...Object.values(mismatches))).toBeLessThanOrEqual(8);
});
