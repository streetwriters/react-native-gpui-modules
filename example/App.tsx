import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { ModuleChecks } from './src/checks/types';
import quickSQLite from './src/checks/quick-sqlite';

const modules: ModuleChecks[] = [quickSQLite];

type Outcome = 'pending' | 'ok' | string;

function useResults() {
  const [results, setResults] = useState<Record<string, Outcome>>({});
  useEffect(() => {
    (async () => {
      for (const { name, checks } of modules) {
        for (const [label, run] of checks) {
          const key = `${name}: ${label}`;
          setResults(state => ({ ...state, [key]: 'pending' }));
          try {
            await run();
            console.log(`CHECK ok - ${key}`);
            setResults(state => ({ ...state, [key]: 'ok' }));
          } catch (error) {
            console.log(
              `CHECK FAIL - ${key}: ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
            setResults(state => ({
              ...state,
              [key]: error instanceof Error ? error.message : String(error),
            }));
          }
        }
      }
    })();
  }, []);
  return results;
}

function App() {
  const results = useResults();
  const failed = Object.values(results).filter(
    outcome => outcome !== 'ok' && outcome !== 'pending',
  );
  const done =
    Object.keys(results).length ===
      modules.reduce((count, { checks }) => count + checks.length, 0) &&
    !Object.values(results).includes('pending');

  return (
    <SafeAreaProvider>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text testID="summary" style={[styles.text, styles.summary]}>
          {!done ? 'RUNNING' : failed.length ? 'FAIL' : 'PASS'}
        </Text>
        {Object.entries(results).map(([key, outcome]) => (
          <View key={key} style={styles.row}>
            <Text testID={key} style={styles.text}>
              {outcome === 'ok' ? 'ok' : outcome === 'pending' ? '...' : 'FAIL'}
              {' - '}
              {key}
              {outcome !== 'ok' && outcome !== 'pending' ? `: ${outcome}` : ''}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ffffff' },
  text: { color: '#000000' },
  content: { padding: 16 },
  summary: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  row: { paddingVertical: 2 },
});

export default App;
