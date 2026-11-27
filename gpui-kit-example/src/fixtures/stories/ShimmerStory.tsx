import React, { useState } from 'react';
import { View } from 'react-native';
import {
  Attachment,
  Button,
  Marker,
  ShimmerText,
} from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame, theme } from './StoryKit';

/** `crates/story/src/stories/shimmer_story.rs` of gpui-component v0.9.1. */
const shared = {
  duration: 3000,
  highlightColor: theme.primary,
  spread: 0.42,
};

function S({
  title,
  description,
  gap = 8,
  children,
}: {
  title: string;
  description: string;
  gap?: number;
  children: React.ReactNode;
}) {
  return (
    <Section
      title={title}
      description={description}
      column
      style={{ maxWidth: 680, gap, alignItems: 'center' }}
    >
      {children}
    </Section>
  );
}

export function ShimmerStory() {
  const [replay, setReplay] = useState(0);
  return (
    <StoryFrame testID="story-shimmer">
      <View style={{ gap: 16 }}>
        <S
          title="Default"
          description="A readable, theme-aware highlight crosses the existing text."
        >
          <ShimmerText text="Thinking…" />
          <ShimmerText
            text="Searching the current project…"
            kitStyle={{ color: theme.mutedForeground }}
          />
        </S>
        <S
          title="Color"
          description="Highlight colors come from semantic theme roles."
        >
          <ShimmerText text="Automatic theme-aware highlight" />
          <ShimmerText
            text="Primary highlight"
            highlightColor={theme.primary}
          />
          <ShimmerText
            text="Success highlight"
            highlightColor={theme.success}
          />
        </S>
        <S
          title="Duration"
          description="Each duration controls one complete sweep."
        >
          <ShimmerText text="Quick sweep · 1 second" duration={1000} />
          <ShimmerText text="Default sweep · 2 seconds" duration={2000} />
          <ShimmerText text="Relaxed sweep · 4 seconds" duration={4000} />
        </S>
        <S
          title="Spread"
          description="Spread is a relative or absolute highlight half-width."
        >
          <ShimmerText text="Narrow highlight · 0.12" spread={0.12} />
          <ShimmerText text="Default highlight · 0.30" spread={0.3} />
          <ShimmerText text="Wide highlight · 0.60" spread={0.6} />
          <ShimmerText text="Fixed highlight · 48px" spreadPixels={48} />
        </S>
        <S
          title="Direction"
          description="Reverse changes movement without replacing text or layout."
        >
          <ShimmerText text="Forward · left to right" />
          <ShimmerText text="Reverse · right to left" reverse />
        </S>
        <S
          title="Play once"
          description="A stable explicit identity controls one-shot playback and replay."
          gap={12}
        >
          <ShimmerText
            key={replay}
            text="A single sweep completes and then stops"
            once
          />
          <Button label="Replay" onPress={() => setReplay(r => r + 1)} />
        </S>
        <S
          title="Reusable style"
          description="One ShimmerStyle can be shared by independent status labels."
        >
          <ShimmerText text="Analyzing source files…" {...shared} />
          <ShimmerText text="Preparing a response…" {...shared} />
        </S>
        <S
          title="Typography and wrapping"
          description="Text inherits typography, color, and the surrounding layout."
          gap={12}
        >
          <ShimmerText
            text="Compact supporting status"
            kitStyle={{ fontSize: 14, color: theme.mutedForeground }}
          />
          <ShimmerText
            text="Prominent status"
            kitStyle={{ fontSize: 18, fontWeight: 600 }}
          />
          <View style={{ width: 384, maxWidth: '100%', minWidth: 0 }}>
            <ShimmerText text="Long loading messages remain readable as the surrounding region becomes narrower." />
          </View>
        </S>
        <S
          title="Marker"
          description="Marker applies the same reusable style to its text content."
        >
          <Marker
            loading
            loadingStyle="shimmer"
            shimmerDuration={shared.duration}
            shimmerHighlightColor={shared.highlightColor}
            shimmerSpread={shared.spread}
            text="Generating an answer…"
          />
        </S>
        <Section
          title="Attachment"
          description="An uploading or processing title can share its loading style."
          style={{ maxWidth: 680 }}
        >
          <Attachment
            status="processing"
            title="meeting-transcript.pdf"
            description="Extracting key discussion points"
          />
        </Section>
      </View>
    </StoryFrame>
  );
}
