import React, { useState } from 'react';
import { View } from 'react-native';
import { Dock, type DockPanelEntry } from '@react-native-gpui/gpui-kit';
import { StoryFrame, StoryToolbar, T, theme } from './StoryKit';

/** `crates/story/src/stories/dock_story.rs` of gpui-component v0.9.1. */

/** `DemoPanel`: its body text with `p_4`. */
const body = (text: string) => (
  <View style={{ flex: 1, padding: 16 }}>
    <T>{text}</T>
  </View>
);

const PANELS: DockPanelEntry[] = [
  {
    id: 'DockStoryExplorer',
    title: 'Explorer',
    group: 'side',
    size: 240,
    content: body('Drag this tab into another group.'),
  },
  {
    id: 'DockStorySearch',
    title: 'Search',
    group: 'side',
    content: body('Two panels can share one tab group.'),
  },
  {
    id: 'DockStoryEditor',
    title: 'Editor',
    group: 'main',
    closable: false,
    content: body('Drop a tab near an edge to split this group.'),
  },
  {
    id: 'DockStoryTerminal',
    title: 'Terminal',
    placement: 'bottom',
    content: body('The bottom dock shares the workspace column.'),
  },
  {
    id: 'DockStoryProblems',
    title: 'Problems',
    placement: 'bottom',
    content: body('No problems detected.'),
  },
];

export function DockStory() {
  const [closeButtons, setCloseButtons] = useState(false);
  return (
    <StoryFrame fill testID="story-dock" paddings={0}>
      <View style={{ flex: 1 }}>
        <View style={{ padding: 8 }}>
          <StoryToolbar
            items={[
              {
                label: 'Options',
                menu: [
                  {
                    label: 'Tab close buttons',
                    checked: closeButtons,
                    onSelect: () => setCloseButtons(v => !v),
                  },
                ],
              },
            ]}
          />
        </View>
        <View
          style={{
            flex: 1,
            minHeight: 0,
            borderTopWidth: 1,
            borderColor: theme.border,
          }}
        >
          <Dock
            style={{ width: '100%', height: '100%' }}
            panels={PANELS}
            dockSizes={{ bottom: 160 }}
            collapsible={['bottom']}
            closeButtonVisible={closeButtons}
          />
        </View>
      </View>
    </StoryFrame>
  );
}
