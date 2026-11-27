import React from 'react';
import { Text, View } from 'react-native';
import { Avatar, Button, HoverCard, Link } from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame, T, theme } from './StoryKit';

/** `crates/story/src/stories/hover_card_story.rs` of gpui-component v0.9.1. */
const sm = { fontSize: 14, lineHeight: 22.65, color: theme.foreground };

function Positioned({
  anchor,
  label,
}: {
  anchor:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';
  label: string;
}) {
  return (
    <HoverCard
      anchor={anchor}
      content={<Text style={sm}>Positioned at {label}</Text>}
    >
      <Button label={label} outline />
    </HoverCard>
  );
}

export function HoverCardStory() {
  return (
    <StoryFrame testID="story-hover_card">
      <View style={{ width: '100%', alignItems: 'center', gap: 24 }}>
        <Section
          title="Default"
          description="Shows supporting information without changing the current view."
          style={{ width: 520 }}
        >
          <HoverCard
            content={
              <View style={{ width: 450, gap: 4 }}>
                <Text style={[sm, { fontWeight: '600' }]}>
                  This is a hover card
                </Text>
                <Text style={[sm, { color: theme.mutedForeground }]}>
                  You can display rich content when hovering over a trigger
                  element.
                </Text>
              </View>
            }
          >
            <Text style={[sm, { color: theme.primary }]}>Hover over me</Text>
          </HoverCard>
        </Section>
        <Section
          title="Rich Content"
          description="Cards can contain avatars, typography, and structured details."
          style={{ width: 520 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <T>Hover over </T>
            <HoverCard
              content={
                <View
                  style={{
                    width: 320,
                    flexDirection: 'row',
                    gap: 12,
                    alignItems: 'flex-start',
                  }}
                >
                  <Avatar src="https://avatars.githubusercontent.com/u/5518?s=64" />
                  <View style={{ gap: 4 }}>
                    <T style={{ fontWeight: '600', lineHeight: 16 }}>
                      Jason Lee
                    </T>
                    <Text
                      style={{
                        fontSize: 14,
                        lineHeight: 14,
                        color: theme.blue,
                      }}
                    >
                      @huacnlee
                    </Text>
                    <T style={{ marginTop: 4, lineHeight: 16 }}>
                      The author of GPUI Component.
                    </T>
                  </View>
                </View>
              }
            >
              <Link text="@huacnlee" />
            </HoverCard>
            <T> to see their profile</T>
          </View>
        </Section>
        <Section
          title="Timing"
          description="Open and close delays can match the interaction context."
          style={{ width: 520 }}
        >
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <HoverCard
              openDelay={200}
              closeDelay={100}
              content={
                <Text style={sm}>This hover card opens after 200ms</Text>
              }
            >
              <Button label="Fast Open (200ms)" outline />
            </HoverCard>
            <HoverCard
              openDelay={1000}
              closeDelay={500}
              content={
                <Text style={sm}>This hover card opens after 1000ms</Text>
              }
            >
              <Button label="Slow Open (1000ms)" outline />
            </HoverCard>
          </View>
        </Section>
        <Section
          title="Position"
          description="Content can anchor to each side of its trigger."
          style={{ width: 640 }}
        >
          <View
            style={{ gap: 16, alignItems: 'center', justifyContent: 'center' }}
          >
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <Positioned anchor="top-left" label="Top Left" />
              <Positioned anchor="top-center" label="Top Center" />
              <Positioned anchor="top-right" label="Top Right" />
            </View>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <Positioned anchor="bottom-left" label="Bottom Left" />
              <Positioned anchor="bottom-center" label="Bottom Center" />
              <Positioned anchor="bottom-right" label="Bottom Right" />
            </View>
          </View>
        </Section>
      </View>
    </StoryFrame>
  );
}
