import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export type TableColumn = Readonly<{
  key: string;
  title: string;
  width: CodegenTypes.Double;
  sortable: boolean;
}>;

export interface NativeProps extends ViewProps {
  columns?: ReadonlyArray<TableColumn>;
  cells?: ReadonlyArray<string>;
  stripe?: boolean;
  bordered?: boolean;
  slots?: string;
  onGpuiKitTableSelectRow?: CodegenTypes.DirectEventHandler<
    Readonly<{ row: CodegenTypes.Int32 }>
  >;
  onGpuiKitTableOpenRow?: CodegenTypes.DirectEventHandler<
    Readonly<{ row: CodegenTypes.Int32 }>
  >;
  onGpuiKitTableSort?: CodegenTypes.DirectEventHandler<
    Readonly<{ column: CodegenTypes.Int32; direction: string }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitTable', {
  interfaceOnly: true,
});
