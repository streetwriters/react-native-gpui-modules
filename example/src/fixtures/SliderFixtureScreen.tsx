import { useState } from 'react';
import { Text, View } from 'react-native';
import Slider from '@react-native-community/slider';

export function SliderFixtureScreen() {
  const [value, setValue] = useState(25);
  const [events, setEvents] = useState<string[]>([]);
  const log = (name: string) => setEvents(current => [...current, name]);

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Slider
        testID="slider"
        style={{ width: 300, height: 40 }}
        minimumValue={0}
        maximumValue={100}
        step={1}
        value={25}
        minimumTrackTintColor="#2563eb"
        maximumTrackTintColor="#d4d4d8"
        thumbTintColor="#ffffff"
        onSlidingStart={() => log('start')}
        onValueChange={next => setValue(Math.round(next))}
        onSlidingComplete={() => log('complete')}
      />
      <Text testID="slider-value">{`value: ${value}`}</Text>
      <Text testID="slider-events">{`events: ${events.join(',')}`}</Text>
    </View>
  );
}
