import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, existsSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { PNG } from 'pngjs';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { expect as desktopExpect } from '@react-native-gpui/testing';
import data from '../../src/fixtures/gpuiKitParityCases.json';
import { closeApp, launch } from './launch';

/**
 * Compares every case of `gpuiKitParityCases.json` drawn by the React Native
 * components with the same case drawn by `tools/gpui-kit-gen/reference`, a
 * plain GPUI app that uses gpui-kit directly. Build the reference first:
 *
 *   cd tools/gpui-kit-gen/reference && cargo build
 *
 * Tolerance: a pixel matches when no channel differs by more than 40 (of 255),
 * which absorbs glyph and edge antialiasing that depends on the subpixel
 * position of the frame; a case matches when at most 2.5% of its pixels do
 * not. A wrong color, size, offset or missing part of a component moves far
 * more pixels than that.
 */

type ParityCase = {
  id: string;
  component: string;
  width: number;
  height: number;
  interact?: 'click' | 'type';
};

const CHANNEL_TOLERANCE = 40;
const PIXEL_TOLERANCE = 0.025;
const TYPED = 'x';

const reference =
  process.env.GPUI_KIT_REFERENCE ??
  path.resolve('../target/debug/gpui-kit-reference');
const out = mkdtempSync(path.join(tmpdir(), 'gpui-kit-parity-'));
console.log(`parity output: ${out}`);
const cases = data.cases as ParityCase[];

type App = Awaited<ReturnType<typeof launch>>;

function diff(actual: Buffer, expected: Buffer) {
  const a = PNG.sync.read(actual);
  const b = PNG.sync.read(expected);
  if (a.width !== b.width || a.height !== b.height)
    return {
      ratio: 1,
      detail: `size ${a.width}x${a.height} vs ${b.width}x${b.height}`,
    };
  let off = 0;
  for (let at = 0; at < a.data.length; at += 4) {
    for (let c = 0; c < 3; c++) {
      if (Math.abs(a.data[at + c] - b.data[at + c]) > CHANNEL_TOLERANCE) {
        off++;
        break;
      }
    }
  }
  return { ratio: off / (a.width * a.height), detail: `${off} pixels` };
}

/** Brings a PNG drawn at a display scale above 1 back to points with a box filter. */
function atScale(buffer: Buffer, width: number) {
  const png = PNG.sync.read(buffer);
  if (png.width === width) return buffer;
  const factor = png.width / width;
  const outPng = new PNG({
    width,
    height: Math.round(png.height / factor),
  });
  for (let y = 0; y < outPng.height; y++) {
    for (let x = 0; x < outPng.width; x++) {
      for (let c = 0; c < 4; c++) {
        let sum = 0;
        let n = 0;
        for (let dy = 0; dy < factor; dy++) {
          for (let dx = 0; dx < factor; dx++) {
            const sx = Math.floor(x * factor + dx);
            const sy = Math.floor(y * factor + dy);
            sum += png.data[(sy * png.width + sx) * 4 + c];
            n++;
          }
        }
        outPng.data[(y * outPng.width + x) * 4 + c] = Math.round(sum / n);
      }
    }
  }
  return PNG.sync.write(outPng);
}

const pause = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

async function open(id: string) {
  const app = await launch('GPUIKitParityFixture', id);
  await desktopExpect(app.getByTestId(id)).toBeVisible(60000);
  await pause();
  return app;
}

async function capture(app: App, c: ParityCase) {
  return atScale(await app.getByTestId(c.id).screenshot(), c.width);
}

beforeAll(() => {
  expect(existsSync(reference), `build ${reference} first`).toBe(true);
  execFileSync(reference, ['--out', out], { stdio: 'inherit' });
}, 300000);

afterAll(async () => {
  await closeApp();
});

describe('gpui-kit parity with a plain gpui-kit app', () => {
  for (const c of cases) {
    test(`${c.id} draws like the reference`, async () => {
      const app = await open(c.id);
      const actual = await capture(app, c);
      writeFileSync(path.join(out, `${c.id}-rn.png`), actual);
      const result = diff(
        actual,
        atScale(readFileSync(path.join(out, `${c.id}.png`)), c.width),
      );
      expect(result.ratio, `${c.id}: ${result.detail}`).toBeLessThanOrEqual(
        PIXEL_TOLERANCE,
      );
    });
  }

  for (const c of cases.filter(item => item.interact)) {
    test(`${c.id}: ${c.interact} gives the reference result and events`, async () => {
      const app = await open(c.id);
      const box = (await app.getByTestId(c.id).all())[0].frame;
      const element = (await app.getByTestId(`${c.id}-el`).all())[0].frame;
      const x = element.x - box.x + element.width / 2;
      const y = element.y - box.y + element.height / 2;
      await app.getByTestId(`${c.id}-el`).click();
      if (c.interact === 'type') await app.press(TYPED);
      await pause();
      const after = await capture(app, c);
      writeFileSync(path.join(out, `${c.id}-rn-after.png`), after);
      const events = (await app.getByTestId(`${c.id}-log`).textContent())
        .split(',')
        .filter(Boolean);

      const dir = mkdtempSync(path.join(out, `${c.id}-`));
      execFileSync(reference, [
        '--out',
        dir,
        '--case',
        c.id,
        '--click',
        `${x},${y}`,
        ...(c.interact === 'type' ? ['--type', TYPED] : []),
      ]);
      const result = diff(
        after,
        atScale(readFileSync(path.join(dir, `${c.id}-after.png`)), c.width),
      );
      expect(result.ratio, `${c.id}: ${result.detail}`).toBeLessThanOrEqual(
        PIXEL_TOLERANCE,
      );
      if (c.interact === 'click') {
        const expected = readFileSync(
          path.join(dir, `${c.id}-events.txt`),
          'utf8',
        )
          .split('\n')
          .filter(Boolean);
        expect(new Set(events)).toEqual(new Set(expected));
      }
    });
  }
});
