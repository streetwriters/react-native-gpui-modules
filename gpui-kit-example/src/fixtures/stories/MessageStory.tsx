import React from 'react';
import { View } from 'react-native';
import { Button, Message, MessageGroup } from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame, theme } from './StoryKit';

/** `crates/story/src/stories/message_story.rs` of gpui-component v0.9.1. */
const PREVIEW = 'https://pub.lbkrs.com/files/202503/vEnnmgUM6bo362ya/sdk.svg';
const col = (gap?: number) => ({
  maxWidth: 680,
  gap: gap ?? 16,
  alignItems: 'stretch' as const,
});
const avatar = (name: string, src?: string) => ({ name, src, size: 32 });
const empty = { empty: true, kitStyle: { backgroundColor: 'transparent' } };

export function MessageStory() {
  return (
    <StoryFrame testID="story-message">
      <View style={{ width: '100%', gap: 16 }}>
        <Section
          title="Alignment"
          description="The message owns alignment for all of its named slots."
          column
          style={col(20)}
        >
          <Message
            avatar={avatar('Alice')}
            header={{ items: ['Alice', '10:24 AM'] }}
            parts={[{ bubble: 'Can you review this?', variant: 'secondary' }]}
            footer="Read"
          />
          <Message
            align="end"
            avatar={avatar('You')}
            header={{ items: ['You', '10:25 AM'] }}
            parts={[{ bubble: 'Sure — I will send notes shortly.' }]}
            footer="Delivered"
          />
        </Section>
        <Section
          title="Avatar"
          description="Use sender avatars, initials, or an empty slot to preserve alignment."
          column
          style={col(20)}
        >
          <Message
            avatar={avatar(
              'Alice Chen',
              'https://avatars.githubusercontent.com/u/5518?s=64',
            )}
            header="Alice Chen"
            parts={[
              {
                bubble:
                  'The sender image falls back to initials when unavailable.',
                variant: 'secondary',
              },
            ]}
          />
          <Message
            avatar={avatar('Jordan Park')}
            header="Jordan Park"
            parts={[
              {
                bubble: 'Initials remain available without an image.',
                variant: 'muted',
              },
            ]}
          />
          <Message
            avatar={empty}
            parts={[
              {
                bubble: 'An empty avatar slot keeps grouped responses aligned.',
                variant: 'secondary',
              },
            ]}
          />
        </Section>
        <Section
          title="Header and footer"
          description="Compose sender metadata, timestamps, and delivery status explicitly."
          column
          style={col(20)}
        >
          <Message
            avatar={avatar('Support team')}
            header={{
              items: [
                { text: 'Support', color: theme.foreground },
                '·',
                '10:42 AM',
              ],
            }}
            parts={[
              {
                bubble: 'Your issue has been assigned to the team.',
                variant: 'secondary',
              },
            ]}
            footer="Read by 3 people"
          />
          <Message
            align="end"
            header={{ items: ['You · Just now'], inset: false }}
            parts={[{ bubble: 'Thank you for the quick update.' }]}
            footer={{ items: ['Delivered'], inset: false }}
          />
        </Section>
        <Section
          title="Actions"
          description="Keep copy, feedback, and retry actions keyboard-accessible."
          column
          style={col(20)}
        >
          <Message
            parts={[
              {
                bubble:
                  'The install failure is coming from the workspace package.',
                variant: 'muted',
              },
            ]}
            footer={{
              gap: 8,
              items: [
                { button: { icon: 'copy', tooltip: 'Copy message' } },
                { button: { icon: 'heart', tooltip: 'Like message' } },
                { button: { icon: 'star', tooltip: 'Save message' } },
              ],
            }}
          />
          <Message
            align="end"
            parts={[
              {
                bubble: 'The response could not be sent.',
                variant: 'destructive',
              },
            ]}
            footer={{
              gap: 8,
              items: [
                { text: 'Failed to send', color: theme.danger },
                { button: { label: 'Retry' } },
              ],
            }}
          />
        </Section>
        <Section
          title="Attachment"
          description="Mix image previews, file attachments, and text within one message."
          column
          style={col(20)}
        >
          <Message
            align="end"
            parts={[
              { attachment: { axis: 'vertical', mediaSrc: PREVIEW } },
              { bubble: 'Can you use this image on the cover?' },
            ]}
          />
          <Message
            avatar={avatar('Alice')}
            parts={[
              {
                bubble: 'Done. Here is the updated report.',
                variant: 'secondary',
              },
              {
                attachment: {
                  mediaIcon: 'file-text',
                  title: 'sales-dashboard.pdf',
                  description: 'PDF · 2.4 MB',
                  actions: <Open />,
                },
              },
            ]}
          />
        </Section>
        <Section
          title="Multiple bubbles"
          description="A message can hold multiple surfaces, reactions, and long-form text."
          style={col()}
        >
          <Message
            avatar={avatar('Assistant')}
            header={{ items: ['Assistant', 'Just now'] }}
            contentGap={16}
            parts={[
              {
                bubble: 'I reviewed the upload and message rendering paths.',
                variant: 'secondary',
              },
              {
                bubble: LONG,
                variant: 'muted',
                reactions: {
                  action: {
                    label: '👍 2',
                    tooltip: 'Like this response',
                    size: 'xsmall',
                  },
                },
              },
            ]}
            footer="Response complete"
          />
        </Section>
        <Section
          title="Group"
          description="Group consecutive messages while keeping each row composable."
          column
          style={col()}
        >
          <MessageGroup>
            <Message
              avatar={avatar('Alice')}
              header="Alice"
              parts={[
                { bubble: 'I attached the draft.', variant: 'secondary' },
              ]}
            />
            <Message
              avatar={empty}
              parts={[
                {
                  bubble: 'The second page needs attention.',
                  variant: 'secondary',
                },
              ]}
            />
          </MessageGroup>
        </Section>
        <Section
          title="Custom style"
          description="Every structural part accepts GPUI style refinements."
          style={col()}
        >
          <Message
            kitStyle={{
              padding: 12,
              borderRadius: theme.radiusLg,
              backgroundColor: 'rgba(245, 245, 245, 0.35)',
            }}
            header={{ items: ['System'], kitStyle: { paddingHorizontal: 0 } }}
            parts={[{ text: 'The conversation has been archived.' }]}
            footer={{ items: ['Just now'], kitStyle: { paddingHorizontal: 0 } }}
          />
        </Section>
        <Section
          title="Ghost surface"
          description="Typed ghost bubbles automatically remove metadata insets."
          style={col()}
        >
          <Message
            stackGap={12}
            header={{ items: ['System', 'Just now'] }}
            parts={[
              {
                bubble: 'The conversation has been archived.',
                variant: 'ghost',
              },
            ]}
            footer="No further action required"
          />
        </Section>
      </View>
    </StoryFrame>
  );
}

function Open() {
  return <Button variant="ghost" size="small" label="Open" />;
}

const LONG =
  "Keep lifecycle state on the attachment, preserve the sender's alignment, and expose every action as an existing semantic Button.";
