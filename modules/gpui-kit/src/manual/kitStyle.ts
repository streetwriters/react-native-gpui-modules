import { processColor, type ColorValue } from 'react-native';

/** The subset of a style that kit `*Style` props take. */
export interface KitStyle {
  backgroundColor?: ColorValue;
  color?: ColorValue;
  borderColor?: ColorValue;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  fontSize?: number;
  fontWeight?: number;
  opacity?: number;
}

const COLORS = ['backgroundColor', 'color', 'borderColor'] as const;

/** Serializes a KitStyle for the native side; empty when there is none. */
export function kitStyle(style: KitStyle | undefined): string {
  if (!style) return '';
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(style)) {
    if (value == null) continue;
    if ((COLORS as readonly string[]).includes(key)) {
      const color = processColor(value as ColorValue);
      if (typeof color === 'number') out[key] = color >>> 0;
    } else if (typeof value === 'number') {
      out[key] = value;
    }
  }
  return JSON.stringify(out);
}
