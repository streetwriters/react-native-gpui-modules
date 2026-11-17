import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  end?: boolean;
  text?: string;
  variant?: CodegenTypes.WithDefault<
    | 'unset'
    | 'filled'
    | 'secondary'
    | 'muted'
    | 'tinted'
    | 'outline'
    | 'ghost'
    | 'destructive',
    'unset'
  >;
  slots?: string;
}

export default codegenNativeComponent<NativeProps>('GpuiKitBubble', {
  interfaceOnly: true,
});
