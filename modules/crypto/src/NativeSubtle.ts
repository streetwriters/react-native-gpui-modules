import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  digest(hash: string, data: ArrayBuffer): Promise<ArrayBuffer>;
  aesGcm(
    encrypt: boolean,
    key: ArrayBuffer,
    iv: ArrayBuffer,
    additionalData: ArrayBuffer,
    data: ArrayBuffer,
  ): Promise<ArrayBuffer>;
  aesKw(wrap: boolean, key: ArrayBuffer, data: ArrayBuffer): Promise<ArrayBuffer>;
  pbkdf2(
    hash: string,
    password: ArrayBuffer,
    salt: ArrayBuffer,
    iterations: number,
    length: number,
  ): Promise<ArrayBuffer>;
  hkdf(
    hash: string,
    key: ArrayBuffer,
    salt: ArrayBuffer,
    info: ArrayBuffer,
    length: number,
  ): Promise<ArrayBuffer>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RNGpuiSubtle');
