import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ReactNode,
} from 'react';
import type { NativeSyntheticEvent, StyleProp, ViewStyle } from 'react-native';
import EditorNative from './GpuiKitEditorNativeComponent';
import DiffNative, {
  Commands as DiffCommands,
} from './GpuiKitDiffNativeComponent';
import { SlotHost } from './SlotHost';
import { kitStyle, type KitStyle } from './kitStyle';

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
  /** The text the editor starts with, when `value` does not control it. */
  defaultValue?: string;
  /** Spaces per indent level. */
  tabSize?: number;
  /** Indents with tabs. */
  hardTabs?: boolean;
  fontFamily?: string;
  fontSize?: number;
  /** Styles text ranges (UTF-8 byte offsets); the ranges follow edits. */
  decorations?: EditorTextDecoration[];
  /** Fills or frames text ranges. */
  rangeDecorations?: EditorRangeDecoration[];
  /** Marks lines in a strip before the line numbers, such as version-control changes. */
  gutterDecorations?: EditorGutterDecoration[];
  /** Marks lines on the vertical scrollbar track. */
  overviewRulerDecorations?: EditorOverviewRulerDecoration[];
  /** Offers these words as completions while typing; `match` picks and marks them by the query. */
  completions?: {
    items: string[];
    match?: 'prefix' | 'contains' | 'characters';
  };
  onChangeText?: (text: string) => void;
  onChange?: (event: NativeSyntheticEvent<Readonly<{ text: string }>>) => void;
}

type StyleColor = string | number;

/**
 * A color of a decoration: a `#rrggbb[aa]` string, a `processColor` number,
 * or a theme color by name (`warning`, `danger`, `success`, `info`, `primary`,
 * `foreground`, `muted-foreground`, `border`, `status.created`,
 * `status.modified`, `status.deleted`, ...) with an optional opacity.
 */
export type EditorColor = StyleColor | { token: string; opacity?: number };

interface EditorRange {
  /** UTF-8 byte offsets into the text. */
  start: number;
  end: number;
}

export interface EditorTextDecoration extends EditorRange {
  color?: EditorColor;
  backgroundColor?: EditorColor;
  bold?: boolean;
  italic?: boolean;
  underline?: { color?: EditorColor; thickness?: number; wavy?: boolean };
}

export interface EditorRangeDecoration extends EditorRange {
  style?: 'fill' | 'frame';
  color?: EditorColor;
}

export interface EditorGutterDecoration extends EditorRange {
  color?: EditorColor;
  /** The color of the bar on a fold's row. */
  foldedColor?: EditorColor;
}

export interface EditorOverviewRulerDecoration extends EditorRange {
  lane?: 'left' | 'center' | 'right';
  color?: EditorColor;
}

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
  decorations,
  rangeDecorations,
  gutterDecorations,
  overviewRulerDecorations,
  completions,
  style,
  ...rest
}: EditorProps) {
  const json = (value: unknown) =>
    value === undefined ? '' : JSON.stringify(value);
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
      decorationsJson={json(decorations)}
      rangeDecorationsJson={json(rangeDecorations)}
      gutterDecorationsJson={json(gutterDecorations)}
      overviewRulerDecorationsJson={json(overviewRulerDecorations)}
      completionsJson={json(completions)}
      onGpuiKitEditorChange={event => {
        onChange?.(event as never);
        onChangeText?.(event.nativeEvent.text);
      }}
    />
  );
}

export type DiffSide = 'original' | 'modified';

export type DiffFileSource =
  /** A unified or Git patch, which may hold several files. */
  | { kind: 'patch'; patch: string }
  /** A file with Git merge conflict markers. */
  | { kind: 'conflicts'; path: string; text: string }
  /** A whole file without changes. */
  | { kind: 'unchanged'; path: string; text: string };

export interface DiffLine {
  path: string;
  side?: DiffSide;
  line: number;
}

export interface DiffRange {
  path: string;
  side?: DiffSide;
  start: number;
  end: number;
}

export interface DiffHandle {
  nextChange: () => void;
  previousChange: () => void;
  expandUnchanged: () => void;
  collapseUnchanged: () => void;
}

