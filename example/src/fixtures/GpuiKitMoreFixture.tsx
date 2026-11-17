import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import {
  Button,
  Chart,
  Form,
  InputGroup,
  Sidebar,
  Theme,
} from '@react-native-gpui/gpui-kit';

export function GpuiKitMoreFixture() {
  const [log, setLog] = useState('');
  const [text, setText] = useState('');
  const [dark, setDark] = useState<'light' | 'dark'>('light');
  const add = (name: string) => setLog(current => `${current}${name},`);
  return (
    <ScrollView contentContainerStyle={{ padding: 12, gap: 10 }}>
      <Theme
        mode={dark}
        onChange={event => add(`theme:${event.nativeEvent.dark}`)}
      />
      <Text testID="more-log">{`log ${log}`}</Text>
      <Text testID="more-dark" onPress={() => setDark('dark')}>
        go dark
      </Text>
      <InputGroup
        testID="more-input-group"
        placeholder="amount"
        start="$"
        end={
          <Text testID="more-input-group-end" style={{ color: '#ff0000' }}>
            USD
          </Text>
        }
        value={text}
        onChangeText={value => {
          setText(value);
          add(`ig:${value}`);
        }}
      />
      <Form
        testID="more-form"
        style={{ width: 360, height: 130 }}
        fields={[
          {
            label: 'Name',
            required: true,
            control: <Text testID="more-form-control">RN control</Text>,
          },
          {
            label: 'Action',
            control: (
              <Button
                testID="more-form-button"
                label="Submit"
                onPress={() => add('submit')}
              />
            ),
          },
        ]}
      />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Sidebar
          testID="more-sidebar"
          style={{ width: 200, height: 220 }}
          width={200}
          groups={[
            {
              label: 'Main',
              items: [
                { label: 'Home', active: true },
                { label: 'Docs', open: true, children: [{ label: 'Guide' }] },
              ],
            },
          ]}
          header={<Text testID="more-sidebar-header">Header</Text>}
          onPress={event => add(`side:${event.nativeEvent.index}`)}
        />
        <Chart
          testID="more-chart"
          kind="bar"
          color="#ff0000"
          style={{ width: 240, height: 200 }}
          data={[
            { label: 'a', value: 3 },
            { label: 'b', value: 8 },
            { label: 'c', value: 5 },
          ]}
        />
      </View>
    </ScrollView>
  );
}
