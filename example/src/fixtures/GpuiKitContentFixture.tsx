import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import {
  Attachment,
  Bubble,
  Button,
  Diff,
  Editor,
  Message,
  MessageScroller,
  TextView,
} from '@react-native-gpui/gpui-kit';

const patch = `diff --git a/a.txt b/a.txt
--- a/a.txt
+++ b/a.txt
@@ -1,2 +1,2 @@
-old line
+new line
 same
`;

export function GpuiKitContentFixture() {
  const [log, setLog] = useState('');
  const add = (name: string) => setLog(current => `${current}${name},`);
  return (
    <ScrollView contentContainerStyle={{ padding: 12, gap: 10 }}>
      <Text testID="content-log">{`log ${log}`}</Text>
      <Message
        testID="content-message"
        header="Ada"
        footer="now"
        avatar={<Text>A</Text>}
      >
        <Bubble testID="content-bubble" style={{ width: 240, height: 40 }}>
          <Text testID="content-bubble-body">Hello from a bubble</Text>
        </Bubble>
        <Text testID="content-message-body">message body</Text>
      </Message>
      <Attachment
        testID="content-attachment"
        title="report.pdf"
        description="2 MB"
        status="uploading"
        progress={40}
        actions={
          <Button
            testID="content-attachment-action"
            label="Go"
            onPress={() => add('action')}
          />
        }
      />
      <MessageScroller
        testID="content-scroller"
        style={{ width: 360, height: 120 }}
      >
        <Text testID="content-scroller-row-0">row 0</Text>
        <Text>row 1</Text>
        <Text>row 2</Text>
      </MessageScroller>
      <TextView
        testID="content-text"
        source={'# Title\n\nSome **markdown** text'}
      />
      <Diff
        testID="content-diff"
        patch={patch}
        style={{ width: 360, height: 120 }}
      />
      <Editor
        testID="content-editor"
        language="json"
        value={'{ "a": 1 }'}
        style={{ width: 360, height: 100 }}
      />
      <View style={{ height: 80 }} />
    </ScrollView>
  );
}
