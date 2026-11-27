import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import {
  Checkbox,
  NumberInput,
  OtpInput,
  Radio,
  Rating,
  Slider,
  Switch,
  Textarea,
} from '@react-native-gpui/gpui-kit';

export function GpuiKitInputsFixture() {
  const [checkbox, setCheckbox] = useState(false);
  const [radio, setRadio] = useState(false);
  const [on, setOn] = useState(false);
  const [rating, setRating] = useState(0);
  const [slider, setSlider] = useState(30);
  const [text, setText] = useState('');
  const [number, setNumber] = useState('5');
  const [otp, setOtp] = useState('');
  const [complete, setComplete] = useState(0);
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
      <Checkbox
        testID="inputs-checkbox"
        label="Checkbox"
        checked={checkbox}
        onChange={event => setCheckbox(event.nativeEvent.state)}
      />
      <Text testID="inputs-checkbox-state">{`checkbox ${checkbox}`}</Text>
      <Radio
        testID="inputs-radio"
        label="Radio"
        checked={radio}
        onChange={event => setRadio(event.nativeEvent.state)}
      />
      <Text testID="inputs-radio-state">{`radio ${radio}`}</Text>
      <Switch
        testID="inputs-switch"
        label="Switch"
        checked={on}
        onChange={event => setOn(event.nativeEvent.state)}
      />
      <Text testID="inputs-switch-state">{`switch ${on}`}</Text>
      <Rating
        testID="inputs-rating"
        value={rating}
        max={5}
        onChange={event => setRating(event.nativeEvent.value)}
      />
      <Text testID="inputs-rating-state">{`rating ${rating}`}</Text>
      <Slider
        testID="inputs-slider"
        minimum={0}
        maximum={100}
        step={1}
        value={slider}
        onValueChange={setSlider}
        style={{ width: 240, height: 20 }}
      />
      <Text testID="inputs-slider-state">{`slider ${Math.round(slider)}`}</Text>
      <Textarea
        testID="inputs-textarea"
        style={{ width: 240, height: 70 }}
        placeholder="Textarea"
        value={text}
        onChangeText={setText}
      />
      <Text testID="inputs-textarea-state">{`textarea [${text}]`}</Text>
      <NumberInput
        testID="inputs-number"
        style={{ width: 160, height: 32 }}
        value={number}
        onChangeText={setNumber}
      />
      <Text testID="inputs-number-state">{`number [${number}]`}</Text>
      <OtpInput
        testID="inputs-otp"
        length={4}
        style={{ width: 200, height: 40 }}
        value={otp}
        onChangeText={setOtp}
        onComplete={() => setComplete(count => count + 1)}
      />
      <Text testID="inputs-otp-state">{`otp [${otp}] complete ${complete}`}</Text>
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}
