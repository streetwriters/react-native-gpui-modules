import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { PNG } from 'pngjs';
import { afterAll, expect, test } from 'vitest';
import { expect as desktopExpect } from '@react-native-gpui/testing';
import { closeApp, launch } from './launch';

let app: Awaited<ReturnType<typeof launch>>;

afterAll(async () => {
  await closeApp();
});

test('the image manipulator crops, resizes and encodes, and the result shows as a data URI', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'manipulator-e2e-'));
  const source = path.join(directory, 'quadrants.png');
  const picture = new PNG({ width: 400, height: 300 });
  const colours = [
    [255, 0, 0],
    [0, 255, 0],
    [0, 0, 255],
    [255, 255, 0],
  ];
  for (let y = 0; y < 300; y += 1) {
    for (let x = 0; x < 400; x += 1) {
      const [r, g, b] = colours[(y >= 150 ? 2 : 0) + (x >= 200 ? 1 : 0)];
      picture.data.set([r, g, b, 255], (y * 400 + x) * 4);
    }
  }
  fs.writeFileSync(source, PNG.sync.write(picture));

  const at = async (testID: string, x: number, y: number) => {
    const image = PNG.sync.read(await app.getByTestId(testID).screenshot());
    const px = Math.min(image.width - 1, Math.round(image.width * x));
    const py = Math.min(image.height - 1, Math.round(image.height * y));
    const offset = (py * image.width + px) * 4;
    return Array.from(image.data.subarray(offset, offset + 3));
  };
  const near = (actual: number[], expected: number[], tolerance = 40) =>
    actual.every((value, i) => Math.abs(value - expected[i]) <= tolerance);

  // An image paints once its decode finishes, a moment after its node exists.
  const colour = async (
    testID: string,
    x: number,
    y: number,
    expected: number[],
  ) => {
    const deadline = Date.now() + 5000;
    let actual = await at(testID, x, y);
    while (!near(actual, expected) && Date.now() < deadline) {
      await new Promise(resolve => setTimeout(resolve, 100));
      actual = await at(testID, x, y);
    }
    expect(
      near(actual, expected),
      `${testID} at ${x},${y} is ${actual}, expected ${expected}`,
    ).toBe(true);
  };

  try {
    app = await launch('GPUIImageManipulatorFixture', undefined, { source });
    await desktopExpect(app.getByText('done ok')).toBeVisible(30000);
    const tree = JSON.stringify(await app.tree());
    for (const expected of [
      'size ok',
      'crop ok',
      'resize ok',
      'rotate ok',
      'avatar ok',
      'dataUri ok',
      'errors ok',
    ]) {
      expect(tree).toContain(expected);
    }
    expect(tree).not.toContain('BAD');
    expect(tree).not.toContain('FAILED');

    // The JPEG data URI shows the four quadrants of the cropped square.
    await desktopExpect(app.getByTestId('manipulated-avatar')).toBeVisible();
    await colour('manipulated-avatar', 0.25, 0.25, [255, 0, 0]);
    await colour('manipulated-avatar', 0.75, 0.25, [0, 255, 0]);
    await colour('manipulated-avatar', 0.25, 0.75, [0, 0, 255]);
    await colour('manipulated-avatar', 0.75, 0.75, [255, 255, 0]);

    const red = [255, 0, 0];
    const white = [255, 255, 255];
    // A fixed circle with a panned and zoomed image inside: the image does not
    // leak out of the circle, above it or at its corners.
    await colour('clip-pan', 0.5, 0.5, red);
    await colour('clip-pan', 0.5, 0.2, red);
    await colour('clip-pan', 0.5, 0.15, white);
    await colour('clip-pan', 0.18, 0.18, white);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
