import React from 'react';
import { View } from 'react-native';
import {
  Button,
  Link,
  Marker,
  ShimmerText,
  Spinner,
} from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame, theme } from './StoryKit';

/** `crates/story/src/stories/marker_story.rs` of gpui-component v0.9.1. */
const col = (gap: number) => ({
  maxWidth: 680,
  gap,
  alignItems: 'stretch' as const,
});

export function MarkerStory() {
  return (
    <StoryFrame testID="story-marker">
      <View style={{ width: '100%', gap: 16 }}>
        <Section
          title="Variants"
          description="Choose a plain row, a centered separator, or a bordered boundary."
          column
          style={col(16)}
        >
          <Marker text="Plain status update" />
          <Marker variant="separator" text="Earlier messages" />
          <Marker variant="border" text="Unread messages" />
        </Section>
        <Section
          title="Alignment"
          description="Center a system notice or trail a delivery state; Separator centers by default."
          column
          style={col(12)}
        >
          <Marker text="Leading by default" />
          <Marker
            alignment="center"
            icon="info"
            text="Messages are end-to-end encrypted"
          />
          <Marker alignment="center" text={STOPPED} />
          <Marker
            alignment="center"
            text="The message could not be sent."
            after={<Button variant="text" size="small" label="Retry" />}
          />
          <Marker alignment="end" text="Delivered" />
          <Marker variant="separator" alignment="end" text="Today" />
        </Section>
        <Section
          title="Status"
          description="Compose icons, spinners, and labels without a fixed status model."
          column
          style={col(12)}
        >
          <Marker
            kitStyle={{ color: theme.success }}
            icon="circle-check"
            text="Online"
          />
          <Marker
            iconSlot={<Spinner size="xsmall" />}
            text="Alice is typing…"
          />
          <Marker icon="bell" text="Unread notifications" />
          <Marker
            kitStyle={{ color: theme.danger }}
            icon="info"
            text="Message could not be delivered"
          />
        </Section>
        <Section
          title="With icon"
          description="Icons can communicate sender activity, notices, and saved items."
          column
          style={col(12)}
        >
          <Marker icon="info" text="Conversation details updated" />
          <Marker icon="star" text="Pinned for your team" />
          <Marker text="No icon is required" />
        </Section>
        <Section
          title="Loading styles"
          description="Choose a spinner or a sweeping, ChatGPT-style text shimmer."
          column
          style={col(16)}
        >
          <Marker
            loading
            loadingStyle="spinner"
            text="shadcn/ui · Loading messages…"
          />
          <Marker loading loadingStyle="shimmer" text="ChatGPT · Thinking" />
          <Marker
            loading
            loadingStyle="shimmer"
            icon="info"
            text="正在探索 4 个文件…"
          />
          <Marker
            loading
            loadingStyle="shimmer"
            shimmerDuration={3000}
            shimmerHighlightColor={theme.primary}
            shimmerSpread={0.45}
            shimmerReverse
            text="Custom color, width, and direction"
          />
          <ShimmerText
            text="Reusable shimmer without a Marker"
            kitStyle={{ color: theme.mutedForeground }}
          />
        </Section>
        <Section
          title="Shimmer settings"
          description="Customize timing, highlight width, direction, and playback independently."
          column
          style={col(12)}
        >
          <Marker
            loading
            loadingStyle="shimmer"
            shimmerDuration={900}
            text="Faster highlight sweep"
          />
          <Marker
            loading
            loadingStyle="shimmer"
            shimmerSpread={0.55}
            text="Wider highlight band"
          />
          <Marker
            loading
            loadingStyle="shimmer"
            shimmerReverse
            text="Right-to-left sweep"
          />
          <Marker
            loading
            loadingStyle="shimmer"
            shimmerHighlightColor={theme.primary}
            text="Semantic primary highlight"
          />
          <Marker
            loading
            loadingStyle="shimmer"
            shimmerOnce
            text="Play the highlight once"
          />
          <Marker
            loading={false}
            loadingStyle="shimmer"
            text="Loading is disabled"
          />
        </Section>
        <Section
          title="Separator"
          description="Place a conversation boundary between two semantic lines."
          column
          style={col(16)}
        >
          <Marker variant="separator" text="Today" />
          <Marker
            variant="separator"
            separatorStyle={{ backgroundColor: 'rgba(23, 23, 23, 0.35)' }}
            icon="star"
            text="Pinned messages"
          />
        </Section>
        <Section
          title="Border"
          description="Use a bottom edge for an unread or section boundary."
          column
          style={col(12)}
        >
          <Marker variant="border" icon="info" text="3 unread messages" />
          <Marker
            variant="border"
            kitStyle={{ borderColor: 'rgba(23, 23, 23, 0.4)' }}
            text="New replies since your last visit"
          />
        </Section>
        <Section
          title="Links and buttons"
          description="Keep external destinations and in-app commands semantically distinct."
          column
          style={col(12)}
        >
          <Marker icon="info">
            <Link
              href="https://gpui-kit.com/"
              text="Open the component documentation"
            />
          </Marker>
          <Marker
            icon="star"
            text="A saved draft is ready"
            after={<Button variant="ghost" size="small" label="Open draft" />}
          />
        </Section>
        <Section
          title="Custom style"
          description="Caller refinements can replace spacing, color, and surface."
          style={{ maxWidth: 680 }}
        >
          <Marker
            kitStyle={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: theme.radius,
              backgroundColor: '#f5f5f5',
              color: theme.foreground,
            }}
            icon="star"
            text="Pinned message"
          />
        </Section>
      </View>
    </StoryFrame>
  );
}

const STOPPED =
  'The answer was stopped before it finished. Edit the question or ask again, and a long notice wraps around its center.';
