import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  value?: string;
  controlled?: boolean;
  language?: string;
  lineNumber?: boolean;
  softWrap?: boolean;
  bordered?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  highlightTheme?: CodegenTypes.WithDefault<'app' | 'light' | 'dark', 'app'>;
  editorStyleJson?: string;
  foldPlaceholder?: string;
  folding?: CodegenTypes.WithDefault<boolean, true>;
  indentGuides?: CodegenTypes.WithDefault<boolean, true>;
  scrollbarStyleJson?: string;
  /** The text the editor starts with, when `value` does not control it. */
  defaultValue?: string;
  /** Spaces per indent level; 0 for the kit's 2. */
  tabSize?: CodegenTypes.Int32;
  hardTabs?: boolean;
  fontFamily?: string;
  /** In points; 0 for the theme's monospace size. */
  fontSize?: CodegenTypes.Double;
  /** Text decorations as JSON: `[{ start, end, color, backgroundColor, bold, italic, underline }]`. */
  decorationsJson?: string;
  /** Fills and frames as JSON: `[{ start, end, style, color }]`. */
  rangeDecorationsJson?: string;
  /** Gutter marks as JSON: `[{ start, end, color, foldedColor }]`. */
  gutterDecorationsJson?: string;
  /** Scrollbar track marks as JSON: `[{ start, end, lane, color }]`. */
  overviewRulerDecorationsJson?: string;
  /** Completions as JSON: `{ items: string[], match: 'prefix' | 'contains' | 'characters' }`. */
  completionsJson?: string;
  onGpuiKitEditorChange?: CodegenTypes.DirectEventHandler<
    Readonly<{ text: string }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitEditor', {
  interfaceOnly: true,
});
