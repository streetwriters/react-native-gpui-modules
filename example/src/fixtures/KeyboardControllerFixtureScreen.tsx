import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import {
  KeyboardAvoidingView,
  KeyboardAwareScrollView,
  KeyboardController,
  KeyboardProvider,
} from 'react-native-keyboard-controller';

export function KeyboardControllerFixtureScreen() {
  const [status, setStatus] = useState('idle');

  return (
    <KeyboardProvider>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <KeyboardAwareScrollView>
          <View testID="kc-root" style={{ padding: 16, gap: 12 }}>
            <TextInput
              testID="kc-input"
              placeholder="Type here"
              onFocus={() => setStatus('focused')}
              onBlur={() => setStatus('blurred')}
              submitBehavior="submit"
              onSubmitEditing={() => {
                setStatus('submitted');
                KeyboardController.setFocusTo('next');
              }}
              style={{ borderWidth: 1, padding: 8 }}
            />
            <TextInput
              testID="kc-input-2"
              placeholder="Next field"
              onFocus={() => setStatus('second focused')}
              submitBehavior="submit"
              onSubmitEditing={() => KeyboardController.setFocusTo('prev')}
              style={{ borderWidth: 1, padding: 8 }}
            />
            <Pressable
              testID="kc-dismiss"
              onPress={() => {
                KeyboardController.dismiss();
              }}
            >
              <Text>Dismiss</Text>
            </Pressable>
            <Text testID="kc-status">{`status: ${status}`}</Text>
          </View>
        </KeyboardAwareScrollView>
      </KeyboardAvoidingView>
    </KeyboardProvider>
  );
}
