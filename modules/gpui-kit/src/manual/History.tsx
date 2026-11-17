import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ComponentRef,
} from 'react';
import { type NativeSyntheticEvent } from 'react-native';
import HistoryNative, { Commands } from './GpuiKitHistoryNativeComponent';

export interface HistoryHandle {
  /** Adds an entry after the current one and drops the entries ahead of it. */
  push(entry: string): void;
  replaceCurrent(entry: string): void;
  /** Steps back; `onChange` reports the entry it lands on. */
  back(): void;
  forward(): void;
  clear(): void;
}

export interface HistoryChange {
  current: string | null;
  canBack: boolean;
  canForward: boolean;
  length: number;
  /** What caused the change: `push`, `replace`, `back`, `forward` or `clear`. */
  moved: string;
}

export interface HistoryProps {
  /** The most entries kept; the oldest are dropped. */
  maxEntries?: number;
  onChange?: (change: HistoryChange) => void;
}

/**
 * The kit's undo history as an imperative API. It draws nothing; entries are
 * strings, so serialise richer values yourself.
 */
export const History = forwardRef<HistoryHandle, HistoryProps>(function History(
  { maxEntries, onChange },
  ref,
) {
  const native = useRef<ComponentRef<typeof HistoryNative>>(null);
  useImperativeHandle(ref, () => ({
    push: entry => native.current && Commands.push(native.current, entry),
    replaceCurrent: entry =>
      native.current && Commands.replaceCurrent(native.current, entry),
    back: () => native.current && Commands.back(native.current),
    forward: () => native.current && Commands.forward(native.current),
    clear: () => native.current && Commands.clear(native.current),
  }));
  return (
    <HistoryNative
      ref={native}
      style={{ width: 0, height: 0 }}
      maxEntries={maxEntries}
      onGpuiKitHistoryChange={(
        event: NativeSyntheticEvent<{
          current: string;
          canBack: boolean;
          canForward: boolean;
          length: number;
          moved: string;
        }>,
      ) =>
        onChange?.({
          ...event.nativeEvent,
          current:
            event.nativeEvent.length > 0 ? event.nativeEvent.current : null,
        })
      }
    />
  );
});
