import React, { useEffect, useRef, useState } from 'react';
import { Text, View, type TextStyle, type ViewStyle } from 'react-native';
import {
  Button,
  Input,
  Marker,
  Message,
  MessageScroller,
  type InputHandle,
  type MessageScrollerHandle,
  type MessageScrollerProps,
} from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame, theme } from './StoryKit';

/** `crates/story/src/stories/message_scroller_story.rs` of gpui-component v0.9.1. */

const INITIAL_STREAM_MESSAGE_COUNT = 7;
const RADIUS_2XL = theme.radius * 2.5;
const RADIUS_4XL = theme.radius * 3.5;
const ROUND = { borderRadius: 9999 };

type DemoMessage = { id: number; body: string; sent: boolean };

const text = (size: number, extra: TextStyle = {}): TextStyle => ({
  fontSize: size,
  lineHeight: size * 1.618,
  color: theme.foreground,
  ...extra,
});

function previewMessages(firstId: number, count: number): DemoMessage[] {
  return Array.from({ length: count }, (_, index) => ({
    id: firstId + index,
    sent: index % 3 === 2,
    body:
      index % 4 === 0
        ? `Message ${index + 1} wraps across more than one line to keep virtual-row measurement realistic.`
        : `Conversation message ${index + 1}`,
  }));
}

function conversationScript(): DemoMessage[] {
  return (
    [
      [
        true,
        "I'm building a chat for our app and the scroll behavior is driving me nuts. Every time the AI streams a reply, the whole thread jumps around.",
      ],
      [
        false,
        "That's the classic streaming scroll problem. Render the rows with MessageScroller — it follows the tail while the reader sits at the live edge, so streamed tokens land in place instead of shoving the thread around.",
      ],
      [
        true,
        "Okay, but what happens when someone scrolls up to re-read an older answer? I don't want to yank them back down.",
      ],
      [
        false,
        "You won't. Scrolling up releases tail following, so the reading position is preserved while new rows keep arriving below.\n\nA jump-to-latest button appears once the reader leaves the tail; one click returns to the newest row and resumes following.",
      ],
      [true, 'And loading older history when they reach the top?'],
      [
        false,
        'prepend inserts the earlier rows while the row the reader is on stays anchored in place — no jump to the top, no lost context.',
      ],
      [
        true,
        'Last one — does it handle rows that change height while streaming?',
      ],
      [
        false,
        'Yes. Remeasure just the growing row and the list keeps its anchor, so streamed markdown, images, and expanding content stay stable.',
      ],
    ] as [boolean, string][]
  ).map(([sent, body], id) => ({ id, sent, body }));
}

function initialStream(): DemoMessage[] {
  return [
    ...previewMessages(1000, INITIAL_STREAM_MESSAGE_COUNT - 1),
    {
      id: 1000 + INITIAL_STREAM_MESSAGE_COUNT - 1,
      sent: true,
      body: 'How does streaming preserve my position?',
    },
  ];
}

/** `render_message_row`: sent rows on a muted surface, received rows as ghost text. */
function messageRow(message: DemoMessage, unread = false) {
  return (
    <View key={message.id} style={{ width: '100%', minWidth: 0, gap: 12 }}>
      {unread && <Marker variant="separator" text="Unread" />}
      <View style={{ width: '100%' }}>
        <Message
          align={message.sent ? 'end' : 'start'}
          parts={[
            {
              bubble: message.body,
              variant: message.sent ? 'muted' : 'ghost',
            },
          ]}
        />
      </View>
    </View>
  );
}

const frame: ViewStyle = {
  width: 416,
  maxWidth: '100%',
  height: 304,
  overflow: 'hidden',
  borderRadius: RADIUS_2XL,
  borderWidth: 1,
  borderColor: theme.border,
  backgroundColor: theme.background,
};

function Preview(
  props: MessageScrollerProps & {
    scrollerRef?: React.Ref<MessageScrollerHandle>;
  },
) {
  const { scrollerRef, ...rest } = props;
  return (
    <View style={frame}>
      <MessageScroller
        ref={scrollerRef}
        bottomFade={theme.background}
        listStyle={{ padding: 16 }}
        {...rest}
        style={{ width: '100%', height: '100%' }}
      />
    </View>
  );
}

