import { useState } from 'react';
import { Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

export function CalendarsFixtureScreen() {
  const [pressed, setPressed] = useState('none');

  return (
    <View style={{ padding: 16, gap: 8 }}>
      <Calendar
        testID="calendar"
        current="2026-11-16"
        onDayPress={day => setPressed(day.dateString)}
      />
      <Text testID="calendar-pressed">{`pressed: ${pressed}`}</Text>
    </View>
  );
}
