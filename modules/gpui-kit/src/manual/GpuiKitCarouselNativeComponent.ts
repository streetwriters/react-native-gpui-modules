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
  size?: string;
  /** Slides drawn natively as centred text, instead of the slots. */
  slides?: ReadonlyArray<string>;
  /** Refines each native slide (a KitStyle as JSON). */
  slideStyle?: string;
  /** Refines the carousel, its content, its track and each item (KitStyles as JSON). */
  kitStyle?: string;
  contentStyle?: string;
  trackStyle?: string;
  itemStyle?: string;
  /** Numbers the pagination items. */
  paginationLabels?: boolean;
  previousLabel?: string;
  nextLabel?: string;
  previousAccessibilityLabel?: string;
  nextAccessibilityLabel?: string;
  slots?: string;
  onGpuiKitCarouselChange?: CodegenTypes.DirectEventHandler<
    Readonly<{ index: CodegenTypes.Int32 }>
  >;
}

export default codegenNativeComponent<NativeProps>('GpuiKitCarousel', {
  interfaceOnly: true,
});
