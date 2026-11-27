import React, { useState } from 'react';
import { View } from 'react-native';
import { Breadcrumb } from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame, T } from './StoryKit';

/** `crates/story/src/stories/breadcrumb_story.rs` of gpui-component v0.9.1. */
export function BreadcrumbStory() {
  const [clicked, setClicked] = useState<string | null>(null);
  const item = (label: string) => ({
    label,
    onPress: () => setClicked(label),
  });
  return (
    <StoryFrame testID="story-breadcrumb">
      <View style={{ gap: 24 }}>
        <Section
          title="Default"
          description="Shows the current location in a hierarchy."
          style={{ width: 480 }}
        >
          <Breadcrumb
            items={[
              { label: 'Home' },
              { label: 'Documents' },
              { label: 'Projects' },
            ]}
          />
        </Section>
        <Section
          title="Interactive"
          description="Earlier levels can respond to navigation clicks."
          style={{ width: 480 }}
        >
          <View style={{ gap: 16, alignItems: 'center' }}>
            <Breadcrumb
              items={[
                { label: 'Home' },
                item('Documents'),
                item('Projects'),
                item('Current'),
              ]}
            />
            {clicked !== null && <T>{`Selected: ${clicked}`}</T>}
          </View>
        </Section>
      </View>
    </StoryFrame>
  );
}
