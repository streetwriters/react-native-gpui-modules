import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ModuleChecks } from './checks/types';

type Outcome = 'pending' | 'ok' | string;

export function ModulePage({ name, checks, view }: ModuleChecks) {
  const [results, setResults] = useState<Record<string, Outcome>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const [label, run] of checks) {
        if (cancelled) return;
        setResults(state => ({ ...state, [label]: 'pending' }));
        try {
          await run();
          console.log(`CHECK ok - ${name}: ${label}`);
          if (!cancelled) setResults(state => ({ ...state, [label]: 'ok' }));
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          console.log(`CHECK FAIL - ${name}: ${label}: ${message}`);
          if (!cancelled) {
            setResults(state => ({ ...state, [label]: message }));
          }
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [name, checks]);

  const outcomes = Object.values(results);
  const done =
    outcomes.length === checks.length && !outcomes.includes('pending');
  const failed = outcomes.some(o => o !== 'ok' && o !== 'pending');

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{name}</Text>
      <Text testID="summary" style={[styles.text, styles.summary]}>
        {!done ? 'RUNNING' : failed ? 'FAIL' : 'PASS'}
      </Text>
      {view}
      {checks.map(([label]) => {
        const outcome = results[label];
        return (
          <View key={label} style={styles.row}>
            <Text testID={`check-${label}`} style={styles.text}>
              {outcome === 'ok'
                ? 'ok'
                : outcome && outcome !== 'pending'
                ? 'FAIL'
                : '...'}
              {' - '}
              {label}
              {outcome && outcome !== 'ok' && outcome !== 'pending'
                ? `: ${outcome}`
                : ''}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#ffffff' },
  content: { padding: 16 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  text: { color: '#000000' },
  summary: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  row: { paddingVertical: 2 },
});
