import React from 'react';
import { Image, View } from 'react-native';
import { Section, StoryFrame, theme } from './StoryKit';

/** `crates/story/src/stories/image_story.rs` of gpui-component v0.9.1. */
const SDK_SVG = 'https://pub.lbkrs.com/files/202503/vEnnmgUM6bo362ya/sdk.svg';

export function ImageStory() {
  return (
    <StoryFrame testID="story-image">
      <View style={{ flex: 1, alignItems: 'center', gap: 24 }}>
        <Section
          title="Remote SVG"
          description="Loads and renders an SVG from a remote URL."
          style={{ width: 480 }}
        >
          <View
            style={{
              width: '100%',
              height: 180,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: theme.radiusLg,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <Image
              source={{ uri: SDK_SVG }}
              style={{ height: 96, aspectRatio: 1 }}
              resizeMode="contain"
            />
          </View>
        </Section>
      </View>
    </StoryFrame>
  );
}
