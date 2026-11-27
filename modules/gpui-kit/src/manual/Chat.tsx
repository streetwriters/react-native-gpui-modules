import React, {
  Children,
  useImperativeHandle,
  useRef,
  forwardRef,
  type ReactNode,
} from 'react';
import {
  processColor,
  type ColorValue,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import MessageNative from './GpuiKitMessageNativeComponent';
import BubbleNative from './GpuiKitBubbleNativeComponent';
import AttachmentNative from './GpuiKitAttachmentNativeComponent';
import ScrollerNative, {
  Commands,
} from './GpuiKitMessageScrollerNativeComponent';
import { SlotHost } from './SlotHost';
import { kitStyle, type KitStyle } from './kitStyle';
import type { IconName } from '../generated/icons';

interface Base {
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const text = (node: ReactNode) => (typeof node === 'string' ? node : undefined);

/** An item of a message's header or footer. */
export type MessageMetaItem =
  | string
  | { text: string; color?: string }
  | {
      button: { icon?: IconName; label?: string; tooltip?: string };
      onPress?: () => void;
    }
  | { content: ReactNode };

/** A part of a message's content, in order. */
export type MessagePart =
  | {
      bubble: string;
      variant?: BubbleVariantName;
      reactions?: Omit<BubbleReactionsSpec, 'content'>;
    }
  | { attachment: AttachmentProps }
  | { text: string }
  | { content: ReactNode };

export interface MessageMeta {
  items: MessageMetaItem[];
  /** Lines the items up with the content, past the avatar (default `true`). */
  inset?: boolean;
  gap?: number;
  kitStyle?: KitStyle;
}

export interface MessageProps extends Base {
  /** The message is the user's own, aligned to the end. */
  end?: boolean;
  align?: 'start' | 'end';
  /** An avatar by name and image, an empty slot that keeps alignment, or React Native content. */
  avatar?:
    | {
        name?: string;
        src?: string;
        size?: number;
        empty?: boolean;
        kitStyle?: KitStyle;
      }
    | ReactNode;
  /** A string, React Native content, or the header's items. */
  header?: ReactNode | MessageMeta;
  /** A string, React Native content, or the footer's items. */
  footer?: ReactNode | MessageMeta;
  /** The body: React Native content, or `parts`. */
  children?: ReactNode;
  /** The content as bubbles, attachments and text, in order. */
  parts?: MessagePart[];
  contentGap?: number;
  /** The gap between header, content and footer. */
  stackGap?: number;
  kitStyle?: KitStyle;
}

const isMeta = (value: unknown): value is MessageMeta =>
  typeof value === 'object' &&
  value != null &&
  !React.isValidElement(value) &&
  Array.isArray((value as MessageMeta).items);

function messageSpec(
  props: MessageProps,
  slots: { name: string; content: ReactNode }[],
  actions: (() => void)[],
) {
  const slot = (content: ReactNode) => {
    slots.push({ name: `item-${slots.length}`, content });
    return slots.length - 1;
  };
  const meta = (value: ReactNode | MessageMeta | undefined) => {
    if (value == null) return null;
    const m: MessageMeta = isMeta(value)
      ? value
      : { items: [value as MessageMetaItem] };
    return {
      inset: m.inset,
      gap: m.gap,
      style: kitStyle(m.kitStyle),
      items: m.items.map(item => {
        if (typeof item === 'string') return { text: item };
        if (typeof item === 'object' && item != null && 'text' in item)
          return {
            text: item.text,
            color: item.color ? (processColor(item.color) as number) >>> 0 : 0,
          };
        if (typeof item === 'object' && item != null && 'button' in item) {
          actions.push(item.onPress ?? (() => {}));
          return {
            button: {
              ...item.button,
              icon: item.button.icon ?? '',
              id: actions.length - 1,
            },
          };
        }
        const content =
          typeof item === 'object' && item != null && 'content' in item
            ? item.content
            : item;
        return { slot: slot(content as ReactNode) };
      }),
    };
  };
  const avatar = props.avatar;
  const avatarSpec =
    avatar != null &&
    typeof avatar === 'object' &&
    !React.isValidElement(avatar)
      ? (avatar as {
          name?: string;
          src?: string;
          size?: number;
          empty?: boolean;
          kitStyle?: KitStyle;
        })
      : null;
  return {
    align: props.end ? 'end' : (props.align ?? ''),
    avatar: avatarSpec
      ? {
          name: avatarSpec.name ?? '',
          src: avatarSpec.src ?? '',
          size: avatarSpec.size,
          empty: avatarSpec.empty ?? false,
          style: kitStyle(avatarSpec.kitStyle),
        }
      : null,
    avatarSlot:
      avatar != null && !avatarSpec ? slot(avatar as ReactNode) : null,
    header: meta(props.header as ReactNode | MessageMeta),
    footer: meta(props.footer as ReactNode | MessageMeta),
    content: {
      gap: props.contentGap,
      parts: [
        ...(props.parts ?? []).map(part => {
          if ('bubble' in part)
            return {
              kind: 'bubble',
              text: part.bubble,
              variant: part.variant ?? 'filled',
              reactions: part.reactions ?? null,
            };
          if ('attachment' in part)
            return {
              kind: 'attachment',
              attachment: attachmentSpec(part.attachment),
              slot:
                part.attachment.actions != null
                  ? slot(part.attachment.actions)
                  : null,
            };
          if ('text' in part) return { kind: 'text', text: part.text };
          return { kind: 'slot', slot: slot(part.content) };
        }),
        ...(props.children != null
          ? [{ kind: 'slot', slot: slot(props.children) }]
          : []),
      ],
    },
    style: kitStyle(props.kitStyle),
    stackGap: props.stackGap,
  };
}

function messageHost(messages: MessageProps[], view: Base, grouped: boolean) {
  const slots: { name: string; content: ReactNode }[] = [];
  const actions: (() => void)[] = [];
  const json = JSON.stringify(
    messages.map(message => messageSpec(message, slots, actions)),
  );
  return (
    <SlotHost
      style={[{ width: '100%' }, view.style]}
      testID={view.testID}
      native={MessageNative as never}
      nativeProps={{
        messagesJson: json,
        grouped,
        onGpuiKitMessageAction: (event: NativeSyntheticEvent<{ id: number }>) =>
          actions[event.nativeEvent.id]?.(),
      }}
      slots={slots}
    />
  );
}

/** A chat message: avatar, header, content and footer, aligned to the start or the end. */
export function Message(props: MessageProps) {
  return messageHost([props], props, false);
}

export interface MessageGroupProps extends Base {
  /** `Message` elements shown as one group. */
  children?: ReactNode;
}

/** Consecutive messages of one sender. */
export function MessageGroup({ children, style, testID }: MessageGroupProps) {
  const messages = Children.toArray(children)
    .filter((child): child is React.ReactElement<MessageProps> =>
      React.isValidElement(child),
    )
    .map(child => child.props);
  return messageHost(messages, { style, testID }, true);
}

export interface BubbleReactionsSpec {
  side?: 'top' | 'bottom';
  align?: 'start' | 'end';
  /** Plain text, an emoji count such as `✨ 1`. */
  text?: string;
  /** Padding of the reactions box, in points. */
  padding?: number;
  /** A ghost button among the reactions. */
  action?: {
    label?: string;
    icon?: IconName;
    tooltip?: string;
    size?: 'xsmall' | 'small';
  };
  /** React Native content among the reactions. */
  content?: ReactNode;
}

type BubbleVariantName =
  | 'filled'
  | 'secondary'
  | 'muted'
  | 'tinted'
  | 'outline'
  | 'ghost'
  | 'destructive';

export interface BubbleProps extends Base {
  /** Shorthand for `align="end"`. */
  end?: boolean;
  /** `start` or `end`; left out, it follows the message around it. */
  align?: 'start' | 'end';
  variant?: BubbleVariantName;
  /** A string, or React Native content. */
  children?: ReactNode;
  /** Reactions attached to an edge of the bubble. */
  reactions?: BubbleReactionsSpec;
  /** Refines the bubble's surface: background, text color, radius, border. */
  contentStyle?: KitStyle;
}

export function Bubble({
  end,
  align,
  variant,
  children,
  reactions,
  contentStyle,
  style,
  testID,
}: BubbleProps) {
  const { content: reactionContent, ...reactionSpec } = reactions ?? {};
  return (
    <SlotHost
      style={[{ width: '100%' }, style]}
      testID={testID}
      native={BubbleNative as never}
      nativeProps={{
        align: end ? 'end' : (align ?? ''),
        variant,
        text: text(children),
        reactionsJson: reactions ? JSON.stringify(reactionSpec) : '',
        contentStyle: kitStyle(contentStyle),
      }}
      slots={[
        {
          name: 'body',
          content: text(children) === undefined ? children : null,
        },
        { name: 'reactions', content: reactionContent },
      ]}
    />
  );
}

export interface BubbleGroupProps extends Base {
  /** Consecutive plain bubbles, spaced as one group. */
  bubbles: {
    text: string;
    variant?: BubbleVariantName;
    align?: 'start' | 'end';
  }[];
}

/** Consecutive bubbles with the group spacing. */
export function BubbleGroup({ bubbles, style, testID }: BubbleGroupProps) {
  return (
    <SlotHost
      style={[{ width: '100%' }, style]}
      testID={testID}
      native={BubbleNative as never}
      nativeProps={{
        groupJson: JSON.stringify(
          bubbles.map(bubble => ({
            text: bubble.text,
            variant: bubble.variant ?? 'filled',
            align: bubble.align ?? '',
          })),
        ),
      }}
      slots={[]}
    />
  );
}

export interface AttachmentProps extends Base {
  /** Leave it out for a card that is only its media. */
  title?: string;
  description?: string;
  tooltip?: string;
  /** Upload progress, 0 to 100. */
  progress?: number;
  status?: 'pending' | 'uploading' | 'processing' | 'failed' | 'complete';
  /** `vertical` puts the media above the text, as a card. */
  axis?: 'horizontal' | 'vertical';
  size?: 'xsmall' | 'small' | 'medium' | 'large';
  /** An image URL drawn as the media. */
  mediaSrc?: string;
  /** An icon drawn as the media. */
  mediaIcon?: IconName;
  /** An icon painted over the media. */
  mediaOverlayIcon?: IconName;
  /** Refines the media box. */
  mediaStyle?: KitStyle;
  /** Refines the title. */
  titleStyle?: KitStyle;
  /** The title's shimmer while processing. */
  shimmer?: { color?: string; spread?: number; reverse?: boolean };
  /** Refines the card. */
  kitStyle?: KitStyle;
  /** React Native content for the actions. */
  actions?: ReactNode;
  /** Pressing the card; the card is clickable only with it. */
  onPress?: () => void;
  /** Shows the remove control. */
  onRemove?: () => void;
  /** Shows the retry control on a failed card. */
  onRetry?: () => void;
}

const attachmentSpec = (props: AttachmentProps) => ({
  title: props.title ?? '',
  description: props.description ?? '',
  tooltip: props.tooltip ?? '',
  progress: props.progress ?? -1,
  status: props.status ?? 'complete',
  axis: props.axis ?? 'horizontal',
  size: props.size ?? '',
  mediaSrc: props.mediaSrc ?? '',
  mediaIcon: props.mediaIcon ?? '',
  mediaOverlayIcon: props.mediaOverlayIcon ?? '',
  mediaStyle: kitStyle(props.mediaStyle),
  titleStyle: kitStyle(props.titleStyle),
  shimmer: props.shimmer
    ? {
        color: props.shimmer.color
          ? (processColor(props.shimmer.color) as number) >>> 0
          : 0,
        spread: props.shimmer.spread ?? 0,
        reverse: props.shimmer.reverse ?? false,
      }
    : null,
  style: kitStyle(props.kitStyle),
  clickable: props.onPress != null,
  removable: props.onRemove != null,
  retryable: props.onRetry != null,
});

type IndexEvent = NativeSyntheticEvent<{ index: number }>;

function attachmentHost(
  items: AttachmentProps[],
  view: Base,
  group?: { edgeFade?: string },
) {
  const pick =
    (name: 'onPress' | 'onRemove' | 'onRetry') => (event: IndexEvent) =>
      items[event.nativeEvent.index]?.[name]?.();
  const fade = group?.edgeFade ? processColor(group.edgeFade) : 0;
  return (
    <SlotHost
      style={view.style}
      fitWidth={!group}
      testID={view.testID}
      native={AttachmentNative as never}
      nativeProps={{
        itemsJson: JSON.stringify(items.map(attachmentSpec)),
        asGroup: group != null,
        edgeFade: typeof fade === 'number' ? fade | 0 : 0,
        onGpuiKitAttachmentPress: pick('onPress'),
        onGpuiKitAttachmentRemove: pick('onRemove'),
        onGpuiKitAttachmentRetry: pick('onRetry'),
      }}
      slots={items.map((item, index) => ({
        name: `actions-${index}`,
        content: item.actions,
      }))}
    />
  );
}

/** A file or image attached to a message: a chip, or a card with `axis="vertical"`. */
export function Attachment(props: AttachmentProps) {
  return attachmentHost([props], props);
}

export interface AttachmentGroupProps extends Base {
  /** `Attachment` elements, drawn in a scrolling row. */
  children?: ReactNode;
  /** The background the row's edges fade into. */
  edgeFade?: string;
}

/** A scrolling row of attachments. */
export function AttachmentGroup({
  children,
  edgeFade,
  style,
  testID,
}: AttachmentGroupProps) {
  const items = Children.toArray(children)
    .filter((child): child is React.ReactElement<AttachmentProps> =>
      React.isValidElement(child),
    )
    .map(child => child.props);
  return attachmentHost(items, { style, testID }, { edgeFade });
}

export interface MessageScrollerHandle {
  scrollToEnd(): void;
  scrollToItem(index: number): void;
  /** Measures rows `start` up to `end` again after their content changed, keeping the anchor. */
  remeasureItems(start: number, end: number): void;
}

export interface MessageScrollerProps extends Base {
  /**
   * One React Native view per message, each with a stable `key`: rows added
   * at the end are appended (the scroller follows them at the tail) and rows
   * added at the start prepended, keeping the reading position.
   */
  children?: ReactNode;
  scrollbar?: boolean;
  jumpButton?: boolean;
  /** Refines the scroller's surface. */
  contentStyle?: KitStyle;
  /** Refines the list, for example its padding. */
  listStyle?: KitStyle;
  /** Refines every row. */
  rowStyle?: KitStyle;
  /** Fades the bottom edge into this color while the reader is away from the tail. */
  bottomFade?: ColorValue;
  /** The jump button's accessible label. */
  jumpButtonLabel?: string;
  /** The jump button's text, variant and size, instead of the kit's icon button. */
  jumpButtonText?: string;
  jumpButtonVariant?: 'outline' | 'ghost' | 'primary' | 'secondary' | 'default';
  jumpButtonSize?: 'xsmall' | 'small' | 'medium' | 'large';
  jumpButtonStyle?: KitStyle;
  /** How long the jump button takes to appear, in milliseconds. */
  jumpButtonTransition?: number;
  /** The reader followed the tail or scrolled away from it. */
  onScrollChange?: (state: {
    followingTail: boolean;
    scrolledUp: boolean;
  }) => void;
}

/** A virtualized transcript that follows its tail. */
export const MessageScroller = forwardRef<
  MessageScrollerHandle,
  MessageScrollerProps
>(function MessageScroller(
  {
    children,
    scrollbar,
    jumpButton,
    contentStyle,
    listStyle,
    rowStyle,
    bottomFade,
    jumpButtonLabel,
    jumpButtonText,
    jumpButtonVariant,
    jumpButtonSize,
    jumpButtonStyle,
    jumpButtonTransition,
    onScrollChange,
    style,
    testID,
  },
  ref,
) {
  const rows = React.Children.toArray(children);
  const native = useRef<React.ComponentRef<typeof ScrollerNative>>(null);
  useImperativeHandle(ref, () => ({
    scrollToEnd: () => native.current && Commands.scrollToEnd(native.current),
    scrollToItem: (index: number) =>
      native.current && Commands.scrollToItem(native.current, index),
    remeasureItems: (start: number, end: number) =>
      native.current && Commands.remeasureItems(native.current, start, end),
  }));
  const fade = bottomFade == null ? 0 : processColor(bottomFade);
  return (
    <SlotHost
      style={[{ width: 360, height: 240 }, style]}
      testID={testID}
      native={ScrollerNative as never}
      nativeRef={native as never}
      nativeProps={{
        keysJson: JSON.stringify(
          rows.map((row, index) =>
            React.isValidElement(row) && row.key != null
              ? String(row.key)
              : `#${index}`,
          ),
        ),
        scrollbar: scrollbar ?? true,
        jumpButton: jumpButton ?? true,
        contentStyle: kitStyle(contentStyle),
        listStyle: kitStyle(listStyle),
        rowStyle: kitStyle(rowStyle),
        bottomFade: typeof fade === 'number' ? fade | 0 : 0,
        jumpButtonLabel: jumpButtonLabel ?? '',
        jumpButtonText: jumpButtonText ?? '',
        jumpButtonVariant: jumpButtonVariant ?? '',
        jumpButtonSize: jumpButtonSize ?? '',
        jumpButtonStyle: kitStyle(jumpButtonStyle),
        jumpButtonTransition: jumpButtonTransition ?? -1,
        onGpuiKitMessageScrollerScrollChange: (
          event: NativeSyntheticEvent<
            Readonly<{ followingTail: boolean; scrolledUp: boolean }>
          >,
        ) => onScrollChange?.(event.nativeEvent),
      }}
      slots={rows.map((row, index) => ({ name: `row-${index}`, content: row }))}
    />
  );
});

export type AttachmentEvent = NativeSyntheticEvent<
  Readonly<Record<string, never>>
>;
