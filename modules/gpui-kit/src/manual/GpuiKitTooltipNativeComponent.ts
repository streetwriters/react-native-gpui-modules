import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  text?: string;
  contentWidth?: CodegenTypes.Double;
  slots?: string;
}

export default codegenNativeComponent<NativeProps>('GpuiKitTooltip', {
  interfaceOnly: true,
});
