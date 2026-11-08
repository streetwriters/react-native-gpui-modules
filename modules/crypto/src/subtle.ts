import NativeSubtle from './NativeSubtle';

type BufferSource = ArrayBuffer | ArrayBufferView;
type KeyUsage =
  | 'encrypt'
  | 'decrypt'
  | 'wrapKey'
  | 'unwrapKey'
  | 'deriveKey'
  | 'deriveBits';
type KeyFormat = 'raw' | 'jwk' | 'spki' | 'pkcs8';
type AlgorithmIdentifier = string | { name: string; [key: string]: unknown };

interface KeyState {
  bytes: ArrayBuffer;
}

async function native<T>(call: Promise<T>): Promise<T> {
  try {
    return await call;
  } catch (error) {
    const code = (error as { code?: string }).code;
    const message = (error as Error).message;
    if (code === 'ERR_CRYPTO_UNSUPPORTED') {
      return fail('NotSupportedError', message);
    }
    return fail('OperationError', message);
  }
}

const states = new WeakMap<object, KeyState>();

function fail(name: string, message: string): never {
  const error = new Error(message);
  error.name = name;
  throw error;
}

function copy(data: BufferSource): ArrayBuffer {
  if (data instanceof ArrayBuffer) return data.slice(0);
  if (ArrayBuffer.isView(data)) {
    return data.buffer.slice(
      data.byteOffset,
      data.byteOffset + data.byteLength,
    ) as ArrayBuffer;
  }
  return fail('TypeError', 'The data is not an ArrayBuffer or a view of one');
}

const KNOWN = ['AES-GCM', 'AES-KW', 'PBKDF2', 'HKDF'] as const;

function nameOf(algorithm: AlgorithmIdentifier): string {
  const given = typeof algorithm === 'string' ? algorithm : algorithm?.name;
  if (typeof given !== 'string') {
    return fail('TypeError', 'The algorithm needs a name');
  }
  const found = KNOWN.find(name => name === given.toUpperCase());
  return found ?? given.toUpperCase();
}

function hashOf(hash: unknown): string {
  const given =
    typeof hash === 'string' ? hash : (hash as { name?: string } | undefined)?.name;
  const name = typeof given === 'string' ? given.toUpperCase() : '';
  if (!['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'].includes(name)) {
    return fail('NotSupportedError', `The hash ${String(given)} is not supported`);
  }
  return name;
}

const ALLOWED: Record<string, KeyUsage[]> = {
  'AES-GCM': ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey'],
  'AES-KW': ['wrapKey', 'unwrapKey'],
  PBKDF2: ['deriveKey', 'deriveBits'],
  HKDF: ['deriveKey', 'deriveBits'],
};

export class CryptoKey {
  readonly type: 'secret' = 'secret';
  readonly extractable: boolean;
  readonly algorithm: { name: string; length?: number };
  readonly usages: KeyUsage[];

  constructor(
    token: symbol,
    bytes: ArrayBuffer,
    algorithm: { name: string; length?: number },
    extractable: boolean,
    usages: KeyUsage[],
  ) {
    if (token !== CREATE) {
      fail('TypeError', 'Illegal constructor');
    }
    this.algorithm = Object.freeze(algorithm);
    this.extractable = extractable;
    this.usages = Object.freeze([...usages]) as KeyUsage[];
    states.set(this, { bytes });
    Object.freeze(this);
  }
}
const CREATE = Symbol('create');

function makeKey(
  bytes: ArrayBuffer,
  algorithm: { name: string; length?: number },
  extractable: boolean,
  usages: KeyUsage[],
): CryptoKey {
  const allowed = ALLOWED[algorithm.name];
  for (const usage of usages) {
    if (!allowed.includes(usage)) {
      fail('SyntaxError', `${algorithm.name} keys cannot be used to ${usage}`);
    }
  }
  return new CryptoKey(CREATE, bytes, algorithm, extractable, usages);
}

function bytesOf(key: CryptoKey): ArrayBuffer {
  const state = states.get(key);
  if (!state) return fail('TypeError', 'The key is not a CryptoKey');
  return state.bytes;
}

