import crypto from 'node:crypto';
import http from 'node:http';
import type { AddressInfo } from 'node:net';

type Part = { size: number; sha256: string; etag: string; digest: Buffer };

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function readBody(request: http.IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    request.on('data', chunk => chunks.push(chunk));
    request.on('end', () => resolve(Buffer.concat(chunks)));
    request.on('error', reject);
    request.on('aborted', () => reject(new Error('aborted')));
  });
}

function parseForm(body: Buffer, contentType: string) {
  const boundary = `--${contentType.split('boundary=')[1]}`;
  const fields: Record<string, string> = {};
  let file: Record<string, unknown> | undefined;
  let offset = body.indexOf(boundary);
  while (offset !== -1) {
    const start = offset + boundary.length;
    if (body.subarray(start, start + 2).toString() === '--') break;
    const next = body.indexOf(boundary, start);
    if (next === -1) break;
    const section = body.subarray(start + 2, next - 2);
    const split = section.indexOf('\r\n\r\n');
    const head = section.subarray(0, split).toString();
    const content = section.subarray(split + 4);
    const name = /name="([^"]*)"/.exec(head)?.[1] ?? '';
    const filename = /filename="([^"]*)"/.exec(head)?.[1];
    if (filename !== undefined) {
      file = {
        field: name,
        filename,
        sha256: crypto.createHash('sha256').update(content).digest('hex'),
      };
    } else {
      fields[name] = content.toString();
    }
    offset = next;
  }
  return { fields, file };
}

export async function startUploadServer() {
  const uploads = new Map<string, Map<number, Part>>();
  const flaky = new Set<string>();

  const server = http.createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', 'http://localhost');
    const segments = url.pathname.split('/').filter(Boolean);
    try {
      if (segments[0] === 'raw') {
        const hash = crypto.createHash('sha256');
        let size = 0;
        for await (const chunk of request) {
          hash.update(chunk);
          size += chunk.length;
        }
        response.setHeader('content-type', 'application/json');
        response.end(
          JSON.stringify({
            method: request.method,
            size,
            sha256: hash.digest('hex'),
            headers: request.headers,
          }),
        );
      } else if (segments[0] === 'form') {
        const body = await readBody(request);
        response.setHeader('content-type', 'application/json');
        response.end(
          JSON.stringify({
            contentType: request.headers['content-type'],
            ...parseForm(body, request.headers['content-type'] ?? ''),
          }),
        );
      } else if (segments[0] === 'status') {
        await readBody(request);
        response.statusCode = Number(segments[1]);
        response.end('forbidden');
      } else if (segments[0] === 'slow') {
        request.resume();
        await delay(20000);
        response.end('late');
      } else if (segments[0] === 's3' || segments[0] === 's3slow') {
        const body = await readBody(request);
        if (segments[0] === 's3slow') await delay(1000);
        const digest = crypto.createHash('md5').update(body).digest();
        const parts = uploads.get(segments[1]) ?? new Map<number, Part>();
        uploads.set(segments[1], parts);
        parts.set(Number(segments[2]), {
          size: body.length,
          sha256: crypto.createHash('sha256').update(body).digest('hex'),
          etag: digest.toString('hex'),
          digest: body,
        });
        response.setHeader('etag', `"${digest.toString('hex')}"`);
        response.end();
      } else if (segments[0] === 'flaky') {
        const body = await readBody(request);
        const key = segments[1] + segments[2];
        if (!flaky.has(key)) {
          flaky.add(key);
          response.statusCode = 503;
          response.end('try again');
        } else {
          response.setHeader(
            'etag',
            `"${crypto.createHash('md5').update(body).digest('hex')}"`,
          );
          response.end();
        }
      } else if (segments[0] === 'summary') {
        const parts = uploads.get(segments[1]) ?? new Map<number, Part>();
        const ordered = [...parts.entries()].sort((a, b) => a[0] - b[0]);
        const whole = crypto.createHash('sha256');
        for (const [, part] of ordered) whole.update(part.digest);
        response.setHeader('content-type', 'application/json');
        response.end(
          JSON.stringify({
            sha256: whole.digest('hex'),
            parts: Object.fromEntries(
              ordered.map(([n, p]) => [n, { size: p.size, etag: p.etag }]),
            ),
          }),
        );
      } else {
        response.statusCode = 404;
        response.end();
      }
    } catch {
      response.destroy();
    }
  });

  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = (server.address() as AddressInfo).port;
  return {
    url: `http://127.0.0.1:${port}`,
    close: () =>
      new Promise<void>(resolve => {
        server.closeAllConnections();
        server.close(() => resolve());
      }),
  };
}
