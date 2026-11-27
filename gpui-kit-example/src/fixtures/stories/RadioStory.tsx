import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Radio, RadioGroup } from '@react-native-gpui/gpui-kit';
import {
  Section,
  StoryFrame,
  StoryToolbar,
  theme,
  type StorySize,
} from './StoryKit';

/** `crates/story/src/stories/radio_story.rs` of gpui-component v0.9.1. */
const hint = { fontSize: 12, lineHeight: 19.4, color: theme.mutedForeground };

export function RadioStory({ size = 'medium' }: { size?: StorySize }) {
  const [delivery, setDelivery] = useState(0);
  const [billing, setBilling] = useState(1);
  return (
    <StoryFrame testID="story-radio">
      <View style={{ width: '100%', alignItems: 'center', gap: 12 }}>
        <StoryToolbar size={size} />
        <Section
          title="Delivery"
          description="Choose one option from a clearly described set."
          style={{ width: 320 }}
        >
          <RadioGroup
            layout="vertical"
            style={{ width: 320 }}
            kitStyle={{ width: 320, gap: 12 }}
            selectedIndex={delivery}
            onChange={e => setDelivery(e.nativeEvent.index)}
          >
            <Radio
              size={size}
              kitStyle={{ width: 320 }}
              label="Standard delivery"
            >
              <Text style={hint}>Arrives in 3–5 business days.</Text>
            </Radio>
            <Radio
              size={size}
              kitStyle={{ width: 320 }}
              label="Express delivery"
            >
              <Text style={hint}>Arrives the next business day.</Text>
            </Radio>
            <Radio
              size={size}
              kitStyle={{ width: 320 }}
              label="Store pickup"
              disabled
            >
              <Text style={hint}>Unavailable for this order.</Text>
            </Radio>
          </RadioGroup>
        </Section>
        <Section
          title="Billing cycle"
          description="Horizontal groups work for short, related choices."
          style={{ width: 320 }}
        >
          <RadioGroup
            layout="horizontal"
            style={{ width: 320 }}
            kitStyle={{ width: 320, justifyContent: 'space-between' }}
            selectedIndex={billing}
            onChange={e => setBilling(e.nativeEvent.index)}
          >
            <Radio size={size} label="Monthly" />
            <Radio size={size} label="Yearly" />
            <Radio size={size} label="Lifetime" />
          </RadioGroup>
        </Section>
      </View>
    </StoryFrame>
  );
}
