import React from 'react';
import { View } from 'react-native';
import { Calendar } from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame } from './StoryKit';

/** `crates/story/src/stories/calendar_story.rs` of gpui-component v0.9.1. */
export function CalendarStory() {
  return (
    <StoryFrame testID="story-calendar">
      <View style={{ gap: 12 }}>
        <Section
          title="Single month"
          description="Single-date selection."
          style={{ width: 512 }}
        >
          <Calendar />
        </Section>
        <Section
          title="Multiple months"
          description="Three months shown together."
          style={{ width: 512 }}
        >
          <Calendar numberOfMonths={3} />
        </Section>
        <Section
          title="Disabled dates"
          description="Recurring unavailable weekdays."
          style={{ width: 512 }}
        >
          <Calendar disabledWeekdays={[0, 3, 6]} />
        </Section>
      </View>
    </StoryFrame>
  );
}
