import { useState } from 'react';
import { Appearance, Pressable, Text, View } from 'react-native';
import { StyleSheet, UnistylesRuntime } from 'react-native-unistyles';
import './unistyles';

export function UnistylesFixtureScreen() {
  const [size, setSize] = useState<'small' | 'large'>('small');
  const [, setTick] = useState(0);
  styles.useVariants({ size });

  const values: Record<string, string> = {
    themeName: String(UnistylesRuntime.themeName),
    colorScheme: String(UnistylesRuntime.colorScheme),
    breakpoint: String(UnistylesRuntime.breakpoint),
    screenWidth: String(Math.round(UnistylesRuntime.screen.width)),
    pixelRatio: String(UnistylesRuntime.pixelRatio),
    fontScale: String(UnistylesRuntime.fontScale),
    hasAdaptiveThemes: String(UnistylesRuntime.hasAdaptiveThemes),
    rtl: String(UnistylesRuntime.rtl),
    contentSizeCategory: String(UnistylesRuntime.contentSizeCategory),
    insetsTop: String(UnistylesRuntime.insets.top),
  };

  return (
    <View style={styles.page}>
      <View testID="unistyles-box" style={styles.box} />
      <View testID="unistyles-accent" style={styles.accent} />
      <View testID="unistyles-variant" style={styles.variant} />
      {Object.entries(values).map(([key, value]) => (
        <Text key={key} testID={`unistyles-${key}`} style={styles.text}>
          {value}
        </Text>
      ))}
      <View style={styles.row}>
        <Button id="unistyles-refresh" onPress={() => setTick(t => t + 1)} />
        <Button
          id="unistyles-toggle-variant"
          onPress={() => setSize(s => (s === 'small' ? 'large' : 'small'))}
        />
        <Button
          id="unistyles-dark"
          onPress={() => Appearance.setColorScheme('dark')}
        />
        <Button
          id="unistyles-light"
          onPress={() => Appearance.setColorScheme('light')}
        />
        <Button
          id="unistyles-reset"
          onPress={() => Appearance.setColorScheme('auto')}
        />
      </View>
    </View>
  );
}

function Button({ id, onPress }: { id: string; onPress: () => void }) {
  return (
    <Pressable testID={id} onPress={onPress} style={styles.button}>
      <Text style={styles.text}>{id.replace('unistyles-', '')}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create(theme => ({
  page: { flex: 1, padding: 16, backgroundColor: '#888888' },
  box: { width: 100, height: 40, backgroundColor: theme.colors.background },
  accent: {
    height: 20,
    width: { xs: 50, md: 150, lg: 250 },
    backgroundColor: theme.colors.accent,
  },
  variant: {
    height: 20,
    backgroundColor: '#0000ff',
    variants: {
      size: { small: { width: 20 }, large: { width: 80 } },
    },
  },
  text: { fontSize: 12, color: '#000000' },
  row: { flexDirection: 'row', gap: 8, marginTop: 8 },
  button: { padding: 6, backgroundColor: '#dddddd' },
}));
