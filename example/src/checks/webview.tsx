import { createRef } from 'react';
import { WebView } from 'react-native-webview';
import type { ModuleChecks } from './types';

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const html = `<!doctype html><html><body style="background:#cde">
<p>webview example</p>
<script>
  window.ReactNativeWebView.postMessage("hello from page");
  window.addEventListener("message", function (event) {
    window.ReactNativeWebView.postMessage("echo:" + event.data);
  });
</script></body></html>`;

const ref = createRef<WebView>();
const inbox: string[] = [];
let waiting: ((data: string) => void) | undefined;

const next = (timeout = 5000) =>
  new Promise<string>((resolve, reject) => {
    const queued = inbox.shift();
    if (queued !== undefined) return resolve(queued);
    const timer = setTimeout(() => {
      waiting = undefined;
      reject(new Error('no message from the page'));
    }, timeout);
    waiting = data => {
      clearTimeout(timer);
      resolve(data);
    };
  });

const view = (
  <WebView
    ref={ref}
    source={{ html }}
    style={{ height: 160 }}
    injectedJavaScript={
      'window.ReactNativeWebView.postMessage("injected"); true;'
    }
    onMessage={event => {
      const data = event.nativeEvent.data;
      if (waiting) {
        const resolve = waiting;
        waiting = undefined;
        resolve(data);
      } else {
        inbox.push(data);
      }
    }}
  />
);

const webview: ModuleChecks = {
  name: 'webview',
  view,
  checks: [
    [
      'receives a message posted by the page',
      async () => {
        assert((await next()) === 'hello from page', 'wrong message');
      },
    ],
    [
      'runs injectedJavaScript after the page loads',
      async () => {
        assert((await next()) === 'injected', 'wrong message');
      },
    ],
    [
      'runs injectJavaScript on demand',
      async () => {
        ref.current?.injectJavaScript(
          'window.ReactNativeWebView.postMessage(String(40 + 2)); true;',
        );
        assert((await next()) === '42', 'wrong result');
      },
    ],
    [
      'delivers postMessage to the page',
      async () => {
        ref.current?.postMessage('ping');
        assert((await next()) === 'echo:ping', 'wrong echo');
      },
    ],
  ],
};

export default webview;
