import { useState } from 'react';
import { Text, View } from 'react-native';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Icon,
  Input,
  Label,
  Link,
  Progress,
  ProgressCircle,
  ShimmerText,
  Skeleton,
  Spinner,
  Tag,
  Toggle,
} from '@react-native-gpui/gpui-kit';

/** The basic smoke checks of the module: presses, typing and primitives. */
export function KitChecksFixture() {
  const [presses, setPresses] = useState(0);
  const [text, setText] = useState('');
  const [submits, setSubmits] = useState(0);
  const [toggled, setToggled] = useState(false);
  return (
    <View style={{ gap: 8, padding: 8 }}>
      <Button
        testID="kit-button"
        label="Press me"
        variant="primary"
        onPress={() => setPresses(count => count + 1)}
      />
      <Button testID="kit-button-icon" label="Search" icon="search" />
      <Button testID="kit-button-disabled" label="Disabled" disabled />
      <Button
        testID="kit-button-children"
        variant="secondary"
        onPress={() => setPresses(count => count + 10)}
      >
        <Text testID="kit-button-child-text">Child view</Text>
      </Button>
      <Input
        testID="kit-input"
        style={{ width: 240, height: 32 }}
        placeholder="Type here"
        value={text}
        onChangeText={setText}
        onSubmit={() => setSubmits(count => count + 1)}
      />
      <Button
        testID="kit-input-set"
        label="Set text"
        onPress={() => setText('external')}
      />
      <Text testID="kit-input-text">{`text [${text}] submits ${submits}`}</Text>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <Label testID="kit-label" text="A label" />
        <Icon testID="kit-icon" name="info" />
        <Badge testID="kit-badge" count={3}>
          <Icon name="bell" />
        </Badge>
        <Tag testID="kit-tag" label="beta" variant="primary" />
        <Avatar
          testID="kit-avatar"
          name="Ada Lovelace"
          style={{ width: 32, height: 32 }}
        />
        <Spinner testID="kit-spinner" style={{ width: 16, height: 16 }} />
        <Link
          testID="kit-link"
          text="A link"
          onPress={() => setPresses(count => count + 100)}
        />
      </View>
      <Skeleton testID="kit-skeleton" style={{ width: 160, height: 12 }} />
      <Progress
        testID="kit-progress"
        value={40}
        style={{ width: 160, height: 6 }}
      />
      <Progress
        testID="kit-progress-red"
        value={100}
        color="#ff0000"
        style={{ width: 160, height: 12 }}
      />
      <ProgressCircle
        testID="kit-progress-circle"
        value={60}
        style={{ width: 24, height: 24 }}
      />
      <ShimmerText testID="kit-shimmer" text="Loading" />
      <Alert
        testID="kit-alert"
        message="Heads up"
        style={{ width: 240, height: 44 }}
      />
      <Toggle
        testID="kit-toggle"
        label="Toggle"
        checked={toggled}
        onChange={event => setToggled(event.nativeEvent.state)}
      />
      <Text testID="kit-toggle-state">{`toggled ${toggled}`}</Text>
      <Text testID="kit-presses">{`presses ${presses}`}</Text>
    </View>
  );
}