export interface DiffProps extends Base {
  /** A unified patch. */
  patch?: string;
  /** The files, instead of `patch`. */
  files?: DiffFileSource[];
  lineNumbers?: boolean;
  syntaxHighlight?: boolean;
  header?: boolean;
  softWrap?: boolean;
  mode?: 'unified' | 'split';
  /** Lines of context around each change, or `all` of them. */
  contextLines?: number | 'all';
  /** What changed within a line is marked by word, by character, or not (`none`). */
  inlineUnit?: 'word' | 'character' | 'none';
  hunkSeparator?: 'metadata' | 'line-info' | 'simple';
  changeIndicator?: 'signs' | 'bars' | 'none';
  /** Tints changed lines; true by default. */
  changeBackground?: boolean;
  hoverHighlight?: 'none' | 'line' | 'line-number' | 'both';
  /** Line ranges to mark. */
  decorations?: DiffRange[];
  /** React Native content in the gutter of a line, with an accessible label. */
  gutterMarkers?: (DiffLine & {
    id: string;
    label?: string;
    content: ReactNode;
  })[];
  /** React Native content after a line, such as a review comment. */
  annotations?: (DiffLine & { id: string; content: ReactNode })[];
  /** The files changed: whether any of them has a change to step through. */
  onFilesChange?: (hasChanges: boolean) => void;
  /** The user asked to annotate these lines (the gutter's add button). */
  onAddAnnotation?: (range: DiffRange & { endSide: DiffSide }) => void;
  /** Refines the diff, for example its size. */
  kitStyle?: KitStyle;
}

export const Diff = forwardRef<DiffHandle, DiffProps>(function Diff(
  {
    patch,
    files,
    lineNumbers,
    syntaxHighlight,
    header,
    contextLines,
    decorations,
    gutterMarkers,
    annotations,
    onAddAnnotation,
    onFilesChange,
    kitStyle: diffStyle,
    style,
    testID,
    ...rest
  },
  ref,
) {
  const native = useRef<React.ElementRef<typeof DiffNative>>(null);
  useImperativeHandle(ref, () => ({
    nextChange: () => native.current && DiffCommands.nextChange(native.current),
    previousChange: () =>
      native.current && DiffCommands.previousChange(native.current),
    expandUnchanged: () =>
      native.current && DiffCommands.expandUnchanged(native.current),
    collapseUnchanged: () =>
      native.current && DiffCommands.collapseUnchanged(native.current),
  }));
  const line = ({ path, side, line: at }: DiffLine) => ({
    path,
    side: side ?? 'modified',
    line: at,
  });
  return (
    <SlotHost
      style={[{ width: 420, height: 200 }, style]}
      testID={testID}
      nativeRef={native}
      native={DiffNative as never}
      nativeProps={{
        ...rest,
        patch: patch ?? '',
        filesJson: files ? JSON.stringify(files) : '',
        mode: rest.mode ?? '',
        inlineUnit: rest.inlineUnit ?? '',
        hunkSeparator: rest.hunkSeparator ?? '',
        changeIndicator: rest.changeIndicator ?? '',
        hoverHighlight: rest.hoverHighlight ?? '',
        lineNumbers: lineNumbers ?? true,
        syntaxHighlight: syntaxHighlight ?? true,
        header: header ?? true,
        contextLines: contextLines === 'all' ? -1 : (contextLines ?? -2),
        decorationsJson: JSON.stringify(
          (decorations ?? []).map(range => ({
            ...range,
            side: range.side ?? 'modified',
          })),
        ),
        markersJson: JSON.stringify(
          (gutterMarkers ?? []).map(marker => ({
            ...line(marker),
            id: marker.id,
            label: marker.label ?? '',
          })),
        ),
        annotationsJson: JSON.stringify(
          (annotations ?? []).map(annotation => ({
            ...line(annotation),
            id: annotation.id,
          })),
        ),
        addAnnotationEvents: onAddAnnotation !== undefined,
        kitStyle: kitStyle(diffStyle),
        onGpuiKitDiffFilesChange: (
          event: NativeSyntheticEvent<Readonly<{ hasChanges: boolean }>>,
        ) => onFilesChange?.(event.nativeEvent.hasChanges),
        onGpuiKitDiffAddAnnotation: (
          event: NativeSyntheticEvent<
            Readonly<{
              path: string;
              side: string;
              start: number;
              end: number;
              endSide: string;
            }>
          >,
        ) =>
          onAddAnnotation?.({
            ...event.nativeEvent,
            side: event.nativeEvent.side as DiffSide,
            endSide: event.nativeEvent.endSide as DiffSide,
          }),
      }}
      slots={[
        ...(gutterMarkers ?? []).map(marker => ({
          name: `marker:${marker.id}`,
          content: marker.content,
          fit: true,
        })),
        ...(annotations ?? []).map(annotation => ({
          name: `annotation:${annotation.id}`,
          content: annotation.content,
        })),
      ]}
    />
  );
});
