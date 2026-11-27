import React, { useState } from 'react';
import { View } from 'react-native';
import {
  Button,
  Checkbox,
  Clipboard,
  Radio,
  Switch,
  Toggle,
  Tooltip,
} from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame, T } from './StoryKit';

/** `crates/story/src/stories/tooltip_story.rs` of gpui-component v0.9.1. */
export function TooltipStory() {
  const [visible, setVisible] = useState(true);
  return (
    <StoryFrame testID="story-tooltip">
      <View style={{ width: '100%', gap: 12 }}>
        <Section
          title="Button"
          description="Prefer the left, bottom, or right side, with an optional keyboard shortcut hint."
        >
          <Button
            label="Search"
            variant="primary"
            tooltip="This is a search Button."
            tooltipPlacement="left"
          />
          <Button
            label="Info"
            tooltip="This is a tooltip with Action for display keybinding."
            tooltipPlacement="bottom"
          />
          <Button
            label="Hover me"
            tooltip="This tooltip prefers the right side."
            tooltipPlacement="right"
          />
        </Section>
        <Section
          title="Show delay"
          description="Override the delay per trigger. Moving between triggers switches without waiting again."
        >
          <Button
            label="Immediate"
            tooltip="Shows as soon as the pointer enters."
            tooltipShowDelay={0}
          />
          <Button
            label="Default"
            tooltip="Shows after the application default delay."
          />
          <Button
            label="Slow"
            tooltip="Shows after 1 second."
            tooltipShowDelay={1000}
          />
        </Section>
        <Section
          title="Checkbox"
          description="Tooltips work on selection controls."
        >
          <Checkbox label="Remember me" checked tooltip="This is a tooltip" />
        </Section>
        <Section
          title="Radio"
          description="Explain an individual radio option."
        >
          <Radio
            label="Radio with tooltip"
            checked
            tooltip="This is a radio button"
          />
        </Section>
        <Section
          title="Switch"
          description="Add context without extending the visible label."
        >
          <Switch checked tooltip="This is a switch" />
        </Section>
        <Section
          title="Toggle"
          description="Describe text and icon-only toggles."
        >
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Toggle label="Bold" tooltip="Toggle bold" />
            <Toggle icon="heart" tooltip="Toggle favorite" />
          </View>
        </Section>
        <Section title="Clipboard" description="Clarify the copy action.">
          <Clipboard value="Hello, World!" tooltip="Copy to clipboard" />
        </Section>
        <Section
          title="Custom content"
          description="Build tooltip content with an action hint."
        >
          <Tooltip content="This is a default tooltip style by GPUI.">
            <T>Hover me</T>
          </Tooltip>
        </Section>
        <Section
          title="Removed trigger"
          description="Dismiss cleanly when the trigger leaves the view."
        >
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {visible ? (
              <Button
                variant="danger"
                label="Remove me"
                tooltip="Clicking this button removes the trigger."
                onPress={() => setVisible(false)}
              />
            ) : (
              <Button label="Restore button" onPress={() => setVisible(true)} />
            )}
          </View>
        </Section>
      </View>
    </StoryFrame>
  );
}
