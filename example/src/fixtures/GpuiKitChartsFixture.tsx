import { ScrollView, Text, View } from 'react-native';
import {
  Chart,
  GridItem,
  GridLayout,
  ScrollArea,
  TitleBar,
} from '@react-native-gpui/gpui-kit';

export function GpuiKitChartsFixture() {
  return (
    <ScrollView contentContainerStyle={{ padding: 12, gap: 10 }}>
      <TitleBar testID="content-title" style={{ width: 360, height: 36 }}>
        <Text>Title bar content</Text>
      </TitleBar>
      <Chart
        testID="content-candles"
        kind="candlestick"
        style={{ width: 240, height: 160 }}
        data={[
          { label: 'a', open: 3, high: 6, low: 2, close: 5 },
          { label: 'b', open: 5, high: 8, low: 4, close: 4 },
        ]}
      />
      <Chart
        testID="content-radar"
        kind="radar"
        color="#ff0000"
        style={{ width: 240, height: 200 }}
        data={[
          { label: 'speed', value: 4 },
          { label: 'power', value: 7 },
          { label: 'range', value: 5 },
        ]}
      />
      <Chart
        testID="content-sankey"
        kind="sankey"
        style={{ width: 320, height: 160 }}
        nodes={['a', 'b', 'c']}
        links={[
          { source: 0, target: 1, value: 5 },
          { source: 0, target: 2, value: 3 },
        ]}
      />
      <GridLayout
        testID="content-grid"
        columns={4}
        style={{ width: 360, height: 120 }}
      >
        <GridItem id="one" col={0} row={0} colSpan={2}>
          <Text testID="content-grid-item-0">grid one</Text>
        </GridItem>
        <GridItem id="two" col={2} row={0} colSpan={2}>
          <Text>grid two</Text>
        </GridItem>
      </GridLayout>
      <ScrollArea testID="content-scroll" style={{ width: 240, height: 80 }}>
        <View>
          <Text testID="content-scroll-item">scrolled content</Text>
          <Text>more</Text>
        </View>
      </ScrollArea>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
