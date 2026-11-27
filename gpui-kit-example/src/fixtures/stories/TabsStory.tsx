import React, { useState } from 'react';
import { View } from 'react-native';
import {
  Button,
  ButtonGroup,
  Tabs,
  type TabEntry,
  type TabsProps,
} from '@react-native-gpui/gpui-kit';
import {
  Section,
  StoryFrame,
  StoryToolbar,
  theme,
  type StorySize,
} from './StoryKit';

/** `crates/story/src/stories/tabs_story.rs` of gpui-component v0.9.1. */

const MAX_WIDTHS: (number | undefined)[] = [undefined, 60, 90, 120, 160];
const maxWidthLabel = (width: number | undefined) =>
  width === undefined ? 'Unlimited' : `${width}px`;

/** `tab_active` of the default light theme. */
const TAB_ACTIVE = '#ffffff';

const LABELS = [
  'Account',
  'Profile',
  'Documents',
  'Mail',
  'Appearance',
  'Settings',
  'About',
  'License',
];
const withProfileDisabled = (third: string): TabEntry[] =>
  [
    'Account',
    'Profile',
    third,
    'Mail',
    'Appearance',
    'Settings',
    'About',
    'License',
  ].map(label => ({ label, disabled: label === 'Profile' }));

const ghost = (icon: 'arrow-left' | 'arrow-right' | 'inbox' | 'ellipsis') => (
  <Button variant="ghost" size="xsmall" icon={icon} />
);
const close = <Button variant="ghost" size="xsmall" icon="close" />;

export function TabsStory({ size = 'medium' }: { size?: StorySize }) {
  const [active, setActive] = useState(0);
  const [menu, setMenu] = useState(false);
  const [maxWidthIx, setMaxWidthIx] = useState(0);
  const [dynamicTabs, setDynamicTabs] = useState([0, 1, 2]);
  const [nextId, setNextId] = useState(3);
  const [dynamicActive, setDynamicActive] = useState(0);
  const maxWidth = MAX_WIDTHS[maxWidthIx];
  const shared: Partial<TabsProps> = {
    size,
    menu,
    maxWidth,
    selectedIndex: active,
    onSelect: event => setActive(event.nativeEvent.index),
    style: { width: '100%' },
  };
  return (
    <StoryFrame testID="story-tabs">
      <View style={{ width: '100%', gap: 12 }}>
        <StoryToolbar
          size={size}
          items={[
            {
              label: `Max width: ${maxWidthLabel(maxWidth)}`,
              menu: MAX_WIDTHS.map((width, ix) => ({
                label: maxWidthLabel(width),
                checked: ix === maxWidthIx,
                onSelect: () => setMaxWidthIx(ix),
              })),
            },
            {
              label: 'Options',
              menu: [
                {
                  label: 'More menu',
                  checked: menu,
                  onSelect: () => setMenu(m => !m),
                },
              ],
            },
          ]}
        />
        <Section title="Tabs" style={{ width: '100%' }}>
          <Tabs
            {...shared}
            tabs={withProfileDisabled('Documents')}
            kitStyle={{ borderTopWidth: 1, borderColor: theme.border }}
            prefix={
              <View style={{ flexDirection: 'row', marginHorizontal: 4 }}>
                {ghost('arrow-left')}
                {ghost('arrow-right')}
              </View>
            }
            suffix={
              <View style={{ flexDirection: 'row', marginHorizontal: 4 }}>
                {ghost('inbox')}
                {ghost('ellipsis')}
              </View>
            }
          />
        </Section>
        <Section title="Underline Tabs" style={{ width: '100%' }}>
          <Tabs
            {...shared}
            variant="underline"
            tabs={LABELS.map(label => ({ label }))}
          />
        </Section>
        <Section title="Pill Tabs" style={{ width: '100%' }}>
          <Tabs
            {...shared}
            variant="pill"
            tabs={withProfileDisabled('Documents & Files')}
          />
        </Section>
        <Section title="Outline Tabs" style={{ width: '100%' }}>
          <Tabs
            {...shared}
            variant="outline"
            tabs={withProfileDisabled('Documents & Files')}
          />
        </Section>
        <Section title="Segmented Tabs" style={{ width: '100%' }}>
          <Tabs
            {...shared}
            variant="segmented"
            tabs={[
              { icon: 'bot' },
              { icon: 'calendar' },
              { icon: 'map' },
              { label: 'Appearance' },
              { label: 'Settings' },
              { label: 'About' },
              { label: 'License' },
            ]}
          />
        </Section>
        <Section title="Folder Tabs" style={{ width: '100%' }}>
          <View
            style={{
              width: '100%',
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: theme.radiusLg,
              overflow: 'hidden',
            }}
          >
            <Tabs
              {...shared}
              variant="folder"
              tabs={LABELS.map(label => ({ label, suffix: close }))}
              suffix={
                <View style={{ marginHorizontal: 4 }}>
                  <Button variant="ghost" size="xsmall" icon="plus" />
                </View>
              }
            />
            <View style={{ height: 80, backgroundColor: TAB_ACTIVE }} />
          </View>
        </Section>
        <Section
          title="Dynamic Tabs"
          description="Tabs can be added, removed, and composed with prefix and suffix content."
          style={{ width: '100%' }}
        >
          <ButtonGroup outline compact>
            <Button
              label="Add Tab"
              onPress={() => {
                setDynamicTabs(tabs => [...tabs, nextId]);
                setDynamicActive(dynamicTabs.length);
                setNextId(id => id + 1);
              }}
            />
            <Button
              label="Remove Last"
              onPress={() => {
                if (dynamicTabs.length <= 1) return;
                setDynamicTabs(tabs => tabs.slice(0, -1));
                setDynamicActive(ix => Math.min(ix, dynamicTabs.length - 2));
              }}
            />
          </ButtonGroup>
          <Tabs
            size={size}
            maxWidth={maxWidth}
            variant="segmented"
            style={{ width: '100%' }}
            selectedIndex={dynamicActive}
            onSelect={event => setDynamicActive(event.nativeEvent.index)}
            tabs={dynamicTabs.map(id => ({
              label: `Tab ${id}`,
              prefixIcon: 'book-open',
              kitStyle: { paddingHorizontal: 8 },
              suffix: close,
            }))}
          />
        </Section>
        <Section
          title="Filling Space"
          description="Segmented tabs can share the available width equally."
          style={{ width: '100%' }}
        >
          <Tabs
            {...shared}
            variant="segmented"
            tabs={['About', 'Profile'].map(label => ({
              label,
              kitStyle: { flex: 1 },
            }))}
          />
        </Section>
      </View>
    </StoryFrame>
  );
}
