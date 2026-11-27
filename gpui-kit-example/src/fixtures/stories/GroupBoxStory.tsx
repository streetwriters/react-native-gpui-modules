import React, { useState } from 'react';
import { View } from 'react-native';
import {
  Button,
  Checkbox,
  GroupBox,
  Radio,
  RadioGroup,
  Switch,
  TextView,
} from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame, T } from './StoryKit';

/** `crates/story/src/stories/group_box_story.rs` of gpui-component v0.9.1. */
const GROUP_BOX = '#f5f5f5';

function Row({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <T>{label}</T>
      <Switch checked={checked} onChange={e => onChange(e.nativeEvent.state)} />
    </View>
  );
}

export function GroupBoxStory() {
  const [email, setEmail] = useState([false, false, false]);
  const [profilePrivate, setProfilePrivate] = useState(true);
  const [contributions, setContributions] = useState(false);
  const [compactPrivate, setCompactPrivate] = useState(true);
  const [themeIndex, setThemeIndex] = useState(2);
  const setOption = (index: number) => (value: boolean) =>
    setEmail(previous => previous.map((v, i) => (i === index ? value : v)));
  const body = { gap: 16 } as const;
  return (
    <StoryFrame testID="story-group_box">
      <View style={{ flex: 1, alignItems: 'center', gap: 24 }}>
        <Section title="Default" style={{ width: 512 }}>
          <GroupBox title="Email notifications" style={{ width: '100%' }}>
            <View style={body}>
              <Checkbox
                label="All activity"
                checked={email[0]}
                onChange={e => setOption(0)(e.nativeEvent.state)}
              />
              <Checkbox
                label="Product updates"
                checked={email[1]}
                onChange={e => setOption(1)(e.nativeEvent.state)}
              />
              <Checkbox
                label="Account activity"
                checked={email[2]}
                onChange={e => setOption(2)(e.nativeEvent.state)}
              />
              <Button variant="primary" label="Save preferences" />
            </View>
          </GroupBox>
        </Section>
        <Section title="Filled" style={{ width: 512 }}>
          <GroupBox
            variant="fill"
            title="Contributions & activity"
            footer="Private contributions never reveal repository names."
            style={{ width: '100%' }}
          >
            <View style={{ gap: 16 }}>
              <Row
                label="Make profile private and hide activity"
                checked={profilePrivate}
                onChange={setProfilePrivate}
              />
              <Row
                label="Include private contributions on my profile"
                checked={contributions}
                onChange={setContributions}
              />
              <Button variant="primary" label="Save" />
            </View>
          </GroupBox>
        </Section>
        <Section title="Outlined" style={{ width: 512 }}>
          <GroupBox
            variant="outline"
            title="Appearance"
            style={{ width: '100%' }}
          >
            <RadioGroup
              layout="vertical"
              selectedIndex={themeIndex}
              onChange={e => setThemeIndex(e.nativeEvent.index)}
            >
              <Radio label="Light" />
              <Radio label="Dark" />
              <Radio label="System" />
            </RadioGroup>
          </GroupBox>
        </Section>
        <Section title="Without Title" style={{ width: 512 }}>
          <GroupBox variant="outline" style={{ width: '100%' }}>
            <Row
              label="Make profile private and hide activity"
              checked={compactPrivate}
              onChange={setCompactPrivate}
            />
          </GroupBox>
        </Section>
        <Section title="Custom Style" style={{ width: 512 }}>
          <GroupBox
            variant="outline"
            title="This is a custom style"
            style={{ width: '100%' }}
            kitStyle={{
              backgroundColor: GROUP_BOX,
              borderRadius: 12,
              padding: 20,
            }}
            titleStyle={{
              fontWeight: 600,
              lineHeight: 16,
              paddingHorizontal: 12,
            }}
            contentStyle={{
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderWidth: 2,
            }}
          >
            <TextView
              source={
                'You can use `title_style` to customize the style of the title. \n And any style in `GroupBox` will apply to the content container.'
              }
            />
          </GroupBox>
        </Section>
      </View>
    </StoryFrame>
  );
}
