import { Text, View } from 'react-native';
import Config from 'react-native-config';

export function ConfigFixtureScreen() {
  return (
    <View style={{ padding: 16 }}>
      <Text testID="config-check">{`GPUI_CONFIG_CHECK: ${Config.GPUI_CONFIG_CHECK}`}</Text>
    </View>
  );
}
