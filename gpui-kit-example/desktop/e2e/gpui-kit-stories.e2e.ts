import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { PNG } from 'pngjs';
import { afterAll, expect, test } from 'vitest';
import { expect as desktopExpect } from '@react-native-gpui/testing';
import { STORY_NAMES, STORY_SIZE } from '../../src/fixtures/stories/meta';
import { closeApp, launch } from './launch';

/**
 * Compares the React Native port of each official gpui-component story
 * (`src/fixtures/stories`) with the story itself, which
 * `tools/gpui-kit-gen/reference --story <name>` draws from the vendored
 * v0.9.1 sources at the same window size and theme.
 *
 * Tolerance: a pixel matches when no channel differs by more than 40 (of 255),
 * as in the parity spec; a story matches when at most 1% of its pixels do
 * not, which leaves room for antialiasing over a whole page while a moved,
 * resized or missing part of any section exceeds it.
 */

const CHANNEL_TOLERANCE = 40;
const PIXEL_TOLERANCE = 0.01;

const reference =
  process.env.GPUI_KIT_REFERENCE ??
  path.resolve('../target/debug/gpui-kit-reference');
/**
 * Stories that list their working directory start in a fixed folder, which
 * the port lists as data.
 */
const STORY_CWD: Record<string, string> = {
  tree: path.resolve('desktop/e2e/fixtures/tree-root'),
};

const out = mkdtempSync(path.join(tmpdir(), 'gpui-kit-stories-'));
console.log(`story output: ${out}`);

afterAll(async () => {
  await closeApp();
});

function points(buffer: Buffer, width: number) {
  const png = PNG.sync.read(buffer);
  if (png.width === width) return png;
  const factor = png.width / width;
  const scaled = new PNG({ width, height: Math.round(png.height / factor) });
  for (let y = 0; y < scaled.height; y++)
    for (let x = 0; x < scaled.width; x++)
      for (let c = 0; c < 4; c++) {
        let sum = 0;
        let n = 0;
        for (let dy = 0; dy < factor; dy++)
          for (let dx = 0; dx < factor; dx++) {
            const sx = Math.floor(x * factor + dx);
            const sy = Math.floor(y * factor + dy);
            sum += png.data[(sy * png.width + sx) * 4 + c];
            n++;
          }
        scaled.data[(y * scaled.width + x) * 4 + c] = Math.round(sum / n);
      }
  return scaled;
}

function diff(a: PNG, b: PNG) {
  if (a.width !== b.width || a.height !== b.height)
    return {
      ratio: 1,
      detail: `size ${a.width}x${a.height} vs ${b.width}x${b.height}`,
    };
  const marked = new PNG({ width: a.width, height: a.height });
  let off = 0;
  for (let at = 0; at < a.data.length; at += 4) {
    let bad = false;
    for (let c = 0; c < 3; c++)
      if (Math.abs(a.data[at + c] - b.data[at + c]) > CHANNEL_TOLERANCE)
        bad = true;
    if (bad) off++;
    marked.data[at] = bad ? 255 : a.data[at] / 3;
    marked.data[at + 1] = bad ? 0 : a.data[at + 1] / 3;
    marked.data[at + 2] = bad ? 0 : a.data[at + 2] / 3;
    marked.data[at + 3] = 255;
  }
  return { ratio: off / (a.width * a.height), detail: `${off} pixels`, marked };
}

for (const name of STORY_NAMES) {
  test(`story ${name} draws like the official story`, async () => {
    expect(existsSync(reference), `build ${reference} first`).toBe(true);
    execFileSync(reference, ['--story', name, '--out', out], {
      stdio: 'inherit',
      cwd: STORY_CWD[name],
    });
    const app = await launch('GPUIKitStoryFixture', name);
    await app.setWindowSize(STORY_SIZE.width + 40, STORY_SIZE.height + 40);
    await desktopExpect(app.getByTestId(`story-${name}`)).toBeVisible(60000);
    await app.waitForIdle({ ignoreUrls: ['user-attachments'] });
    await new Promise(resolve => setTimeout(resolve, 3000));
    const actual = points(
      await app.getByTestId(`story-${name}`).screenshot(),
      STORY_SIZE.width,
    );
    writeFileSync(
      path.join(out, `story-${name}-rn.png`),
      PNG.sync.write(actual),
    );
    const expected = points(
      readFileSync(path.join(out, `story-${name}.png`)),
      STORY_SIZE.width,
    );
    const result = diff(actual, expected);
    if (result.marked)
      writeFileSync(
        path.join(out, `story-${name}-diff.png`),
        PNG.sync.write(result.marked),
      );
    expect(result.ratio, `${name}: ${result.detail}`).toBeLessThanOrEqual(
      PIXEL_TOLERANCE,
    );
  }, 120000);
}
