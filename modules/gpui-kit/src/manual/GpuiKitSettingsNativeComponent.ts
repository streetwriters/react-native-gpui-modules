import { codegenNativeComponent, type ViewProps } from 'react-native';
import type { CodegenTypes } from 'react-native';

export type SettingsItem = Readonly<{
  page: string;
  group: string;
  title: string;
  description: string;
  vertical: boolean;
  disabled: boolean;
  kitField: boolean;
}>;

export interface NativeProps extends ViewProps {
  items?: ReadonlyArray<SettingsItem>;
  size?: CodegenTypes.WithDefault<
    'unset' | 'xsmall' | 'small' | 'medium' | 'large',
    'unset'
  >;
  sidebarWidth?: CodegenTypes.Double;
  fieldWidth?: CodegenTypes.WithDefault<CodegenTypes.Double, 220>;
  slots?: string;
}

export default codegenNativeComponent<NativeProps>('GpuiKitSettings', {
  interfaceOnly: true,
});
