import React, { useState } from 'react';
import { Text, View } from 'react-native';
import {
  Accordion,
  Checkbox,
  Icon,
  Switch,
  Tag,
  type AccordionEntry,
  type IconName,
} from '@react-native-gpui/gpui-kit';
import {
  Section,
  StoryFrame,
  StoryToolbar,
  theme,
  type StorySize,
} from './StoryKit';

/** `crates/story/src/stories/accordion_story.rs` of gpui-component v0.9.1. */
const secondaryHalf = 'rgba(229, 229, 229, 0.5)';

function settingsItem(
  icon: IconName,
  title: string,
  tag: boolean,
  body: string,
  open: boolean,
): AccordionEntry {
  return {
    open,
    title: (
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <View
          style={{
            width: 32,
            height: 32,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: theme.radius,
            backgroundColor: secondaryHalf,
          }}
        >
          <Icon name={icon} size="small" color={theme.mutedForeground} />
        </View>
        <Text
          style={{
            fontSize: 16,
            lineHeight: 25.9,
            fontWeight: '600',
            color: theme.foreground,
          }}
        >
          {title}
        </Text>
        {tag && <Tag variant="success" outline size="small" label="New" />}
      </View>
    ),
    titleStyle: { paddingTop: 8, paddingBottom: 8 },
    contentStyle: {
      color: theme.mutedForeground,
      paddingLeft: 52,
      paddingTop: 0,
      paddingBottom: 12,
    },
    content: body,
  };
}

export function AccordionStory({ size = 'medium' }: { size?: StorySize }) {
  const [openIxs, setOpenIxs] = useState([0]);
  const [styledOpen, setStyledOpen] = useState([0]);
  const [multiple, setMultiple] = useState(false);
  const [showIcon, setShowIcon] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [bordered, setBordered] = useState(false);
  return (
    <StoryFrame testID="story-accordion">
      <View style={{ width: '100%', alignItems: 'center', gap: 24 }}>
        <View style={{ alignSelf: 'stretch' }}>
          <StoryToolbar
            size={size}
            items={[
              {
                label: 'Options',
                menu: [
                  {
                    label: 'Multiple',
                    checked: multiple,
                    onSelect: () => setMultiple(v => !v),
                  },
                  {
                    label: 'Icons',
                    checked: showIcon,
                    onSelect: () => setShowIcon(v => !v),
                  },
                  {
                    label: 'Disabled',
                    checked: disabled,
                    onSelect: () => setDisabled(v => !v),
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
        <Section
          title="Default"
          description="Expand one item at a time by default."
        >
          <View style={{ width: 480 }}>
            <Accordion
              style={{ width: 480 }}
              bordered={bordered}
              size={size}
              disabled={disabled}
              multiple={multiple}
              onToggle={e => setOpenIxs([...e.nativeEvent.open])}
              items={[
                {
                  open: openIxs.includes(0),
                  icon: showIcon ? 'info' : undefined,
                  title: 'Is it accessible?',
                  content:
                    'Yes. Each item is a button with an aria-expanded state, so screen readers announce whether the section is open, and the whole group can be reached with the keyboard.',
                },
                {
                  open: openIxs.includes(1),
                  icon: showIcon ? 'inbox' : undefined,
                  title: 'Can it hold any content?',
                  content: (
                    <View style={{ gap: 12 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          lineHeight: 22.65,
                          color: theme.foreground,
                        }}
                      >
                        An item takes any element as its content, not just text.
                        The height animation measures whatever you put in it.
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 16 }}>
                        <Switch label="Switch" />
                        <Checkbox label="Or a Checkbox" />
                      </View>
                    </View>
                  ),
                },
                {
                  open: openIxs.includes(2),
                  icon: showIcon ? 'moon' : undefined,
                  title: 'Is it animated?',
                  content:
                    'Yes. Expanding and collapsing animates the height of the content, and the chevron rotates to follow. Items below move along with it.',
                },
                {
                  title: 'Disabled item',
                  disabled: true,
                  content: 'This item cannot be expanded.',
                },
              ]}
            />
          </View>
        </Section>
        <Section title="Custom style">
          <View
            style={{
              width: 480,
              padding: 4,
              borderRadius: theme.radiusLg * 2,
              backgroundColor: secondaryHalf,
              borderWidth: 1,
              borderColor: 'rgba(229, 229, 229, 0.5)',
            }}
          >
            <Accordion
              style={{ width: '100%' }}
              bordered
              multiple={multiple}
              disabled={disabled}
              onToggle={e => setStyledOpen([...e.nativeEvent.open])}
              items={[
                settingsItem(
                  'settings',
                  'Account Settings',
                  true,
                  'Manage your account preferences, security settings, and personal information. You can also configure two-factor authentication here.',
                  styledOpen.includes(0),
                ),
                settingsItem(
                  'eye',
                  'Privacy & Security',
                  false,
                  'Control who can see your profile and how your data is used.',
                  styledOpen.includes(1),
                ),
                settingsItem(
                  'info',
                  'Help & Support',
                  false,
                  'Browse the documentation, or get in touch with the support team.',
                  styledOpen.includes(2),
                ),
              ]}
            />
          </View>
        </Section>
      </View>
    </StoryFrame>
  );
}
