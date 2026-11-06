import * as Keychain from "react-native-keychain";
import type { ModuleChecks } from "./types";

const suffix = Date.now().toString(36);

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const keychain: ModuleChecks = {
  name: "keychain",
  checks: [
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
