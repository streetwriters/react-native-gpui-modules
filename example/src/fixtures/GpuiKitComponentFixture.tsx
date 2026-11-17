import { Text } from 'react-native';
import { screens } from '@react-native-gpui/gpui-kit/src/generated/screens';

export function GpuiKitComponentFixture({ scenario }: { scenario?: string }) {
  const Screen = scenario ? screens[scenario] : undefined;
  return Screen ? <Screen /> : <Text>unknown component {scenario}</Text>;
}
