import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  text?: string;
  width?: CodegenTypes.Double;
  slots?: string;
}

export default codegenNativeComponent<NativeProps>('GpuiKitTooltip', {
  interfaceOnly: true,
});
