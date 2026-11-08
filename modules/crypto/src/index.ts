import NativeCrypto from './NativeCrypto';
import { CryptoKey, subtle } from './subtle';

NativeCrypto.install();

const target = globalThis.crypto as unknown as Record<string, unknown>;
if (target && !target.subtle) {
  Object.defineProperty(target, 'subtle', {
    value: subtle,
    configurable: true,
    enumerable: true,
    writable: true,
  });
}
const global = globalThis as unknown as Record<string, unknown>;
if (!global.CryptoKey) global.CryptoKey = CryptoKey;

export { CryptoKey, subtle };
