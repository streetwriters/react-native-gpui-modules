import React from 'react';
import { View } from 'react-native';
import { Avatar, AvatarGroup } from '@react-native-gpui/gpui-kit';
import {
  Section,
  StoryFrame,
  StoryToolbar,
  theme,
  type StorySize,
} from './StoryKit';

/** `crates/story/src/stories/avatar_story.rs` of gpui-component v0.9.1. */
export const AVATARS = [
  'https://avatars.githubusercontent.com/u/5518?v=4',
  'https://avatars.githubusercontent.com/u/28998859?v=4',
  'https://avatars.githubusercontent.com/u/20092316?v=4',
  'https://avatars.githubusercontent.com/u/22312482?v=4',
  'https://avatars.githubusercontent.com/u/150917089?v=4',
  'https://avatars.githubusercontent.com/u/20337280?v=4',
  'https://avatars.githubusercontent.com/u/629429?v=4',
  'https://avatars.githubusercontent.com/u/583231?v=4',
  'https://avatars.githubusercontent.com/u/1264109?v=4',
  'https://avatars.githubusercontent.com/u/2936367?v=4',
  'https://avatars.githubusercontent.com/u/1253486?v=4',
];

export function AvatarStory({ size = 'medium' }: { size?: StorySize }) {
  return (
    <StoryFrame testID="story-avatar">
      <View style={{ gap: 12 }}>
        <StoryToolbar size={size} />
        <Section
          title="Image"
          description="Use an image when one is available."
          style={{ width: 512 }}
        >
          <Avatar name="Jason Lee" src={AVATARS[0]} size={size} />
          <Avatar src={AVATARS[1]} size={size} />
        </Section>
        <Section
          title="Fallback"
          description="Show initials or an icon when no image is available."
          style={{ width: 512 }}
        >
          <Avatar name="Jason Lee" size={size} />
          <Avatar size={size} />
          <Avatar placeholder="building-2" size={size} />
        </Section>
        <Section
          title="Group"
          description="Groups can limit visible avatars and show overflow."
          column
          style={{ width: 512, gap: 20 }}
        >
          <AvatarGroup size={size}>
            {AVATARS.slice(0, 6).map(src => (
              <Avatar key={src} src={src} />
            ))}
          </AvatarGroup>
          <AvatarGroup size={size} limit={5} ellipsis>
            {AVATARS.map(src => (
              <Avatar key={src} src={src} />
            ))}
          </AvatarGroup>
        </Section>
        <Section
          title="Custom shape"
          description="Set an explicit size and corner radius."
        >
          <Avatar
            src={AVATARS[0]}
            customSize={100}
            kitStyle={{ borderRadius: 20 }}
          />
        </Section>
        <Section
          title="Custom style"
          description="Add borders and shadows to the image."
        >
          <Avatar
            src={AVATARS[2]}
            customSize={100}
            kitStyle={{
              borderWidth: 3,
              borderColor: theme.foreground,
              boxShadow: 'sm',
            }}
          />
        </Section>
      </View>
    </StoryFrame>
  );
}
