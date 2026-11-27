import React, { useState } from 'react';
import { View } from 'react-native';
import { Rating } from '@react-native-gpui/gpui-kit';
import {
  Section,
  StoryFrame,
  StoryToolbar,
  theme,
  type StorySize,
} from './StoryKit';

/** `crates/story/src/stories/rating_story.rs` of gpui-component v0.9.1. */
export function RatingStory({ size = 'medium' }: { size?: StorySize }) {
  const [value, setValue] = useState(3);
  return (
    <StoryFrame testID="story-rating">
      <View style={{ width: '100%', gap: 12 }}>
        <StoryToolbar size={size} />
        <Section
          title="Default"
          description="Select a value directly from the rating."
          style={{ width: 512 }}
        >
          <View
            style={{
              width: '100%',
              gap: 12,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Rating
              testID="rating-1"
              size={size}
              value={value}
              max={5}
              onChange={event => setValue(event.nativeEvent.value)}
            />
          </View>
        </Section>
        <Section title="Disabled" style={{ width: 480 }}>
          <Rating size={size} value={2} color={theme.green} max={5} disabled />
        </Section>
        <Section title="Color" style={{ width: 480 }}>
          <Rating size={size} value={value} color={theme.green} max={5} />
        </Section>
      </View>
    </StoryFrame>
  );
}
