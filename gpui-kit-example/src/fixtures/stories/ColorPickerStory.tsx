import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { ColorPicker } from '@react-native-gpui/gpui-kit';
import {
  Section,
  StoryFrame,
  StoryToolbar,
  T,
  theme,
  type StorySize,
} from './StoryKit';

/** `crates/story/src/stories/color_picker_story.rs` of gpui-component v0.9.1. */
const INDIGO_500 = '#6366F1';

const hex = (argb: number) =>
  `#${(argb < 0 ? argb + 2 ** 32 : argb)
    .toString(16)
    .padStart(8, '0')
    .slice(2)
    .toUpperCase()}`;

export function ColorPickerStory({ size = 'medium' }: { size?: StorySize }) {
  const [selected, setSelected] = useState<string | null>(INDIGO_500);
  return (
    <StoryFrame testID="story-color_picker">
      <View style={{ width: '100%', alignItems: 'center', gap: 24 }}>
        <View style={{ alignSelf: 'stretch' }}>
          <StoryToolbar size={size} />
        </View>
        <Section
          title="Theme Color"
          description="Select a color and preview the resulting value."
          style={{ width: 440 }}
        >
          <View
            style={{
              width: '100%',
              gap: 16,
              padding: 16,
              borderRadius: theme.radiusLg,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <View style={{ gap: 4 }}>
                <T style={{ fontWeight: '500' }}>Accent color</T>
                <Text
                  style={{
                    fontSize: 14,
                    lineHeight: 22.65,
                    color: theme.mutedForeground,
                  }}
                >
                  Used for primary actions and highlights.
                </Text>
              </View>
              <ColorPicker
                defaultValue={INDIGO_500}
                size={size}
                onChange={e =>
                  setSelected(
                    e.nativeEvent.cleared ? null : hex(e.nativeEvent.color),
                  )
                }
              />
            </View>
            {selected !== null && (
              <View
                style={{
                  width: '100%',
                  overflow: 'hidden',
                  borderRadius: theme.radiusLg,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <View
                  style={{
                    width: '100%',
                    height: 96,
                    borderTopLeftRadius: theme.radiusLg,
                    borderTopRightRadius: theme.radiusLg,
                    backgroundColor: selected,
                  }}
                />
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    backgroundColor: theme.muted,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      lineHeight: 22.65,
                      color: theme.mutedForeground,
                    }}
                  >
                    Selected color
                  </Text>
                  <T style={{ fontFamily: 'monospace', fontWeight: '500' }}>
                    {selected}
                  </T>
                </View>
              </View>
            )}
          </View>
        </Section>
        <Section
          title="Color Select"
          description="A framed field for forms: the whole field opens the picker, like a Select."
          style={{ width: 440 }}
        >
          <View style={{ width: '100%', gap: 12 }}>
            <ColorPicker select defaultValue={INDIGO_500} size={size} />
            <ColorPicker select size={size} placeholder="Pick a color" />
          </View>
        </Section>
      </View>
    </StoryFrame>
  );
}
