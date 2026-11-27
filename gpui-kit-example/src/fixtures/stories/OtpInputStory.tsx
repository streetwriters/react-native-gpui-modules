import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import { OtpInput } from '@react-native-gpui/gpui-kit';
import {
  Section,
  StoryFrame,
  StoryToolbar,
  T,
  type StorySize,
} from './StoryKit';

/** `crates/story/src/stories/otp_input_story.rs` of gpui-component v0.9.1. */
export function OtpInputStory({ size = 'medium' }: { size?: StorySize }) {
  const [masked, setMasked] = useState(true);
  const [value, setValue] = useState<string | null>(null);
  const text = useRef('');
  return (
    <StoryFrame testID="story-otp_input">
      <View style={{ flex: 1, gap: 20 }}>
        <StoryToolbar
          size={size}
          items={[
            {
              label: 'Options',
              menu: [
                {
                  label: 'Masked',
                  checked: masked,
                  onSelect: () => setMasked(v => !v),
                },
              ],
            },
          ]}
        />
        <Section
          title="Default"
          description="Six cells with masking and value updates."
          column
        >
          <OtpInput
            length={6}
            masked={masked}
            size={size}
            onChangeText={next => (text.current = next)}
            onComplete={() => setValue(text.current)}
          />
          {value !== null && <T>{`Value: ${value}`}</T>}
        </Section>
        <Section
          title="Grouping"
          description="Cells can be shown as one or several groups."
          column
        >
          <OtpInput
            length={6}
            defaultValue="123456"
            masked
            groups={1}
            size={size}
          />
          <OtpInput
            length={6}
            defaultValue="012345"
            masked
            groups={3}
            size={size}
          />
        </Section>
        <Section title="Custom size" description="Custom cell dimensions.">
          <OtpInput
            length={4}
            masked
            defaultValue="654321"
            groups={1}
            customSize={55}
          />
        </Section>
        <Section title="Disabled" description="Disabled input with a value.">
          <OtpInput
            length={6}
            masked
            defaultValue="123456"
            size={size}
            disabled
          />
        </Section>
      </View>
    </StoryFrame>
  );
}
