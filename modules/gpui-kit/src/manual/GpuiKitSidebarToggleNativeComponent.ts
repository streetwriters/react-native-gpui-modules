import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  /** `left` or `right`: the side of the sidebar it toggles. */
  side?: string;
  collapsed?: boolean;
  onGpuiKitSidebarTogglePress?: CodegenTypes.DirectEventHandler<Readonly<{}>>;
}

export default codegenNativeComponent<NativeProps>('GpuiKitSidebarToggle', {
  interfaceOnly: true,
});
