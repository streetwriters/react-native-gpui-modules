import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  AlertDialog,
  Button,
  Checkbox,
  Command,
  ContextMenu,
  Dialog,
  DropdownMenu,
  HoverCard,
  Popover,
  PopupMenu,
  Tooltip,
  GroupBox,
  Notification,
  Sheet,
} from '@react-native-gpui/gpui-kit';

export function GpuiKitOverlaysFixture() {
  const [log, setLog] = useState('');
  const [dialog, setDialog] = useState(false);
  const [alert, setAlert] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [note, setNote] = useState(false);
  const [rows, setRows] = useState(1);
  const add = (name: string) => setLog(current => `${current}${name},`);
  return (
    <View style={{ padding: 12, gap: 8 }}>
      <Text testID="overlays-log">{`log ${log}`}</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button
          testID="overlays-open-dialog"
          label="Dialog"
          onPress={() => setDialog(true)}
        />
        <Button
          testID="overlays-open-alert"
          label="Alert"
          onPress={() => setAlert(true)}
        />
        <Button
          testID="overlays-open-sheet"
          label="Sheet"
          onPress={() => setSheet(true)}
        />
        <Button
          testID="overlays-open-note"
          label="Notify"
          onPress={() => setNote(true)}
        />
      </View>
      <GroupBox testID="overlays-auto" variant="outline" title="Auto height">
        {Array.from({ length: rows }, (_, index) => (
          <Text key={index} testID={`overlays-auto-row-${index}`}>
            row {index}
          </Text>
        ))}
      </GroupBox>
      <Pressable
        testID="overlays-grow"
        onPress={() => setRows(count => count + 1)}
      >
        <Text testID="overlays-after">after the group</Text>
      </Pressable>
      <View style={{ flexDirection: 'row', gap: 12, height: 28 }}>
        <Popover
          testID="overlays-popover"
          style={{ width: 80, height: 24 }}
          anchor="top-left"
          onOpenChange={event => add(`open:${event.nativeEvent.open}`)}
          content={
            <View style={{ padding: 4 }}>
              <Pressable
                testID="overlays-popover-body"
                onPress={() => add('popover')}
              >
                <Text style={{ color: '#ff0000' }}>RN in a popover</Text>
              </Pressable>
              <Checkbox
                testID="overlays-popover-checkbox"
                label="Kit in a popover"
                onChange={event => add(`pc:${event.nativeEvent.state}`)}
              />
            </View>
          }
        >
          <Text testID="overlays-popover-trigger">Popover</Text>
        </Popover>
        <HoverCard
          testID="overlays-hover"
          style={{ width: 80, height: 24 }}
          anchor="top-left"
          content={
            <Text testID="overlays-hover-body" style={{ color: '#ff0000' }}>
              RN in a hover card
            </Text>
          }
        >
          <Text testID="overlays-hover-trigger">Hover</Text>
        </HoverCard>
        <Tooltip
          testID="overlays-tooltip"
          style={{ width: 80, height: 24 }}
          content={<Text style={{ color: '#ff0000' }}>RN tooltip</Text>}
        >
          <Text testID="overlays-tooltip-trigger">Tooltip</Text>
        </Tooltip>
        <DropdownMenu
          testID="overlays-dropdown"
          style={{ width: 80, height: 24 }}
          items={[
            { label: 'Alpha', onSelect: () => add('alpha') },
            { label: 'Beta' },
          ]}
        >
          <Text testID="overlays-dropdown-trigger">Menu</Text>
        </DropdownMenu>
        <ContextMenu
          testID="overlays-context"
          style={{ width: 80, height: 24 }}
          items={[{ label: 'Copy', onSelect: () => add('copy') }]}
        >
          <Text testID="overlays-context-trigger">Context</Text>
        </ContextMenu>
      </View>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <PopupMenu
          testID="overlays-popup-menu"
          items={[
            { label: 'First', onSelect: () => add('first') },
            { label: 'Second', onSelect: () => add('second') },
          ]}
        />
        <Command
          testID="overlays-command"
          style={{ width: 300, height: 180 }}
          placeholder="Search"
          items={[
            { label: 'Open file' },
            { label: 'Save file' },
            { label: 'Close' },
          ]}
          onConfirm={event => add(`confirm:${event.nativeEvent.index}`)}
          onQuery={text => add(`q:${text}`)}
        />
      </View>
      <Dialog
        open={dialog}
        title={<Text testID="overlays-dialog-title">RN dialog title</Text>}
        footer={
          <Button
            testID="overlays-dialog-footer"
            label="Done"
            onPress={() => {
              add('footer');
              setDialog(false);
            }}
          />
        }
        onClose={() => {
          add('close');
          setDialog(false);
        }}
      >
        <Pressable testID="overlays-dialog-body" onPress={() => add('body')}>
          <Text>RN body</Text>
        </Pressable>
        <Checkbox
          testID="overlays-dialog-checkbox"
          label="Kit in a dialog"
          onChange={event => add(`check:${event.nativeEvent.state}`)}
        />
      </Dialog>
      <AlertDialog
        open={alert}
        title="Sure?"
        description="This cannot be undone"
        confirm
        okText="Yes"
        onOk={() => add('ok')}
        onCancel={() => add('alert-cancel')}
        onClose={() => {
          add('alert-close');
          setAlert(false);
        }}
      />
      <Sheet
        open={sheet}
        title="A sheet"
        placement="right"
        onClose={() => setSheet(false)}
      >
        <Pressable testID="overlays-sheet-body" onPress={() => add('sheet')}>
          <Text>RN in a sheet</Text>
        </Pressable>
      </Sheet>
      <Notification
        open={note}
        title="Saved"
        message="All changes saved"
        kind="success"
        onClose={() => setNote(false)}
      />
    </View>
  );
}
