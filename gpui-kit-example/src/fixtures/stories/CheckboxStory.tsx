import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Checkbox, TextView } from '@react-native-gpui/gpui-kit';
import {
  Section,
  StoryFrame,
  StoryToolbar,
  theme,
  type StorySize,
} from './StoryKit';

/** `crates/story/src/stories/checkbox_story.rs` of gpui-component v0.9.1. */
const hint = { fontSize: 12, lineHeight: 19.4, color: theme.mutedForeground };

export function CheckboxStory({ size = 'medium' }: { size?: StorySize }) {
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(true);
  const [check3, setCheck3] = useState(false);
  const [check4, setCheck4] = useState(false);
  const [check5, setCheck5] = useState(false);
  const [check6, setCheck6] = useState(false);
  return (
    <StoryFrame testID="story-checkbox">
      <View style={{ flex: 1, justifyContent: 'flex-start', gap: 12 }}>
        <StoryToolbar size={size} />
        <Section
          title="Default"
          description="Checked and unchecked options can be mixed freely."
        >
          <Checkbox
            size={size}
            checked={check1}
            label="Product updates"
            onChange={e => setCheck1(e.nativeEvent.state)}
          />
          <Checkbox
            size={size}
            checked={check2}
            label="Remember this device"
            onChange={e => setCheck2(e.nativeEvent.state)}
          />
        </Section>
        <Section
          title="Without label"
          description="The label can be supplied by surrounding content."
        >
          <Checkbox
            size={size}
            checked={check3}
            onChange={e => setCheck3(e.nativeEvent.state)}
          />
        </Section>
        <Section
          title="Disabled"
          description="Both checked and unchecked values remain visible."
          style={{ width: 512 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24 }}>
            <Checkbox size={size} label="Checked" checked disabled />
            <Checkbox size={size} label="Unchecked" checked={false} disabled />
          </View>
        </Section>
        <Section
          title="Labels"
          description="Labels can wrap and include supporting content."
          column
          style={{ width: 512, gap: 20 }}
        >
          <Checkbox
            size={size}
            style={{ width: 320 }}
            kitStyle={{ width: 320 }}
            checked={check4}
            label="Automatic updates"
            onChange={e => setCheck4(e.nativeEvent.state)}
          >
            <Text style={hint}>
              Download updates when the application is idle.
            </Text>
          </Checkbox>
          <Checkbox
            size={size}
            style={{ width: 320 }}
            kitStyle={{ width: 320 }}
            checked={check6}
            label="Notify me when a new device signs in to my account"
            onChange={e => setCheck6(e.nativeEvent.state)}
          />
          <Checkbox
            size={size}
            style={{ width: 320 }}
            kitStyle={{ width: 320 }}
            checked={check5}
            label="Accept the terms"
            onChange={e => setCheck5(e.nativeEvent.state)}
          >
            <TextView
              source="Read the [terms of service](https://github.com) before continuing."
              kitStyle={{ fontSize: 12, color: theme.mutedForeground }}
            />
          </Checkbox>
        </Section>
      </View>
    </StoryFrame>
  );
}
