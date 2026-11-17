import { codegenNativeComponent, type ViewProps } from 'react-native';

export interface NativeProps extends ViewProps {
  end?: boolean;
  header?: string;
  footer?: string;
  slots?: string;
}

export default codegenNativeComponent<NativeProps>('GpuiKitMessage', {
  interfaceOnly: true,
});
