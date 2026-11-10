import { NativeModules } from 'react-native';
import { DeviceInfoNativeModule } from 'react-native-device-info/src/internal/privateTypes';

let RNDeviceInfo: DeviceInfoNativeModule | undefined =
  NativeModules.RNDeviceInfo;

// The desktop module hands its values over as constants, as the iOS module does.
if (RNDeviceInfo && typeof (RNDeviceInfo as any).getConstants === 'function') {
  RNDeviceInfo = Object.assign(
    { addListener() {}, removeListeners() {} },
    (RNDeviceInfo as any).getConstants(),
  ) as any;
}

if (!RNDeviceInfo) {
  throw new Error(
    'react-native-device-info: NativeModule.RNDeviceInfo is null. Install @react-native-gpui/device-info and run react-native init-desktop.',
  );
}

export default RNDeviceInfo as DeviceInfoNativeModule;
