import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { DropdownButton, Theme } from '@react-native-gpui/gpui-kit';
import {
  Section,
  StoryFrame,
  StoryToolbar,
  theme,
  type StorySize,
} from './StoryKit';

/** `crates/story/src/stories/dropdown_button_story.rs` of gpui-component v0.9.1. */
const muted = { fontSize: 14, lineHeight: 22.65, color: theme.mutedForeground };

export function DropdownButtonStory({ size = 'medium' }: { size?: StorySize }) {
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(false);
  const [compact, setCompact] = useState(false);
  const [shadow, setShadow] = useState<boolean>();
  const [last, setLast] = useState('Nothing yet');
  return (
    <StoryFrame testID="story-dropdown_button">
      {shadow !== undefined && <Theme mode="light" shadow={shadow} />}
      <View style={{ gap: 24 }}>
        <StoryToolbar
          size={size}
          items={[
            {
              label: 'Options',
              menu: [
                {
                  label: 'Disabled',
                  checked: disabled,
                  onSelect: () => setDisabled(v => !v),
                },
                {
                  label: 'Loading',
                  checked: loading,
                  onSelect: () => setLoading(v => !v),
                },
                {
                  label: 'Selected',
                  checked: selected,
                  onSelect: () => setSelected(v => !v),
                },
                {
                  label: 'Compact',
                  checked: compact,
                  onSelect: () => setCompact(v => !v),
                },
                {
                  label: 'Shadow',
                  checked: shadow ?? true,
                  onSelect: () => setShadow(v => !(v ?? true)),
                },
              ],
            },
          ]}
        />
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <Text style={muted}>Last action:</Text>
          <Text style={muted}>{last}</Text>
        </View>
        <Section title="Basic split">
          <DropdownButton
            size={size}
            variant="primary"
            label="Export"
            compact={compact}
            disabled={disabled}
            selected={selected}
            anchor="top-right"
            onPress={() => setLast('Exported current view')}
            items={[
              {
                label: 'Export all rows (.csv)',
                onSelect: () => setLast('Exported as CSV'),
              },
              {
                label: 'Download report (.pdf)',
                onSelect: () => setLast('Exported as PDF'),
              },
            ]}
          />
        </Section>
        <Section title="Inner button options">
          <DropdownButton
            size={size}
            outline
            label="Save"
            tooltip="Save the current document"
            compact={compact}
            loading={loading}
            disabled={disabled}
            onPress={() => setLast('Saved document')}
            items={[
              {
                label: 'Save as new file…',
                onSelect: () => setLast('Saved as a new file'),
              },
              {
                label: 'Save as template…',
                onSelect: () => setLast('Saved as a template'),
              },
            ]}
          />
        </Section>
        <Section title="Inherited styling">
          <DropdownButton
            label="Open latest"
            buttonVariant="ghost"
            buttonSize="small"
            selected={selected}
            disabled={disabled}
            onPress={() => setLast('Opened latest file')}
            items={[
              {
                label: 'Quarterly Report.gpui',
                onSelect: () => setLast('Opened Quarterly Report.gpui'),
              },
              {
                label: 'Watchlist Layout.gpui',
                onSelect: () => setLast('Opened Watchlist Layout.gpui'),
              },
            ]}
          />
        </Section>
      </View>
    </StoryFrame>
  );
}
