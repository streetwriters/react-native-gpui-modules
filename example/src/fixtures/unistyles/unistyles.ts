import { StyleSheet } from 'react-native-unistyles';

const light = {
  colors: { background: '#ffffff', accent: '#ff0000' },
} as const;

const dark = {
  colors: { background: '#000000', accent: '#00ff00' },
} as const;

const breakpoints = { xs: 0, md: 600, lg: 1000 } as const;

type AppThemes = { light: typeof light; dark: typeof dark };
type AppBreakpoints = typeof breakpoints;

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

StyleSheet.configure({
  themes: { light, dark },
  breakpoints,
  settings: { adaptiveThemes: true },
});
