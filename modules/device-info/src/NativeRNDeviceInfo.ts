import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  getConstants(): {
    model: string;
    brand: string;
    systemName: string;
    systemVersion: string;
    appName: string;
    appVersion: string;
    buildNumber: string;
    bundleId: string;
    isTablet: boolean;
  };
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RNDeviceInfo');
