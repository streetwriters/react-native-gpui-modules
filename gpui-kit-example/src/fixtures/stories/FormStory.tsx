import React, { useState } from 'react';
import { View } from 'react-native';
import {
  Checkbox,
  ColorPicker,
  DatePicker,
  Form,
  Input,
  Select,
  Separator,
  Switch,
  Textarea,
} from '@react-native-gpui/gpui-kit';
import { StoryFrame, StoryToolbar, T, type StorySize } from './StoryKit';

/** `crates/story/src/stories/form_story.rs` of gpui-component v0.9.1. */
export function FormStory({ size = 'medium' }: { size?: StorySize }) {
  const [horizontal, setHorizontal] = useState(false);
  const [columns, setColumns] = useState(1);
  const [subscribe, setSubscribe] = useState(false);
  const multi = columns > 1;
  return (
    <StoryFrame testID="story-form">
      <View
        style={{ flex: 1, padding: 16, justifyContent: 'flex-start', gap: 12 }}
      >
        <StoryToolbar
          size={size}
          items={[
            {
              label: 'Options',
              menu: [
                {
                  label: 'Horizontal',
                  checked: horizontal,
                  onSelect: () => setHorizontal(h => !h),
                },
                {
                  label: 'Multiple columns',
                  checked: columns > 1,
                  onSelect: () => setColumns(c => (c > 1 ? 1 : 2)),
                },
              ],
            },
          ]}
        />
        <Separator orientation="horizontal" />
        <Form
          horizontal={horizontal}
          size={size}
          columns={columns}
          labelWidth={multi ? 100 : 140}
          fields={[
            {
              label: 'Name',
              control: (
                <Input
                  size={size}
                  defaultValue="Jason Lee"
                  kitStyle={{ paddingHorizontal: 0 }}
                  prefix={
                    <View style={{ width: 90 }}>
                      <Select
                        style={{ width: 90 }}
                        items={['Mr.', 'Mrs.', 'Ms.', 'Dr.']}
                        defaultValue="Mr."
                        size={size}
                        appearance={false}
                      />
                    </View>
                  }
                />
              ),
            },
            {
              label: 'Email',
              required: true,
              control: <Input size={size} placeholder="Enter text here..." />,
            },
            {
              label: 'Bio',
              description: 'Use at most 100 words to describe yourself.',
              kitStyle: horizontal ? undefined : { alignItems: 'flex-start' },
              control: (
                <Textarea
                  size={size}
                  autoGrowMin={5}
                  autoGrowMax={20}
                  placeholder="Enter text here..."
                  defaultValue="Hello 世界，this is GPUI component."
                />
              ),
            },
            {
              labelIndent: false,
              colSpan: multi ? 2 : 1,
              control: <T>This is a full width form field.</T>,
            },
            {
              label: 'Please select your birthday',
              description: 'Select your birthday, we will send you a gift.',
              control: <DatePicker size={size} />,
            },
            {
              labelIndent: !(horizontal && multi),
              colStart: multi ? 1 : 0,
              control: (
                <Switch
                  size={size}
                  label="Subscribe our newsletter"
                  checked={subscribe}
                  onChange={e => setSubscribe(e.nativeEvent.state)}
                />
              ),
            },
            {
              label: 'Theme color',
              control: (
                <ColorPicker select defaultValue="#6366F1" size={size} />
              ),
            },
            {
              labelIndent: !(horizontal && multi),
              control: (
                <Checkbox
                  size={size}
                  label="Use this color for future events"
                  checked={subscribe}
                  onChange={e => setSubscribe(e.nativeEvent.state)}
                />
              ),
            },
          ]}
        />
      </View>
    </StoryFrame>
  );
}
