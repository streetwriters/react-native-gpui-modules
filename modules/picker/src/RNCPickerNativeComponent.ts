import type { ColorValue, HostComponent, ViewProps } from 'react-native';
import { codegenNativeComponent } from 'react-native';
import type { CodegenTypes } from 'react-native';

export type PickerItem = Readonly<{
  label: string;
  testID?: string;
}>;

export type OpenEvent = Readonly<{
  x: CodegenTypes.Double;
  y: CodegenTypes.Double;
}>;

export interface NativeProps extends ViewProps {
  items: ReadonlyArray<PickerItem>;
  selectedIndex?: CodegenTypes.WithDefault<CodegenTypes.Int32, -1>;
  enabled?: CodegenTypes.WithDefault<boolean, true>;
  color?: ColorValue;
  fontSize?: CodegenTypes.WithDefault<CodegenTypes.Double, 14>;
  placeholder?: string;
  onRNCPickerOpen?: CodegenTypes.DirectEventHandler<OpenEvent>;
}

export default codegenNativeComponent<NativeProps>('RNCPicker', {
  interfaceOnly: true,
}) as HostComponent<NativeProps>;
