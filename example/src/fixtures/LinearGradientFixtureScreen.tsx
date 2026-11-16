import { Text, View } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';

export function LinearGradientFixtureScreen() {
  return (
    <View style={{ padding: 16, gap: 12 }}>
      <LinearGradient
        testID="gradient"
        colors={['#ff0000', '#00ff00']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ width: 300, height: 120, borderRadius: 8 }}
      >
        <Text testID="gradient-label">gradient</Text>
      </LinearGradient>
      <LinearGradient
        testID="gradient-stops"
        colors={['#ff0000', '#00ff00', '#0000ff']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ width: 300, height: 60 }}
      />
    </View>
  );
}
