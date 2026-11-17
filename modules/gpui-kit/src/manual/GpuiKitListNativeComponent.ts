import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export type ListRow = Readonly<{
  label: string;
  disabled: boolean;
}>;

export interface NativeProps extends ViewProps {
  items?: ReadonlyArray<ListRow>;
  selectedIndex?: CodegenTypes.WithDefault<CodegenTypes.Int32, -1>;
  controlled?: boolean;
  searchable?: boolean;
  slots?: string;
  onGpuiKitListSelect?: CodegenTypes.DirectEventHandler<
    Readonly<{ index: CodegenTypes.Int32 }>
  >;
  onGpuiKitListConfirm?: CodegenTypes.DirectEventHandler<
    Readonly<{ index: CodegenTypes.Int32 }>
  >;
  onGpuiKitListCancel?: CodegenTypes.DirectEventHandler<Readonly<{}>>;
}

export default codegenNativeComponent<NativeProps>('GpuiKitList', {
  interfaceOnly: true,
});
