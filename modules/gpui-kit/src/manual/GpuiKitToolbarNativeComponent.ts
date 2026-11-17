import { codegenNativeComponent, type ViewProps } from 'react-native';

export interface NativeProps extends ViewProps {
  disabled?: boolean;
  slots?: string;
}

export default codegenNativeComponent<NativeProps>('GpuiKitToolbar', {
  interfaceOnly: true,
});
