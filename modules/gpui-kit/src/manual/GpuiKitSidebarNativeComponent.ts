import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export type SidebarGroupSpec = Readonly<{
  label: string;
}>;

export type SidebarItemSpec = Readonly<{
  group: CodegenTypes.Int32;
  label: string;
  icon: string;
  depth: CodegenTypes.Int32;
  active: boolean;
  disabled: boolean;
  open: boolean;
}>;

export interface NativeProps extends ViewProps {
  width?: CodegenTypes.Double;
  collapsed?: boolean;
  collapsible?: CodegenTypes.WithDefault<
    'unset' | 'icon' | 'offcanvas' | 'none',
    'unset'
  >;
  groups?: ReadonlyArray<SidebarGroupSpec>;
  items?: ReadonlyArray<SidebarItemSpec>;
  slots?: string;
  onGpuiKitSidebarPress?: CodegenTypes.DirectEventHandler<
    Readonly<{ index: CodegenTypes.Int32 }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitSidebar', {
  interfaceOnly: true,
});
