import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  Button,
  Carousel,
  List,
  Resizable,
  ResizablePanel,
  StatusBar,
  Table,
  Toolbar,
  Tree,
} from '@react-native-gpui/gpui-kit';

export function GpuiKitLayoutFixture() {
  const [log, setLog] = useState('');
  const add = (name: string) => setLog(current => `${current}${name},`);
  return (
    <ScrollView contentContainerStyle={{ padding: 12, gap: 10 }}>
      <Text testID="layout-log">{`log ${log}`}</Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <List
          testID="layout-list"
          style={{ width: 200, height: 120 }}
          rows={[
            { label: 'First' },
            {
              content: (
                <Text testID="layout-list-rn" style={{ color: '#ff0000' }}>
                  RN row
                </Text>
              ),
            },
            { label: 'Third' },
          ]}
          onConfirm={event => add(`list:${event.nativeEvent.index}`)}
        />
        <Tree
          testID="layout-tree"
          style={{ width: 200, height: 120 }}
          items={[
            {
              id: 'src',
              label: 'src',
              expanded: true,
              children: [
                { id: 'a', label: 'a.ts' },
                { id: 'b', label: 'b.ts' },
              ],
            },
            { id: 'docs', label: 'docs' },
          ]}
          onSelect={event => add(`tree:${event.nativeEvent.id}`)}
        />
      </View>
      <Table
        testID="layout-table"
        style={{ width: 420, height: 150 }}
        columns={[
          { key: 'name', title: 'Name', width: 140 },
          { key: 'role', title: 'Role', width: 140 },
        ]}
        rows={[
          ['Ada', 'Mathematician'],
          [
            'Grace',
            <Pressable
              key="g"
              testID="layout-table-rn"
              onPress={() => add('cell')}
            >
              <Text style={{ color: '#ff0000' }}>RN cell</Text>
            </Pressable>,
          ],
        ]}
        onSelectRow={event => add(`row:${event.nativeEvent.row}`)}
      />
      <StatusBar
        testID="layout-status"
        style={{ width: 420, height: 28 }}
        left={<Text testID="layout-status-left">left text</Text>}
        right={<Text testID="layout-status-right">right text</Text>}
      />
      <Toolbar testID="layout-toolbar" style={{ width: 420, height: 40 }}>
        <Pressable testID="layout-toolbar-item" onPress={() => add('tool')}>
          <Text>Tool</Text>
        </Pressable>
      </Toolbar>
      <Resizable testID="layout-resizable" style={{ width: 420, height: 100 }}>
        <ResizablePanel size={200}>
          <Text testID="layout-panel-0">panel zero</Text>
        </ResizablePanel>
        <ResizablePanel>
          <Button
            testID="layout-panel-1"
            label="Panel one"
            onPress={() => add('panel')}
          />
        </ResizablePanel>
      </Resizable>
      <Carousel
        testID="layout-carousel"
        style={{ width: 320, height: 120 }}
        onChange={event => add(`slide:${event.nativeEvent.index}`)}
      >
        <Text testID="layout-slide-0">slide zero</Text>
        <Text testID="layout-slide-1">slide one</Text>
      </Carousel>
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}
