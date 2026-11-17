import React, {
  useImperativeHandle,
  useRef,
  forwardRef,
  type ReactNode,
} from 'react';
import type { NativeSyntheticEvent, StyleProp, ViewStyle } from 'react-native';
import MessageNative from './GpuiKitMessageNativeComponent';
import BubbleNative from './GpuiKitBubbleNativeComponent';
import AttachmentNative from './GpuiKitAttachmentNativeComponent';
import ScrollerNative, {
  Commands,
} from './GpuiKitMessageScrollerNativeComponent';
import { SlotHost } from './SlotHost';

interface Base {
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const text = (node: ReactNode) => (typeof node === 'string' ? node : undefined);

export interface MessageProps extends Base {
  /** The message is the user's own, aligned to the end. */
  end?: boolean;
  /** React Native content for the avatar. */
  avatar?: ReactNode;
  /** A string, or React Native content. */
  header?: ReactNode;
  /** A string, or React Native content. */
  footer?: ReactNode;
  /** The body: a `Bubble` or any React Native content. */
  children?: ReactNode;
}

export function Message({
  end,
  avatar,
  header,
  footer,
  children,
  style,
  testID,
}: MessageProps) {
  return (
    <SlotHost
      style={[{ width: 360 }, style]}
      testID={testID}
      native={MessageNative as never}
      nativeProps={{ end, header: text(header), footer: text(footer) }}
      slots={[
        { name: 'avatar', content: avatar },
        { name: 'header', content: text(header) === undefined ? header : null },
        { name: 'body', content: children },
        { name: 'footer', content: text(footer) === undefined ? footer : null },
      ]}
    />
  );
}

export interface BubbleProps extends Base {
  end?: boolean;
  variant?:
    | 'filled'
    | 'secondary'
    | 'muted'
    | 'tinted'
    | 'outline'
    | 'ghost'
    | 'destructive';
  /** A string, or React Native content. */
  children?: ReactNode;
}

export function Bubble({ end, variant, children, style, testID }: BubbleProps) {
  return (
    <SlotHost
      style={[{ width: 280 }, style]}
      testID={testID}
      native={BubbleNative as never}
      nativeProps={{ end, variant, text: text(children) }}
      slots={[
        {
          name: 'body',
          content: text(children) === undefined ? children : null,
        },
      ]}
    />
  );
}

export interface AttachmentProps extends Base {
  title: string;
  description?: string;
  tooltip?: string;
  /** Upload progress, 0 to 100. */
  progress?: number;
  status?: 'pending' | 'uploading' | 'processing' | 'failed' | 'complete';
  /** React Native content for the actions. */
  actions?: ReactNode;
  onPress?: () => void;
  onRemove?: () => void;
  onRetry?: () => void;
}

export function Attachment({
  onPress,
  onRemove,
  onRetry,
  actions,
  style,
  testID,
  progress,
  ...rest
}: AttachmentProps) {
  return (
    <SlotHost
      style={[{ width: 280 }, style]}
      testID={testID}
      native={AttachmentNative as never}
      nativeProps={{
        ...rest,
        progress: progress ?? -1,
        onGpuiKitAttachmentPress: () => onPress?.(),
        onGpuiKitAttachmentRemove: () => onRemove?.(),
        onGpuiKitAttachmentRetry: () => onRetry?.(),
      }}
      slots={[{ name: 'actions', content: actions }]}
    />
  );
}

export interface MessageScrollerHandle {
  scrollToEnd(): void;
  scrollToItem(index: number): void;
}

export interface MessageScrollerProps extends Base {
  /** One React Native view per message. */
  children?: ReactNode;
  scrollbar?: boolean;
  jumpButton?: boolean;
}

/** A virtualized transcript that follows its tail. */
export const MessageScroller = forwardRef<
  MessageScrollerHandle,
  MessageScrollerProps
>(function MessageScroller(
  { children, scrollbar, jumpButton, style, testID },
  ref,
) {
  const rows = React.Children.toArray(children);
  const native = useRef<React.ComponentRef<typeof ScrollerNative>>(null);
  useImperativeHandle(ref, () => ({
    scrollToEnd: () => native.current && Commands.scrollToEnd(native.current),
    scrollToItem: (index: number) =>
      native.current && Commands.scrollToItem(native.current, index),
  }));
  return (
    <SlotHost
      style={[{ width: 360, height: 240 }, style]}
      testID={testID}
      native={ScrollerNative as never}
      nativeRef={native as never}
      nativeProps={{
        count: rows.length,
        scrollbar: scrollbar ?? true,
        jumpButton: jumpButton ?? true,
      }}
      slots={rows.map((row, index) => ({ name: `row-${index}`, content: row }))}
    />
  );
});

export type AttachmentEvent = NativeSyntheticEvent<
  Readonly<Record<string, never>>
>;
