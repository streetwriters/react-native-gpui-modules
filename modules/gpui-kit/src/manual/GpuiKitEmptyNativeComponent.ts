import { codegenNativeComponent, type ViewProps } from 'react-native';

export interface NativeProps extends ViewProps {
  title?: string;
  description?: string;
  icon?: string;
  slots?: string;
  kitStyle?: string;
  headerStyle?: string;
  contentStyle?: string;
}

export default codegenNativeComponent<NativeProps>('GpuiKitEmpty', {
  interfaceOnly: true,
});
