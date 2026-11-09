import http from 'node:http';
import type { AddressInfo } from 'node:net';

type Seen = { path: string; authorization?: string; lastEventId?: string };

export async function startSseServer() {
  const seen: Seen[] = [];
  let dropped = 0;
  let flaky = 0;
  let open = 0;
  let quiet = 0;
  let sent = 0;
  const sockets = new Set<import('node:net').Socket>();

  const server = http.createServer((request, response) => {
    const url = new URL(request.url ?? '/', 'http://localhost');
    const authorization = request.headers.authorization;
    const lastEventId = request.headers['last-event-id'] as string | undefined;
    if (url.pathname !== '/state') {
      seen.push({ path: url.pathname, authorization, lastEventId });
    }
    const stream = (status = 200) => {
      response.writeHead(status, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      });
      response.flushHeaders();
    };

    switch (url.pathname) {
      case '/state':
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ seen, open, quiet, sent }));
        return;
      case '/stream': {
        if (authorization !== 'Bearer secret') {
          response.writeHead(401, { 'Content-Type': 'text/plain' });
          response.end('denied');
          return;
        }
        stream();
        response.write(': welcome\n\n');
        response.write('data: hello\n\n');
        response.write('data: line one\ndata: line two\n\n');
        response.write('event: custom\ndata: payload\n\n');
        response.write('data: {"a":"é"}\n\n');
        return;
      }
      case '/drop': {
        dropped += 1;
        stream();
        if (dropped === 1) {
          response.write('retry: 100\nid: 41\ndata: first\n\n');
          setTimeout(() => request.socket.destroy(), 50);
        } else {
          response.write(`id: 42\ndata: second ${lastEventId ?? 'none'}\n\n`);
        }
        return;
      }
      case '/flaky': {
        flaky += 1;
        if (flaky === 1) {
          response.writeHead(503, { 'Content-Type': 'text/plain' });
          response.end('busy');
          return;
        }
        stream();
        response.write('data: recovered\n\n');
        return;
      }
      case '/quiet': {
        stream();
        response.write(': quiet\n\n');
        quiet += 1;
        response.on('close', () => {
          quiet -= 1;
        });
        return;
      }
      case '/ticks': {
        stream();
        open += 1;
        const timer = setInterval(() => {
          sent += 1;
          response.write(`data: tick ${sent}\n\n`);
        }, 50);
        response.on('close', () => {
          clearInterval(timer);
          open -= 1;
        });
        return;
      }
      default:
        response.writeHead(404);
        response.end();
    }
  });
  server.on('connection', socket => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
  });

  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  return {
    url: `http://127.0.0.1:${port}`,
    close: () =>
      new Promise<void>(resolve => {
        for (const socket of sockets) socket.destroy();
        server.close(() => resolve());
      }),
  };
}
