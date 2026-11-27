import React from 'react';
import { View } from 'react-native';
import { Tag } from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame, StoryToolbar, type StorySize } from './StoryKit';

/** `crates/story/src/stories/tag_story.rs` of gpui-component v0.9.1. */
const INDIGO_50 = '#eef2ff';
const INDIGO_500 = '#6366f1';

const VARIANTS = [
  ['primary', 'Tag'],
  ['secondary', 'Secondary'],
  ['danger', 'Danger'],
  ['success', 'Success'],
  ['warning', 'Warning'],
  ['info', 'Info'],
] as const;

const COLORS = [
  'Neutral',
  'Red',
  'Orange',
  'Amber',
  'Yellow',
  'Lime',
  'Green',
  'Emerald',
  'Teal',
  'Cyan',
  'Sky',
  'Blue',
  'Indigo',
  'Violet',
  'Purple',
  'Fuchsia',
  'Pink',
  'Rose',
];

const row = { flexDirection: 'row', gap: 8 } as const;

export function TagStory({ size = 'medium' }: { size?: StorySize }) {
  return (
    <StoryFrame testID="story-tag">
      <View style={{ width: '100%', gap: 12 }}>
        <StoryToolbar size={size} />
        <Section title="Default">
          <View style={row}>
            {VARIANTS.map(([variant, label]) => (
              <Tag key={variant} variant={variant} size={size} label={label} />
            ))}
            <Tag
              size={size}
              label="Custom"
              customColor={INDIGO_500}
              customForeground={INDIGO_50}
              customBorder={INDIGO_500}
            />
          </View>
        </Section>
        <Section title="Outline">
          <View style={row}>
            {VARIANTS.map(([variant, label]) => (
              <Tag
                key={variant}
                variant={variant}
                size={size}
                outline
                label={label}
              />
            ))}
            <Tag
              size={size}
              outline
              label="Custom"
              customColor={INDIGO_500}
              customForeground={INDIGO_500}
              customBorder={INDIGO_500}
            />
          </View>
        </Section>
        <Section title="Rounded">
          <View style={row}>
            {VARIANTS.map(([variant, label]) => (
              <Tag
                key={variant}
                variant={variant}
                size={size}
                roundedFull
                label={label}
              />
            ))}
          </View>
        </Section>
        <Section title="Square">
          <View style={row}>
            {VARIANTS.map(([variant, label]) => (
              <Tag
                key={variant}
                variant={variant}
                size={size}
                radius={0}
                label={label}
              />
            ))}
          </View>
        </Section>
        <Section title="Colors" style={{ width: 640 }}>
          <View style={{ width: '100%', gap: 16 }}>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                gap: 8,
                flexWrap: 'wrap',
              }}
            >
              {COLORS.map(color => (
                <Tag key={color} colorName={color} size={size} label={color} />
              ))}
            </View>
          </View>
        </Section>
      </View>
    </StoryFrame>
  );
}
