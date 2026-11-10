import * as Keychain from "react-native-keychain";
import {
  decryptString,
  deleteItem,
  encryptString,
  getItem,
  isEncryptionAvailable,
  setItem
} from "@react-native-gpui/keychain";
import type { ModuleChecks } from "./types";

const suffix = Date.now().toString(36);

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const keychain: ModuleChecks = {
  name: "keychain",
  checks: [
    [
      "reports that encryption is available",
      async () => {
        assert(await isEncryptionAvailable(), "the credential store is not available");
      }
    ],
    [
      "encrypts and decrypts a string with the stored key",
      async () => {
        const service = `crypt-${suffix}`;
        const data = await encryptString(service, "héllo 日本 🙂");
        assert(data instanceof Uint8Array && data.length > 29, "not bytes");
        assert((await decryptString(service, data)) === "héllo 日本 🙂", "text differs");
        const other = await encryptString(service, "héllo 日本 🙂");
        assert(
          data.some((byte, at) => byte !== other[at]),
          "the nonce did not change"
        );
        const changed = data.slice();
        changed[changed.length - 1] ^= 1;
        let rejected = false;
        try {
          await decryptString(service, changed);
        } catch {
          rejected = true;
        }
        assert(rejected, "changed data was accepted");
        let wrongService = false;
        try {
          await decryptString(`${service}-other`, data);
        } catch {
          wrongService = true;
        }
        assert(wrongService, "another service decrypted the data");
      }
    ],
    [
      "stores, reads, replaces and deletes an item in the app's namespace",
      async () => {
        const service = `items-${suffix}`;
        assert((await getItem(service, "token")) === null, "exists early");
        await setItem(service, "token", "one");
        await setItem(service, "token", "two");
        assert((await getItem(service, "token")) === "two", "not replaced");
        assert(await deleteItem(service, "token"), "nothing deleted");
        assert(!(await deleteItem(service, "token")), "deleted twice");
        assert((await getItem(service, "token")) === null, "not removed");
      }
    ],
    [
      "refuses a service name that could leave the app's namespace",
      async () => {
        for (const service of ["", "a/b", "../x"]) {
          let rejected = false;
          try {
            await getItem(service, "token");
          } catch {
            rejected = true;
          }
          assert(rejected, `service ${JSON.stringify(service)} was accepted`);
        }
      }
    ],
    [
      "does not expose the encryption key as an item",
      async () => {
        const service = `key-${suffix}`;
        await encryptString(service, "x");
        assert((await getItem(service, "master-key")) === null, "the key is readable");
      }
    ],
    [
      "stores, reads and removes internet credentials",
      async () => {
        const server = `example-${suffix}`;
        assert(!(await Keychain.hasInternetCredentials({ server })), "exists early");
        await Keychain.setInternetCredentials(server, "user", "secret", {
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY
        });
        assert(await Keychain.hasInternetCredentials({ server }), "not stored");
        const credentials = await Keychain.getInternetCredentials(server);
        assert(
          credentials &&
            credentials.username === "user" &&
            credentials.password === "secret",
          "credentials differ"
        );
        await Keychain.resetInternetCredentials({ server });
        assert(
          !(await Keychain.hasInternetCredentials({ server })),
          "not removed"
        );
      }
    ],
    [
      "overwrites an existing entry",
      async () => {
        const server = `overwrite-${suffix}`;
        await Keychain.setInternetCredentials(server, "a", "1");
        await Keychain.setInternetCredentials(server, "b", "2");
        const credentials = await Keychain.getInternetCredentials(server);
        assert(
          credentials && credentials.username === "b" && credentials.password === "2",
          "not overwritten"
        );
        await Keychain.resetInternetCredentials({ server });
      }
    ],
    [
      "stores and reads a generic password",
      async () => {
        const service = `generic-${suffix}`;
        await Keychain.setGenericPassword("user", "secret", { service });
        const found = await Keychain.getGenericPassword({ service });
        assert(found && found.password === "secret", "generic differs");
        await Keychain.resetGenericPassword({ service });
        assert((await Keychain.getGenericPassword({ service })) === false, "kept");
      }
    ],
    [
      "returns false for a missing entry",
      async () => {
        const result = await Keychain.getInternetCredentials(`missing-${suffix}`);
        assert(result === false, "expected false");
      }
    ]
  ]
};

export default keychain;
