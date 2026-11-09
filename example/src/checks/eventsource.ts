import EventSource from "@ammarahmed/react-native-eventsource";
import type { ModuleChecks } from "./types";

export type EventSourceConfig = { server: string };

let config: EventSourceConfig | undefined;

export function setEventSourceConfig(value: EventSourceConfig | undefined) {
  config = value;
}

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function server() {
  if (!config) throw new Error("no test server configured");
  return config.server;
}

async function until(label: string, ready: () => boolean, ms = 8000) {
  const end = Date.now() + ms;
  while (!ready()) {
    if (Date.now() > end) throw new Error(`timed out waiting for ${label}`);
    await wait(25);
  }
}

async function state() {
  const response = await fetch(`${server()}/state`);
  return response.json() as Promise<{
    seen: { path: string; authorization?: string; lastEventId?: string }[];
    open: number;
    sent: number;
  }>;
}

const eventsource: ModuleChecks = {
  name: "eventsource",
  checks: [
    [
      "streams events with the headers, multi-line data and named events",
      async () => {
        const messages: string[] = [];
        const custom: string[] = [];
        let opened = 0;
        const source = new EventSource(`${server()}/stream`, {
          headers: { Authorization: "Bearer secret" }
        });
        source.onopen = () => {
          opened += 1;
        };
        source.onmessage = (event: { data: string }) => messages.push(event.data);
        source.addEventListener("custom", (event: { data: string }) => custom.push(event.data));
        try {
          await until("four messages", () => messages.length >= 3 && custom.length >= 1);
          assert(opened === 1, `opened ${opened} times`);
          assert(source.readyState === source.OPEN, `readyState ${source.readyState}`);
          assert(messages[0] === "hello", `first ${messages[0]}`);
          assert(messages[1] === "line one\nline two", `second ${messages[1]}`);
          assert(custom[0] === "payload", `custom ${custom[0]}`);
          await until("json message", () => messages.length >= 3);
          assert(messages[2] === '{"a":"é"}', `third ${messages[2]}`);
        } finally {
          source.close();
        }
      }
    ],
    [
      "reports a rejected request with its status and body and closes",
      async () => {
        const errors: { status: number; body: string; message: string }[] = [];
        const source = new EventSource(`${server()}/stream`, { headers: { Authorization: "nope" } });
        source.onerror = (event: { status: number; body: string; message: string }) => errors.push(event);
        await until("an error", () => errors.length > 0);
        assert(errors[0].status === 401, `status ${errors[0].status}`);
        assert(errors[0].body === "denied", `body ${errors[0].body}`);
        assert(source.readyState === source.CLOSED, `readyState ${source.readyState}`);
        await wait(400);
        assert(errors.length === 1, `${errors.length} errors, expected no retry`);
        source.close();
      }
    ],
    [
      "reconnects after a drop with the retry delay and Last-Event-ID",
      async () => {
        const messages: string[] = [];
        let errors = 0;
        let opened = 0;
        const started = Date.now();
        const source = new EventSource(`${server()}/drop`, {});
        source.onopen = () => {
          opened += 1;
        };
        source.onerror = () => {
          errors += 1;
        };
        source.onmessage = (event: { data: string }) => messages.push(event.data);
        try {
          await until("the second message", () => messages.length >= 2);
          assert(messages[0] === "first", `first ${messages[0]}`);
          assert(messages[1] === "second 41", `second ${messages[1]}`);
          assert(errors >= 1 && opened === 2, `errors ${errors}, opened ${opened}`);
          assert(Date.now() - started >= 140, "reconnected before the retry delay");
          assert(source.readyState === source.OPEN, `readyState ${source.readyState}`);
        } finally {
          source.close();
        }
      }
    ],
    [
      "retries after a server error",
      async () => {
        const messages: string[] = [];
        const statuses: number[] = [];
        const source = new EventSource(`${server()}/flaky`, {});
        source.onerror = (event: { status: number }) => statuses.push(event.status);
        source.onmessage = (event: { data: string }) => messages.push(event.data);
        try {
          await until("the recovered message", () => messages.length >= 1, 12000);
          assert(statuses[0] === 503, `status ${statuses[0]}`);
          assert(messages[0] === "recovered", `message ${messages[0]}`);
        } finally {
          source.close();
        }
      }
    ],
    [
      "close stops delivery and releases the connection",
      async () => {
        const messages: string[] = [];
        const source = new EventSource(`${server()}/ticks`, {});
        source.onmessage = (event: { data: string }) => messages.push(event.data);
        await until("three ticks", () => messages.length >= 3);
        source.close();
        assert(source.readyState === source.CLOSED, `readyState ${source.readyState}`);
        const count = messages.length;
        const end = Date.now() + 5000;
        let closed = false;
        while (Date.now() < end) {
          if ((await state()).open === 0) {
            closed = true;
            break;
          }
          await wait(50);
        }
        assert(closed, "the connection stayed open after close");
        assert(messages.length === count, "messages arrived after close");
      }
    ]
  ]
};

export default eventsource;
