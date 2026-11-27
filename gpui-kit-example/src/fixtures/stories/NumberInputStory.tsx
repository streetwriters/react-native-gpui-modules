import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, NumberInput } from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame } from './StoryKit';

/** `crates/story/src/stories/number_input_story.rs` of gpui-component v0.9.1. */
const SECONDARY = '#e5e5e5';
const INFO = '#06b6d4';
const field = { width: 260 };

const round = (value: number) => Math.round(value * 1000) / 1000;

export function NumberInputStory() {
  const [first, setFirst] = useState('1');
  const [styled, setStyled] = useState('0.9');
  return (
    <StoryFrame testID="story-number_input">
      <View style={{ flex: 1, justifyContent: 'flex-start', gap: 12 }}>
        <Section
          title="Default"
          description="Application-managed step events."
          style={{ width: 512 }}
        >
          <NumberInput
            style={field}
            placeholder="Normal Integer"
            value={first}
            onChangeText={setFirst}
            onStep={e =>
              setFirst(v =>
                String(
                  (parseInt(v, 10) || 0) + (e.nativeEvent.increment ? 1 : -1),
                ),
              )
            }
          />
        </Section>
        <Section
          title="Disabled"
          description="Read-only disabled state."
          style={{ width: 512 }}
        >
          <NumberInput
            style={field}
            defaultValue="100"
            placeholder="Disabled"
            disabled
          />
        </Section>
        <Section
          title="Suffix"
          description="Small size with a suffix action."
          style={{ width: 512 }}
        >
          <NumberInput
            style={field}
            size="small"
            placeholder="Unsized Integer"
            pattern="^\d+$"
            min={0}
            suffix={<Button variant="text" icon="info" size="xsmall" />}
          />
        </Section>
        <Section
          title="Number format"
          description="Grouping, decimals, range, and step."
          style={{ width: 512 }}
        >
          <NumberInput
            style={field}
            placeholder="Mask pattern"
            maskPattern={JSON.stringify({ separator: ',', fraction: 2 })}
            defaultValue="1234.56"
            step={100}
            min={0}
          />
        </Section>
        <Section
          title="Custom style"
          description="Appearance-free input with dynamic steps."
          style={{ width: 512 }}
        >
          <NumberInput
            style={field}
            placeholder="Styling"
            appearance={false}
            kitStyle={{ backgroundColor: SECONDARY, color: INFO }}
            value={styled}
            onChangeText={setStyled}
            onStep={e =>
              setStyled(v => {
                const value = parseFloat(v) || 0;
                const up = e.nativeEvent.increment;
                const step = up
                  ? value < 1
                    ? 0.1
                    : 0.5
                  : value <= 1
                    ? 0.1
                    : 0.5;
                return String(Math.max(0, round(value + (up ? step : -step))));
              })
            }
          />
        </Section>
      </View>
    </StoryFrame>
  );
}
