import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Icon, Sidebar, StatusBar } from '@react-native-gpui/gpui-kit';
import list from './storyList.json';
import { stories } from '../fixtures/stories';
import { StoryLayoutContext } from '../fixtures/stories/StoryKit';

type StoryEntry = {
  klass: string;
  title: string;
  description: string;
  file: string | null;
};

const entries = list as StoryEntry[];
/** The story's file name, or for a story without its own file its class in snake case. */
const key = (entry: StoryEntry) =>
  (
    entry.file ??
    entry.klass
      .replace(/Story$/, '')
      .replace(/[A-Z]/g, (c, at) => (at ? '_' : '') + c.toLowerCase())
  ).replace(/_story$/, '');

/**
 * The counterpart of gpui-component's story gallery (`crates/story`,
 * v0.9.1): the same story list in a sidebar, and the selected story under a
 * header with its title and description. Stories not ported yet say so.
 */
export function Gallery() {
  const [active, setActive] = useState(0);
  const entry = entries[active];
  const Story = stories[key(entry)];
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <Sidebar
          testID="gallery-sidebar"
          width={255}
          collapsible="offcanvas"
          style={{ width: 255, height: '100%' }}
          header={
            <View style={{ padding: 8 }}>
              <Text style={{ fontWeight: '600' }}>GPUI Component</Text>
              <Text style={{ fontSize: 12, color: '#737373' }}>
                Component showcase
              </Text>
            </View>
          }
          groups={[
            {
              label: '',
              items: entries.map((item, index) => ({
                label: item.title,
                active: index === active,
              })),
            },
          ]}
          onPress={event => setActive(event.nativeEvent.index)}
        />
        <View style={{ flex: 1 }}>
          <View
            testID="gallery-header"
            style={{
              padding: 16,
              borderBottomWidth: 1,
              borderColor: '#e5e5e5',
              gap: 4,
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: '600' }}>
              {entry.title}
            </Text>
            <Text style={{ color: '#737373' }}>{entry.description}</Text>
          </View>
          <StoryLayoutContext.Provider value="page">
            {Story ? (
              <Story />
            ) : (
              <Text testID="gallery-unported" style={{ padding: 16 }}>
                {`${entry.title} is not ported yet.`}
              </Text>
            )}
          </StoryLayoutContext.Provider>
        </View>
      </View>
      <StatusBar
        testID="gallery-status"
        left={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="gallery-vertical-end" size="xsmall" />
            <Text>{`${entries.length} components`}</Text>
            <Text>{entry.title}</Text>
          </View>
        }
      />
    </View>
  );
}
