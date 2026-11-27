import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  /** The groups and their items as JSON (see `Chrome.tsx`). */
  groupsJson?: string;
  /** `left` or `right`. */
  side?: string;
  sidebarWidth?: CodegenTypes.Double;
  collapsed?: boolean;
  collapsible?: CodegenTypes.WithDefault<
    'unset' | 'icon' | 'offcanvas' | 'none',
    'unset'
  >;
  /** Wraps the header content in the kit's `SidebarHeader`. */
  headerKit?: boolean;
  /** The menu the header opens, as a menu model; empty for none. */
  headerMenuJson?: string;
  headerStyle?: string;
  /** Wraps the footer content in the kit's `SidebarFooter`. */
  footerKit?: boolean;
  footerStyle?: string;
  kitStyle?: string;
  slots?: string;
  onGpuiKitSidebarPress?: CodegenTypes.DirectEventHandler<
    Readonly<{ index: CodegenTypes.Int32 }>
  >;
  onGpuiKitSidebarHeaderMenu?: CodegenTypes.DirectEventHandler<
    Readonly<{ id: CodegenTypes.Int32 }>
  >;
  onGpuiKitSidebarItemMenu?: CodegenTypes.DirectEventHandler<
    Readonly<{ index: CodegenTypes.Int32; id: CodegenTypes.Int32 }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitSidebar', {
  interfaceOnly: true,
});
