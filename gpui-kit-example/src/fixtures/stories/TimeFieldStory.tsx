import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { TimeField } from '@react-native-gpui/gpui-kit';
import {
  Section,
  StoryFrame,
  StoryToolbar,
  theme,
  type StorySize,
} from './StoryKit';

/** `crates/story/src/stories/time_field_story.rs` of gpui-component v0.9.1. */
const START = '09:30:00';

export function TimeFieldStory({ size = 'medium' }: { size?: StorySize }) {
  const [value, setValue] = useState(START);
  return (
    <StoryFrame testID="story-time_field">
      <View style={{ gap: 12 }}>
        <StoryToolbar size={size} />
        <Section
          title="Default"
          description="Up/Down change the selected segment; digits type it and move to the next."
          column
          style={{ gap: 12 }}
        >
          <TimeField
            defaultTime={START}
            size={size}
            onChange={e => setValue(e.nativeEvent.time)}
          />
          <Text
            style={{
              fontSize: 14,
              lineHeight: 22.65,
              color: theme.mutedForeground,
            }}
          >
            {`Value: ${value}`}
          </Text>
        </Section>
        <Section
          title="With seconds"
          description="Set the precision to edit seconds as well."
        >
          <TimeField defaultTime={START} precision="second" size={size} />
        </Section>
        <Section
          title="12-hour clock"
          description="An AM/PM segment follows the time; type a or p to set it."
        >
          <TimeField defaultTime={START} hourCycle="h12" size={size} />
        </Section>
        <Section title="Disabled">
          <TimeField defaultTime={START} size={size} disabled />
        </Section>
        <Section
          title="Invalid"
          description="Show a validation result from the owner."
        >
          <TimeField defaultTime={START} size={size} invalid />
        </Section>
      </View>
    </StoryFrame>
  );
}
