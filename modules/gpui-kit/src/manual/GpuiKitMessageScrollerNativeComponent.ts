import {
  codegenNativeComponent,
  codegenNativeCommands,
  type CodegenTypes,
  type HostComponent,
  type ViewProps,
} from 'react-native';
import type React from 'react';

export interface NativeProps extends ViewProps {
  /** The rows' keys as a JSON array: a change at the end appends, at the start prepends. */
  keysJson?: string;
  scrollbar?: CodegenTypes.WithDefault<boolean, true>;
  jumpButton?: CodegenTypes.WithDefault<boolean, true>;
  /** Refines the scroller's surface. */
  contentStyle?: string;
  /** Refines the list, for example its padding. */
  listStyle?: string;
  /** Refines every row. */
  rowStyle?: string;
  /** Fades the bottom edge into this color while away from the tail; 0 for none. */
  bottomFade?: CodegenTypes.Int32;
  jumpButtonLabel?: string;
  /** The jump button's text, variant (`outline`, `ghost`, `primary`, ...) and size. */
  jumpButtonText?: string;
  jumpButtonVariant?: string;
  jumpButtonSize?: string;
  jumpButtonStyle?: string;
  /** How long the jump button takes to appear, in milliseconds; -1 for the kit's. */
  jumpButtonTransition?: CodegenTypes.WithDefault<CodegenTypes.Int32, -1>;
  slots?: string;
  onGpuiKitMessageScrollerScrollChange?: CodegenTypes.DirectEventHandler<
    Readonly<{ followingTail: boolean; scrolledUp: boolean }>
  >;
}

interface NativeCommands {
  scrollToEnd: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
  scrollToItem: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    index: CodegenTypes.Int32,
  ) => void;
  remeasureItems: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    start: CodegenTypes.Int32,
    end: CodegenTypes.Int32,
  ) => void;
}

export const Commands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['scrollToEnd', 'scrollToItem', 'remeasureItems'],
});

export default codegenNativeComponent<NativeProps>('GpuiKitMessageScroller', {
  interfaceOnly: true,
}) as HostComponent<NativeProps>;
