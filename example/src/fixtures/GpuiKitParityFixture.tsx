import { useState, type ComponentType } from 'react';
import { Text, View } from 'react-native';
import * as Kit from '@react-native-gpui/gpui-kit';
import data from './gpuiKitParityCases.json';

type ParityCase = {
  id: string;
  component: string;
  width: number;
  height: number;
  props: Record<string, unknown>;
  style?: Record<string, number>;
};

const cases = data.cases as ParityCase[];

/**
 * Renders one case of `gpuiKitParityCases.json` at the window's top-left, the
 * way `tools/gpui-kit-gen/reference` renders it with gpui-kit directly.
 */
export function GpuiKitParityFixture({ scenario }: { scenario?: string }) {
  const [log, setLog] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const found = cases.find(c => c.id === scenario);
  if (!found) return <Text>unknown case {scenario}</Text>;
  const Component = (Kit as unknown as Record<string, ComponentType<any>>)[
    found.component
  ];
  const note = (name: string) => () => setLog(current => [...current, name]);
  return (
    <View style={{ flex: 1, alignItems: 'flex-start' }}>
      <View
        testID={found.id}
        collapsable={false}
        style={{
          width: found.width,
          height: found.height,
          backgroundColor: data.background,
          alignItems: 'flex-start',
        }}
      >
        <Component
          testID={`${found.id}-el`}
          {...found.props}
          style={found.style}
          onPress={note('press')}
          checked={checked}
          onChange={(event: {
            nativeEvent?: { state?: boolean; checked?: boolean };
          }) => {
            note('change')();
            const next =
              event?.nativeEvent?.state ?? event?.nativeEvent?.checked;
            if (typeof next === 'boolean') setChecked(next);
          }}
        />
      </View>
      <Text testID={`${found.id}-log`}>{log.join(',')}</Text>
    </View>
  );
}
