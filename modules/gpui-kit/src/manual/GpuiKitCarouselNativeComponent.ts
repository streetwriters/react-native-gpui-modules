import {
  codegenNativeComponent,
  type CodegenTypes,
  type ViewProps,
} from 'react-native';

export interface NativeProps extends ViewProps {
  vertical?: boolean;
  looping?: boolean;
  controls?: boolean;
  pagination?: boolean;
  selectedIndex?: CodegenTypes.Int32;
  controlled?: boolean;
  slots?: string;
  onGpuiKitCarouselChange?: CodegenTypes.DirectEventHandler<
    Readonly<{ index: CodegenTypes.Int32 }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitCarousel', {
  interfaceOnly: true,
});