function requireUsage(key: CryptoKey, usage: KeyUsage, algorithm: string) {
  if (key.algorithm.name !== algorithm) {
    fail('InvalidAccessError', `The key is not a ${algorithm} key`);
  }
  if (!key.usages.includes(usage)) {
    fail('InvalidAccessError', `The key cannot be used to ${usage}`);
  }
}

function aesLength(algorithm: AlgorithmIdentifier): number {
  const length = (algorithm as { length?: number }).length;
  if (length !== 128 && length !== 192 && length !== 256) {
    return fail('OperationError', 'The key length must be 128, 192 or 256');
  }
  return length;
}

function importRaw(
  data: BufferSource,
  algorithm: AlgorithmIdentifier,
  extractable: boolean,
  usages: KeyUsage[],
): CryptoKey {
  const name = nameOf(algorithm);
  const bytes = copy(data);
  if (name === 'AES-GCM' || name === 'AES-KW') {
    if (![16, 24, 32].includes(bytes.byteLength)) {
      fail('DataError', 'An AES key is 128, 192 or 256 bits');
    }
    return makeKey(
      bytes,
      { name, length: bytes.byteLength * 8 },
      extractable,
      usages,
    );
  }
  if (name === 'PBKDF2' || name === 'HKDF') {
    if (extractable) {
      fail('SyntaxError', `A ${name} key cannot be extractable`);
    }
    return makeKey(bytes, { name }, false, usages);
  }
  return fail('NotSupportedError', `The algorithm ${name} is not supported`);
}

async function deriveBitsFrom(
  algorithm: AlgorithmIdentifier,
  baseKey: CryptoKey,
  length: number,
): Promise<ArrayBuffer> {
  const name = nameOf(algorithm);
  const params = algorithm as Record<string, unknown>;
  if (!Number.isInteger(length) || length <= 0 || length % 8 !== 0) {
    fail('OperationError', 'The length must be a positive multiple of 8 bits');
  }
  requireUsage(baseKey, 'deriveBits', name);
  if (name === 'PBKDF2') {
    return native(NativeSubtle.pbkdf2(
      hashOf(params.hash),
      bytesOf(baseKey),
      copy(params.salt as BufferSource),
      Number(params.iterations),
      length / 8,
    ));
  }
  if (name === 'HKDF') {
    return native(NativeSubtle.hkdf(
      hashOf(params.hash),
      bytesOf(baseKey),
      copy(params.salt as BufferSource),
      copy(params.info as BufferSource),
      length / 8,
    ));
  }
  return fail('NotSupportedError', `The algorithm ${name} cannot derive`);
}

function generateBytes(length: number): ArrayBuffer {
  const bytes = new Uint8Array(length / 8);
  globalThis.crypto.getRandomValues(bytes);
  return bytes.buffer as ArrayBuffer;
}

