import React, { useState } from 'react';
import { Text, View } from 'react-native';
import {
  Button,
  ButtonGroup,
  Icon,
  Theme,
  type ButtonProps,
} from '@react-native-gpui/gpui-kit';
import {
  Section,
  StoryFrame,
  StoryToolbar,
  theme,
  type StorySize,
} from './StoryKit';

/** `crates/story/src/stories/button_story.rs` of gpui-component v0.9.1. */
const MAGENTA = theme.magenta;
const custom = {
  customColor: MAGENTA,
  customForeground: MAGENTA,
  customHover: 'rgba(147,51,234,0.1)',
  customActive: 'rgba(147,51,234,0.2)',
};

export function ButtonStory({ size = 'medium' }: { size?: StorySize }) {
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(false);
  const [compact, setCompact] = useState(false);
  const [multiple, setMultiple] = useState(false);
  const [shadow, setShadow] = useState<boolean>();
  const state: ButtonProps = { size, disabled, selected, loading, compact };
  const B = (props: ButtonProps) => <Button {...state} {...props} />;
  return (
    <StoryFrame testID="story-button">
      <View style={{ gap: 24 }}>
        {shadow !== undefined && <Theme mode="light" shadow={shadow} />}
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
                {
                  label: 'Loading',
                  checked: loading,
                  onSelect: () => setLoading(v => !v),
                },
                {
                  label: 'Selected',
                  checked: selected,
                  onSelect: () => setSelected(v => !v),
                },
                {
                  label: 'Compact',
                  checked: compact,
                  onSelect: () => setCompact(v => !v),
                },
                {
                  label: 'Shadow',
                  checked: shadow ?? true,
                  onSelect: () => setShadow(v => !(v ?? true)),
                },
                { separator: true },
                {
                  label: 'Multiple selection',
                  checked: multiple,
                  onSelect: () => setMultiple(v => !v),
                },
              ],
            },
          ]}
        />
        <Section
          title="Variants"
          description="Visual treatments communicate action priority."
          style={{ width: 512 }}
        >
          <B label="Default" />
          <B variant="primary" label="Primary" />
          <B variant="secondary" label="Secondary" />
          <B variant="danger" label="Danger" />
          <B variant="warning" label="Warning" />
          <B variant="success" label="Success" />
          <B variant="info" label="Info" />
          <B variant="ghost" label="Ghost" />
          <B variant="link" label="Link" />
          <B variant="text" label="Text" />
        </Section>
        <Section
          title="Icons"
          description="Icons can lead labels or appear in custom content."
        >
          <B outline label="Confirm" icon="check" />
          <B outline label="Abort" icon="close" />
          <B outline label="Maximize" icon="maximize" />
          <B>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <Text style={{ fontSize: 14, color: theme.foreground }}>
                Custom Child
              </Text>
              <Icon name="chevron-down" />
              <Icon name="eye" />
            </View>
          </B>
          <B variant="ghost" icon="check" label="Confirm" />
          <B variant="link" icon="check" label="Link" />
          <B variant="text" icon="check" label="Text Button" />
        </Section>
        <Section
          title="Progress"
          description="Buttons can show determinate progress."
        >
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Button
              size={size}
              variant="primary"
              iconProgress={25}
              iconProgressColor={theme.primaryForeground}
              label="Installing..."
            />
            <Button size={size} iconProgress={35} label="Installing..." />
            <Button size={size} iconProgress={68} label="Installing..." />
            <Button size={size} iconProgress={85} label="Installing..." />
          </View>
        </Section>
        <Section
          title="Outline"
          description="Outlined treatments keep actions visually quiet."
          style={{ width: 512 }}
        >
          <B variant="primary" outline label="Primary Button" />
          <B outline label="Normal Button" />
          <B variant="danger" outline label="Danger Button" />
          <B variant="warning" outline label="Warning Button" />
          <B variant="success" outline label="Success Button" />
          <B variant="info" outline label="Info Button" />
          <B variant="ghost" outline label="Ghost Button" />
          <B variant="link" outline label="Link Button" />
          <B variant="text" outline label="Text Button" />
        </Section>
        <Section
          title="Dropdown"
          description="A caret indicates an attached menu."
          style={{ width: 512 }}
        >
          <B variant="primary" dropdownCaret label="Primary Button" />
          <B label="Default Button" dropdownCaret />
          <B variant="secondary" label="Secondary Button" dropdownCaret />
          <B variant="ghost" dropdownCaret label="Ghost Button" />
          <B variant="link" dropdownCaret label="Link Button" />
          <B outline dropdownCaret label="Small Button" />
        </Section>
        <Section title="Horizontal group">
          <ButtonGroup outline size={size} disabled={disabled}>
            <Button label="One" />
            <Button label="Two" />
            <Button label="Three" />
          </ButtonGroup>
        </Section>
        <Section title="Vertical group">
          <ButtonGroup
            outline
            layout="vertical"
            size={size}
            disabled={disabled}
          >
            <Button label="One" />
            <Button label="Two" />
            <Button label="Three" />
          </ButtonGroup>
        </Section>
        <Section
          title="Selection group"
          description="Groups support single or multiple selection."
        >
          <ButtonGroup
            outline
            compact
            multiple={multiple}
            size={size}
            onPress={e => {
              const on = e.nativeEvent.pressed;
              setDisabled(on.includes(0));
              setLoading(on.includes(1));
              setSelected(on.includes(2));
              setCompact(on.includes(3));
            }}
          >
            <Button label="Disabled" selected={disabled} />
            <Button label="Loading" selected={loading} />
            <Button label="Selected" selected={selected} />
            <Button label="Compact" selected={compact} />
          </ButtonGroup>
        </Section>
        <Section
          title="Icon-only"
          description="Compact actions can omit visible labels."
        >
          <B icon="search" loadingIcon="loader-circle" variant="primary" />
          <B icon="info" loading />
          <B icon="close" variant="danger" />
          <B icon="search" variant="primary" />
          <B icon="search" outline />
          <B icon="arrow-left" loadingIcon="loader-circle" variant="ghost" />
        </Section>
        <Section
          title="Custom size"
          description="A fixed pixel size is available for compact icon actions."
        >
          <B icon="heart" customSize={24} variant="ghost" />
        </Section>
        <Section title="Custom color">
          <B {...custom} label="Custom Button" />
          <B {...custom} outline label="Outline Button" />
          <B {...custom} outline icon="bell" label="Icon Button" />
        </Section>
      </View>
    </StoryFrame>
  );
}
