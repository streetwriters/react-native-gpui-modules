import React, { useState, type ComponentType } from 'react';
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
  child?: Child;
};

type Child = {
  kind: 'icon' | 'avatar' | 'badge';
  name?: string;
  size?: string;
  props?: Record<string, unknown>;
  child?: Child;
};

function childElement(child?: Child): React.ReactNode {
  if (!child) return undefined;
  if (child.kind === 'icon') return <Kit.Icon name={child.name as never} />;
  if (child.kind === 'avatar')
    return <Kit.Avatar name={child.name} size={child.size as never} />;
  return <Kit.Badge {...child.props}>{childElement(child.child)}</Kit.Badge>;
}

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
          children={childElement(found.child)}
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
