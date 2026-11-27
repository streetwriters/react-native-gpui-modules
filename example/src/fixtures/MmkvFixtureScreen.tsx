import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { createMMKV } from 'react-native-mmkv';

const bytes = (buffer: ArrayBuffer | undefined) =>
  buffer ? Array.from(new Uint8Array(buffer)).join(',') : 'undefined';

function runChecks(changes: string[]) {
  const results: Record<string, string> = {};
  const storage = createMMKV({ id: 'fixture-default' });
  storage.clearAll();

  const listener = storage.addOnValueChangedListener(key => changes.push(key));

  storage.set('str', 'hello');
  storage.set('num', 42.5);
  storage.set('bool', true);
  storage.set('buf', new Uint8Array([1, 2, 3, 250]).buffer);
  results.string = String(storage.getString('str'));
  results.number = String(storage.getNumber('num'));
  results.boolean = String(storage.getBoolean('bool'));
  results.buffer = bytes(storage.getBuffer('buf'));
  results.contains = `${storage.contains('str')} ${storage.contains(
    'missing',
  )}`;
  results.keys = storage.getAllKeys().sort().join(',');
  results.removed = `${storage.remove('str')} ${storage.getString('str')}`;
  results.length = String(storage.length);
  listener.remove();
  storage.clearAll();
  results.cleared = `${storage.getAllKeys().length} ${storage.contains('num')}`;

  const secure = createMMKV({
    id: 'fixture-secure',
    encryptionKey: 'fixture-key',
  });
  secure.set('secret', 'value');
  results.encrypted = `${secure.isEncrypted} ${secure.getString('secret')}`;
  results.isolated = String(storage.getString('secret'));
  secure.clearAll();

  return results;
}

export function MmkvFixtureScreen() {
  const [results, setResults] = useState<Record<string, string>>({});
  const [persisted, setPersisted] = useState('persisted ...');

  const run = useCallback(() => {
    try {
      const changes: string[] = [];
      setResults(runChecks(changes));
      setTimeout(
        () => setResults(state => ({ ...state, listener: changes.join(',') })),
        300,
      );
    } catch (e) {
      setResults({ error: String(e) });
    }
  }, []);

  const persist = useCallback(
    (action: 'write' | 'read' | 'clear') => {
      const storage = createMMKV({ id: 'fixture-persist' });
      if (action === 'write') storage.set('kept', 'across launches');
      if (action === 'clear') storage.clearAll();
      setPersisted(`persisted ${storage.getString('kept')}`);
    },
    [setPersisted],
  );

  return (
    <View style={styles.page}>
      <Pressable testID="mmkv-run" onPress={run} style={styles.button}>
        <Text style={styles.text}>run</Text>
      </Pressable>
      {Object.entries(results).map(([name, value]) => (
        <Text key={name} testID={`mmkv-${name}`} style={styles.text}>
          {`${name}: ${value}`}
        </Text>
      ))}
      <Pressable
        testID="mmkv-persist-write"
        onPress={() => persist('write')}
        style={styles.button}
      >
        <Text style={styles.text}>write</Text>
      </Pressable>
      <Pressable
        testID="mmkv-persist-read"
        onPress={() => persist('read')}
        style={styles.button}
      >
        <Text style={styles.text}>read</Text>
      </Pressable>
      <Pressable
        testID="mmkv-persist-clear"
        onPress={() => persist('clear')}
        style={styles.button}
      >
        <Text style={styles.text}>clear</Text>
      </Pressable>
      <Text testID="mmkv-persisted" style={styles.text}>
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
