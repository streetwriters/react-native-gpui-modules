import React from 'react';
import { View } from 'react-native';
import { Kbd } from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame } from './StoryKit';

/** `crates/story/src/stories/kbd_story.rs` of gpui-component v0.9.1. */
const KEYS = [
  'cmd-shift-p',
  'cmd-ctrl-t',
  'cmd--',
  'cmd-+',
  'escape',
  'backspace',
  '/',
  'enter',
];

const row = {
  width: '100%',
  flexDirection: 'row',
  justifyContent: 'center',
  gap: 8,
  flexWrap: 'wrap',
} as const;

export function KbdStory() {
  return (
    <StoryFrame testID="story-kbd">
      <View style={{ width: '100%', alignItems: 'center', gap: 24 }}>
        <Section
          title="Default"
          description="Displays single keys and multi-key shortcuts."
          style={{ width: 560 }}
        >
          <View style={row}>
            {KEYS.map(key => (
              <Kbd key={key} keystroke={key} />
            ))}
          </View>
        </Section>
        <Section
          title="Outlined"
          description="An outlined treatment adds emphasis on dense surfaces."
          style={{ width: 560 }}
        >
          <View style={row}>
            {['cmd-shift-p', 'cmd-ctrl-t', 'enter'].map(key => (
              <Kbd key={key} keystroke={key} outline />
            ))}
          </View>
        </Section>
      </View>
    </StoryFrame>
  );
}
