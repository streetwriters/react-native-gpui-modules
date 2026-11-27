import React, { useState } from 'react';
import { View } from 'react-native';
import { VirtualList } from '@react-native-gpui/gpui-kit';
import { StoryFrame, StoryToolbar, theme } from './StoryKit';

/** `crates/story/src/stories/scrollbar_story.rs` of gpui-component v0.9.1. */
const DATASETS: [string, number][] = [
  ['Standard', 5000],
  ['Wide', 100],
  ['Stress', 500000],
  ['Short', 5],
];

export function ScrollbarStory() {
  const [mode, setMode] = useState(0);
  return (
    <StoryFrame fill testID="story-scrollbar">
      <View style={{ flex: 1, gap: 16 }}>
        <StoryToolbar
          items={[
            {
              label: `Dataset: ${DATASETS[mode][0]}`,
              menu: DATASETS.map(([label], index) => ({
                label,
                checked: mode === index,
                onSelect: () => setMode(index),
              })),
            },
          ]}
        />
        <View style={{ flex: 1, borderWidth: 1, borderColor: theme.border }}>
          <VirtualList
            style={{ width: '100%', height: '100%' }}
            itemSize={50}
            scrollbars="vertical"
            kitStyle={{ paddingVertical: 4, paddingHorizontal: 12 }}
            template={{
              count: DATASETS[mode][1],
              text: 'Item {row}',
              rowStyle: { flexDirection: 'column', paddingTop: 4, height: 50 },
              cellStyle: {
                padding: 8,
                fontSize: 14,
                backgroundColor: theme.secondary,
              },
            }}
          />
        </View>
      </View>
    </StoryFrame>
  );
}
