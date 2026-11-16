import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { callback } from 'react-native-nitro-modules';
import {
  NitroFixture,
  NitroFixtureView,
  type NitroFixtureViewMethods,
} from 'react-native-nitro-fixture';

export function NitroFixtureScreen() {
  const [color, setColor] = useState('#ff0000');
  const [lines, setLines] = useState<Record<string, string>>({});
  const [applied, setApplied] = useState('');
  const [updates, setUpdates] = useState('');
  const [created, setCreated] = useState('');
  const viewRef = useRef<NitroFixtureViewMethods | null>(null);

  const hybridRef = useMemo(
    () =>
      callback((ref: NitroFixtureViewMethods) => {
        viewRef.current = ref;
      }),
    [],
  );

  const refresh = useCallback(() => {
    const view = viewRef.current;
    if (!view) return;
    setApplied(`applied ${view.getAppliedColor()}`);
    setUpdates(`updates ${view.getUpdateCount()}`);
    setCreated(`native ${view.isNativeViewCreated()}`);
  }, []);

  useEffect(() => {
    const set = (key: string, value: string) =>
      setLines(state => ({ ...state, [key]: value }));
    set('add', `add ${NitroFixture.add(2, 3)}`);
    set('greet', `greet ${NitroFixture.greet('desktop')}`);
    NitroFixture.addAsync(4, 5).then(value =>
      set('addAsync', `addAsync ${value}`),
    );
    NitroFixture.callBack('ping', value =>
      set('callBack', `callBack ${value}`),
    );
    set(
      'sumBytes',
      `sumBytes ${NitroFixture.sumBytes(new Uint8Array([1, 2, 3, 4]).buffer)}`,
    );
  }, []);

  useEffect(() => {
    const timer = setTimeout(refresh, 200);
    return () => clearTimeout(timer);
  }, [color, refresh]);

  return (
    <View style={styles.page}>
      {['add', 'greet', 'addAsync', 'callBack', 'sumBytes'].map(key => (
        <Text key={key} testID={`nitro-${key}`} style={styles.text}>
          {lines[key] ?? `${key} ...`}
        </Text>
      ))}
      <NitroFixtureView
        testID="nitro-view"
        color={color}
        label="fixture"
        hybridRef={hybridRef}
        style={styles.view}
      />
      <Pressable
        testID="nitro-toggle"
        onPress={() => setColor(c => (c === '#ff0000' ? '#00ff00' : '#ff0000'))}
        style={styles.button}
      >
        <Text style={styles.text}>toggle</Text>
      </Pressable>
      <Pressable testID="nitro-refresh" onPress={refresh} style={styles.button}>
        <Text style={styles.text}>refresh</Text>
      </Pressable>
      <Text testID="nitro-applied" style={styles.text}>
        {applied || 'applied ...'}
      </Text>
      <Text testID="nitro-updates" style={styles.text}>
        {updates || 'updates ...'}
      </Text>
      <Text testID="nitro-native" style={styles.text}>
        {created || 'native ...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16, backgroundColor: '#ffffff' },
  text: { color: '#000000', marginVertical: 2 },
  view: { width: 120, height: 80, marginVertical: 8 },
  button: {
    padding: 8,
    backgroundColor: '#d8e6ff',
    marginVertical: 4,
    width: 120,
  },
});
