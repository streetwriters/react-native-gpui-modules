import React, { useState } from 'react';
import { View } from 'react-native';
import { Stepper } from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame, StoryToolbar, type StorySize } from './StoryKit';

/** `crates/story/src/stories/stepper_story.rs` of gpui-component v0.9.1. */
export function StepperStory({ size = 'medium' }: { size?: StorySize }) {
  const [step0, setStep0] = useState(1);
  const [step1, setStep1] = useState(0);
  const [step2, setStep2] = useState(2);
  const [step3, setStep3] = useState(0);
  const [disabled, setDisabled] = useState(false);
  return (
    <StoryFrame testID="story-stepper">
      <View style={{ width: '100%', gap: 12 }}>
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
              ],
            },
          ]}
        />
        <Section title="Horizontal Stepper" column style={{ width: 480 }}>
          <Stepper
            style={{ width: '100%' }}
            kitStyle={{ width: '100%' }}
            size={size}
            disabled={disabled}
            selectedIndex={step0}
            items={[
              { title: 'Step 1' },
              { title: 'Step 2' },
              { title: 'Step 3' },
            ]}
            onSelect={e => setStep0(e.nativeEvent.index)}
          />
        </Section>
        <Section title="Icon Stepper" column style={{ width: 480 }}>
          <Stepper
            style={{ width: '100%' }}
            kitStyle={{ width: '100%' }}
            size={size}
            disabled={disabled}
            selectedIndex={step1}
            items={[
              { icon: 'calendar', title: 'Order Details' },
              { icon: 'inbox', title: 'Shipping' },
              { icon: 'frame', title: 'Preview' },
              { icon: 'info', title: 'Finish' },
            ]}
            onSelect={e => setStep1(e.nativeEvent.index)}
          />
        </Section>
        <Section title="Vertical Stepper" column style={{ width: 480 }}>
          <Stepper
            layout="vertical"
            size={size}
            disabled={disabled}
            selectedIndex={step2}
            kitStyle={{ alignItems: 'center' }}
            items={[
              { icon: 'building-2', n: 1 },
              { icon: 'asterisk', n: 2 },
              { icon: 'folder', n: 3 },
              { icon: 'circle-check', n: 4 },
            ].map(({ icon, n }) => ({
              icon: icon as 'folder',
              title: `Step ${n}`,
              description: `Description for step ${n}.`,
              kitStyle: n < 4 ? { paddingBottom: 32 } : undefined,
            }))}
            onSelect={e => setStep2(e.nativeEvent.index)}
          />
        </Section>
        <Section title="Text Center" column style={{ width: 480 }}>
          <Stepper
            size={size}
            disabled={disabled}
            selectedIndex={step3}
            textCenter
            fitWidth
            items={[1, 2, 3].map(n => ({
              title: `Step ${n}`,
              description: `Desc for step ${n}.`,
            }))}
            onSelect={e => setStep3(e.nativeEvent.index)}
          />
        </Section>
      </View>
    </StoryFrame>
  );
}
