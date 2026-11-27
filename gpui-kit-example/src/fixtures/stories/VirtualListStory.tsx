import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import {
  VirtualList,
  type VirtualListHandle,
} from '@react-native-gpui/gpui-kit';
import { StoryFrame, StoryToolbar, T, theme } from './StoryKit';

/** `crates/story/src/stories/virtual_list_story.rs` of gpui-component v0.9.1. */
const DATASETS: [string, number, number][] = [
  ['Standard', 5000, 30],
  ['Wide', 100, 100],
  ['Stress', 500000, 100],
  ['Short', 5, 10],
];
type Axis = 'both' | 'vertical' | 'horizontal';
const AXIS_LABEL: Record<Axis, string> = {
  both: 'Both',
  vertical: 'Vertical',
  horizontal: 'Horizontal',
};

export function VirtualListStory() {
  const list = useRef<VirtualListHandle>(null);
  const [mode, setMode] = useState(0);
  const [axis, setAxis] = useState<Axis>('both');
  const [visible, setVisible] = useState<[number, number]>([0, 0]);
  const [, count, columns] = DATASETS[mode];
  return (
    <StoryFrame fill testID="story-virtual_list">
      <View style={{ flex: 1, gap: 16 }}>
        <View style={{ gap: 8 }}>
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
              {
                label: `Axis: ${AXIS_LABEL[axis]}`,
                menu: (Object.keys(AXIS_LABEL) as Axis[]).map(value => ({
                  label: AXIS_LABEL[value],
                  checked: axis === value,
                  onSelect: () => setAxis(value),
                })),
              },
              { label: 'Top', onPress: () => list.current?.scrollToItem(0) },
              {
                label: 'Row 50',
                onPress: () => list.current?.scrollToItem(50),
              },
              {
                label: 'Center 25',
                onPress: () => list.current?.scrollToItem(25, 'center'),
              },
              { label: 'Bottom', onPress: () => list.current?.scrollToEnd() },
            ]}
          />
          <T>{`Visible: ${visible[0]}..${visible[1]}`}</T>
        </View>
        <View style={{ width: '100%', flex: 1, minHeight: 256 }}>
          <VirtualList
            ref={list}
            style={{ width: '100%', height: '100%' }}
            itemSize={30}
            crossSize={columns * 104 - 4}
            scrollbars={axis}
            kitStyle={{
              padding: 16,
              borderWidth: 1,
              borderColor: theme.border,
              gap: 4,
            }}
            template={{
              count,
              columns,
              firstText: 'row: {row}',
              text: '{col}',
              rowStyle: { gap: 4, alignItems: 'center' },
              cellStyle: {
                height: 30,
                width: 100,
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                backgroundColor: theme.secondary,
              },
            }}
            onVisibleRangeChange={e =>
              setVisible([e.nativeEvent.start, e.nativeEvent.end])
            }
          />
        </View>
      </View>
    </StoryFrame>
  );
}
