import { useState } from 'react';
import { Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ContextMenu } from '@react-native-gpui/core/desktop';

ContextMenu.setPresentation('custom');

export function PickerFixtureScreen() {
  const [language, setLanguage] = useState('js');

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Picker
        testID="picker"
        style={{ width: 240 }}
        selectedValue={language}
        onValueChange={value => setLanguage(String(value))}
      >
        <Picker.Item label="Java" value="java" />
        <Picker.Item label="JavaScript" value="js" />
        <Picker.Item label="Rust" value="rust" />
      </Picker>
      <Text testID="picker-value">{`language: ${language}`}</Text>
    </View>
  );
}
