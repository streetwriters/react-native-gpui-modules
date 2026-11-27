import React, { useState } from 'react';
import { Text, View } from 'react-native';
import {
  Button,
  ContextMenu,
  DropdownMenu,
  type MenuEntry,
} from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame, T, theme } from './StoryKit';

/** `crates/story/src/stories/menu_story.rs` of gpui-component v0.9.1. */
type Side = 'left' | 'right' | undefined;
const sideName = (side: Side) =>
  side === 'left' ? 'Some(Left)' : side === 'right' ? 'Some(Right)' : 'None';

const area = {
  width: '100%',
  padding: 16,
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 80,
  borderRadius: theme.radiusLg,
  borderWidth: 2,
  borderStyle: 'dashed',
  borderColor: theme.border,
} as const;

export function MenuStory() {
  const [checkSide, setCheckSide] = useState<Side>();
  const [message, setMessage] = useState('');
  const say = (text: string) => () => setMessage(text);
  const info = (n: number) => say(`You have clicked info: ${n}`);
  const toggleCheck = () => {
    const next: Side =
      checkSide === 'left'
        ? 'right'
        : checkSide === 'right'
          ? undefined
          : 'left';
    setCheckSide(next);
    setMessage(`You have used check at side: ${sideName(next)}`);
  };
  const checkItem: MenuEntry = {
    label: `Check Side ${sideName(checkSide)}`,
    checked: checkSide !== undefined,
    shortcut: 'ctrl-shift-alt-t',
    onSelect: toggleCheck,
  };
  const ABOUT = 'https://github.com/longbridge/gpui-kit';
  const editMenu: MenuEntry[] = [
    { label: 'About', href: ABOUT },
    { separator: true },
    { label: 'Handle Click', onSelect: say('You have clicked Handle Click') },
    { separator: true },
    {
      label: 'Copy',
      shortcut: 'secondary-c',
      onSelect: say('You have clicked copy'),
    },
    {
      label: 'Cut',
      shortcut: 'secondary-x',
      onSelect: say('You have clicked cut'),
    },
    {
      label: 'Paste',
      shortcut: 'secondary-v',
      onSelect: say('You have clicked paste'),
    },
    { separator: true },
    checkItem,
    { separator: true },
    {
      label: 'Search',
      icon: 'search',
      shortcut: 'secondary-shift-f',
      onSelect: say('You have clicked search all'),
    },
    { separator: true },
    {
      content: (
        <View>
          <Text
            style={{ fontSize: 14, lineHeight: 22.65, color: theme.foreground }}
          >
            Custom Element
          </Text>
          <Text
            style={{
              fontSize: 12,
              lineHeight: 19.4,
              color: theme.mutedForeground,
            }}
          >
            This is sub-title
          </Text>
        </View>
      ),
      onSelect: say('You have clicked on custom element'),
    },
    {
      checked: checkSide !== undefined,
      shortcut: 'ctrl-shift-alt-t',
      onSelect: toggleCheck,
      content: (
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <Text
            style={{ fontSize: 14, lineHeight: 22.65, color: theme.foreground }}
          >
            Custom Element
          </Text>
          <Text
            style={{
              fontSize: 12,
              lineHeight: 22.65,
              color: theme.mutedForeground,
            }}
          >
            checked
          </Text>
        </View>
      ),
    },
    {
      icon: 'info',
      onSelect: info(0),
      content: (
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <Text
            style={{ fontSize: 14, lineHeight: 22.65, color: theme.foreground }}
          >
            Custom
          </Text>
          <Text
            style={{
              fontSize: 14,
              lineHeight: 22.65,
              color: theme.mutedForeground,
            }}
          >
            element
          </Text>
        </View>
      ),
    },
    { separator: true },
    { label: 'Disabled Item', disabled: true, onSelect: info(0) },
    { separator: true },
    {
      label: 'Links',
      children: [
        { label: 'GPUI Component', icon: 'github', href: ABOUT },
        { separator: true },
        { label: 'GPUI Kit', href: 'https://gpui-kit.com' },
        { label: 'Zed', href: 'https://zed.dev' },
      ],
    },
    { separator: true },
    {
      label: 'Other Links',
      children: [
        { label: 'Crates', href: 'https://crates.io' },
        { label: 'Rust Docs', href: 'https://docs.rs' },
        { separator: true },
        {
          label: 'Nested',
          children: [
            { label: 'Docs.rs', href: 'https://docs.rs' },
            { separator: true },
            {
              label: 'Deeper',
              children: [{ label: 'GPUI Kit', href: 'https://gpui-kit.com' }],
            },
          ],
        },
      ],
    },
  ];
  const contextMenu: MenuEntry[] = [
    { label: 'About', href: ABOUT },
    { separator: true },
    {
      label: 'Cut',
      shortcut: 'secondary-x',
      onSelect: say('You have clicked cut'),
    },
    {
      label: 'Copy',
      shortcut: 'secondary-c',
      onSelect: say('You have clicked copy'),
    },
    {
      label: 'Paste',
      shortcut: 'secondary-v',
      onSelect: say('You have clicked paste'),
    },
    { separator: true },
    { label: 'This is a label', heading: true },
    checkItem,
    { separator: true },
    {
      label: 'Settings',
      children: [
        { label: 'Info 0', onSelect: info(0) },
        { separator: true },
        { label: 'Item 1', onSelect: info(1) },
        { label: 'Item 2', onSelect: info(2) },
        { separator: true },
        {
          label: 'More',
          children: [
            { label: 'More Item 1', onSelect: info(1) },
            { label: 'More Item 2', onSelect: info(2) },
            { separator: true },
            {
              label: 'Even More',
              children: [
                { label: 'Deep Item 1', onSelect: info(1) },
                { label: 'Deep Item 2', onSelect: info(2) },
                { separator: true },
                {
                  label: 'Deepest',
                  children: [
                    { label: 'Leaf 1', onSelect: info(1) },
                    { label: 'Leaf 2', onSelect: info(2) },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    { separator: true },
    {
      label: 'Search All',
      shortcut: 'secondary-shift-f',
      onSelect: say('You have clicked search all'),
    },
    { separator: true },
  ];
  const small: MenuEntry[] = [
    { label: 'About', href: ABOUT },
    { separator: true },
    { label: 'Item 1', onSelect: info(1) },
  ];
  const long: MenuEntry[] = [{ label: 'Total 100 items', heading: true }];
  for (let i = 0; i < 100; i++) {
    if (i % 5 === 0) long.push({ separator: true });
    long.push(
      i % 10 === 9
        ? {
            label: `More ${i}`,
            children: [
              { label: `Item ${i} copy`, onSelect: info(i) },
              { label: `Item ${i} duplicate`, onSelect: info(i) },
            ],
          }
        : { label: `Item ${i}`, onSelect: info(i) },
    );
  }
  const short: MenuEntry[] = [
    { label: 'Total 100 items', heading: true },
    ...[0, 1, 2, 3, 4].map(i => ({ label: `Item ${i}`, onSelect: info(i) })),
  ];
  return (
    <StoryFrame testID="story-menu">
      <View
        style={{ width: '100%', minHeight: 400, alignItems: 'center', gap: 24 }}
      >
        <Section
          title="Popup Menu"
          description="Supports actions, links, checks, icons, custom rows, and nested menus."
          style={{ width: 640 }}
        >
          <DropdownMenu
            items={editMenu}
            minWidth={250}
            checkSide={checkSide ?? 'left'}
          >
            <Button outline label="Edit" />
          </DropdownMenu>
          <T>{message}</T>
        </Section>
        <Section
          title="Context Menu"
          description="Different regions can provide their own right-click actions."
          column
          style={{ width: 640 }}
        >
          <ContextMenu
            items={contextMenu}
            checkSide={checkSide ?? 'left'}
            externalLinkIcon={false}
            style={{ width: '100%' }}
          >
            <View style={area}>
              <T>Right click to open ContextMenu</T>
              <Text
                style={{
                  fontSize: 14,
                  lineHeight: 22.65,
                  color: theme.mutedForeground,
                }}
              >
                You can right click anywhere in this area to open the context
                menu.
              </Text>
            </View>
          </ContextMenu>
          <ContextMenu items={small} style={{ width: '100%' }}>
            <View style={[area, { flexDirection: 'row' }]}>
              <T>Here is another area with context menu.</T>
            </View>
          </ContextMenu>
          <ContextMenu items={small} style={{ width: '100%' }}>
            <View style={[area, { flexDirection: 'row' }]}>
              <T>ContextMenu area 1</T>
            </View>
          </ContextMenu>
        </Section>
        <Section
          title="Scrollable"
          description="Long menus constrain their height while short menus stay compact."
          style={{ width: 640 }}
        >
          <DropdownMenu
            items={long}
            anchor="top-right"
            scrollable
            maxHeight={300}
            minWidth={100}
          >
            <Button outline label="Scrollable Menu (100 items)" />
          </DropdownMenu>
          <DropdownMenu
            items={short}
            anchor="top-right"
            scrollable
            maxHeight={300}
            minWidth={100}
          >
            <Button outline label="Scrollable Menu (5 items)" />
          </DropdownMenu>
        </Section>
      </View>
    </StoryFrame>
  );
}
