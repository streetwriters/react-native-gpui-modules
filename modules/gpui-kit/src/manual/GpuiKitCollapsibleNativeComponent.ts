import { codegenNativeComponent, type ViewProps } from 'react-native';

export interface NativeProps extends ViewProps {
  open?: boolean;
  slots?: string;
}

export default codegenNativeComponent<NativeProps>('GpuiKitCollapsible', {
  interfaceOnly: true,
});
