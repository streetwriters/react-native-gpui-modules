import { StyleSheet, Text, View } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';

const slot = { width: 100, height: 100, backgroundColor: '#ffffff' } as const;
const fill = { width: 100, height: 100 } as const;
const red = [fill, { backgroundColor: '#ff0000' }];

export function MaskedViewFixtureScreen() {
  return (
    <View
      style={{ padding: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}
    >
      <View testID="masked-text" style={slot}>
        <MaskedView
          style={fill}
          maskElement={
            <View style={StyleSheet.absoluteFill}>
              <Text style={{ fontSize: 90, fontWeight: 'bold', color: '#000' }}>
                I
              </Text>
            </View>
          }
        >
          <View style={red} />
        </MaskedView>
      </View>
      <View testID="masked-half" style={slot}>
        <MaskedView
          style={fill}
          maskElement={
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: 'rgba(0,0,0,0.5)' },
              ]}
            />
          }
        >
          <View style={red} />
        </MaskedView>
      </View>
      <View testID="masked-partial" style={slot}>
        <MaskedView
          style={fill}
          maskElement={
            <View
              style={[
                StyleSheet.absoluteFill,
                { width: 50, height: 50, backgroundColor: '#000000' },
              ]}
            />
          }
        >
          <View style={red} />
        </MaskedView>
      </View>
    </View>
  );
}
