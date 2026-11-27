import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Button, Input, Label, Toggle } from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame, StoryToolbar, theme } from './StoryKit';

/** `crates/story/src/stories/label_story.rs` of gpui-component v0.9.1. */
const card = {
  width: '100%',
  padding: 16,
  borderRadius: theme.radiusLg,
} as const;

export function LabelStory() {
  const [prefix, setPrefix] = useState(false);
  const [highlights, setHighlights] = useState('');
  const [masked, setMasked] = useState(false);
  return (
    <StoryFrame testID="story-label">
      <View style={{ width: '100%', alignItems: 'center', gap: 24 }}>
        <View style={{ alignSelf: 'stretch' }}>
          <StoryToolbar
            items={[
              {
                label: 'Options',
                menu: [
                  {
                    label: 'Prefix Match',
                    checked: prefix,
                    onSelect: () => setPrefix(v => !v),
                  },
                ],
              },
            ]}
          />
        </View>
        <Section
          title="Default"
          description="Present primary text with optional supporting context."
          style={{ width: 560 }}
        >
          <View style={{ width: 320, gap: 16 }}>
            <Label text="Account details" />
            <Label text="Company address" secondary="Optional" />
            <Label
              text="Workspace owner"
              secondary="Administrator"
              kitStyle={{ fontWeight: 600 }}
            />
          </View>
        </Section>
        <Section
          title="Highlighting"
          description="Find matching text across Latin and CJK content."
          style={{ width: 560 }}
        >
          <View style={{ width: 320, gap: 16 }}>
            <View style={{ width: '100%', flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Input
                  placeholder="Search labels"
                  cleanOnEscape
                  value={highlights}
                  onChangeText={setHighlights}
                />
              </View>
              <Toggle
                label="Mask"
                checked={masked}
                onChange={e => setMasked(e.nativeEvent.state)}
              />
            </View>
            <View
              style={[
                card,
                { gap: 12, borderWidth: 1, borderColor: theme.border },
              ]}
            >
              <Label
                text="Design system documentation"
                highlights={highlights}
                highlightsPrefix={prefix}
                masked={masked}
              />
              <Label
                text="AAA中文BB"
                highlights={highlights}
                highlightsPrefix={prefix}
                masked={masked}
              />
            </View>
          </View>
        </Section>
        <Section
          title="Layout"
          description="Labels support alignment and natural wrapping."
          style={{ width: 560 }}
        >
          <View style={{ width: 320, gap: 16 }}>
            <View
              style={[
                card,
                { gap: 8, backgroundColor: 'rgba(245,245,245,0.4)' },
              ]}
            >
              <Label text="Start aligned" />
              <Label
                text="Center aligned"
                style={{ alignSelf: 'stretch' }}
                kitStyle={{ textAlign: 'center' }}
              />
              <Label
                text="End aligned"
                style={{ alignSelf: 'stretch' }}
                kitStyle={{ textAlign: 'right' }}
              />
            </View>
            <View style={{ width: 220 }}>
              <Label
                text="Long labels wrap cleanly inside constrained layouts."
                kitStyle={{ lineHeight: 24 }}
              />
            </View>
          </View>
        </Section>
        <Section
          title="Masked"
          description="Reveal or conceal sensitive values in place."
          style={{ width: 560 }}
        >
          <View
            style={[
              card,
              {
                width: 320,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderWidth: 1,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={{ gap: 4 }}>
              <Text
                style={{
                  fontSize: 12,
                  lineHeight: 19.4,
                  color: theme.mutedForeground,
                }}
              >
                Available balance
              </Text>
              <Label
                text="$9,182.10"
                masked={masked}
                kitStyle={{ fontSize: 24, fontWeight: 600 }}
              />
            </View>
            <Button
              variant="ghost"
              icon={masked ? 'eye-off' : 'eye'}
              onPress={() => setMasked(m => !m)}
            />
          </View>
        </Section>
      </View>
    </StoryFrame>
  );
}
