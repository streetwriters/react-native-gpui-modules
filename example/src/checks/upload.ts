import Upload, {
  addMultipartListener,
  acknowledgeMultipartS3,
  getAllUploads,
  getFileInfo,
  getMultipartS3Uploads,
  setMultipartCompletionHandler,
  startMultipartS3,
  type UploadChangeEvent,
} from '@ammarahmed/react-native-upload';
import type { ModuleChecks } from './types';

export type UploadConfig = {
  server: string;
  small: { path: string; size: number; sha256: string };
  large: { path: string; size: number; sha256: string };
};

let config: UploadConfig | undefined;

export function setUploadConfig(value: UploadConfig | undefined) {
  config = value;
}

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function settings(): UploadConfig {
  if (!config) throw new Error('no test server configured');
  return config;
}

async function json(path: string) {
  const response = await fetch(`${settings().server}${path}`);
  return response.json();
}

const run = `${Date.now()}`;

const upload: ModuleChecks = {
  name: 'upload',
  checks: [
    [
      'reports file info',
      async () => {
        const { small } = settings();
        const info = await getFileInfo(small.path);
        assert(info.exists && info.size === small.size, `size ${info.size}`);
        assert(info.extension === 'bin', `extension ${info.extension}`);
        const missing = await getFileInfo(`${small.path}.missing`);
        assert(missing.exists === false, 'missing file exists');
      },
    ],
    [
      'uploads a file as a raw PUT with headers and progress',
      async () => {
        const { server, large } = settings();
        const events: UploadChangeEvent[] = [];
        const result = await Upload.create({
          url: `${server}/raw/${run}`,
          path: `file://${large.path}`,
          method: 'PUT',
          headers: { 'x-test': 'one', 'content-type': 'application/x-test' },
        })
          .onChange(event => events.push(event))
          .start();
        assert(
          result.status === 'completed',
          `status ${result.status} ${result.error}`,
        );
        assert(result.responseCode === 200, `code ${result.responseCode}`);
        const body = JSON.parse(result.responseBody ?? '{}');
        assert(body.method === 'PUT', `method ${body.method}`);
        assert(body.size === large.size, `size ${body.size}`);
        assert(body.sha256 === large.sha256, 'file content differs');
        assert(body.headers['x-test'] === 'one', 'custom header missing');
        assert(
          body.headers['content-type'] === 'application/x-test',
          'content type differs',
        );
        const progress = events.filter(e => e.progress !== undefined);
        assert(progress.length > 0, 'no progress events');
        const last = progress[progress.length - 1];
        assert(
          last.progress === 100 && last.uploadedBytes === large.size,
          'progress did not reach 100',
        );
        assert(
          events[events.length - 1].status === 'completed',
          'last change is not completed',
        );
      },
    ],
    [
      'defaults to a raw POST of octet-stream',
      async () => {
        const { server, small } = settings();
        const result = await Upload.create({
          url: `${server}/raw/${run}-post`,
          path: small.path,
        }).start();
        const body = JSON.parse(result.responseBody ?? '{}');
        assert(body.method === 'POST', `method ${body.method}`);
        assert(
          body.headers['content-type'] === 'application/octet-stream',
          'content type differs',
        );
        assert(body.sha256 === small.sha256, 'file content differs');
      },
    ],
    [
      'uploads as multipart form data with parameters',
      async () => {
        const { server, small } = settings();
        const result = await Upload.create({
          url: `${server}/form`,
          path: small.path,
          type: 'multipart',
          field: 'attachment',
          parameters: { hash: 'abc', note: 'héllo' },
        }).start();
        assert(
          result.status === 'completed',
          `status ${result.status} ${result.error}`,
        );
        const body = JSON.parse(result.responseBody ?? '{}');
        assert(
          body.contentType.startsWith('multipart/form-data; boundary='),
          body.contentType,
        );
        assert(
          body.fields.hash === 'abc' && body.fields.note === 'héllo',
          JSON.stringify(body.fields),
        );
        assert(
          body.file.field === 'attachment' &&
            body.file.filename === 'small.bin',
          JSON.stringify(body.file),
        );
        assert(body.file.sha256 === small.sha256, 'file content differs');
      },
    ],
    [
      'reports a server error with its response',
      async () => {
        const { server, small } = settings();
        const result = await Upload.create({
          url: `${server}/status/403`,
          path: small.path,
        }).start();
        assert(result.status === 'error', `status ${result.status}`);
        assert(result.responseCode === 403, `code ${result.responseCode}`);
        assert(
          result.responseBody === 'forbidden',
          `body ${result.responseBody}`,
        );
      },
    ],
    [
      'reports a missing file',
      async () => {
        const { server, small } = settings();
        const result = await Upload.create({
          url: `${server}/raw/x`,
          path: `${small.path}.missing`,
          customUploadId: `${run}-missing`,
        }).start();
        assert(result.status === 'error', `status ${result.status}`);
      },
    ],
    [
      'cancels a running upload',
      async () => {
        const { server, large } = settings();
        const id = `${run}-cancel`;
        const instance = Upload.create({
          url: `${server}/slow`,
          path: large.path,
          customUploadId: id,
        });
        const done = instance.start();
        await wait(300);
        assert(
          (await getAllUploads()).some(u => u.id === id),
          'upload is not listed while running',
        );
        await instance.cancel();
        const result = await done;
        assert(result.status === 'cancelled', `status ${result.status}`);
        assert(
          !(await getAllUploads()).some(u => u.id === id),
          'upload still listed',
        );
      },
    ],
    [
      'uploads the parts of a multipart upload to S3 style URLs',
      async () => {
        const { server, large } = settings();
        const uploadId = `${run}-s3`;
        const progress: number[] = [];
        const completed: string[] = [];
        setMultipartCompletionHandler(async event => {
          completed.push(`${event.uploadId}:${event.status}`);
        });
        const subscription = addMultipartListener('progress', uploadId, data =>
          progress.push(data.chunkIndex),
        );
        const result = await startMultipartS3({
          uploadId,
          path: large.path,
          parts: [`${server}/s3/${uploadId}/1`, `${server}/s3/${uploadId}/2`],
          maxParallel: 2,
        });
        subscription.remove();
        assert(
          result.success && result.etags.length === 2,
          JSON.stringify(result),
        );
        assert(
          result.etags.every(etag => /^[0-9a-f]{32}$/.test(etag)),
          `etags ${result.etags}`,
        );
        assert(progress.length === 2, `progress events ${progress.length}`);
        const summary = await json(`/summary/${uploadId}`);
        assert(
          summary.sha256 === large.sha256,
          'the parts do not add up to the file',
        );
        assert(
          summary.parts['1'].etag === result.etags[0],
          'etag of part 1 differs',
        );
        await wait(100);
        setMultipartCompletionHandler(null);
        assert(
          completed.includes(`${uploadId}:completed`),
          `completion handler: ${completed}`,
        );
        assert(
          !(await getMultipartS3Uploads()).some(u => u.uploadId === uploadId),
          'not acknowledged',
        );
      },
    ],
    [
      'skips parts that already have an ETag',
      async () => {
        const { server, large } = settings();
        const uploadId = `${run}-resume`;
        const result = await startMultipartS3({
          uploadId,
          path: large.path,
          parts: [`${server}/s3/${uploadId}/1`, `${server}/s3/${uploadId}/2`],
          existingEtags: ['previous', ''],
        });
        assert(result.etags[0] === 'previous', `etags ${result.etags}`);
        const summary = await json(`/summary/${uploadId}`);
        assert(
          Object.keys(summary.parts).join() === '2',
          `parts seen ${Object.keys(summary.parts)}`,
        );
      },
    ],
    [
      'pauses and resumes a multipart upload',
      async () => {
        const { server, large } = settings();
        const uploadId = `${run}-pause`;
        const done = startMultipartS3({
          uploadId,
          path: large.path,
          parts: [
            `${server}/s3slow/${uploadId}/1`,
            `${server}/s3/${uploadId}/2`,
          ],
          maxParallel: 1,
        });
        await wait(200);
        assert(await Upload.pauseMultipartS3(uploadId), 'pause returned false');
        await wait(1800);
        const seen = await json(`/summary/${uploadId}`);
        assert(
          Object.keys(seen.parts).join() === '1',
          `parts while paused ${Object.keys(seen.parts)}`,
        );
        assert(
          await Upload.resumeMultipartS3(uploadId),
          'resume returned false',
        );
        const result = await done;
        assert(result.success, 'not finished after resume');
        await acknowledgeMultipartS3(uploadId);
      },
    ],
    [
      'retries a failing part and gives up on a rejected one',
      async () => {
        const { server, large } = settings();
        const retry = await startMultipartS3({
          uploadId: `${run}-retry`,
          path: large.path,
          parts: [`${server}/flaky/${run}/1`, `${server}/s3/${run}-retry/2`],
        });
        assert(retry.success, 'retry failed');
        await acknowledgeMultipartS3(`${run}-retry`);

        let code = '';
        let message = '';
        const failures: string[] = [];
        const subscription = addMultipartListener(
          'error',
          `${run}-denied`,
          data => failures.push(data.error),
        );
        try {
          await startMultipartS3({
            uploadId: `${run}-denied`,
            path: large.path,
            parts: [`${server}/status/403`, `${server}/s3/${run}-denied/2`],
          });
        } catch (error) {
          code = (error as { code?: string }).code ?? '';
          message = (error as Error).message;
        }
        subscription.remove();
        assert(code === 'MULTIPART_UPLOAD_ERROR', `code ${code}`);
        assert(message.includes('403'), `message ${message}`);
        assert(failures.length === 1, `error events ${failures.length}`);
        const pending = await getMultipartS3Uploads();
        const failed = pending.find(u => u.uploadId === `${run}-denied`);
        assert(failed?.status === 'failed', `status ${failed?.status}`);
        assert(
          await acknowledgeMultipartS3(`${run}-denied`),
          'acknowledge returned false',
        );
      },
    ],
    [
      'cancels a multipart upload',
      async () => {
        const { server, large } = settings();
        const uploadId = `${run}-mpcancel`;
        const events: string[] = [];
        const subscription = addMultipartListener('cancelled', uploadId, () =>
          events.push('cancelled'),
        );
        const done = startMultipartS3({
          uploadId,
          path: large.path,
          parts: [`${server}/slow`, `${server}/slow`],
        });
        await wait(300);
        assert(
          await Upload.cancelMultipartS3(uploadId),
          'cancel returned false',
        );
        let code = '';
        try {
          await done;
        } catch (error) {
          code = (error as { code?: string }).code ?? '';
        }
        subscription.remove();
        assert(code === 'CANCELLED', `code ${code}`);
        assert(events.length === 1, `cancelled events ${events.length}`);
        assert(
          !(await getMultipartS3Uploads()).some(u => u.uploadId === uploadId),
          'record kept',
        );
      },
    ],
    [
      'rejects a multipart upload with too few bytes for its parts',
      async () => {
        const { server, small } = settings();
        let code = '';
        try {
          await startMultipartS3({
            uploadId: `${run}-small`,
            path: small.path,
            parts: [`${server}/s3/a/1`, `${server}/s3/a/2`],
          });
        } catch (error) {
          code = (error as { code?: string }).code ?? '';
        }
        assert(code === 'INVALID_ARGUMENT', `code ${code}`);
      },
    ],
  ],
};

export default upload;
