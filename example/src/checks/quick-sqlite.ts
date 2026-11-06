import { open } from "react-native-quick-sqlite";
import type { ModuleChecks } from "./types";

const suffix = Date.now().toString(36);

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const quickSQLite: ModuleChecks = {
  name: "quick-sqlite",
  checks: [
    [
      "creates a table, inserts and selects with parameters",
      async () => {
        const db = open({ name: `plain-${suffix}.db` });
        await db.executeAsync("CREATE TABLE t (id INTEGER PRIMARY KEY, v TEXT)");
        const insert = await db.executeAsync("INSERT INTO t (v) VALUES (?)", [
          "hello"
        ]);
        assert(insert.rowsAffected === 1, "rowsAffected is not 1");
        const select = await db.executeAsync("SELECT v FROM t WHERE id = ?", [
          insert.insertId
        ]);
        assert(select.rows?._array[0]?.v === "hello", "row not found");
        db.close();
        db.delete();
      }
    ],
    [
      "rolls a transaction back",
      async () => {
        const db = open({ name: `tx-${suffix}.db` });
        await db.executeAsync("CREATE TABLE t (v TEXT)");
        await db.executeAsync("BEGIN TRANSACTION");
        await db.executeAsync("INSERT INTO t VALUES ('x')");
        await db.executeAsync("ROLLBACK");
        const select = await db.executeAsync("SELECT COUNT(*) AS c FROM t");
        assert(select.rows?._array[0]?.c === 0, "rollback kept the row");
        db.close();
        db.delete();
      }
    ],
    [
      "uses WAL journaling",
      async () => {
        const db = open({ name: `wal-${suffix}.db` });
        const result = await db.executeAsync("PRAGMA journal_mode = WAL");
        const mode = Object.values(result.rows?._array[0] ?? {})[0];
        assert(mode === "wal", `journal_mode is ${String(mode)}`);
        db.close();
        db.delete();
      }
    ],
    [
      "encrypts with PRAGMA key and rejects a wrong key",
      async () => {
        const name = `enc-${suffix}.db`;
        const db = open({ name });
        await db.executeAsync("PRAGMA key = 'secret'");
        await db.executeAsync("CREATE TABLE t (v TEXT)");
        await db.executeAsync("INSERT INTO t VALUES ('private')");
        db.close();

        const wrong = open({ name });
        await wrong.executeAsync("PRAGMA key = 'wrong'");
        let rejected = false;
        try {
          await wrong.executeAsync("SELECT * FROM t");
        } catch {
          rejected = true;
        }
        assert(rejected, "a wrong key opened the database");
        wrong.close();

        const right = open({ name });
        await right.executeAsync("PRAGMA key = 'secret'");
        const select = await right.executeAsync("SELECT v FROM t");
        assert(select.rows?._array[0]?.v === "private", "right key failed");
        right.close();
        right.delete();
      }
    ],
    [
      "searches with the better_trigram tokenizer",
      async () => {
        const db = open({ name: `trigram-${suffix}.db` });
        await db.executeAsync(
          "CREATE VIRTUAL TABLE docs USING fts5(content, tokenize = 'better_trigram')"
        );
        await db.executeAsync("INSERT INTO docs VALUES ('encrypted notes app')");
        const result = await db.executeAsync(
          "SELECT content FROM docs WHERE docs MATCH 'crypt'"
        );
        assert(result.rows?._array.length === 1, "trigram match failed");
        db.close();
        db.delete();
      }
    ],
    [
      "searches with the html tokenizer",
      async () => {
        const db = open({ name: `html-${suffix}.db` });
        await db.executeAsync(
          "CREATE VIRTUAL TABLE docs USING fts5(content, tokenize = 'html')"
        );
        await db.executeAsync(
          "INSERT INTO docs VALUES ('<p>hello <b>world</b></p>')"
        );
        const result = await db.executeAsync(
          "SELECT content FROM docs WHERE docs MATCH 'world'"
        );
        assert(result.rows?._array.length === 1, "html match failed");
        db.close();
        db.delete();
      }
    ],
    [
      "registers the natural_key function",
      async () => {
        const db = open({ name: `key-${suffix}.db` });
        const result = await db.executeAsync("SELECT natural_key('Note 10') AS k");
        assert(typeof result.rows?._array[0]?.k === "string", "no natural_key");
        db.close();
        db.delete();
      }
    ]
  ]
};

export default quickSQLite;
