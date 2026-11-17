import { Text, View } from 'react-native';
import { Badge } from '@react-native-gpui/gpui-kit';

const rows: [string, Record<string, unknown>][] = [
  ['dot', { dot: true }],
  ['count=5', { count: 5 }],
  ['count=120 max=99', { count: 120, max: 99 }],
  ['icon=check', { icon: 'check' }],
];

export function GpuiKitBadgeCompareFixture() {
  return (
    <View style={{ flex: 1, backgroundColor: '#e5e7eb', padding: 24, gap: 16 }}>
      <Text>REACT NATIVE (gpui-kit module)</Text>
      {rows.map(([label, props]) => (
        <View key={label} style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ width: 160, height: 48, backgroundColor: '#ffffff', alignItems: 'flex-start' }}>
            <Badge {...props} />
          </View>
          <Text style={{ fontSize: 12 }}>{label}</Text>
        </View>
      ))}
    </View>
  );
}
