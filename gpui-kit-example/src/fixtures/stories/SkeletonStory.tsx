import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame, theme } from './StoryKit';

/** `crates/story/src/stories/skeleton_story.rs` of gpui-component v0.9.1. */
export function SkeletonStory() {
  return (
    <StoryFrame testID="story-skeleton">
      <View style={{ width: '100%', alignItems: 'center', gap: 24 }}>
        <Section
          title="Text"
          description="Represents an avatar and text while profile content loads."
          style={{ width: 360 }}
        >
          <View style={{ width: '100%', flexDirection: 'row', gap: 12 }}>
            <Skeleton
              style={{ width: 48, height: 48 }}
              kitStyle={{ borderRadius: 9999 }}
            />
            <View style={{ flex: 1, gap: 8 }}>
              <Skeleton
                style={{ width: '100%', height: 16 }}
                kitStyle={{ borderRadius: theme.radius }}
              />
              <Skeleton
                style={{ width: '66.6667%', height: 16 }}
                kitStyle={{ borderRadius: theme.radius }}
              />
            </View>
          </View>
        </Section>
        <Section
          title="Card"
          description="Combines media and text placeholders in a content card."
          style={{ width: 360 }}
        >
          <View style={{ width: '100%', gap: 8 }}>
            <Skeleton
              style={{ width: '100%', height: 180 }}
              kitStyle={{ borderRadius: theme.radius }}
            />
            <View style={{ gap: 8 }}>
              <Skeleton
                style={{ width: '100%', height: 16 }}
                kitStyle={{ borderRadius: theme.radius }}
              />
              <Skeleton
                style={{ width: 200, height: 16 }}
                kitStyle={{ borderRadius: theme.radius }}
              />
            </View>
          </View>
        </Section>
      </View>
    </StoryFrame>
  );
}
