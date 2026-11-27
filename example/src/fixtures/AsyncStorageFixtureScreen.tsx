import { useCallback, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TurboModuleRegistry,
  View,
} from 'react-native';
import AsyncStorage, {
  createAsyncStorage,
} from '@react-native-async-storage/async-storage';

async function runChecks() {
  const results: Record<string, string> = {};
  const custom = createAsyncStorage('custom');
  await AsyncStorage.clear();
  await custom.clear();

  await AsyncStorage.setItem('a', '1');
  results.get = String(await AsyncStorage.getItem('a'));
  results.missing = String(await AsyncStorage.getItem('nope'));
  await AsyncStorage.removeItem('a');
  results.removed = String(await AsyncStorage.getItem('a'));

  await AsyncStorage.setMany({ k1: 'v1', k2: 'v2' });
  results.keys = (await AsyncStorage.getAllKeys()).slice().sort().join(',');
  results.getMany = JSON.stringify(await AsyncStorage.getMany(['k1', 'k3']));

  const native = TurboModuleRegistry.getEnforcing<{
    legacy_multiGet(keys: string[]): Promise<Array<Array<string | null>>>;
    legacy_multiMerge(pairs: string[][]): Promise<void>;
  }>('RNAsyncStorage');
  results.legacyGet = JSON.stringify(
    await native.legacy_multiGet(['k1', 'k3']),
  );
  await AsyncStorage.setItem(
    'obj',
    JSON.stringify({ a: { b: 1, c: 2 }, d: 3 }),
  );
  await native.legacy_multiMerge([
    ['obj', JSON.stringify({ a: { c: 9, e: 4 } })],
  ]);
  results.merge = String(await AsyncStorage.getItem('obj'));

  await custom.setItem('c1', 'custom');
  results.customGet = String(await custom.getItem('c1'));
  results.customIsolated = String(await AsyncStorage.getItem('c1'));
  results.customKeys = (await custom.getAllKeys()).join(',');
  await custom.setMany({ m1: 'x', m2: 'y' });
  results.customMany = JSON.stringify(await custom.getMany(['m1', 'm2', 'zz']));
  await custom.removeMany(['m1']);
  results.customRemoved = (await custom.getAllKeys()).slice().sort().join(',');

  await AsyncStorage.clear();
  results.cleared = String((await AsyncStorage.getAllKeys()).length);
  results.customKept = String(await custom.getItem('c1'));
  await custom.clear();
  return results;
}

export function AsyncStorageFixtureScreen() {
  const [results, setResults] = useState<Record<string, string>>({});
  const [persisted, setPersisted] = useState('persisted ...');

  const run = useCallback(() => {
    runChecks().then(setResults, e => setResults({ error: String(e) }));
  }, []);

  const persist = useCallback(async (action: 'write' | 'read' | 'clear') => {
    const custom = createAsyncStorage('persist');
    if (action === 'write') {
      await AsyncStorage.setItem('kept', 'default across launches');
      await custom.setItem('kept', 'custom across launches');
    }
    if (action === 'clear') {
      await AsyncStorage.removeItem('kept');
      await custom.removeItem('kept');
    }
    setPersisted(
      `persisted ${await AsyncStorage.getItem('kept')} | ${await custom.getItem(
        'kept',
      )}`,
    );
  }, []);

  return (
    <View style={styles.page}>
      <Pressable testID="as-run" onPress={run} style={styles.button}>
        <Text style={styles.text}>run</Text>
      </Pressable>
      {Object.entries(results).map(([name, value]) => (
        <Text key={name} testID={`as-${name}`} style={styles.text}>
          {`${name}: ${value}`}
        </Text>
      ))}
      <Pressable
        testID="as-persist-write"
        onPress={() => persist('write')}
        style={styles.button}
      >
        <Text style={styles.text}>write</Text>
      </Pressable>
      <Pressable
        testID="as-persist-read"
        onPress={() => persist('read')}
        style={styles.button}
      >
        <Text style={styles.text}>read</Text>
      </Pressable>
      <Pressable
        testID="as-persist-clear"
        onPress={() => persist('clear')}
        style={styles.button}
      >
        <Text style={styles.text}>clear</Text>
      </Pressable>
      <Text testID="as-persisted" style={styles.text}>
        {persisted}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16, backgroundColor: '#ffffff' },
  text: { color: '#000000', marginVertical: 2 },
  button: {
    padding: 8,
    backgroundColor: '#d8e6ff',
    marginVertical: 4,
    width: 120,
  },
});
