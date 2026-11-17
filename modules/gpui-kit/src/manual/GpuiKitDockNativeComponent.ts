import {
  codegenNativeComponent,
  codegenNativeCommands,
  type CodegenTypes,
  type HostComponent,
  type ViewProps,
} from 'react-native';
import type React from 'react';

export type DockPanel = Readonly<{
  id: string;
  title: string;
  /** The dock the panel is in: `center`, `left`, `right` or `bottom`. */
  placement: string;
  /** Panels of one placement with the same group share a tab bar. */
  group: string;
  closable: boolean;
}>;

export interface NativeProps extends ViewProps {
  panels?: ReadonlyArray<DockPanel>;
  /** How the groups of the center are split. */
  centerAxis?: CodegenTypes.WithDefault<
    'horizontal' | 'vertical',
    'horizontal'
  >;
  locked?: boolean;
  dockSize?: CodegenTypes.WithDefault<CodegenTypes.Double, 240>;
  slots?: string;
  /** A layout from `onLayoutChange` to start from. */
  layout?: string;
  onGpuiKitDockLayoutChange?: CodegenTypes.DirectEventHandler<
    Readonly<{ layout: string }>
  >;
  onGpuiKitDockToggle?: CodegenTypes.DirectEventHandler<
    Readonly<{ placement: string; open: boolean }>
  >;
}

interface NativeCommands {
  toggleDock: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    placement: string,
  ) => void;
  selectPanel: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    id: string,
  ) => void;
  restoreLayout: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    layout: string,
  ) => void;
}

export const Commands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['toggleDock', 'selectPanel', 'restoreLayout'],
});

export default codegenNativeComponent<NativeProps>('GpuiKitDock', {
  interfaceOnly: true,
}) as HostComponent<NativeProps>;
