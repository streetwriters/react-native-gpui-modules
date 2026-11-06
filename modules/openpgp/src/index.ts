import NativeOpenPGP from './NativeOpenPGP';

export type KeyPair = { publicKey: string; privateKey: string };

export type GenerateOptions = { name?: string; email?: string };

const OpenPGP = {
  useJSI: false,
  generate: (options: GenerateOptions) =>
    NativeOpenPGP.generate(options) as Promise<KeyPair>,
  encrypt: (message: string, publicKey: string) =>
    NativeOpenPGP.encrypt(message, publicKey),
  decrypt: (message: string, privateKey: string, passphrase: string) =>
    NativeOpenPGP.decrypt(message, privateKey, passphrase),
};

export default OpenPGP;
