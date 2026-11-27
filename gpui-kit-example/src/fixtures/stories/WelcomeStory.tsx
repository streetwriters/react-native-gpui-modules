import React from 'react';
import { TextView } from '@react-native-gpui/gpui-kit';
import { README } from './data/readme';
import { StoryFrame } from './StoryKit';

/** `crates/story/src/stories/welcome_story.rs` of gpui-component v0.9.1. */
export function WelcomeStory() {
  return (
    <StoryFrame fill testID="story-welcome" paddings={0}>
      <TextView
        source={README}
        scrollable
        selectable
        style={{ width: '100%', height: '100%' }}
        kitStyle={{ paddingHorizontal: 16 }}
      />
    </StoryFrame>
  );
}
