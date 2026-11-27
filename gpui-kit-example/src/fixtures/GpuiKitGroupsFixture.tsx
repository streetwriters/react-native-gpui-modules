import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import {
  Avatar,
  AvatarGroup,
  Breadcrumb,
  Button,
  ButtonGroup,
  Clipboard,
  DropdownButton,
  Kbd,
  Pagination,
  Separator,
  Stepper,
  Toggle,
  ToggleGroup,
  type ButtonHandle,
} from '@react-native-gpui/gpui-kit';

export function GpuiKitGroupsFixture() {
  const [log, setLog] = useState('');
  const [pressed, setPressed] = useState('none');
  const [checked, setChecked] = useState('none');
  const [selected, setSelected] = useState('none');
  const [actions, setActions] = useState(0);
  const [crumb, setCrumb] = useState('none');
  const [step, setStep] = useState(0);
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState('none');
  const focusable = useRef<ButtonHandle>(null);
  const note = (name: string) => setLog(current => `${current}${name},`);
  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text testID="groups-log">{`log ${log}`}</Text>
      <ButtonGroup
        testID="groups-button-group"
        onPress={event => setPressed(event.nativeEvent.pressed.join(','))}
      >
        <Button label="One" onPress={() => note('one')} />
        <Button label="Two" onPress={() => note('two')} />
        <Button label="Three" onPress={() => note('three')} />
      </ButtonGroup>
      <Text testID="groups-button-group-state">{`pressed ${pressed}`}</Text>
      <ToggleGroup
        testID="groups-toggle-group"
        single
        segmented
        onChange={event => setChecked(event.nativeEvent.checked.join(','))}
      >
        <Toggle label="Left" />
        <Toggle label="Center" />
        <Toggle label="Right" />
      </ToggleGroup>
      <Text testID="groups-toggle-group-state">{`checked ${checked}`}</Text>
      <AvatarGroup testID="groups-avatar-group" limit={3} ellipsis>
        <Avatar name="Ada Lovelace" />
        <Avatar name="Grace Hopper" />
        <Avatar name="Alan Turing" />
        <Avatar name="Linus Torvalds" />
      </AvatarGroup>
      <DropdownButton
        testID="groups-dropdown"
        label="Actions"
        onPress={() => setActions(count => count + 1)}
        onSelect={event => setSelected(String(event.nativeEvent.index))}
        items={[
          { label: 'First', onSelect: () => note('first') },
          { label: 'Second', checked: true },
          { separator: true },
          { label: 'Third', disabled: true },
        ]}
      />
      <Text testID="groups-dropdown-state">{`actions ${actions} selected ${selected}`}</Text>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <Kbd testID="groups-kbd" keystroke="cmd-shift-p" />
        <Kbd testID="groups-kbd-outline" keystroke="ctrl-," outline />
        <Kbd testID="groups-kbd-bad" keystroke="" />
      </View>
      <Breadcrumb
        testID="groups-breadcrumb"
        items={[
          { label: 'Home' },
          { label: 'Library', onPress: () => note('library') },
          { label: 'Data' },
        ]}
        onPress={event => setCrumb(String(event.nativeEvent.index))}
      />
      <Text testID="groups-breadcrumb-state">{`crumb ${crumb}`}</Text>
      <Stepper
        testID="groups-stepper"
        selectedIndex={step}
        items={[{ title: 'One' }, { title: 'Two' }, { title: 'Three' }]}
        onSelect={event => setStep(event.nativeEvent.index)}
      />
      <Text testID="groups-stepper-state">{`step ${step}`}</Text>
      <Pagination
        testID="groups-pagination"
        currentPage={page}
        totalPages={5}
        onChange={event => setPage(event.nativeEvent.page)}
      />
      <Text testID="groups-pagination-state">{`page ${page}`}</Text>
      <Clipboard
        testID="groups-clipboard"
        value="copied text"
        onCopied={event => setCopied(event.nativeEvent.value)}
      />
      <Text testID="groups-clipboard-state">{`copied ${copied}`}</Text>
      <Separator
        testID="groups-separator"
        label="or"
        style={{ width: 240, height: 20 }}
      />
      <Button
        ref={focusable}
        testID="groups-focusable"
        label="Focusable"
        focusable
        onPress={() => note('focusable')}
      />
      <Button
        testID="groups-focus"
        label="Focus the button"
        onPress={() => focusable.current?.focus()}
      />
    </View>
  );
}
