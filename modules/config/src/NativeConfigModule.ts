import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  getConfig(): {
    config: Object;
  };
}

export default TurboModuleRegistry.getEnforcing<Spec>('RNCConfigModule');
