import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  keystroke?: string;
  appearance?: CodegenTypes.WithDefault<boolean, true>;
  outline?: boolean;
  action?: string;
  actionContext?: string;
  actionScope?: CodegenTypes.WithDefault<'any' | 'global' | 'focused', 'any'>;
}

export default codegenNativeComponent<NativeProps>('GpuiKitKbd', {
  interfaceOnly: true,
});
