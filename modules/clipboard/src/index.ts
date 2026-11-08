import NativeClipboard from './NativeClipboardModule';

/** What `setRich` puts on the clipboard, as one item. */
export interface RichClipboardContent {
  'text/plain': string;
  'text/html'?: string;
  'text/markdown'?: string;
}

/**
 * Desktop extension: writes plain text together with HTML and Markdown in one
 * clipboard item, so an app pastes the richest form it understands. Markdown is
 * kept on macOS only.
 */
export function setRich(content: RichClipboardContent): void {
  NativeClipboard.setRich(
    content['text/plain'],
    content['text/html'] ?? null,
    content['text/markdown'] ?? null,
  );
}
