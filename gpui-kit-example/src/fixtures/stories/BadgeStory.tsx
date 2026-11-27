import React from 'react';
import { View } from 'react-native';
import { Avatar, Badge, Icon } from '@react-native-gpui/gpui-kit';
import {
  Section,
  StoryFrame,
  StoryToolbar,
  theme,
  type StorySize,
} from './StoryKit';

/** `crates/story/src/stories/badge_story.rs` of gpui-component v0.9.1. */
const A5518 = 'https://avatars.githubusercontent.com/u/5518?v=4';
const A28998859 = 'https://avatars.githubusercontent.com/u/28998859?v=4';
const A20092316 = 'https://avatars.githubusercontent.com/u/20092316?v=4';
const A22312482 = 'https://avatars.githubusercontent.com/u/22312482?v=4';
const A150917089 = 'https://avatars.githubusercontent.com/u/150917089?v=4';

export function BadgeStory({ size = 'medium' }: { size?: StorySize }) {
  return (
    <StoryFrame testID="story-badge">
      <View style={{ gap: 12 }}>
        <StoryToolbar size={size} />
        <Section title="Icon" style={{ width: 512 }}>
          <Badge size={size} count={3}>
            <Icon name="bell" size={size} />
          </Badge>
          <Badge size={size} count={103}>
            <Icon name="inbox" size={size} />
          </Badge>
        </Section>
        <Section title="Count" style={{ width: 512 }}>
          <Badge size={size} count={3}>
            <Avatar size={size} src={A5518} />
          </Badge>
          <Badge size={size} count={103}>
            <Avatar size={size} src={A28998859} />
          </Badge>
        </Section>
        <Section title="Badge icon" style={{ width: 512 }}>
          <Badge size={size} icon="check" color={theme.cyan}>
            <Avatar size={size} src={A5518} />
          </Badge>
          <Badge size={size} icon="star" color={theme.yellow}>
            <Avatar size={size} src={A20092316} />
          </Badge>
        </Section>
        <Section title="Dot" style={{ width: 480 }}>
          <Badge size={size} dot count={1}>
            <Avatar size={size} src={A5518} />
          </Badge>
        </Section>
        <Section title="Color" style={{ width: 512 }}>
          <Badge size={size} count={3} color={theme.blue}>
            <Avatar size={size} src={A5518} />
          </Badge>
          <Badge size={size} dot color={theme.green} count={1}>
            <Avatar size={size} src={A5518} />
          </Badge>
        </Section>
        <Section title="Nested" style={{ width: 512 }}>
          <Badge count={212} size="large">
            <Badge size={size} icon="check" color={theme.cyan}>
              <Avatar size={size} src={A5518} />
            </Badge>
          </Badge>
          <Badge count={2} color={theme.green} size="large">
            <Badge size={size} icon="star" color={theme.yellow}>
              <Avatar size="large" src={A20092316} />
            </Badge>
          </Badge>
          <Badge size={size} count={3} color={theme.green}>
            <Badge size={size} icon="asterisk" color={theme.green}>
              <Avatar size={size} src={A22312482} />
            </Badge>
          </Badge>
          <Badge size={size} dot>
            <Badge size={size} icon="sun" color={theme.red}>
              <Avatar size="small" src={A150917089} />
            </Badge>
          </Badge>
        </Section>
      </View>
    </StoryFrame>
  );
}
