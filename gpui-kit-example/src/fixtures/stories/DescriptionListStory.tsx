import React, { useState } from 'react';
import { View } from 'react-native';
import { DescriptionList, TextView } from '@react-native-gpui/gpui-kit';
import { StoryFrame, StoryToolbar, type StorySize } from './StoryKit';

/** `crates/story/src/stories/description_list_story.rs` of gpui-component v0.9.1. */
const ITEMS: [string, string, number][] = [
  ['Name', 'GPUI Component', 1],
  [
    'Description',
    'UI components for building fantastic desktop application by using GPUI.\n\n Contains a lot of useful UI components, such as **Button**, **Input**, **Table**, **List**, **Select**, **DatePicker** ... \n\n You can easily create your native desktop application by using GPUI Component.\n                ',
    3,
  ],
  ['Version', '0.1.0', 1],
  ['License', 'Apache-2.0', 1],
  ['Author', 'Longbridge', 1],
  ['--', '--', 1],
  ['Repository', 'https://github.com/longbridge/gpui-kit', 2],
  ['Category', 'UI, Desktop, Framework', 1],
  ['This is a long label for Platform', 'macOS, Windows, Linux', 1],
];

export function DescriptionListStory({
  size = 'medium',
}: {
  size?: StorySize;
}) {
  const [vertical, setVertical] = useState(false);
  const [bordered, setBordered] = useState(true);
  return (
    <StoryFrame testID="story-description_list">
      <View style={{ padding: 16, flex: 1, alignItems: 'center', gap: 24 }}>
        <View style={{ alignSelf: 'stretch' }}>
          <StoryToolbar
            size={size}
            items={[
              {
                label: 'Options',
                menu: [
                  {
                    label: 'Vertical',
                    checked: vertical,
                    onSelect: () => setVertical(v => !v),
                  },
                  {
                    label: 'Bordered',
                    checked: bordered,
                    onSelect: () => setBordered(v => !v),
                  },
                ],
              },
            ]}
          />
        </View>
        <View style={{ width: 720 }}>
          <DescriptionList
            columns={3}
            layout={vertical ? 'vertical' : 'horizontal'}
            bordered={bordered}
            size={size}
            items={ITEMS.map(([label, value, span]) =>
              label === '--'
                ? { label: '', separator: true }
                : { label, span, value: <TextView source={value} /> },
            )}
          />
        </View>
      </View>
    </StoryFrame>
  );
}
