import { processColor, type ColorValue } from 'react-native';

/** The subset of a style that kit `*Style` props take. */
export interface KitStyle {
  backgroundColor?: ColorValue;
  color?: ColorValue;
  borderColor?: ColorValue;
  borderWidth?: number;
  borderRadius?: number;
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;
  borderLeftWidth?: number;
  borderRightWidth?: number;
  borderTopWidth?: number;
  borderBottomWidth?: number;
  padding?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  margin?: number;
  marginHorizontal?: number;
  marginVertical?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  fontSize?: number;
  fontWeight?: number;
  opacity?: number;
  alignItems?: 'flex-start' | 'center' | 'flex-end';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  overflowX?: 'hidden';
  /** Points, or a percentage of the parent such as `'100%'`. */
  width?: number | `${number}%`;
  gap?: number;
  /** `flex_1` for 1: grows and shrinks from a zero basis. */
  flex?: number;
  minHeight?: number;
  maxWidth?: number;
  flexDirection?: 'row' | 'column';
  flexWrap?: 'wrap';
  lineHeight?: number;
  textAlign?: 'left' | 'center' | 'right';
  /** A font family name, such as the theme's monospace family. */
  fontFamily?: string;
  /** Points, or a percentage of the parent such as `'100%'`. */
  height?: number | `${number}%`;
  minWidth?: number;
  aspectRatio?: number;
  /** Points, or a percentage of the parent. */
  flexBasis?: number | `${number}%`;
  boxShadow?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const KEYWORDS = [
  'alignItems',
  'justifyContent',
  'overflowX',
  'boxShadow',
  'textAlign',
  'flexDirection',
  'flexWrap',
  'fontFamily',
] as const;

const COLORS = ['backgroundColor', 'color', 'borderColor'] as const;

/** Serializes a KitStyle for the native side; empty when there is none. */
export function kitStyle(style: KitStyle | undefined): string {
  if (!style) return '';
  const out: Record<string, number | string> = {};
  for (const [key, value] of Object.entries(style)) {
    if (value == null) continue;
    if ((COLORS as readonly string[]).includes(key)) {
      const color = processColor(value as ColorValue);
      if (typeof color === 'number') out[key] = color >>> 0;
    } else if ((KEYWORDS as readonly string[]).includes(key)) {
      out[key] = value as string;
    } else if (typeof value === 'number') {
      out[key] = value;
    } else if (typeof value === 'string' && value.endsWith('%')) {
      out[key] = value;
    }
  }
  return JSON.stringify(out);
}
