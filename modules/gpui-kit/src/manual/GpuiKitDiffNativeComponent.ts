import type React from 'react';
import {
  codegenNativeCommands,
  codegenNativeComponent,
  type CodegenTypes,
  type HostComponent,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  patch?: string;
  /** The files as JSON: `[{ kind: 'patch' | 'conflicts' | 'unchanged', patch, path, text }]`. */
  filesJson?: string;
  lineNumbers?: boolean;
  syntaxHighlight?: boolean;
  header?: boolean;
  softWrap?: boolean;
  /** `unified` or `split`. */
  mode?: string;
  /** Lines of context around a change; -1 for all of it, -2 for the kit's default. */
  contextLines?: CodegenTypes.WithDefault<CodegenTypes.Int32, -2>;
  /** `word`, `character` or `none` (whole lines). */
  inlineUnit?: string;
  /** `metadata`, `line-info` or `simple`. */
  hunkSeparator?: string;
  /** `signs`, `bars` or `none`. */
  changeIndicator?: string;
  changeBackground?: CodegenTypes.WithDefault<boolean, true>;
  /** `none`, `line`, `line-number` or `both`. */
  hoverHighlight?: string;
  /** Line ranges to mark, as JSON: `[{ path, side, start, end }]`. */
  decorationsJson?: string;
  /** Gutter markers as JSON: `[{ id, path, side, line, label }]`; each one's content is slot `marker:<id>`. */
  markersJson?: string;
  /** Annotations as JSON: `[{ id, path, side, line }]`; each one's content is slot `annotation:<id>`. */
  annotationsJson?: string;
  /** Reports the lines the user asks to annotate. */
  addAnnotationEvents?: boolean;
  kitStyle?: string;
  slots?: string;
  /** The files changed: whether any of them has a change to step through. */
  onGpuiKitDiffFilesChange?: CodegenTypes.DirectEventHandler<
    Readonly<{ hasChanges: boolean }>
  >;
  onGpuiKitDiffAddAnnotation?: CodegenTypes.DirectEventHandler<
    Readonly<{
      path: string;
      side: string;
      start: CodegenTypes.Int32;
      end: CodegenTypes.Int32;
      endSide: string;
    }>
  >;
}

interface NativeCommands {
  nextChange: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
  previousChange: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
  ) => void;
  expandUnchanged: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
  ) => void;
  collapseUnchanged: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
  ) => void;
}

export const Commands = codegenNativeCommands<NativeCommands>({
  supportedCommands: [
    'nextChange',
    'previousChange',
    'expandUnchanged',
    'collapseUnchanged',
  ],
});

export default codegenNativeComponent<NativeProps>('GpuiKitDiff', {
  interfaceOnly: true,
}) as HostComponent<NativeProps>;