const row = { flexDirection: 'row', gap: 8 } as const;
const note = text(12, { color: theme.mutedForeground });

export function MessageScrollerStory() {
  const scroller = useRef<MessageScrollerHandle>(null);
  const streamScroller = useRef<MessageScrollerHandle>(null);
  const historyScroller = useRef<MessageScrollerHandle>(null);
  const navigationScroller = useRef<MessageScrollerHandle>(null);
  const customScroller = useRef<MessageScrollerHandle>(null);
  const applicationScroller = useRef<MessageScrollerHandle>(null);
  const composer = useRef<InputHandle>(null);
  const nextId = useRef(10_000);
  const [messages, setMessages] = useState(conversationScript);
  const [unreadIndex, setUnreadIndex] = useState(4);
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState({
    followingTail: true,
    scrolledUp: false,
  });
  const [streamMessages, setStreamMessages] = useState(initialStream);
  const [streaming, setStreaming] = useState(false);
  const [historyMessages, setHistoryMessages] = useState(() =>
    previewMessages(2000, 14),
  );
  const [previews] = useState(() => previewMessages(3000, 18));
  const [emptyMessages, setEmptyMessages] = useState<DemoMessage[]>([]);
  const [customScrolledUp, setCustomScrolledUp] = useState(false);
  const [applicationScrolledUp, setApplicationScrolledUp] = useState(false);
  const streamTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const remeasureLast = useRef(false);

  useEffect(() => {
    if (!remeasureLast.current) return;
    remeasureLast.current = false;
    const last = streamMessages.length - 1;
    streamScroller.current?.remeasureItems(last, last + 1);
  }, [streamMessages]);
  useEffect(
    () => () => {
      if (streamTimer.current) clearInterval(streamTimer.current);
    },
    [],
  );

  const takeId = (count = 1) => {
    const id = nextId.current;
    nextId.current += count;
    return id;
  };
  const stopStream = () => {
    if (streamTimer.current) clearInterval(streamTimer.current);
    streamTimer.current = null;
    setStreaming(false);
  };
  const updateLastStream = (update: (body: string) => string) => {
    remeasureLast.current = true;
    setStreamMessages(list => {
      const last = list[list.length - 1];
      return [...list.slice(0, -1), { ...last, body: update(last.body) }];
    });
  };
  const startStream = () => {
    if (streaming) return;
    const tokens =
      'The virtual list follows new content while you remain at the live edge. Scroll upward during this response and your reading position stays in place until you choose to return to the latest message.'.split(
        /\s+/,
      );
    setStreaming(true);
    setStreamMessages(list => [
      ...list,
      { id: takeId(), sent: false, body: 'Preparing response…' },
    ]);
    let tokenIx = 0;
    streamTimer.current = setInterval(() => {
      const token = tokens[tokenIx];
      const first = tokenIx === 0;
      tokenIx += 1;
      updateLastStream(body => (first ? token : `${body} ${token}`));
      if (tokenIx >= tokens.length) stopStream();
    }, 110);
  };

  return (
    <StoryFrame testID="story-message_scroller">
      <View style={{ width: '100%', gap: 16 }}>
        <Section
          title="Conversation"
          description="Scroll upward, append a row, jump to unread, or prepend history to exercise each behavior."
          column
          style={{ maxWidth: 720, gap: 12 }}
        >
          <View style={row}>
            <Button
              label="Append"
              onPress={() =>
                setMessages(list => [
                  ...list,
                  {
                    id: takeId(),
                    sent: true,
                    body: `New message ${list.length + 1}`,
                  },
                ])
              }
            />
            <Button
              label="Prepend history"
              onPress={() => {
                const first = takeId(5);
                setMessages(list => [
                  ...Array.from({ length: 5 }, (_, offset) => ({
                    id: first + offset,
                    sent: false,
                    body: `Earlier history ${offset + 1}`,
                  })),
                  ...list,
                ]);
                setUnreadIndex(index => index + 5);
              }}
            />
            <Button
              label="Scroll to unread"
              onPress={() => scroller.current?.scrollToItem(unreadIndex)}
            />
          </View>
          <View
            style={{
              width: 384,
              maxWidth: '100%',
              height: 560,
              overflow: 'hidden',
              borderRadius: RADIUS_4XL,
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: theme.background,
            }}
          >
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 8,
                padding: 20,
                borderBottomWidth: 1,
                borderColor: theme.border,
              }}
            >
              <View style={{ gap: 4 }}>
                <Text style={text(16, { fontWeight: '600' })}>New Chat</Text>
                <Text style={text(14, { color: theme.mutedForeground })}>
                  How can I help you today?
                </Text>
              </View>
              <Button
                outline
                icon="rotate-cw"
                kitStyle={ROUND}
                tooltip="Reset conversation"
                onPress={() => {
                  setMessages(conversationScript());
                  setUnreadIndex(4);
                }}
              />
            </View>
            <View style={{ flex: 1, minHeight: 0 }}>
              <MessageScroller
                ref={scroller}
                style={{ width: '100%', height: '100%' }}
                listStyle={{ padding: 20 }}
                bottomFade={theme.background}
                onScrollChange={setStatus}
              >
                {messages.map((message, index) =>
                  messageRow(message, index === unreadIndex),
                )}
              </MessageScroller>
            </View>
            <View
              style={{
                width: '100%',
                paddingHorizontal: 20,
                paddingBottom: 20,
              }}
            >
              <View
                style={{
                  width: '100%',
                  gap: 4,
                  padding: 8,
                  borderRadius: 12,
                  backgroundColor: theme.muted,
                }}
              >
                <Input
                  ref={composer}
                  appearance={false}
                  placeholder="Write a message…"
                  value={draft}
                  onChangeText={setDraft}
                  style={{ width: '100%' }}
                />
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                  }}
                >
                  <Button
                    variant="primary"
                    icon="arrow-up"
                    kitStyle={ROUND}
                    tooltip="Send"
                    onPress={() => {
                      if (!draft.trim()) return;
                      const body = draft;
                      setMessages(list => [
                        ...list,
                        { id: takeId(), sent: true, body },
                      ]);
                      setDraft('');
                    }}
                  />
                </View>
              </View>
            </View>
          </View>
          <Text style={note}>
            {`Following tail: ${status.followingTail} · Scrolled up: ${status.scrolledUp}`}
          </Text>
        </Section>
        <Section
          title="Streaming responses"
          description="Append one assistant response, grow its text progressively, and remeasure only that row."
          column
          style={{ maxWidth: 720, gap: 12 }}
        >
          <View style={[row, { flexWrap: 'wrap' }]}>
            <Button
              label="Stream response"
              disabled={streaming}
              onPress={startStream}
            />
            <Button
              outline
              label="Stop"
              disabled={!streaming}
              onPress={stopStream}
            />
            <Button
              label="Expand response"
              disabled={
                streaming ||
                streamMessages.length <= INITIAL_STREAM_MESSAGE_COUNT
              }
              onPress={() =>
                updateLastStream(
                  body =>
                    `${body}\n\nExpanded details demonstrate how images, Markdown, and progressive content can change an existing row without replacing its identity.`,
                )
              }
            />
            <Button
              variant="ghost"
              label="Reset"
              onPress={() => {
                stopStream();
                setStreamMessages(initialStream());
              }}
            />
          </View>
          <Preview scrollerRef={streamScroller}>
            {streamMessages.map(message => messageRow(message))}
          </Preview>
          <Text style={note}>
            {streaming
              ? 'Streaming · existing row is remeasured as each token arrives'
              : 'Idle · scroll upward before streaming to preserve reading position'}
          </Text>
        </Section>
        <Section
          title="Loading earlier messages"
          description="Prepend history without disturbing the currently visible message anchor."
          column
          style={{ maxWidth: 720, gap: 12 }}
        >
          <View style={row}>
            <Button
              label="Load five earlier"
              onPress={() => {
                const first = takeId(5);
                setHistoryMessages(list => [
                  ...Array.from({ length: 5 }, (_, offset) => ({
                    id: first + offset,
                    sent: false,
                    body: `Earlier saved message ${offset + 1}`,
                  })),
                  ...list,
                ]);
              }}
            />
            <Button
              outline
              label="Scroll to oldest"
              onPress={() => historyScroller.current?.scrollToItem(0)}
            />
          </View>
          <Preview scrollerRef={historyScroller}>
            {historyMessages.map(message => messageRow(message))}
          </Preview>
        </Section>
        <Section
          title="Jumping to messages"
          description="Applications resolve stable message IDs to their current row indices."
          column
          style={{ maxWidth: 720, gap: 12 }}
        >
          <View style={row}>
            <Button
              label="First message"
              onPress={() => navigationScroller.current?.scrollToItem(0)}
            />
            <Button
              label="Message 9"
              onPress={() => navigationScroller.current?.scrollToItem(8)}
            />
            <Button
              outline
              label="Latest"
              onPress={() => navigationScroller.current?.scrollToEnd()}
            />
          </View>
          <Preview scrollerRef={navigationScroller}>
            {previews.map(message => messageRow(message))}
          </Preview>
        </Section>
        <Section
          title="Empty conversation"
          description="The application owns empty states and switches to a virtual list when data arrives."
          column
          style={{ maxWidth: 720, gap: 12 }}
        >
          <Button
            label={
              emptyMessages.length === 0
                ? 'Add first message'
                : 'Clear conversation'
            }
            onPress={() =>
              setEmptyMessages(list =>
                list.length === 0
                  ? [
                      {
                        id: 20_000,
                        sent: true,
                        body: 'A first message replaces the application-owned empty state.',
                      },
                    ]
                  : [],
              )
            }
          />
          <View style={[frame, { height: 224 }]}>
            {emptyMessages.length === 0 ? (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                }}
              >
                <Text style={text(16, { fontWeight: '600' })}>
                  No messages yet
                </Text>
                <Text style={text(14, { color: theme.mutedForeground })}>
                  Send a message to start the conversation
                </Text>
              </View>
            ) : (
              <MessageScroller
                style={{ width: '100%', height: '100%' }}
                listStyle={{ padding: 16 }}
                bottomFade={theme.background}
              >
                {emptyMessages.map(message => messageRow(message))}
              </MessageScroller>
            )}
          </View>
        </Section>
        <Section
          title="Custom jump button"
          description="Change the built-in button, transition, tooltip, list spacing, and row styles."
          column
          style={{ maxWidth: 720, gap: 12 }}
        >
          <View style={[row, { alignItems: 'center' }]}>
            <Button
              label="Reveal jump button"
              onPress={() => customScroller.current?.scrollToItem(0)}
            />
            <Text style={text(14, { color: theme.mutedForeground })}>
              {customScrolledUp ? 'Visible' : 'Hidden'}
            </Text>
          </View>
          <Preview
            scrollerRef={customScroller}

            contentStyle={{ backgroundColor: theme.background }}
            rowStyle={{ paddingBottom: 16 }}
            jumpButtonLabel="Return to the latest message"
            jumpButtonVariant="outline"
            jumpButtonSize="small"
            jumpButtonText="Latest"
            jumpButtonStyle={{ borderRadius: theme.radiusLg }}
            jumpButtonTransition={350}
            onScrollChange={state => setCustomScrolledUp(state.scrolledUp)}
          >
            {previews.map(message => messageRow(message))}
          </Preview>
        </Section>
        <Section
          title="Application-owned controls"
          description="Disable built-in chrome and place the jump action wherever the product needs it."
          column
          style={{ maxWidth: 720, gap: 12 }}
        >
          <View style={row}>
            <Button
              label="Scroll to first"
              onPress={() => applicationScroller.current?.scrollToItem(0)}
            />
            <Button
              outline
              label="Jump to latest"
              disabled={!applicationScrolledUp}
              onPress={() => applicationScroller.current?.scrollToEnd()}
            />
          </View>
          <Preview
            scrollerRef={applicationScroller}

            jumpButton={false}
            scrollbar={false}
            onScrollChange={state => setApplicationScrolledUp(state.scrolledUp)}
          >
            {previews.map(message => messageRow(message))}
          </Preview>
        </Section>
      </View>
    </StoryFrame>
  );
}
