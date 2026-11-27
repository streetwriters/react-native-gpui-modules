import React, { useState } from 'react';
import { View } from 'react-native';
import {
  Combobox,
  Icon,
  Input,
  Select,
  Toolbar,
} from '@react-native-gpui/gpui-kit';
import {
  Section,
  StoryFrame,
  StoryToolbar,
  theme,
  useSetStorySize,
  type StorySize,
} from './StoryKit';

/** `crates/story/src/stories/toolbar_story.rs` of gpui-component v0.9.1. */
const LABEL: Record<string, string> = {
  xsmall: 'XSmall',
  small: 'Small',
  medium: 'Medium',
  large: 'Medium',
};

export function ToolbarStory({ size = 'medium' }: { size?: StorySize }) {
  const setSize = useSetStorySize();
  const [disabled, setDisabled] = useState(false);
  const [formats, setFormats] = useState([true, false, false]);
  const setFormat = (ix: number) => (checked: boolean) =>
    setFormats(previous =>
      previous.map((value, i) => (i === ix ? checked : value)),
    );
  const frame = {
    width: '100%',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.radius,
  } as const;
  const controlSize = size === 'large' ? 'medium' : size;
  return (
    <StoryFrame testID="story-toolbar">
      <View style={{ width: '100%', alignItems: 'center', gap: 24 }}>
        <View style={{ alignSelf: 'stretch' }}>
          <StoryToolbar
            items={[
              {
                label: `Size: ${LABEL[size]}`,
                menu: [
                  ...(['xsmall', 'small', 'medium'] as StorySize[]).map(
                    value => ({
                      label: LABEL[value],
                      checked: size === value,
                      onSelect: () => setSize(value),
                    }),
                  ),
                  { separator: true },
                  {
                    label: 'Disabled',
                    checked: disabled,
                    onSelect: () => setDisabled(v => !v),
                  },
                ],
              },
            ]}
          />
        </View>
        <Section
          title="Default"
          description="Keep document, history, and formatting commands in one compact editor toolbar."
          style={{ width: 640 }}
        >
          <Toolbar
            style={{ width: '100%' }}
            kitStyle={frame}
            size={controlSize}
            disabled={disabled}
            items={[
              {
                kind: 'group',
                label: 'Document',
                gap: 4,
                items: [
                  { kind: 'button', icon: 'plus', label: 'New', disabled },
                  { kind: 'button', icon: 'save', label: 'Save', disabled },
                ],
              },
              { kind: 'separator' },
              {
                kind: 'group',
                label: 'History',
                gap: 4,
                items: [
                  { kind: 'button', icon: 'undo-2', tooltip: 'Undo', disabled },
                  { kind: 'button', icon: 'redo-2', tooltip: 'Redo', disabled },
                ],
              },
              { kind: 'separator' },
              {
                kind: 'group',
                label: 'Formatting',
                gap: 4,
                items: ['B', 'I', 'U'].map((label, ix) => ({
                  kind: 'toggle' as const,
                  label,
                  checked: formats[ix],
                  disabled,
                  onChange: setFormat(ix),
                })),
              },
              { kind: 'separator' },
              {
                kind: 'content',
                content: (
                  <Select
                    style={{ width: 160 }}
                    size={controlSize}
                    placeholder="Font"
                    disabled={disabled}
                    defaultValue="Inter"
                    items={['Inter', 'SF Pro', 'Helvetica', 'Georgia']}
                  />
                ),
              },
            ]}
          />
        </Section>
        <Section
          title="Mixed controls"
          description="Select and Combobox inherit the same density while preserving their own popup behavior."
          style={{ width: 640 }}
        >
          <Toolbar
            style={{ width: '100%' }}
            kitStyle={frame}
            size={controlSize}
            disabled={disabled}
            items={[
              {
                kind: 'content',
                content: (
                  <Input
                    style={{ width: 160 }}
                    size={controlSize}
                    placeholder="Search"
                    disabled={disabled}
                    prefix={<Icon name="search" size={controlSize} />}
                  />
                ),
              },
              {
                kind: 'content',
                content: (
                  <Select
                    style={{ width: 128 }}
                    size={controlSize}
                    placeholder="Market"
                    disabled={disabled}
                    defaultValue="All markets"
                    items={[
                      'All markets',
                      'US market',
                      'Hong Kong',
                      'Singapore',
                    ]}
                  />
                ),
              },
              {
                kind: 'content',
                content: (
                  <Combobox
                    style={{ width: 160 }}
                    size={controlSize}
                    placeholder="Order status"
                    disabled={disabled}
                    searchable
                    items={['Open', 'In progress', 'Filled', 'Cancelled']}
                  />
                ),
              },
              { kind: 'spacer' },
              {
                kind: 'button',
                icon: 'rotate-cw',
                tooltip: 'Refresh',
                disabled,
              },
              {
                kind: 'button',
                icon: 'settings-2',
                tooltip: 'Configure columns',
                disabled,
              },
            ]}
          />
        </Section>
      </View>
    </StoryFrame>
  );
}
