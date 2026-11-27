import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import {
  Button,
  Checkbox,
  DropdownMenu,
  Input,
  List,
  Popover,
  Separator,
  type MenuEntry,
} from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame, T, theme, useNotify } from './StoryKit';

/** `crates/story/src/stories/popover_story.rs` of gpui-component v0.9.1. */
const sm = { fontSize: 14, lineHeight: 22.65, color: theme.foreground };

type Anchor =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'left-center'
  | 'right-center'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';
const ANCHORS: [Anchor, string][][] = [
  [
    ['top-left', 'TopLeft'],
    ['top-center', 'TopCenter'],
    ['top-right', 'TopRight'],
  ],
  [
    ['left-center', 'LeftCenter'],
    ['right-center', 'RightCenter'],
  ],
  [
    ['bottom-left', 'BottomLeft'],
    ['bottom-center', 'BottomCenter'],
    ['bottom-right', 'BottomRight'],
  ],
];

export function PopoverStory() {
  const notify = useNotify();
  const [formOpen, setFormOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [arrow, setArrow] = useState(false);
  const [message, setMessage] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!menuOpen) {
      setLoaded(false);
      return;
    }
    const timer = setTimeout(() => setLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, [menuOpen]);
  const asyncMenu: MenuEntry[] = [
    {
      label: 'Copy',
      shortcut: 'secondary-c',
      onSelect: () => setMessage('You have clicked copy'),
    },
    { separator: true },
    {
      label: 'Async Submenu',
      children: loaded
        ? [1, 2, 3].map(ix => ({
            label: `Loaded Item ${ix}`,
            onSelect: () => setMessage(`You have clicked info: ${ix}`),
          }))
        : [{ label: 'Loading...', heading: true }],
    },
  ];
  return (
    <StoryFrame testID="story-popover">
      <View style={{ width: '100%', gap: 24 }}>
        <Section
          title="Default"
          description="Display lightweight contextual content."
        >
          <Popover
            width="auto"
            kitStyle={{ maxWidth: 600, width: 400 }}
            content={
              <View style={{ gap: 8 }}>
                <Text style={sm}>Hello, this is a Popover.</Text>
                <Separator />
                <Text style={sm}>
                  You can put any content here, including text,buttons, forms,
                  and more.
                </Text>
              </View>
            }
          >
            <Button outline label="Popover" />
          </Popover>
          <Popover
            defaultOpen
            width="auto"
            content={
              <T>This popover is open by default when first rendered.</T>
            }
          >
            <Button label="Default Open" outline />
          </Popover>
        </Section>
        <Section
          title="Form"
          description="Keep focus and controlled open state around a form."
        >
          <Popover
            open={formOpen}
            onOpenChange={e => setFormOpen(e.nativeEvent.open)}
            width="auto"
            kitStyle={{ padding: 0 }}
            content={
              <View style={{ gap: 8, padding: 12 }}>
                <Text style={sm}>This is a form container.</Text>
                <Text style={sm}>Click submit to dismiss the popover.</Text>
                <Input />
                <Button
                  label="Submit"
                  variant="primary"
                  onPress={() => setFormOpen(false)}
                />
              </View>
            }
          >
            <Button outline label="Popup Form" />
          </Popover>
        </Section>
        <Section
          title="List"
          description="Place a scrollable selection list in the popover."
        >
          <Popover
            open={listOpen}
            onOpenChange={e => setListOpen(e.nativeEvent.open)}
            width="auto"
            kitStyle={{ padding: 0, width: 256, height: 200 }}
            content={
              <List
                searchable
                style={{ width: 256, height: 200 }}
                rows={Array.from({ length: 10 }, (_, row) => ({
                  label: `Item ${row}`,
                }))}
                onConfirm={() => setListOpen(false)}
                onCancel={() => setListOpen(false)}
              />
            }
          >
            <Button outline label="Popup List" />
          </Popover>
        </Section>
        <Section
          title="Right click"
          description="Open from the secondary mouse button."
        >
          <Popover
            mouseButton="right"
            open={rightOpen}
            onOpenChange={e => setRightOpen(e.nativeEvent.open)}
            width="auto"
            kitStyle={{ maxWidth: 600 }}
            content={
              <View style={{ gap: 8 }}>
                <T>Hello, this is a Popover on the Bottom Right.</T>
                <Separator />
                <Button
                  variant="primary"
                  label="Dismiss"
                  style={{ width: 80 }}
                  onPress={() => {
                    notify.push('You have clicked dismiss via DismissEvent.');
                    setRightOpen(false);
                  }}
                />
              </View>
            }
          >
            <Button outline label="Right Click Popover" />
          </Popover>
        </Section>
        <Section
          title="Custom style"
          description="Customize appearance, radius, and shadow."
        >
          <Popover
            appearance={false}
            width="auto"
            kitStyle={{
              paddingVertical: 4,
              paddingHorizontal: 8,
              backgroundColor: theme.primary,
              maxWidth: 600,
              borderRadius: theme.radius / 2,
              boxShadow: '2xl',
            }}
            content={
              <Text style={[sm, { color: theme.primaryForeground }]}>
                A styled Popover with custom background and text color.
              </Text>
            }
          >
            <Button outline label="Style Popover" />
          </Popover>
        </Section>
        <Section
          title="Async submenu"
          description="Rebuild submenu content after asynchronous loading."
        >
          <DropdownMenu
            items={asyncMenu}
            onOpenChange={e => setMenuOpen(e.nativeEvent.open)}
          >
            <Button outline label="Async Menu" />
          </DropdownMenu>
          <T>{message}</T>
        </Section>
        <Section
          title="Anchor"
          description="Position content from each edge of the trigger."
          subTitle={
            <Checkbox
              label="Arrow"
              checked={arrow}
              onChange={e => setArrow(e.nativeEvent.state)}
            />
          }
          column
          style={{
            width: '100%',
            minHeight: 224,
            justifyContent: 'space-between',
          }}
        >
          {ANCHORS.map((row, index) => (
            <View
              key={index}
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              {row.map(([anchor, label]) => (
                <Popover
                  key={anchor}
                  anchor={anchor}
                  arrow={arrow}
                  width="auto"
                  content={<T>Popover content</T>}
                >
                  <Button size="small" outline label={label} />
                </Popover>
              ))}
            </View>
          ))}
        </Section>
      </View>
    </StoryFrame>
  );
}
