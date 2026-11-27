import React from 'react';
import { View } from 'react-native';
import { Label, Separator } from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame, T, theme } from './StoryKit';

/** `crates/story/src/stories/separator_story.rs` of gpui-component v0.9.1. */
const DESCRIPTION =
  'GPUI Component is a Rust GUI components for building fantastic cross-platform desktop application by using GPUI.';

export function SeparatorStory() {
  return (
    <StoryFrame testID="story-separator">
      <View style={{ gap: 24 }}>
        <Section
          title="Horizontal"
          description="Separates stacked content, with optional labels and dashed rules."
          style={{ width: 520 }}
        >
          <View style={{ gap: 16, width: '100%', paddingTop: 16 }}>
            <Separator orientation="horizontal" />
            <Separator orientation="horizontal" label="With Label" />
            <Separator orientation="horizontal" dashed />
            <Separator
              orientation="horizontal"
              dashed
              label="Dashed With Label"
            />
          </View>
        </Section>
        <Section
          title="Vertical"
          description="Separates actions or values arranged in a row."
          style={{ width: 520 }}
        >
          <View style={{ flexDirection: 'row', gap: 16, height: 100 }}>
            <Separator orientation="vertical" />
            <Separator orientation="vertical" label="Solid" />
            <Separator orientation="vertical" dashed />
            <Separator orientation="vertical" dashed label="Dashed" />
          </View>
        </Section>
        <Section
          title="In Context"
          description="Horizontal and vertical rules can structure compact content."
          style={{ width: 520 }}
        >
          {/* Taffy sizes this wrapped-row item at its max-content width (the
              unwrapped description), overflowing the 520pt row; Yoga would
              wrap it at 520. */}
          <View style={{ gap: 16, width: 748 }}>
            <View style={{ gap: 8 }}>
              <T>Hello GPUI Component</T>
              <Label
                text={DESCRIPTION}
                kitStyle={{ color: theme.mutedForeground, fontSize: 14 }}
              />
            </View>
            <Separator orientation="horizontal" />
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <T>Docs</T>
              <Separator orientation="vertical" dashed />
              <T>GitHub</T>
              <Separator orientation="vertical" dashed />
              <T>Source</T>
            </View>
          </View>
        </Section>
      </View>
    </StoryFrame>
  );
}
