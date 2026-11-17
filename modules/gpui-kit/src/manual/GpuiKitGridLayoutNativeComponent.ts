import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export type GridAreaSpec = Readonly<{
  id: string;
  col: CodegenTypes.Int32;
  row: CodegenTypes.Int32;
  colSpan: CodegenTypes.Int32;
  rowSpan: CodegenTypes.Int32;
}>;

export interface NativeProps extends ViewProps {
  columns?: CodegenTypes.Int32;
  draggable?: boolean;
  resizable?: boolean;
  areas?: ReadonlyArray<GridAreaSpec>;
  slots?: string;
  onGpuiKitGridLayoutChange?: CodegenTypes.DirectEventHandler<
    Readonly<{ layout: string }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitGridLayout', {
  interfaceOnly: true,
});
