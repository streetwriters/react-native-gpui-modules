import type { TurboModule, CodegenTypes } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  setGenericPasswordForOptions(
    options: CodegenTypes.UnsafeObject | null | undefined,
    username: string,
    password: string
  ): Promise<CodegenTypes.UnsafeObject | null>;
  getGenericPasswordForOptions(
    options?: CodegenTypes.UnsafeObject | null
  ): Promise<CodegenTypes.UnsafeObject>;
  hasGenericPasswordForOptions(
    options?: CodegenTypes.UnsafeObject | null
  ): Promise<boolean>;
  resetGenericPasswordForOptions(
    options?: CodegenTypes.UnsafeObject | null
  ): Promise<boolean>;
  getAllGenericPasswordServices(
    options?: CodegenTypes.UnsafeObject | null
  ): Promise<string[]>;
  getAllInternetCredentialServers(
    options?: CodegenTypes.UnsafeObject | null
  ): Promise<string[]>;
  hasInternetCredentialsForOptions(
    options: CodegenTypes.UnsafeObject
  ): Promise<boolean>;
  setInternetCredentialsForServer(
    server: string,
    username: string,
    password: string,
    options?: CodegenTypes.UnsafeObject | null
  ): Promise<CodegenTypes.UnsafeObject | null>;
  getInternetCredentialsForServer(
    server: string,
    options?: CodegenTypes.UnsafeObject | null
  ): Promise<CodegenTypes.UnsafeObject>;
  resetInternetCredentialsForOptions(
    options: CodegenTypes.UnsafeObject
  ): Promise<boolean>;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
  'RNKeychainManager'
) as Spec;
