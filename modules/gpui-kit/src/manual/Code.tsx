import React from 'react';
import type { NativeSyntheticEvent, StyleProp, ViewStyle } from 'react-native';
import EditorNative from './GpuiKitEditorNativeComponent';
import DiffNative from './GpuiKitDiffNativeComponent';

interface Base {
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export interface EditorProps extends Base {
  /** Controls the text; leave it out for the kit's own text. */
  value?: string;
  /** A language of the kit's highlighter, such as `rust` or `json`. */
  language?: string;
  lineNumber?: boolean;
  softWrap?: boolean;
  bordered?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  /** The kit's highlight theme: the app theme's, or its default light or dark one. */
  highlightTheme?: 'app' | 'light' | 'dark';
  /** Editor colors over the theme's: `#rrggbb[aa]` strings or `processColor` numbers. */
  editorStyle?: EditorStyle;
  /** The text drawn after each folded line; clicking it unfolds the line. */
  foldPlaceholder?: string;
  folding?: boolean;
  indentGuides?: boolean;
  scrollbarStyle?: ScrollbarStyle;
  onChangeText?: (text: string) => void;
  onChange?: (event: NativeSyntheticEvent<Readonly<{ text: string }>>) => void;
}

type StyleColor = string | number;

export interface EditorStyle {
  foreground?: StyleColor;
  mutedForeground?: StyleColor;
  background?: StyleColor;
  border?: StyleColor;
  selection?: StyleColor;
  caret?: StyleColor;
  activeLine?: StyleColor;
  gutterBackground?: StyleColor;
  invisible?: StyleColor;
}

export interface ScrollbarStyle {
  thumbColor?: StyleColor;
  trackColor?: StyleColor;
  width?: number;
  radius?: number;
  /** Fades the scrollbar out when scrolling stops, as the kit does by default. */
  autoHide?: boolean;
}

export function Editor({
  value,
  onChangeText,
  onChange,
  bordered,
  lineNumber,
  editorStyle,
  scrollbarStyle,
  style,
  ...rest
}: EditorProps) {
  return (
    <EditorNative
      {...rest}
      style={[{ width: 420, height: 200 }, style]}
      value={value}
      controlled={value !== undefined}
      bordered={bordered ?? true}
      lineNumber={lineNumber ?? true}
      editorStyleJson={editorStyle ? JSON.stringify(editorStyle) : ''}
      scrollbarStyleJson={scrollbarStyle ? JSON.stringify(scrollbarStyle) : ''}
      onGpuiKitEditorChange={event => {
        onChange?.(event as never);
        onChangeText?.(event.nativeEvent.text);
      }}
    />
  );
}

export interface DiffProps extends Base {
  /** A unified patch. */
  patch: string;
  lineNumbers?: boolean;
  syntaxHighlight?: boolean;
  header?: boolean;
  softWrap?: boolean;
}

export function Diff({
  lineNumbers,
  syntaxHighlight,
  header,
  style,
  ...rest
}: DiffProps) {
  return (
    <DiffNative
      {...rest}
      style={[{ width: 420, height: 200 }, style]}
      lineNumbers={lineNumbers ?? true}
      syntaxHighlight={syntaxHighlight ?? true}
      header={header ?? true}
    />
  );
}
