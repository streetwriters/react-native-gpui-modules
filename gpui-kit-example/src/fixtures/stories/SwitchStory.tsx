import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Separator, Switch } from '@react-native-gpui/gpui-kit';
import {
  Section,
  StoryFrame,
  StoryToolbar,
  T,
  theme,
  type StorySize,
} from './StoryKit';

/** `crates/story/src/stories/switch_story.rs` of gpui-component v0.9.1. */
function Row({
  title,
  detail,
  children,
}: {
  title: string;
  detail: string;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
        padding: 16,
      }}
    >
      <View style={{ gap: 4 }}>
        <T style={{ fontWeight: '500' }}>{title}</T>
        <Text
          style={{
            fontSize: 14,
            lineHeight: 22.65,
            color: theme.mutedForeground,
          }}
        >
          {detail}
        </Text>
      </View>
      {children}
    </View>
  );
}

const card = {
  borderWidth: 1,
  borderColor: theme.border,
  borderRadius: theme.radiusLg,
} as const;

export function SwitchStory({ size = 'medium' }: { size?: StorySize }) {
  const [switch1, setSwitch1] = useState(true);
  const [switch2, setSwitch2] = useState(false);
  const [switch4, setSwitch4] = useState(true);
  const [switch5, setSwitch5] = useState(false);
  const [longLabel, setLongLabel] = useState(false);
  return (
    <StoryFrame testID="story-switch">
      <View style={{ width: '100%', gap: 12 }}>
        <StoryToolbar size={size} />
        <Section
          title="Default"
          description="Switches work well in a compact settings list."
          style={{ width: 512, alignItems: 'stretch' }}
        >
          <View style={[card, { width: '100%' }]}>
            <Row
              title="Product updates"
              detail="New features and release notes."
            >
              <Switch
                size={size}
                checked={switch1}
                onChange={e => setSwitch1(e.nativeEvent.state)}
              />
            </Row>
            <Separator orientation="horizontal" />
            <Row
              title="Security alerts"
              detail="Important activity on your account."
            >
              <Switch
                size={size}
                checked={switch2}
                onChange={e => setSwitch2(e.nativeEvent.state)}
              />
            </Row>
          </View>
        </Section>
        <Section
          title="Long labels"
          description="Long setting names wrap while the track keeps its size."
        >
          <View style={[card, { width: 320 }]}>
            <Switch
              kitStyle={{ padding: 16 }}
              size={size}
              label="Automatically transcribe downloaded episodes"
              checked={longLabel}
              onChange={e => setLongLabel(e.nativeEvent.state)}
            />
            <Separator orientation="horizontal" />
            <Switch
              kitStyle={{ padding: 16 }}
              size={size}
              label="Automatically download new episodes"
              checked
              disabled
            />
          </View>
        </Section>
        <Section
          title="Disabled"
          description="Unavailable switches preserve their current value."
          style={{ width: 512 }}
        >
          <Switch size={size} checked disabled />
          <Switch
            size={size}
            style={{ width: 200 }}
            kitStyle={{ width: 200 }}
            label="Airplane mode"
            checked
            disabled
          />
        </Section>
        <Section
          title="Color"
          description="Semantic colors can reinforce the setting state."
        >
          <Switch
            size={size}
            checked={switch4}
            label="Success"
            color={theme.success}
            onChange={e => setSwitch4(e.nativeEvent.state)}
          />
          <Switch
            size={size}
            checked={switch5}
            label="Destructive"
            color={theme.danger}
            onChange={e => setSwitch5(e.nativeEvent.state)}
          />
          <Switch
            size={size}
            checked
            label="Disabled"
            color={theme.success}
            disabled
          />
        </Section>
      </View>
    </StoryFrame>
  );
}
