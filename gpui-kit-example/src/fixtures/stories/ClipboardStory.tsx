import React, { useState } from 'react';
import { View } from 'react-native';
import { Clipboard, Input, Label } from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame } from './StoryKit';

/** `crates/story/src/stories/clipboard_story.rs` of gpui-component v0.9.1. */
export function ClipboardStory() {
  const [url, setUrl] = useState('https://github.com');
  return (
    <StoryFrame testID="story-clipboard">
      <View style={{ flex: 1, justifyContent: 'flex-start', gap: 12 }}>
        <Section
          title="Default"
          description="Copies a value supplied by the application."
          style={{ width: 480 }}
        >
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Label text="A clipboard button" />
            <Clipboard value="masked :false" />
          </View>
        </Section>
        <Section
          title="With Input"
          description="Copies the field's current value."
          style={{ width: 480 }}
        >
          <View style={{ width: '100%' }}>
            <Input
              defaultValue="https://github.com"
              onChangeText={setUrl}
              suffix={<Clipboard value={url} />}
            />
          </View>
        </Section>
      </View>
    </StoryFrame>
  );
}
