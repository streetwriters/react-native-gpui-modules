import React from 'react';
import { View } from 'react-native';
import { Spinner } from '@react-native-gpui/gpui-kit';
import {
  Section,
  StoryFrame,
  StoryToolbar,
  theme,
  type StorySize,
} from './StoryKit';

/** `crates/story/src/stories/spinner_story.rs` of gpui-component v0.9.1. */
export function SpinnerStory({ size = 'medium' }: { size?: StorySize }) {
  const row = { columnGap: 8 };
  return (
    <StoryFrame testID="story-spinner">
      <View style={{ width: '100%', gap: 12 }}>
        <StoryToolbar size={size} />
        <Section
          title="Default"
          description="An indeterminate loading indicator."
          style={row}
        >
          <Spinner size={size} />
        </Section>
        <Section
          title="Color"
          description="Use a color that suits the surrounding status."
          style={row}
        >
          <Spinner size={size} color={theme.blue} />
          <Spinner size={size} color={theme.green} />
        </Section>
        <Section
          title="Custom size"
          description="A fixed pixel size is also supported."
          style={row}
        >
          <Spinner customSize={64} />
        </Section>
        <Section
          title="Icon"
          description="Replace the default spinner glyph."
          style={row}
        >
          <Spinner size={size} icon="loader-circle" />
          <Spinner size={size} icon="loader-circle" color={theme.cyan} />
        </Section>
        <Section
          title="Easing"
          description="Customize the rotation timing curve."
          style={row}
        >
          <Spinner size={size} icon="loader" easing="linear" />
          <Spinner size={size} icon="loader" easing="bounce" />
          <Spinner size={size} icon="loader" easing="ease-out-quint" />
        </Section>
      </View>
    </StoryFrame>
  );
}
