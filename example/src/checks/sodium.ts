import Sodium from "@ammarahmed/react-native-sodium";
import type { ModuleChecks } from "./types";

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const sodium: ModuleChecks = {
  name: "sodium",
  checks: [
    [
      "reports the libsodium version",
      async () => {
        const version = await Sodium.sodium_version_string();
        assert(/^\d+\.\d+/.test(version), `version is ${version}`);
      }
    ],
    [
      "derives a 32 byte key and the same key from the same salt",
      async () => {
        const first = await Sodium.deriveKey("password");
        assert(first.key && first.salt, "key or salt missing");
        const second = await Sodium.deriveKey("password", first.salt);
        assert(second.key === first.key, "key differs for the same salt");
      }
    ],
    [
      "encrypts and decrypts text with a password",
      async () => {
        const cipher = await Sodium.encrypt(
          { password: "secret" },
          { type: "plain", data: "hello notesnook" }
        );
        const plain = await Sodium.decrypt(
          { password: "secret" },
          { ...cipher, output: "plain" } as any
        );
        assert(plain === "hello notesnook", `decrypted ${plain}`);
      }
    ],
    [
      "rejects a wrong key",
      async () => {
        const key = await Sodium.deriveKey("one");
        const other = await Sodium.deriveKey("two");
        const cipher = await Sodium.encrypt(key, { type: "plain", data: "x" });
        let failed = false;
        try {
          await Sodium.decrypt(other, cipher);
        } catch {
          failed = true;
        }
        assert(failed, "decrypt with a wrong key succeeded");
      }
    ],
    [
      "encrypts and decrypts several items",
      async () => {
        const key = await Sodium.deriveKey("multi");
        const ciphers = await Sodium.encryptMulti(key, [
          { type: "plain", data: "a" },
          { type: "plain", data: "b" }
        ]);
        const plain = await Sodium.decryptMulti(
          key,
          ciphers.map((c) => ({ ...c, output: "plain" }) as any)
        );
        assert(plain.join("") === "ab", `decrypted ${plain.join("")}`);
      }
    ],
    [
      "hashes a password deterministically",
      async () => {
        const a = await Sodium.hashPassword("password", "a@b.c");
        const b = await Sodium.hashPassword("password", "a@b.c");
        assert(a === b && a.length > 20, "hash is not stable");
      }
    ],
    [
      "encrypts, hashes and decrypts a file in chunks",
      async () => {
        const data = btoa("n".repeat(1_300_000));
        const key = await Sodium.deriveKey("file");
        const hash = await Sodium.hashFile({ type: "base64", uri: "", data });
        const cipher = await Sodium.encryptFile(key, {
          type: "base64",
          uri: "",
          data
        });
        assert(cipher.hash === hash, "hash differs");
        const text = await Sodium.decryptFile(key, cipher, "text");
        assert(text.length === 1_300_000, `decrypted ${text.length} bytes`);
      }
    ]
  ]
};

export default sodium;
