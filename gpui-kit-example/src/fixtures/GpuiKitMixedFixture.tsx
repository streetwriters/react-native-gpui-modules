import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  Button,
  Checkbox,
  DescriptionList,
  Empty,
  GroupBox,
  Marker,
  Switch,
} from '@react-native-gpui/gpui-kit';

export function GpuiKitMixedFixture() {
  const [log, setLog] = useState('');
  const [nested, setNested] = useState(false);
  const note = (name: string) => setLog(current => `${current}${name},`);
  return (
    <ScrollView contentContainerStyle={{ padding: 12, gap: 12 }}>
      <Text testID="mixed-log">{`log ${log}`}</Text>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <Text testID="mixed-rn-text">RN text</Text>
        <Button
          testID="mixed-kit-button"
          label="Kit button"
          onPress={() => note('kit')}
        />
        <Pressable testID="mixed-rn-pressable" onPress={() => note('rn')}>
          <Text>RN pressable</Text>
        </Pressable>
        <Button testID="mixed-kit-children" onPress={() => note('child')}>
          <Text testID="mixed-kit-children-text">RN inside a kit button</Text>
        </Button>
      </View>
      <GroupBox
        testID="mixed-group"
        variant="outline"
        style={{ width: 420, height: 270 }}
        title={<Text testID="mixed-title">RN title</Text>}
        footer={
          <Button
            testID="mixed-footer-button"
            label="Footer"
            onPress={() => note('footer')}
          />
        }
      >
        <Pressable testID="mixed-body-pressable" onPress={() => note('body')}>
          <Text testID="mixed-body-text">RN body text</Text>
        </Pressable>
        <Checkbox
          testID="mixed-body-checkbox"
          label="Kit in the body"
          onChange={event => note(`checkbox:${event.nativeEvent.state}`)}
        />
        <GroupBox
          testID="mixed-nested-group"
          variant="fill"
          title="A nested kit view"
          style={{ width: 380, height: 90 }}
        >
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Text testID="mixed-nested-text">nested RN</Text>
            <Switch
              testID="mixed-nested-switch"
              checked={nested}
              onChange={event => setNested(event.nativeEvent.state)}
            />
          </View>
        </GroupBox>
      </GroupBox>
      <Text testID="mixed-nested-state">{`nested ${nested}`}</Text>
      <DescriptionList
        testID="mixed-description"
        style={{ width: 420, height: 90 }}
        columns={2}
        items={[
          { label: 'Name', value: 'react-native-gpui' },
          {
            label: 'Action',
            value: (
              <Button
                testID="mixed-description-button"
                label="In a list"
                onPress={() => note('described')}
              />
            ),
          },
        ]}
      />
      <Marker
        testID="mixed-marker"
        variant="separator"
        text="Marker"
        icon="info"
        style={{ width: 420, height: 24 }}
      >
        <Text testID="mixed-marker-text">RN after the text</Text>
      </Marker>
      <Empty
        testID="mixed-empty"
        style={{ width: 420, height: 170 }}
        icon="inbox"
        title="Nothing here"
        description={
          <Text testID="mixed-empty-description">RN description</Text>
        }
      >
        <Button
          testID="mixed-empty-action"
          label="Add"
          onPress={() => note('add')}
        />
      </Empty>
    </ScrollView>
  );
}
