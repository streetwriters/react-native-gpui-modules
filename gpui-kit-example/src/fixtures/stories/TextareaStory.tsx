import React, { useRef, useState } from 'react';
import { View } from 'react-native';
import {
  Button,
  Textarea,
  type TextareaHandle,
} from '@react-native-gpui/gpui-kit';
import {
  Section,
  StoryFrame,
  StoryToolbar,
  T,
  theme,
  type StorySize,
} from './StoryKit';

/** `crates/story/src/stories/textarea_story.rs` of gpui-component v0.9.1. */
const INTRO =
  'Hello 世界，this is GPUI component.\n\nThe GPUI Component is a collection of UI components for GPUI framework, including.\n\nButton, Input, Checkbox, Radio, Dropdown, Tab, and more...\n\nHere is an application that is built by using GPUI Component.\n\n> This application is still under development, not published yet.\n\n![image](https://github.com/user-attachments/assets/559a648d-19df-4b5a-b563-b78cc79c8894)\n\n![image](https://github.com/user-attachments/assets/5e06ad5d-7ea0-43db-8d13-86a240da4c8d)\n\n## Demo\n\nIf you want to see the demo, here is a some demo applications.\n';
const NO_WRAP =
  'This is a very long line of text to test if the horizontal scrolling function is working properly, and it should not wrap automatically but display a horizontal scrollbar.\nThe second line is also very long text, used to test the horizontal scrolling effect under multiple lines, and you can input more content to test.\nThe third line: Here you can input other long text content that requires horizontal scrolling.\n';
const AUTO_GROW =
  'Hello 世界 this is a very long line of text to test if the horizontal scrolling function is working properly, and it should not wrap automatically but display a horizontal scrollbar.\nThe second line is also very long text, used to test the horizontal scrolling effect under multiple lines, and you can input more content to test.\nThe third line: Here you can input other long text content that requires horizontal scrolling.\n';

export function TextareaStory({ size = 'medium' }: { size?: StorySize }) {
  const main = useRef<TextareaHandle>(null);
  const [cursor, setCursor] = useState('0:0');
  const [messages, setMessages] = useState<string[]>([]);
  const [chat, setChat] = useState('');
  return (
    <StoryFrame testID="story-textarea">
      <View style={{ width: '100%', gap: 12 }}>
        <StoryToolbar size={size} />
        <Section title="Textarea" style={{ width: 560 }}>
          <View style={{ gap: 8, width: '100%' }}>
            <Textarea
              ref={main}
              size={size}
              style={{ height: 320 }}
              rows={10}
              placeholder="Enter text here..."
              searchable
              defaultValue={INTRO}
              onCursorChange={e =>
                setCursor(`${e.nativeEvent.line}:${e.nativeEvent.character}`)
              }
            />
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button
                  outline
                  size="xsmall"
                  label="Insert Text"
                  onPress={() => main.current?.insert('Hello 你好')}
                />
                <Button
                  outline
                  size="xsmall"
                  label="Replace Text"
                  onPress={() => main.current?.replace('Hello 你好')}
                />
              </View>
              <T>{cursor}</T>
            </View>
          </View>
        </Section>
        <Section title="No Wrap" style={{ width: 560 }}>
          <Textarea
            size={size}
            style={{ width: '100%', height: 200 }}
            rows={6}
            softWrap={false}
            defaultValue={NO_WRAP}
          />
        </Section>
        <Section title="Auto Grow" style={{ width: 560 }}>
          <Textarea
            size={size}
            style={{ width: '100%' }}
            autoGrowMin={1}
            autoGrowMax={5}
            placeholder="Enter text here..."
            defaultValue={AUTO_GROW}
          />
        </Section>
        <Section title="Auto Grow with No Wrap" style={{ width: 560 }}>
          <Textarea
            size={size}
            style={{ width: '100%' }}
            autoGrowMin={1}
            autoGrowMax={5}
            softWrap={false}
            placeholder="Enter text here..."
            defaultValue="Hello 世界，this is GPUI component."
          />
        </Section>
        <Section title="Submit on Enter (Chat)" style={{ width: 560 }}>
          <View style={{ gap: 8, width: '100%' }}>
            <View style={{ gap: 4 }}>
              {messages.map((message, index) => (
                <View
                  key={index}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: theme.radius,
                    backgroundColor: theme.muted,
                  }}
                >
                  <T>{message}</T>
                </View>
              ))}
            </View>
            <Textarea
              size={size}
              autoGrowMin={1}
              autoGrowMax={5}
              submitOnEnter
              placeholder="Type a message, Enter to send, Shift+Enter for newline"
              value={chat}
              onChangeText={setChat}
              onSubmit={() => {
                if (chat.trim()) setMessages(list => [...list, chat.trim()]);
                setChat('');
              }}
            />
          </View>
        </Section>
        <Section
          title="Paste Images (Composer)"
          description="Paste a screenshot, it lands as an attachment pill above."
          style={{ width: 560 }}
        >
          <View style={{ gap: 8, width: '100%' }}>
            <Textarea
              size={size}
              autoGrowMin={1}
              autoGrowMax={5}
              placeholder="Paste a screenshot here, it becomes an attachment above"
            />
          </View>
        </Section>
      </View>
    </StoryFrame>
  );
}
