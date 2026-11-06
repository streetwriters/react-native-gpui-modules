import type { TurboModule, CodegenTypes } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  getString(): Promise<string>;
  getStrings(): Promise<string[]>;
  getImagePNG(): Promise<string>;
  getImageJPG(): Promise<string>;
  setImage(content: string): Promise<void>;
  getImage(): Promise<string>;
  setString(content: string): void;
  setHTML(html: string, content: string): void;
  getHTML(): Promise<string>;
  setStrings(content: string[]): void;
  hasString(): Promise<boolean>;
  hasImage(): Promise<boolean>;
  hasURL(): Promise<boolean>;
  hasNumber(): Promise<boolean>;
  hasWebURL(): Promise<boolean>;
  setListener(): void;
  removeListener(): void;
  addListener(eventName: string): void;
  removeListeners(count: CodegenTypes.Int32): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RNCClipboard');
