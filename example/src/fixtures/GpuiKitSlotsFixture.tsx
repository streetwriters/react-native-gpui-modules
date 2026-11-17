import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Accordion, Button, Collapsible } from '@react-native-gpui/gpui-kit';

export function GpuiKitSlotsFixture() {
  const [log, setLog] = useState('');
  const [open, setOpen] = useState(false);
  const [sections, setSections] = useState('none');
  const note = (name: string) => setLog(current => `${current}${name},`);
  return (
    <View style={{ padding: 12, gap: 12 }}>
      <Text testID="slots-log">{`log ${log}`}</Text>
      <Text testID="slots-open">{`open ${open}`}</Text>
      <Collapsible
        testID="slots-collapsible"
        open={open}
        style={{ width: 420, height: 90 }}
        trigger={
          <Button
            testID="slots-collapsible-trigger"
            label="Toggle"
            onPress={() => setOpen(value => !value)}
          />
        }
      >
        <Text testID="slots-collapsible-text" style={{ color: '#ff0000' }}>
          RN content in a collapsible
        </Text>
      </Collapsible>
      <Accordion
        testID="slots-accordion"
        style={{ width: 420, height: 160 }}
        onToggle={event => setSections(event.nativeEvent.open.join(','))}
        items={[
          {
            title: 'First',
            open: true,
            content: (
              <Pressable
                testID="slots-accordion-pressable"
                onPress={() => note('accordion')}
              >
                <Text testID="slots-accordion-text">
                  RN content in an accordion
                </Text>
              </Pressable>
            ),
          },
          { title: 'Second', content: <Text>Second body</Text> },
        ]}
      />
      <Text testID="slots-accordion-state">{`sections ${sections}`}</Text>
    </View>
  );
}
