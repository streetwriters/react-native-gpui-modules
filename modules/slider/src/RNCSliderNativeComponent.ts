import type { ColorValue, HostComponent, ViewProps } from 'react-native';
import { ImageSource, codegenNativeComponent } from 'react-native';
import type { CodegenTypes } from 'react-native';

type Event = Readonly<{
  value: CodegenTypes.Float;
  fromUser?: boolean;
}>;

export interface NativeProps extends ViewProps {
  accessibilityUnits?: string;
  accessibilityIncrements?: ReadonlyArray<string>;
  disabled?: CodegenTypes.WithDefault<boolean, false>;
  inverted?: CodegenTypes.WithDefault<boolean, false>;
  vertical?: CodegenTypes.WithDefault<boolean, false>;
  tapToSeek?: CodegenTypes.WithDefault<boolean, false>;
  maximumTrackImage?: ImageSource;
  maximumTrackTintColor?: ColorValue;
  maximumValue?: CodegenTypes.WithDefault<CodegenTypes.Double, 1>;
  minimumTrackImage?: ImageSource;
  minimumTrackTintColor?: ColorValue;
  minimumValue?: CodegenTypes.Double;
  onChange?: CodegenTypes.BubblingEventHandler<Event>;
  onRNCSliderSlidingStart?: CodegenTypes.DirectEventHandler<Event>;
  onRNCSliderSlidingComplete?: CodegenTypes.DirectEventHandler<Event>;
  onRNCSliderValueChange?: CodegenTypes.BubblingEventHandler<Event>;
  step?: CodegenTypes.Double;
  testID?: string;
  thumbImage?: ImageSource;
  thumbTintColor?: ColorValue;
  thumbSize?: CodegenTypes.Float;
  trackImage?: ImageSource;
  value?: CodegenTypes.Float;
  lowerLimit?: CodegenTypes.Float;
  upperLimit?: CodegenTypes.Float;
}

export default codegenNativeComponent<NativeProps>('RNCSlider', {
  interfaceOnly: true,
}) as HostComponent<NativeProps>;
