import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  setInternetCredentialsForServer(
    server: string,
    username: string,
    password: string,
    securityLevel: string | null,
    options: Object | null,
  ): Promise<boolean>;
  hasInternetCredentialsForServer(server: string): Promise<boolean>;
  getInternetCredentialsForServer(
    server: string,
    options: Object | null,
  ): Promise<Object>;
  resetInternetCredentialsForServer(
    server: string,
    options: Object | null,
  ): Promise<boolean>;
  setGenericPasswordForOptions(
    service: string | null,
    username: string,
    password: string,
    securityLevel: string | null,
  ): Promise<boolean>;
  getGenericPasswordForOptions(service: string | null): Promise<Object>;
  resetGenericPasswordForOptions(service: string | null): Promise<boolean>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RNKeychainManager');
