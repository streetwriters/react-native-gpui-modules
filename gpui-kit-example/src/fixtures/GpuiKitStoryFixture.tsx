import React from 'react';
import { Text, View } from 'react-native';
import { stories } from './stories';
import { StoryLayoutContext } from './stories/StoryKit';

/**
 * Renders the React Native port of one official gpui-component story, at the
 * capture size or, with `page`, filling the window as in the gallery.
 */
export function GpuiKitStoryFixture({
  scenario,
  page,
}: {
  scenario?: string;
  page?: boolean;
}) {
  const Story = scenario ? stories[scenario] : undefined;
  if (!Story) return <Text>unknown story {scenario}</Text>;
  if (!page) return <Story />;
  return (
    <StoryLayoutContext.Provider value="page">
      <View style={{ flex: 1 }}>
        <Story />
      </View>
    </StoryLayoutContext.Provider>
  );
}
