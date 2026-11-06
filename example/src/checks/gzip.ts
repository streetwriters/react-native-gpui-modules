import { deflate, inflate } from "react-native-gzip";
import type { ModuleChecks } from "./types";

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const gzip: ModuleChecks = {
  name: "gzip",
  checks: [
    [
      "round-trips a string",
      async () => {
        const text = "notesnook ".repeat(500);
        const packed = await deflate(text);
        assert(packed.length < text.length, "not compressed");
        assert((await inflate(packed)) === text, "round trip differs");
      }
    ],
    [
      "round-trips unicode",
      async () => {
        const text = "héllo wörld ✓ 日本語";
        assert((await inflate(await deflate(text))) === text, "unicode differs");
      }
    ],
    [
      "inflates gzip data from another encoder",
      async () => {
        const known = "H4sIAMna7WoC/8tIzcnJVyjPL8pJAQCFEUoNCwAAAA==";
        assert((await inflate(known)) === "hello world", "known data differs");
      }
    ],
    [
      "rejects data that is not gzip",
      async () => {
        let failed = false;
        try {
          await inflate("bm90IGd6aXA=");
        } catch {
          failed = true;
        }
        assert(failed, "invalid data was accepted");
      }
    ]
  ]
};

export default gzip;
