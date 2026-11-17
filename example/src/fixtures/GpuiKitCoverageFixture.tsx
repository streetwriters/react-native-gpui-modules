import { ScrollView, Text, View } from 'react-native';
import {
  Accordion,
  Breadcrumb,
  Button,
  GroupBox,
  Input,
  InputGroup,
  Kbd,
  Marker,
  Plot,
} from '@react-native-gpui/gpui-kit';

const points = [
  { label: 'a', value: 4 },
  { label: 'b', value: 7 },
  { label: 'c', value: 3 },
  { label: 'd', value: 6 },
];

export function GpuiKitCoverageFixture() {
  return (
    <ScrollView contentContainerStyle={{ padding: 12, gap: 8 }}>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {(['bar', 'pie', 'donut', 'radar'] as const).map(kind => (
          <Plot
            key={kind}
            testID={`cov-plot-${kind}`}
            data={points}
            layers={[{ kind, color: '#ff0000' }]}
            style={{ width: 140, height: 100 }}
          />
        ))}
        <Plot
          testID="cov-plot-sankey"
          data={points}
          links={[
            { source: 0, target: 2, value: 3 },
            { source: 1, target: 2, value: 2 },
            { source: 1, target: 3, value: 4 },
          ]}
          layers={[{ kind: 'sankey', color: '#ff0000' }]}
          style={{ width: 140, height: 100 }}
        />
      </View>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <Kbd
          testID="cov-kbd-action"
          action="input::SelectAll"
          actionContext="Input"
        />
        <Button
          testID="cov-button-custom"
          label="Custom"
          customColor="#ff0000"
          customForeground="#ffffff"
          accessibilityRoleOverride="link"
          tabOrder={1}
        />
        <Input
          testID="cov-input-slots"
          defaultValue="slots"
          prefix={<Text style={{ color: '#ff0000' }}>RN</Text>}
          style={{ width: 200, height: 32 }}
        />
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <InputGroup
          testID="cov-probe-group"
          end={<Text style={{ color: '#ff0000' }}>USD</Text>}
          style={{ width: 200 }}
        />
        <Marker
          testID="cov-probe-marker"
          text="m"
          iconSlot={<Text style={{ color: '#ff0000' }}>RN</Text>}
          style={{ width: 120, height: 24 }}
        />
      </View>
      <GroupBox
        testID="cov-group-box"
        title="Styled"
        titleStyle={{ color: '#ff0000', fontSize: 18 }}
        contentStyle={{ backgroundColor: '#ff0000' }}
        style={{ width: 240 }}
      >
        <Text>Body</Text>
      </GroupBox>
      <Marker
        testID="cov-marker"
        variant="separator"
        text="Styled separator"
        separatorStyle={{ backgroundColor: '#ff0000' }}
        style={{ width: 240, height: 24 }}
      />
      <Breadcrumb
        testID="cov-breadcrumb"
        items={[
          { label: 'Home', style: { color: '#ff0000' } },
          { label: 'Docs' },
        ]}
      />
      <Accordion
        testID="cov-accordion"
        items={[{ title: 'Styled', open: true, content: <Text>Inside</Text> }]}
        titleStyle={{ backgroundColor: '#ff0000' }}
        style={{ width: 240 }}
      />
    </ScrollView>
  );
}
