import React, { useRef, useState } from 'react';
import { Linking, Text, View } from 'react-native';
import {
  Button,
  NativeMenu,
  type NativeMenuEntry,
  type NativeMenuHandle,
} from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame, theme } from './StoryKit';

/** `crates/story/src/stories/native_menu_story.rs` of gpui-component v0.9.1. */
const SEARCH_SVG = `<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="m21 21-4.34-4.34" />
  <circle cx="11" cy="11" r="8" />
</svg>
`;

function demoMenu(wordWrap: boolean, toggle: () => void): NativeMenuEntry[] {
  return [
    { label: 'Cut' },
    { label: 'Copy' },
    { label: 'Paste' },
    { separator: true },
    {
      label: 'Github',
      icon: 'github',
      onSelect: () => Linking.openURL('https://github.com'),
    },
    { label: 'Inbox', icon: 'inbox' },
    { label: 'Search (SVG bytes)', iconSvg: SEARCH_SVG },
    { separator: true },
    { label: 'Disabled item', disabled: true },
    { label: 'Word Wrap', checked: wordWrap, onSelect: toggle },
    { separator: true },
    {
      label: 'Open Recent',
      children: [
        { label: 'project-a' },
        { label: 'project-b' },
        { separator: true },
        {
          label: 'More',
          children: [{ label: 'project-c' }, { label: 'project-d' }],
        },
      ],
    },
    { separator: true },
    { label: 'Select All' },
  ];
}

function Trigger({ label }: { label: string }) {
  return (
    <View
      style={{
        width: '100%',
        height: 96,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: theme.radiusLg,
      }}
    >
      <Text
        style={{ fontSize: 16, lineHeight: 25.9, color: theme.mutedForeground }}
      >
        {label}
      </Text>
    </View>
  );
}

export function NativeMenuStory() {
  const [wordWrap, setWordWrap] = useState(true);
  const dropdown = useRef<NativeMenuHandle>(null);
  const menu = demoMenu(wordWrap, () => setWordWrap(v => !v));
  return (
    <StoryFrame testID="story-native_menu">
      <View style={{ width: '100%', alignItems: 'center', gap: 24 }}>
        <Section
          title="Builder API"
          description="Supports disabled items, checked states, and submenus."
          style={{ width: 520 }}
        >
          <NativeMenu items={menu} style={{ width: '100%' }}>
            <Trigger label="Right-click here" />
          </NativeMenu>
        </Section>
        <Section
          title="Menu Items"
          description="Existing GPUI menu definitions can be reused directly."
          style={{ width: 520 }}
        >
          <NativeMenu
            style={{ width: '100%' }}
            items={[
              { label: 'Copy' },
              { label: 'Paste' },
              { separator: true },
              {
                label: 'Share',
                children: [{ label: 'Email' }, { label: 'Message' }],
              },
            ]}
          >
            <Trigger label="Right-click here" />
          </NativeMenu>
        </Section>
        <Section
          title="Dropdown"
          description="A native menu can open from any anchored control."
          style={{ width: 520 }}
        >
          <NativeMenu ref={dropdown} items={menu} contextMenu={false}>
            <Button
              outline
              label="Open Menu"
              onPress={() => dropdown.current?.open()}
            />
          </NativeMenu>
        </Section>
      </View>
    </StoryFrame>
  );
}
