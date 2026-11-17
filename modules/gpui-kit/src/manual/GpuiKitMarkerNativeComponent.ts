import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  variant?: CodegenTypes.WithDefault<
    'unset' | 'plain' | 'separator' | 'border',
    'unset'
  >;
  alignment?: CodegenTypes.WithDefault<
    'unset' | 'start' | 'center' | 'end',
    'unset'
  >;
  loadingStyle?: CodegenTypes.WithDefault<
    'unset' | 'spinner' | 'shimmer',
    'unset'
  >;
  loading?: boolean;
  text?: string;
  icon?: string;
  slots?: string;
  accessibilityRoleOverride?: string;
  separatorStyle?: string;
  shimmerDuration?: CodegenTypes.Double;
  shimmerHighlightColor?: CodegenTypes.Int32;
  shimmerSpread?: CodegenTypes.Double;
  shimmerReverse?: boolean;
  shimmerOnce?: boolean;
}

export default codegenNativeComponent<NativeProps>('GpuiKitMarker', {
  interfaceOnly: true,
});
