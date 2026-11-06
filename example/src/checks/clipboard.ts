import Clipboard from "@react-native-clipboard/clipboard";
import type { ModuleChecks } from "./types";

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const clipboard: ModuleChecks = {
  name: "clipboard",
  checks: [
    [
      "copies and reads a string",
      async () => {
        const text = `notesnook ${Date.now()}`;
        Clipboard.setString(text);
        await wait(100);
        assert((await Clipboard.getString()) === text, "string differs");
        assert(await Clipboard.hasString(), "hasString is false");
      }
    ],
    [
      "copies unicode text",
      async () => {
        Clipboard.setString("héllo ✓ 日本語");
        await wait(100);
        assert((await Clipboard.getString()) === "héllo ✓ 日本語", "unicode differs");
      }
    ],
    [
      "copies html with a plain text fallback",
      async () => {
        Clipboard.setHTML("<b>bold</b>", "bold");
        await wait(100);
        assert((await Clipboard.getString()) === "bold", "plain fallback differs");
      }
    ],
    [
      "reports whether an image is on the clipboard",
      async () => {
        assert(typeof (await Clipboard.hasImage()) === "boolean", "not a boolean");
      }
    ]
  ]
};

export default clipboard;
