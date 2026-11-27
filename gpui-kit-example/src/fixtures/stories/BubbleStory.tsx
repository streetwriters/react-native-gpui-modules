import React, { useState } from 'react';
import { Text, View } from 'react-native';
import {
  Bubble,
  BubbleGroup,
  Button,
  Collapsible,
  Link,
  Popover,
} from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame, theme } from './StoryKit';

/** `crates/story/src/stories/bubble_story.rs` of gpui-component v0.9.1. */
const sm = { fontSize: 14, lineHeight: 20 };
const col = (gap: number, extra?: object) => ({
  maxWidth: 680,
  gap,
  alignItems: 'stretch' as const,
  ...extra,
});

export function BubbleStory() {
  const [expanded, setExpanded] = useState(false);
  return (
    <StoryFrame testID="story-bubble">
      <View style={{ width: '100%', gap: 16 }}>
        <Section
          title="Variants"
          description="Semantic variants match the Base UI bubble treatments."
          column
          style={col(16)}
        >
          <Bubble align="start">A strong primary bubble.</Bubble>
          <Bubble align="start" variant="secondary">
            The neutral secondary bubble.
          </Bubble>
          <Bubble align="start" variant="muted">
            A lower-emphasis muted bubble.
          </Bubble>
          <Bubble align="start" variant="tinted">
            A softly tinted primary bubble.
          </Bubble>
          <Bubble align="start" variant="outline">
            A bordered bubble for rich content.
          </Bubble>
          <Bubble align="start" variant="destructive">
            A failed action with its reason in text.
          </Bubble>
          <Bubble align="start" variant="ghost">
            Ghost content is unframed and can use the full row width.
          </Bubble>
        </Section>
        <Section
          title="Alignment"
          description="Use the same alignment value as Message."
          column
          style={col(12)}
        >
          <Bubble align="start" variant="secondary">
            Incoming message
          </Bubble>
          <Bubble align="end">Outgoing message</Bubble>
        </Section>
        <Section
          title="Reactions"
          description="Use action for integrated Button controls; child keeps emoji and arbitrary reactions composable."
          column
          style={col(32, { paddingVertical: 24 })}
        >
          <Bubble
            align="start"
            variant="outline"
            reactions={{
              action: {
                label: '👍 2',
                tooltip: 'Like this message',
                size: 'small',
              },
            }}
          >
            This bubble has reaction feedback.
          </Bubble>
          <Bubble
            align="end"
            reactions={{ side: 'top', align: 'start', text: '✨ 1' }}
          >
            Reactions can attach to any edge.
          </Bubble>
        </Section>
        <Section
          title="Group"
          description="Group consecutive bubbles using the shared spacing scale."
          column
          style={col(20)}
        >
          <BubbleGroup
            bubbles={[
              {
                text: 'Can you tell me what changed?',
                align: 'start',
                variant: 'secondary',
              },
              {
                text: 'The registry route was stale.',
                align: 'start',
                variant: 'secondary',
              },
            ]}
          />
          <BubbleGroup
            bubbles={[
              { text: 'I removed the stale route.', align: 'end' },
              {
                text: 'The updated registry is ready to review.',
                align: 'end',
              },
            ]}
          />
        </Section>
        <Section
          title="Links and buttons"
          description="Compose external links and application actions inside a bubble."
          column
          style={col(12)}
        >
          <Bubble align="start" variant="outline">
            <View style={{ gap: 8 }}>
              <Text style={[sm, { color: theme.foreground }]}>
                The implementation guide is available online.
              </Text>
              <Link
                href="https://gpui-kit.com/"
                text="Open the component documentation"
              />
            </View>
          </Bubble>
          <Bubble align="start" variant="muted">
            <View
              style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}
            >
              <Text style={[sm, { color: theme.foreground }]}>
                The generated report is ready.
              </Text>
              <Button variant="ghost" size="small" label="Open report" />
            </View>
          </Bubble>
        </Section>
        <Section
          title="Collapsible content"
          description="Keep long responses readable with an explicit disclosure action."
          column
          style={col(16)}
        >
          <Bubble align="start" variant="muted">
            <Collapsible
              open={expanded}
              kitStyle={{ gap: 8 }}
              trigger={
                <Text style={[sm, { color: theme.foreground }]}>
                  The accessibility review found two focus states that need more
                  contrast.
                </Text>
              }
              after={
                <View style={{ alignItems: 'flex-start' }}>
                  <Button
                    variant="ghost"
                    size="small"
                    icon="chevrons-up-down"
                    label={expanded ? 'Show less' : 'Show more'}
                    onPress={() => setExpanded(v => !v)}
                  />
                </View>
              }
            >
              <View style={{ gap: 8 }}>
                <Text style={[sm, { color: theme.foreground }]}>
                  Dialog and sheet controls already keep their focus rings
                  visible.
                </Text>
                <Text style={[sm, { color: theme.foreground }]}>
                  Update the menu focus token separately from its pointer hover
                  state.
                </Text>
              </View>
            </Collapsible>
          </Bubble>
        </Section>
        <Section
          title="Tooltip"
          description="Label icon-only reaction controls with their concrete meaning."
          column
          style={col(16, { paddingVertical: 16 })}
        >
          <Bubble
            align="end"
            reactions={{
              action: {
                icon: 'circle-check',
                tooltip: 'Read today at 4:32 PM',
                size: 'xsmall',
              },
            }}
          >
            The updated registry route is live.
          </Bubble>
        </Section>
        <Section
          title="Popover"
          description="Use a semantic popover for contextual failure details."
          column
          style={col(16, { paddingVertical: 16 })}
        >
          <Bubble
            align="start"
            variant="destructive"
            reactions={{
              padding: 0,
              content: (
                <Popover
                  width="auto"
                  kitStyle={{ width: 256, gap: 8 }}
                  content={
                    <View style={{ gap: 8 }}>
                      <Text style={{ fontSize: 16, lineHeight: 25.9 }}>
                        Build command failed
                      </Text>
                      <Text style={{ fontSize: 16, lineHeight: 25.9 }}>
                        The workspace lockfile could not be found.
                      </Text>
                    </View>
                  }
                >
                  <Button
                    variant="ghost"
                    size="xsmall"
                    icon="info"
                    tooltip="Show error details"
                    kitStyle={{ borderRadius: 9999 }}
                  />
                </Popover>
              ),
            }}
          >
            The build command could not finish.
          </Bubble>
        </Section>
        <Section
          title="Rich content"
          description="Any GPUI element can be placed directly in the surface."
          column
          style={col(12)}
        >
          <Bubble align="start">
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: theme.radius,
                  backgroundColor: 'rgba(250, 250, 250, 0.18)',
                }}
              />
              <View>
                <Text style={[sm, { color: theme.primaryForeground }]}>
                  design-notes.pdf
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    lineHeight: 16,
                    opacity: 0.75,
                    color: theme.primaryForeground,
                  }}
                >
                  2.4 MB · PDF
                </Text>
              </View>
            </View>
          </Bubble>
          <Bubble align="start" variant="secondary">
            {LONG}
          </Bubble>
        </Section>
        <Section
          title="Custom style"
          description="Caller refinements override the surface defaults."
          column
          style={col(16)}
        >
          <Bubble
            align="start"
            contentStyle={{
              borderRadius: theme.radius,
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              color: theme.success,
              borderColor: 'rgba(34, 197, 94, 0.35)',
            }}
          >
            Custom semantic color
          </Bubble>
        </Section>
      </View>
    </StoryFrame>
  );
}

const LONG =
  "A longer message wraps naturally within the bubble's available width, preserving the shared text scale, comfortable reading rhythm, and leading alignment.";
