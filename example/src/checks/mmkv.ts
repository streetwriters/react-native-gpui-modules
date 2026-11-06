import { MMKVLoader } from "react-native-mmkv-storage";
import type { ModuleChecks } from "./types";

const suffix = Date.now().toString(36);

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const mmkv: ModuleChecks = {
  name: "mmkv",
  checks: [
    [
      "stores and reads strings, numbers, booleans and maps",
      () => {
        const storage = new MMKVLoader()
          .withInstanceID(`plain-${suffix}`)
          .initialize();
        storage.setString("s", "hello");
        storage.setInt("n", 42);
        storage.setBool("b", true);
        storage.setMap("m", { a: 1 });
        assert(storage.getString("s") === "hello", "string");
        assert(storage.getInt("n") === 42, "number");
        assert(storage.getBool("b") === true, "boolean");
        assert(storage.getMap<{ a: number }>("m")?.a === 1, "map");
      }
    ],
    [
      "removes keys and clears the store",
      () => {
        const storage = new MMKVLoader()
          .withInstanceID(`remove-${suffix}`)
          .initialize();
        storage.setString("k", "v");
        storage.removeItem("k");
        assert(storage.getString("k") == null, "key not removed");
        storage.setString("k", "v");
        storage.clearStore();
        assert(storage.getString("k") == null, "store not cleared");
      }
    ],
    [
      "indexes keys by type",
      () => {
        const storage = new MMKVLoader()
          .withInstanceID(`index-${suffix}`)
          .initialize();
        storage.setString("a", "1");
        storage.setInt("b", 2);
        assert(storage.indexer.strings.hasKey("a"), "string index");
        assert(storage.indexer.numbers.hasKey("b"), "number index");
      }
    ],
    [
      "encrypts with a key kept in secure storage",
      () => {
        const storage = new MMKVLoader()
          .withInstanceID(`secure-${suffix}`)
          .withEncryption()
          .initialize();
        storage.setString("secret", "value");
        assert(storage.getString("secret") === "value", "encrypted read");
      }
    ]
  ]
};

export default mmkv;
