import { createMMKV } from 'react-native-mmkv';
import type { ModuleChecks } from './types';

const suffix = Date.now().toString(36);

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const mmkv: ModuleChecks = {
  name: 'mmkv',
  checks: [
    [
      'stores and reads strings, numbers, booleans and buffers',
      () => {
        const storage = createMMKV({ id: `plain-${suffix}` });
        storage.set('s', 'hello');
        storage.set('n', 42);
        storage.set('b', true);
        storage.set('buf', new Uint8Array([1, 2, 3]).buffer);
        assert(storage.getString('s') === 'hello', 'string');
        assert(storage.getNumber('n') === 42, 'number');
        assert(storage.getBoolean('b') === true, 'boolean');
        assert(storage.getBuffer('buf')?.byteLength === 3, 'buffer');
        storage.clearAll();
      },
    ],
    [
      'removes keys and clears the store',
      () => {
        const storage = createMMKV({ id: `remove-${suffix}` });
        storage.set('k', 'v');
        assert(storage.remove('k'), 'key not removed');
        assert(storage.getString('k') === undefined, 'key still readable');
        storage.set('k', 'v');
        storage.clearAll();
        assert(storage.getAllKeys().length === 0, 'store not cleared');
      },
    ],
    [
      'encrypts with a key',
      () => {
        const storage = createMMKV({
          id: `secure-${suffix}`,
          encryptionKey: 'check-key',
        });
        storage.set('secret', 'value');
        assert(storage.isEncrypted, 'not encrypted');
        assert(storage.getString('secret') === 'value', 'encrypted read');
        storage.clearAll();
      },
    ],
  ],
};

export default mmkv;
