import "@react-native-gpui/crypto";
import type { ModuleChecks } from "./types";

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const hex = (data: ArrayBuffer | Uint8Array) =>
  Array.from(data instanceof Uint8Array ? data : new Uint8Array(data), (b) =>
    b.toString(16).padStart(2, "0")
  ).join("");

const bytes = (text: string) =>
  new Uint8Array(text.match(/../g)?.map((pair) => parseInt(pair, 16)) ?? []);

const ascii = (text: string) => new TextEncoder().encode(text);

const rejects = async (run: () => Promise<unknown>, name: string) => {
  try {
    await run();
  } catch (error) {
    return (error as Error).name === name;
  }
  return false;
};

const subtle = () => globalThis.crypto.subtle;

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
    ],
    [
      "digests match the FIPS 180 vectors for abc",
      async () => {
        const vectors: Record<string, string> = {
          "SHA-1": "a9993e364706816aba3e25717850c26c9cd0d89d",
          "SHA-256":
            "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
          "SHA-384":
            "cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7",
          "SHA-512":
            "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f"
        };
        for (const [name, expected] of Object.entries(vectors)) {
          const got = hex(await subtle().digest(name, ascii("abc")));
          assert(got === expected, `${name} gave ${got}`);
        }
      }
    ],
    [
      "AES-GCM matches NIST test case 4 and rejects a changed tag",
      async () => {
        const key = await subtle().importKey(
          "raw",
          bytes("feffe9928665731c6d6a8f9467308308"),
          { name: "AES-GCM" },
          false,
          ["encrypt", "decrypt"]
        );
        const params = {
          name: "AES-GCM",
          iv: bytes("cafebabefacedbaddecaf888"),
          additionalData: bytes("feedfacedeadbeeffeedfacedeadbeefabaddad2")
        };
        const plain = bytes(
          "d9313225f88406e5a55909c5aff5269a86a7a9531534f7da2e4c303d8a318a721c3c0c95956809532fcf0e2449a6b525b16aedf5aa0de657ba637b39"
        );
        const expected =
          "42831ec2217774244b7221b784d0d49ce3aa212f2c02a4e035c17e2329aca12e21d514b25466931c7d8f6a5aac84aa051ba30b396a0aac973d58e091" +
          "5bc94fbc3221a5db94fae95ae7121a47";
        const sealed = await subtle().encrypt(params, key, plain);
        assert(hex(sealed) === expected, `sealed ${hex(sealed)}`);
        const opened = await subtle().decrypt(params, key, sealed);
        assert(hex(opened) === hex(plain), "did not decrypt back");
        const broken = new Uint8Array(sealed.slice(0));
        broken[broken.length - 1] ^= 1;
        assert(
          await rejects(() => subtle().decrypt(params, key, broken), "OperationError"),
          "accepted a changed tag"
        );
      }
    ],
    [
      "AES-KW matches the RFC 3394 vectors, wraps and unwraps keys",
      async () => {
        const kek128 = await subtle().importKey(
          "raw",
          bytes("000102030405060708090a0b0c0d0e0f"),
          "AES-KW",
          false,
          ["wrapKey", "unwrapKey"]
        );
        const data128 = await subtle().importKey(
          "raw",
          bytes("00112233445566778899aabbccddeeff"),
          { name: "AES-GCM" },
          true,
          ["encrypt"]
        );
        const wrapped = await subtle().wrapKey("raw", data128, kek128, "AES-KW");
        assert(
          hex(wrapped) === "1fa68b0a8112b447aef34bd8fb5a7b829d3e862371d2cfe5",
          `wrapped ${hex(wrapped)}`
        );
        const back = await subtle().unwrapKey(
          "raw",
          wrapped,
          kek128,
          "AES-KW",
          { name: "AES-GCM", length: 128 },
          true,
          ["encrypt", "decrypt"]
        );
        assert(
          hex(await subtle().exportKey("raw", back)) ===
            "00112233445566778899aabbccddeeff",
          "unwrapped another key"
        );
        const kek256 = await subtle().importKey(
          "raw",
          bytes("000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f"),
          "AES-KW",
          false,
          ["wrapKey"]
        );
        const data256 = await subtle().importKey(
          "raw",
          bytes("00112233445566778899aabbccddeeff000102030405060708090a0b0c0d0e0f"),
          { name: "AES-GCM" },
          true,
          ["encrypt"]
        );
        const wrapped256 = await subtle().wrapKey("raw", data256, kek256, "AES-KW");
        assert(
          hex(wrapped256) ===
            "28c9f404c4b810f4cbccb35cfb87f8263f5786e2d80ed326cbc7f0e71a99f43bfb988b9b7a02dd21",
          `wrapped256 ${hex(wrapped256)}`
        );
        const wrong = await subtle().generateKey({ name: "AES-KW", length: 256 }, false, [
          "unwrapKey"
        ]);
        assert(
          await rejects(
            () =>
              subtle().unwrapKey(
                "raw",
                wrapped,
                wrong,
                "AES-KW",
                { name: "AES-GCM", length: 128 },
                true,
                ["encrypt"]
              ),
            "OperationError"
          ),
          "unwrapped with the wrong key"
        );
      }
    ],
    [
      "PBKDF2 matches the RFC 6070 vectors",
      async () => {
        const base = await subtle().importKey("raw", ascii("password"), "PBKDF2", false, [
          "deriveBits",
          "deriveKey"
        ]);
        const bits = async (iterations: number, hash: string, length: number) =>
          hex(
            await subtle().deriveBits(
              { name: "PBKDF2", salt: ascii("salt"), iterations, hash },
              base,
              length
            )
          );
        assert(
          (await bits(1, "SHA-1", 160)) === "0c60c80f961f0e71f3a9b524af6012062fe037a6",
          "iteration 1"
        );
        assert(
          (await bits(2, "SHA-1", 160)) === "ea6c014dc72d6f8ccd1ed92ace1d41f0d8de8957",
          "iteration 2"
        );
        assert(
          (await bits(4096, "SHA-1", 160)) === "4b007901b765489abead49d926f721d065a429c1",
          "iteration 4096"
        );
        const key = await subtle().deriveKey(
          { name: "PBKDF2", salt: ascii("salt"), iterations: 1, hash: "SHA-256" },
          base,
          { name: "AES-KW", length: 256 },
          true,
          ["wrapKey", "unwrapKey"]
        );
        assert(
          hex(await subtle().exportKey("raw", key)) ===
            "120fb6cffcf8b32c43e7225256c4f837a86548c92ccc35480805987cb70be17b",
          "derived key"
        );
      }
    ],
    [
      "HKDF matches RFC 5869 test case 1",
      async () => {
        const base = await subtle().importKey(
          "raw",
          bytes("0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b"),
          "HKDF",
          false,
          ["deriveBits"]
        );
        const okm = await subtle().deriveBits(
          {
            name: "HKDF",
            hash: "SHA-256",
            salt: bytes("000102030405060708090a0b0c"),
            info: bytes("f0f1f2f3f4f5f6f7f8f9")
          },
          base,
          336
        );
        assert(
          hex(okm) ===
            "3cb25f25faacd57a90434f64d0362f2a2d2d0a90cf1a5a4c5db02d56ecc4c5bf34007208d5b887185865",
          `okm ${hex(okm)}`
        );
      }
    ],
    [
      "keys are opaque and honour extractable and usages",
      async () => {
        const key = await subtle().generateKey({ name: "AES-GCM", length: 256 }, false, [
          "encrypt"
        ]);
        assert(key.type === "secret" && key.extractable === false, "key attributes");
        assert(
          await rejects(() => subtle().exportKey("raw", key), "InvalidAccessError"),
          "exported a non-extractable key"
        );
        assert(
          await rejects(
            () =>
              subtle().decrypt({ name: "AES-GCM", iv: new Uint8Array(12) }, key, new Uint8Array(32)),
            "InvalidAccessError"
          ),
          "decrypted without the usage"
        );
        const extractable = await subtle().generateKey({ name: "AES-GCM", length: 128 }, true, [
          "encrypt"
        ]);
        assert((await subtle().exportKey("raw", extractable)).byteLength === 16, "128 bit key");
        assert(Object.keys(key).every((name) => name !== "bytes"), "key bytes are visible");
      }
    ]
  ]
};

export default crypto;
