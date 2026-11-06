import OpenPGP from "@react-native-gpui/openpgp";
import { message, plaintext, privateKey } from "./openpgp-fixture";
import type { ModuleChecks } from "./types";

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const openpgp: ModuleChecks = {
  name: "openpgp",
  checks: [
    [
      "generates an armored key pair",
      async () => {
        const keys = await OpenPGP.generate({ name: "NN", email: "NN@NN.NN" });
        assert(keys.publicKey.includes("BEGIN PGP PUBLIC KEY BLOCK"), "public");
        assert(keys.privateKey.includes("BEGIN PGP PRIVATE KEY BLOCK"), "private");
      }
    ],
    [
      "encrypts and decrypts with a generated key pair",
      async () => {
        const keys = await OpenPGP.generate({ name: "NN", email: "NN@NN.NN" });
        const text = JSON.stringify({ favorite: true, title: "Hello world" });
        const cipher = await OpenPGP.encrypt(text, keys.publicKey);
        assert(cipher.includes("BEGIN PGP MESSAGE"), "not armored");
        assert((await OpenPGP.decrypt(cipher, keys.privateKey, "")) === text, "differs");
      }
    ],
    [
      "decrypts a message made by openpgp.js",
      async () => {
        const text = await OpenPGP.decrypt(message, privateKey, "");
        assert(text === plaintext, `decrypted ${text}`);
      }
    ],
    [
      "rejects a key that does not match",
      async () => {
        const a = await OpenPGP.generate({ name: "A", email: "a@a.a" });
        const b = await OpenPGP.generate({ name: "B", email: "b@b.b" });
        const cipher = await OpenPGP.encrypt("secret", a.publicKey);
        let failed = false;
        try {
          await OpenPGP.decrypt(cipher, b.privateKey, "");
        } catch {
          failed = true;
        }
        assert(failed, "decrypted with the wrong key");
      }
    ]
  ]
};

export default openpgp;
