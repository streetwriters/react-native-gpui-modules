import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Settings } from '@react-native-gpui/gpui-kit';

export function GpuiKitSettingsFixture() {
  const [log, setLog] = useState('');
  return (
    <View style={{ padding: 12, gap: 8 }}>
      <Text testID="settings-log">{`log ${log}`}</Text>
      <Settings
        testID="settings"
        style={{ width: 640, height: 320 }}
        entries={[
          {
            page: 'General',
            group: 'Startup',
            title: 'Open at login',
            description: 'Start with the system',
            field: (
              <Pressable
                testID="settings-toggle"
                onPress={() => setLog(current => `${current}toggle,`)}
                style={{ height: 28, backgroundColor: '#ff0000' }}
              >
                <Text>Toggle</Text>
              </Pressable>
            ),
          },
          {
            page: 'General',
            group: 'Startup',
            title: 'Language',
            field: <Text testID="settings-language">English</Text>,
          },
          {
            page: 'Advanced',
            title: 'Cache',
            field: <Text>1 GB</Text>,
            vertical: true,
          },
        ]}
      />
    </View>
  );
}
