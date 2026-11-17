import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  format?: CodegenTypes.WithDefault<'unset' | 'markdown' | 'html', 'unset'>;
  source?: string;
  selectable?: boolean;
  scrollable?: boolean;
  maxLines?: CodegenTypes.Int32;
}

export default codegenNativeComponent<NativeProps>('GpuiKitTextView', {
  interfaceOnly: true,
});
