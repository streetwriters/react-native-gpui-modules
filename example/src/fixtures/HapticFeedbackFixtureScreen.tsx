import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const types = [
  'selection',
  'impactLight',
  'notificationSuccess',
  'rigid',
] as const;

export function HapticFeedbackFixtureScreen() {
  const [result, setResult] = useState('not triggered');

  return (
    <View style={{ padding: 16, gap: 8 }}>
      <Pressable
        testID="haptic-run"
        onPress={() => {
          for (const type of types) {
            ReactNativeHapticFeedback.trigger(type);
          }
          setResult(`triggered ${types.length}`);
        }}
      >
        <Text>Trigger</Text>
      </Pressable>
      <Text testID="haptic-result">{result}</Text>
    </View>
  );
}
