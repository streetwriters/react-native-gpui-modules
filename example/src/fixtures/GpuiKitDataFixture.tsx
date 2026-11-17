import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  Calendar,
  ColorPicker,
  Combobox,
  DatePicker,
  Select,
  Tabs,
  TimeField,
} from '@react-native-gpui/gpui-kit';

export function GpuiKitDataFixture() {
  const [log, setLog] = useState('');
  const [tab, setTab] = useState(0);
  const [date, setDate] = useState('2026-11-17');
  const add = (name: string) => setLog(current => `${current}${name},`);
  return (
    <ScrollView contentContainerStyle={{ padding: 12, gap: 10 }}>
      <Text testID="data-log">{`log ${log}`}</Text>
      <Select
        testID="data-select"
        items={['Alpha', 'Beta', 'Gamma']}
        placeholder="Pick one"
        onChange={event => add(`select:${event.nativeEvent.value}`)}
      />
      <Combobox
        testID="data-combobox"
        items={['Red', 'Green', 'Blue']}
        multiple
        placeholder="Pick many"
        onChange={event => add(`combo:${event.nativeEvent.values.join('+')}`)}
      />
      <Tabs
        testID="data-tabs"
        style={{ width: 360, height: 90 }}
        selectedIndex={tab}
        tabs={[
          { label: 'One', panel: <Text testID="data-panel-0">Panel one</Text> },
          { label: 'Two', panel: <Text testID="data-panel-1">Panel two</Text> },
        ]}
        onSelect={event => setTab(event.nativeEvent.index)}
      />
      <Pressable testID="data-set-date" onPress={() => setDate('2026-12-24')}>
        <Text>set date</Text>
      </Pressable>
      <Calendar
        testID="data-calendar"
        date={date}
        onChange={event => {
          setDate(event.nativeEvent.start);
          add(`cal:${event.nativeEvent.start}`);
        }}
      />
      <Text testID="data-date">{`date ${date}`}</Text>
      <DatePicker
        testID="data-date-picker"
        placeholder="Pick a date"
        onChange={event => add(`dp:${event.nativeEvent.start}`)}
      />
      <TimeField
        testID="data-time"
        time="10:30:00"
        onChange={event => add(`t:${event.nativeEvent.time}`)}
      />
      <ColorPicker
        testID="data-color"
        value="#ff0000"
        onChange={event => add(`c:${event.nativeEvent.color}`)}
      />
      <View style={{ height: 200 }} />
    </ScrollView>
  );
}
