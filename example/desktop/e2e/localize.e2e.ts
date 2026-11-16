import { afterAll, expect, test } from 'vitest';
import { expect as desktopExpect } from '@react-native-gpui/testing';
import { closeApp, launch } from './launch';

afterAll(async () => {
  await closeApp();
});

test('localize reports well-formed locale values', async () => {
  const app = await launch('GPUILocalizeFixture');
  await desktopExpect(app.getByTestId('localize-run')).toBeVisible(60000);
  await app.getByTestId('localize-run').click();
  await desktopExpect(app.getByTestId('localize-report')).toBeVisible();
  const [report] = await app.getByTestId('localize-report').all();
  const values = JSON.parse(report.text);
  expect(values.locales).toBeGreaterThan(0);
  expect(values.country).toMatch(/^[A-Z]{2}$/);
  expect(values.currencies).toBeGreaterThan(0);
  expect(values.timeZone.length).toBeGreaterThan(0);
  expect(['gregorian']).toContain(values.calendar);
  expect(['celsius', 'fahrenheit']).toContain(values.temperature);
  expect(typeof values.clock24).toBe('boolean');
  expect(typeof values.metric).toBe('boolean');
  expect(['.', ',']).toContain(values.decimal);
});
