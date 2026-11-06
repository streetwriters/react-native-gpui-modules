import "@react-native-gpui/crypto";
import type { ModuleChecks } from "./types";

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const crypto: ModuleChecks = {
  name: "crypto",
  checks: [
    [
      "fills a typed array in place and returns it",
      () => {
        const bytes = new Uint8Array(64);
        const result = globalThis.crypto.getRandomValues(bytes);
        assert(result === bytes, "did not return the same array");
        assert(bytes.some((b) => b !== 0), "array is still zero");
      }
    ],
    [
      "respects the offset of a view",
      () => {
        const buffer = new ArrayBuffer(32);
        const view = new Uint8Array(buffer, 8, 16);
        globalThis.crypto.getRandomValues(view);
        const all = new Uint8Array(buffer);
        assert(all.slice(0, 8).every((b) => b === 0), "wrote before the view");
        assert(all.slice(24).every((b) => b === 0), "wrote after the view");
        assert(view.some((b) => b !== 0), "view is still zero");
      }
    ],
    [
      "fills wider integer arrays",
      () => {
        const words = new Uint32Array(16);
        globalThis.crypto.getRandomValues(words);
        assert(words.some((w) => w !== 0), "array is still zero");
      }
    ],
    [
      "rejects float arrays and more than 65536 bytes",
      () => {
        let floats = false;
        let large = false;
        try {
          globalThis.crypto.getRandomValues(new Float32Array(4) as never);
        } catch {
          floats = true;
        }
        try {
          globalThis.crypto.getRandomValues(new Uint8Array(65537));
        } catch {
          large = true;
        }
        assert(floats, "accepted a float array");
        assert(large, "accepted more than 65536 bytes");
      }
    ],
    [
      "generates distinct version 4 uuids",
      () => {
        const a = globalThis.crypto.randomUUID();
        const b = globalThis.crypto.randomUUID();
        assert(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(a),
          `bad uuid ${a}`
        );
        assert(a !== b, "uuids repeat");
      }
    ]
  ]
};

export default crypto;
