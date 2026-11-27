import { useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  History,
  Inspector,
  Plot,
  SearchableList,
  Speech,
  VirtualList,
  type HistoryChange,
  type HistoryHandle,
  type VirtualListHandle,
} from '@react-native-gpui/gpui-kit';

const Button = ({ id, onPress }: { id: string; onPress: () => void }) => (
  <Pressable
    testID={id}
    onPress={onPress}
    style={{ height: 28, paddingHorizontal: 8, backgroundColor: '#dddddd' }}
  >
    <Text>{id}</Text>
  </Pressable>
);

export function GpuiKitToolsFixture() {
  const history = useRef<HistoryHandle>(null);
  const list = useRef<VirtualListHandle>(null);
  const [change, setChange] = useState('none');
  const [inspector, setInspector] = useState(false);
  const [speech, setSpeech] = useState('');
  const report = (value: HistoryChange) =>
    setChange(
      `${value.current}|${value.canBack}|${value.canForward}|${value.length}|${value.moved}`,
    );
  return (
    <ScrollView contentContainerStyle={{ padding: 12, gap: 8 }}>
      <History ref={history} maxEntries={5} onChange={report} />
      <Text testID="tools-history">{`history ${change}`}</Text>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        <Button id="tools-push-a" onPress={() => history.current?.push('a')} />
        <Button id="tools-push-b" onPress={() => history.current?.push('b')} />
        <Button id="tools-back" onPress={() => history.current?.back()} />
        <Button id="tools-forward" onPress={() => history.current?.forward()} />
        <Button id="tools-clear" onPress={() => history.current?.clear()} />
      </View>
      <VirtualList
        testID="tools-virtual"
        itemSize={24}
        style={{ width: 240, height: 120 }}
        ref={list}
      >
        {Array.from({ length: 600 }, (_, index) => (
          <Text
            key={index}
            testID={`tools-vrow-${index}`}
          >{`row ${index}`}</Text>
        ))}
      </VirtualList>
      <Button id="tools-jump" onPress={() => list.current?.scrollToItem(500)} />
      <SearchableList
        testID="tools-search"
        style={{ width: 240, height: 160 }}
        rows={[
          {
            label: 'apple',
            content: <Text style={{ color: '#ff0000' }}>apple</Text>,
          },
          {
            label: 'banana',
            content: <Text style={{ color: '#ff0000' }}>banana</Text>,
          },
          {
            label: 'cherry',
            content: <Text style={{ color: '#ff0000' }}>cherry</Text>,
          },
        ]}
      />
      <Plot
        testID="tools-plot"
        style={{ width: 280, height: 160 }}
        layers={[
          'grid',
          'axis',
          { kind: 'area', color: '#ff0000' },
          { kind: 'line', color: '#ff0000', width: 3 },
          { kind: 'dots', color: '#ff0000' },
        ]}
        data={[
          { label: 'a', value: 3 },
          { label: 'b', value: 8 },
          { label: 'c', value: 5 },
          { label: 'd', value: 9 },
        ]}
      />
      <Speech
        testID="tools-speech"
        onStatusChange={status => setSpeech(status)}
        style={{ width: 320, height: 56 }}
      />
      <Text testID="tools-speech-state">{`speech ${speech}`}</Text>
      <Inspector open={inspector} />
      <Button
        id="tools-inspector"
        onPress={() => setInspector(value => !value)}
      />
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
