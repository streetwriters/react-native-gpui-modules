import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Toggle, ToggleGroup } from '@react-native-gpui/gpui-kit';
import {
  Section,
  StoryFrame,
  StoryToolbar,
  theme,
  type StorySize,
} from './StoryKit';

/** `crates/story/src/stories/toggle_story.rs` of gpui-component v0.9.1. */
const caption = {
  fontSize: 14,
  lineHeight: 22.65,
  fontWeight: '500',
  color: theme.foreground,
} as const;

export function ToggleStory({ size = 'medium' }: { size?: StorySize }) {
  const [single, setSingle] = useState(1);
  const [checked, setChecked] = useState<boolean[]>(Array(12).fill(false));
  const [period, setPeriod] = useState<number | null>(1);
  const [density, setDensity] = useState<number | null>(null);
  const setRange = (from: number, values: number[], count: number) =>
    setChecked(previous => {
      const next = [...previous];
      for (let i = 0; i < count; i++) next[from + i] = values.includes(i);
      return next;
    });
  return (
    <StoryFrame testID="story-toggle">
      <View style={{ width: '100%', gap: 12 }}>
        <StoryToolbar size={size} />
        <Section
          title="Default"
          description="Text and icon toggles with clear selected states."
          column
          style={{ width: 512, gap: 12 }}
        >
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Toggle
              label="Preview"
              size={size}
              checked={single === 1}
              onChange={e => setSingle(e.nativeEvent.state ? 1 : 0)}
            />
            <Toggle
              icon="star"
              size={size}
              checked={checked[0]}
              onChange={e => setRange(0, e.nativeEvent.state ? [0] : [], 1)}
            />
          </View>
        </Section>
        <Section
          title="Variants"
          description="Ghost and outline treatments for different surfaces."
          column
          style={{ width: 512, gap: 16 }}
        >
          <View style={{ alignItems: 'center', gap: 8 }}>
            <Text style={caption}>Ghost</Text>
            <ToggleGroup
              size={size}
              onChange={e => setRange(1, e.nativeEvent.checked, 3)}
            >
              <Toggle icon="bell" checked={checked[1]} />
              <Toggle icon="inbox" checked={checked[2]} />
              <Toggle icon="check" checked={checked[3]} />
            </ToggleGroup>
          </View>
          <View style={{ alignItems: 'center', gap: 8 }}>
            <Text style={caption}>Outline</Text>
            <ToggleGroup
              variant="outline"
              size={size}
              onChange={e => setRange(4, e.nativeEvent.checked, 3)}
            >
              <Toggle icon="bell" checked={checked[4]} />
              <Toggle icon="inbox" checked={checked[5]} />
              <Toggle icon="check" checked={checked[6]} />
            </ToggleGroup>
          </View>
        </Section>
        <Section
          title="Group"
          description="Connected toggles keep related choices together."
          column
          style={{ width: 512 }}
        >
          <ToggleGroup
            segmented
            variant="outline"
            size={size}
            onChange={e => setRange(7, e.nativeEvent.checked, 3)}
          >
            <Toggle label="Bold" checked={checked[7]} />
            <Toggle label="Italic" checked={checked[8]} />
            <Toggle label="Code" checked={checked[9]} />
          </ToggleGroup>
        </Section>
        <Section
          title="Single selection"
          description="One item at a time. Selecting the chosen item again clears it."
          column
          style={{ width: 512, gap: 12 }}
        >
          <ToggleGroup
            single
            segmented
            variant="outline"
            size={size}
            onChange={e => setPeriod(e.nativeEvent.checked[0] ?? null)}
          >
            <Toggle label="Day" checked={period === 0} />
            <Toggle label="Week" checked={period === 1} />
            <Toggle label="Month" checked={period === 2} />
          </ToggleGroup>
          <ToggleGroup
            single
            size={size}
            onChange={e => setDensity(e.nativeEvent.checked[0] ?? null)}
          >
            <Toggle label="Compact" checked={density === 0} />
            <Toggle label="Comfortable" checked={density === 1} />
            <Toggle label="Spacious" checked={density === 2} />
          </ToggleGroup>
        </Section>
      </View>
    </StoryFrame>
  );
}
