import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Checkbox,
  Icon,
  Kbd,
  Label,
  Link,
  Marker,
  Progress,
  ProgressCircle,
  Radio,
  ShimmerText,
  Skeleton,
  Spinner,
  Switch,
  Tag,
  Toggle,
  Tooltip,
} from '@react-native-gpui/gpui-kit';

export function GpuiKitPrimitivesFixture() {
  const [long, setLong] = useState(false);
  const word = long ? 'a much longer caption here' : 'short';
  return (
    <ScrollView contentContainerStyle={{ padding: 12, gap: 8 }}>
      <Pressable testID="prim-grow" onPress={() => setLong(true)}>
        <Text>grow</Text>
      </Pressable>
      <View
        style={{
          flexDirection: 'row',
          gap: 8,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Label testID="prim-label" text={word} />
        <Tag testID="prim-tag" label={word} variant="danger" />
        <Link testID="prim-link" text={word} />
        <ShimmerText testID="prim-shimmer" text={word} />
        <Button testID="prim-button" label={word} variant="primary" />
        <Button
          testID="prim-button-small"
          label={word}
          size="small"
          tooltip="Plain tooltip text"
        />
        <Checkbox testID="prim-checkbox" label={word} />
        <Radio testID="prim-radio" label={word} />
        <Switch testID="prim-switch" label={word} color="#ff0000" />
        <Toggle testID="prim-toggle" label={word} />
      </View>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <Icon testID="prim-icon" name="heart" color="#ff0000" size="large" />
        <Badge testID="prim-badge" count={7} />
        <Avatar testID="prim-avatar" name="Grace Hopper" size="large" />
        <Spinner testID="prim-spinner" />
        <Kbd testID="prim-kbd" keystroke="cmd-k" />
      </View>
      <Skeleton testID="prim-skeleton" style={{ width: 160, height: 16 }} />
      <Progress
        testID="prim-progress"
        value={50}
        color="#ff0000"
        style={{ width: 160, height: 8 }}
      />
      <ProgressCircle
        testID="prim-progress-circle"
        value={70}
        color="#ff0000"
        style={{ width: 32, height: 32 }}
      />
      <Alert
        testID="prim-alert"
        message="Heads up"
        variant="warning"
        style={{ width: 240, height: 44 }}
      />
      <Marker
        testID="prim-marker"
        text="Marker"
        icon="info"
        style={{ width: 240, height: 24 }}
      />
      <Tooltip
        testID="prim-tooltip"
        style={{ width: 80, height: 24 }}
        content={<Text style={{ color: '#ff0000' }}>RN tooltip</Text>}
      >
        <Text testID="prim-tooltip-trigger">Tooltip</Text>
      </Tooltip>
      <View style={{ height: 160 }} />
    </ScrollView>
  );
}
