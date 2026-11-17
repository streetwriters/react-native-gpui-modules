import { codegenNativeComponent, type ViewProps } from 'react-native';

export interface NativeProps extends ViewProps {
  slots?: string;
}

export default codegenNativeComponent<NativeProps>('GpuiKitStatusBar', {
  interfaceOnly: true,
});
