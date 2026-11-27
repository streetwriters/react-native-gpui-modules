import type React from 'react';
import {
  codegenNativeCommands,
  codegenNativeComponent,
  type CodegenTypes,
  type HostComponent,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  columns?: CodegenTypes.WithDefault<CodegenTypes.Int32, 12>;
  itemsDraggable?: CodegenTypes.WithDefault<boolean, true>;
  itemsResizable?: CodegenTypes.WithDefault<boolean, true>;
  /** `vertical` (the default), `horizontal` or `none`. */
  compaction?: string;
  preventCollision?: boolean;
  /** Lays the items out in this many columns without changing the layout; 0 for none. */
  reflow?: CodegenTypes.Int32;
  /** The height of one row, in points; 0 for the kit's 2.5rem. */
  rowHeight?: CodegenTypes.Double;
  label?: string;
  /** The default areas, as the kit's serialized `GridArea` list. */
  areasJson?: string;
  /** The items as JSON: `[{ id, label, dragHandleOnly, kitStyle, cardStyle, handleStyle }]`. */
  itemsJson?: string;
  slots?: string;
  onGpuiKitGridLayoutChange?: CodegenTypes.DirectEventHandler<
    Readonly<{ layout: string }>
  >;
  onGpuiKitGridLayoutSelect?: CodegenTypes.DirectEventHandler<
    Readonly<{ id: string }>
  >;
}

interface NativeCommands {
  setAreas: (
    viewRef: React.ElementRef<HostComponent<NativeProps>>,
    areas: string,
  ) => void;
}

export const Commands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['setAreas'],
});

export default codegenNativeComponent<NativeProps>('GpuiKitGridLayout', {
  interfaceOnly: true,
}) as HostComponent<NativeProps>;
