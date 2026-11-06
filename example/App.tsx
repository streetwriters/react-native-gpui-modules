import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ModulePage } from './src/ModulePage';
import type { ModuleChecks } from './src/checks/types';
import quickSQLite from './src/checks/quick-sqlite';
import sodium from './src/checks/sodium';
import mmkv from './src/checks/mmkv';
import gzip from './src/checks/gzip';

const modules: ModuleChecks[] = [gzip, mmkv, sodium, quickSQLite];

function App() {
  const [selected, setSelected] = useState(modules[0].name);
  const module = modules.find(({ name }) => name === selected) ?? modules[0];

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <View style={styles.nav}>
          {modules.map(({ name }) => (
            <Pressable
              key={name}
              testID={`nav-${name}`}
              onPress={() => setSelected(name)}
              style={[styles.item, name === selected && styles.selected]}
            >
              <Text style={styles.itemText}>{name}</Text>
            </Pressable>
          ))}
        </View>
        <ModulePage key={module.name} {...module} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: '#ffffff' },
  nav: { width: 200, backgroundColor: '#f0f0f0', paddingVertical: 8 },
  item: { paddingHorizontal: 16, paddingVertical: 10 },
  selected: { backgroundColor: '#d8e6ff' },
  itemText: { color: '#000000' },
});

export default App;