/** The part of the WebCrypto `SubtleCrypto` interface the apps here use. */
export const subtle = {
  async digest(algorithm: AlgorithmIdentifier, data: BufferSource) {
    return native(NativeSubtle.digest(hashOf(algorithm), copy(data)));
  },

  async generateKey(
    algorithm: AlgorithmIdentifier,
    extractable: boolean,
    usages: KeyUsage[],
  ) {
    const name = nameOf(algorithm);
    if (name !== 'AES-GCM' && name !== 'AES-KW') {
      fail('NotSupportedError', `The algorithm ${name} cannot generate keys`);
    }
    const length = aesLength(algorithm);
    return makeKey(generateBytes(length), { name, length }, extractable, usages);
  },

  async importKey(
    format: KeyFormat,
    keyData: BufferSource,
    algorithm: AlgorithmIdentifier,
    extractable: boolean,
    usages: KeyUsage[],
  ) {
    if (format !== 'raw') {
      fail('NotSupportedError', `The key format ${format} is not supported`);
    }
    return importRaw(keyData, algorithm, extractable, usages);
  },

  async exportKey(format: KeyFormat, key: CryptoKey) {
    if (format !== 'raw') {
      fail('NotSupportedError', `The key format ${format} is not supported`);
    }
    const bytes = bytesOf(key);
    if (!key.extractable) {
      fail('InvalidAccessError', 'The key is not extractable');
    }
    return bytes.slice(0);
  },

  async encrypt(
    algorithm: AlgorithmIdentifier,
    key: CryptoKey,
    data: BufferSource,
  ) {
    return gcmWith(true, algorithm, key, data);
  },

  async decrypt(
    algorithm: AlgorithmIdentifier,
    key: CryptoKey,
    data: BufferSource,
  ) {
    return gcmWith(false, algorithm, key, data);
  },

  async wrapKey(
    format: KeyFormat,
    key: CryptoKey,
    wrappingKey: CryptoKey,
    wrapAlgorithm: AlgorithmIdentifier,
  ) {
    const name = nameOf(wrapAlgorithm);
    if (name !== 'AES-KW') {
      fail('NotSupportedError', `Wrapping with ${name} is not supported`);
    }
    requireUsage(wrappingKey, 'wrapKey', 'AES-KW');
    const exported = await subtle.exportKey(format, key);
    return native(NativeSubtle.aesKw(true, bytesOf(wrappingKey), exported));
  },

  async unwrapKey(
    format: KeyFormat,
    wrappedKey: BufferSource,
    unwrappingKey: CryptoKey,
    unwrapAlgorithm: AlgorithmIdentifier,
    unwrappedKeyAlgorithm: AlgorithmIdentifier,
    extractable: boolean,
    usages: KeyUsage[],
  ) {
    const name = nameOf(unwrapAlgorithm);
    if (name !== 'AES-KW') {
      fail('NotSupportedError', `Unwrapping with ${name} is not supported`);
    }
    requireUsage(unwrappingKey, 'unwrapKey', 'AES-KW');
    if (format !== 'raw') {
      fail('NotSupportedError', `The key format ${format} is not supported`);
    }
    const bytes = await native(NativeSubtle.aesKw(
      false,
      bytesOf(unwrappingKey),
      copy(wrappedKey),
    ));
    return importRaw(bytes, unwrappedKeyAlgorithm, extractable, usages);
  },

  async deriveBits(
    algorithm: AlgorithmIdentifier,
    baseKey: CryptoKey,
    length: number,
  ) {
    return deriveBitsFrom(algorithm, baseKey, length);
  },

  async deriveKey(
    algorithm: AlgorithmIdentifier,
    baseKey: CryptoKey,
    derivedKeyType: AlgorithmIdentifier,
    extractable: boolean,
    usages: KeyUsage[],
  ) {
    const name = nameOf(derivedKeyType);
    if (name !== 'AES-GCM' && name !== 'AES-KW') {
      fail('NotSupportedError', `Deriving a ${name} key is not supported`);
    }
    const length = aesLength(derivedKeyType);
    requireUsage(baseKey, 'deriveKey', nameOf(algorithm));
    const bits = await deriveBitsFrom(
      algorithm,
      new CryptoKey(
        CREATE,
        bytesOf(baseKey),
        baseKey.algorithm,
        false,
        ['deriveBits'],
      ),
      length,
    );
    return makeKey(bits, { name, length }, extractable, usages);
  },
};

async function gcmWith(
  encrypt: boolean,
  algorithm: AlgorithmIdentifier,
  key: CryptoKey,
  data: BufferSource,
) {
  if (nameOf(algorithm) !== 'AES-GCM') {
    fail('NotSupportedError', `${nameOf(algorithm)} is not supported`);
  }
  requireUsage(key, encrypt ? 'encrypt' : 'decrypt', 'AES-GCM');
  const params = algorithm as Record<string, unknown>;
  if (params.tagLength !== undefined && params.tagLength !== 128) {
    fail('NotSupportedError', 'Only a 128 bit tag is supported');
  }
  return native(NativeSubtle.aesGcm(
    encrypt,
    bytesOf(key),
    copy(params.iv as BufferSource),
    params.additionalData ? copy(params.additionalData as BufferSource) : new ArrayBuffer(0),
    copy(data),
  ));
}
