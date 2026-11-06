import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  generate(options: Object): Promise<Object>;
  encrypt(message: string, publicKey: string): Promise<string>;
  decrypt(
    message: string,
    privateKey: string,
    passphrase: string,
  ): Promise<string>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RNGpuiOpenPGP');
