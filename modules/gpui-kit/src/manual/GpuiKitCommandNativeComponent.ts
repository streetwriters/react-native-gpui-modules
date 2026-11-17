import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export type CommandItem = Readonly<{
  label: string;
  icon: string;
  checked: boolean;
  keywords: string;
}>;

export interface NativeProps extends ViewProps {
  items?: ReadonlyArray<CommandItem>;
  placeholder?: string;
  searchable?: boolean;
  filterable?: boolean;
  bordered?: boolean;
  onGpuiKitCommandSelect?: CodegenTypes.DirectEventHandler<
    Readonly<{ index: CodegenTypes.Int32 }>
  >;
  onGpuiKitCommandConfirm?: CodegenTypes.DirectEventHandler<
    Readonly<{ index: CodegenTypes.Int32 }>
  >;
  onGpuiKitCommandCancel?: CodegenTypes.DirectEventHandler<Readonly<{}>>;
  onGpuiKitCommandQuery?: CodegenTypes.DirectEventHandler<
    Readonly<{ text: string }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitCommand', {
  interfaceOnly: true,
});
