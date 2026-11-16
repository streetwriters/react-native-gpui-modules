import type { HybridObject } from 'react-native-nitro-modules';

export interface NitroFixture extends HybridObject<{
  ios: 'c++';
  android: 'c++';
}> {
  add(a: number, b: number): number;
  greet(name: string): string;
  addAsync(a: number, b: number): Promise<number>;
  callBack(value: string, callback: (value: string) => void): void;
  sumBytes(buffer: ArrayBuffer): number;
}
