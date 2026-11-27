import React, { useState, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import {
  Button,
  DataTable,
  DatePicker,
  Dialog,
  Icon,
  Input,
  Select,
  TextView,
  type DialogProps,
} from '@react-native-gpui/gpui-kit';
import { README } from './data/readme';
import {
  Section,
  StoryFrame,
  StoryToolbar,
  T,
  theme,
  useNotify,
} from './StoryKit';

/** `crates/story/src/stories/dialog_story.rs` of gpui-component v0.9.1. */
type Entrance = 'slide-down' | 'fade' | 'fade-slide' | 'none';

function Opener({
  label,
  dialog,
  children,
}: {
  label: string;
  dialog:
    | Omit<DialogProps, 'open' | 'onClose'>
    | ((close: () => void) => Omit<DialogProps, 'open' | 'onClose'>);
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const props = typeof dialog === 'function' ? dialog(close) : dialog;
  return (
    <>
      <Button outline label={label} onPress={() => setOpen(true)} />
      <Dialog {...props} open={open} onClose={close}>
        {children}
      </Dialog>
    </>
  );
}

const ROWS = Array.from({ length: 200 }, (_, row) => [
  String(row),
  `User ${row}`,
  `user-${row}@mail.com`,
  'User',
  'Active',
]);

export function DialogStory() {
  const notify = useNotify();
  const [overlay, setOverlay] = useState(true);
  const [overlayClosable, setOverlayClosable] = useState(true);
  const [closeButton, setCloseButton] = useState(true);
  const [keyboard, setKeyboard] = useState(true);
  const [entrance, setEntrance] = useState<Entrance>('slide-down');
  const [other, setOther] = useState(false);
  const [name, setName] = useState('');
  const options = { overlay, overlayClosable, keyboard, closeButton, entrance };
  const plain = { overlay, overlayClosable };
  return (
    <StoryFrame testID="story-dialog">
      <View style={{ gap: 24 }}>
        <StoryToolbar
          items={[
            {
              label: 'Options',
              menu: [
                {
                  label: 'Overlay',
                  checked: overlay,
                  onSelect: () => setOverlay(v => !v),
                },
                {
                  label: 'Close on overlay click',
                  checked: overlayClosable,
                  onSelect: () => setOverlayClosable(v => !v),
                },
                {
                  label: 'Close button',
                  checked: closeButton,
                  onSelect: () => setCloseButton(v => !v),
                },
                {
                  label: 'Keyboard',
                  checked: keyboard,
                  onSelect: () => setKeyboard(v => !v),
                },
                {
                  label: 'Entrance',
                  children: (
                    [
                      ['Slide down', 'slide-down'],
                      ['Fade', 'fade'],
                      ['Fade and slide', 'fade-slide'],
                      ['No animation', 'none'],
                    ] as [string, Entrance][]
                  ).map(([label, value]) => ({
                    label,
                    checked: entrance === value,
                    onSelect: () => setEntrance(value),
                  })),
                },
              ],
            },
          ]}
        />
        <Section
          title="Default"
          description="Compose form controls and footer actions."
        >
          <Opener
            label="Open Dialog"
            dialog={close => ({
              ...options,
              title: 'Basic Dialog',
              description:
                'This is a basic dialog created using the declarative API.',
              kitStyle: { padding: 0 },
              headerStyle: { padding: 16 },
              footerStyle: {
                padding: 16,
                backgroundColor: theme.muted,
                justifyContent: 'space-between',
              },
              footer: (
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Button
                    label="Open Other Dialog"
                    outline
                    onPress={() => setOther(true)}
                  />
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Button label="Cancel" outline onPress={close} />
                    <Button
                      variant="primary"
                      label="Confirm"
                      onPress={() => {
                        notify.push('You have pressed confirm.');
                        close();
                      }}
                    />
                  </View>
                </View>
              ),
            })}
          >
            <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 12 }}>
              <T>This is a dialog dialog, you can put anything here.</T>
              <Input
                placeholder="Your Name"
                value={name}
                onChangeText={setName}
              />
              <Select items={['Option 1', 'Option 2', 'Option 3']} />
              <DatePicker placeholder="Date of Birth" />
            </View>
          </Opener>
          <Dialog
            {...plain}
            open={other}
            title="Other Dialog"
            kitStyle={{ minHeight: 100 }}
            onClose={() => setOther(false)}
          >
            <T>This is another dialog.</T>
          </Dialog>
        </Section>
        <Section
          title="Custom actions"
          description="Replace the default footer actions."
        >
          <Opener
            label="Custom Buttons"
            dialog={{
              ...plain,
              kitStyle: { borderRadius: theme.radiusLg },
              buttons: [
                { role: 'cancel', label: 'Later', outline: true },
                { role: 'ok', label: 'Restart Now', variant: 'primary' },
              ],
              headerStyle: { padding: 0 },
              onOk: () => notify.push('You have pressed restart.'),
              onCancel: () => notify.push('You have pressed later.'),
            }}
          >
            <View style={{ gap: 12, alignItems: 'center' }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: theme.radiusLg,
                  backgroundColor: 'rgba(234, 179, 8, 0.2)',
                }}
              >
                <Icon
                  name="triangle-alert"
                  customSize={32}
                  color={theme.warning}
                />
              </View>
              <T>Update successful, we need to restart the application.</T>
            </View>
          </Opener>
        </Section>
        <Section
          title="Scrollable"
          description="Keep long content inside a fixed dialog size."
        >
          <Opener
            label="Scrollable Dialog"
            dialog={{
              ...plain,
              kitStyle: { width: 720, height: 600 },
              title: 'Dialog with scrollbar',
              footerStyle: { gap: 8 },
              buttons: [
                { role: 'cancel', label: 'Cancel', outline: true },
                { role: 'ok', label: 'Confirm', variant: 'primary' },
              ],
            }}
          >
            <TextView
              source={README}
              scrollable
              style={{ width: '100%', height: '100%' }}
            />
          </Opener>
        </Section>
        <Section
          title="Data table"
          description="Embed a full interactive component."
        >
          <Opener
            label="Table Dialog"
            dialog={{
              ...plain,
              kitStyle: { width: 800, height: 600 },
              title: 'Dialog with Table',
            }}
          >
            <View style={{ flex: 1, gap: 12 }}>
              <T>This is a dialog contains a table component.</T>
              <DataTable
                style={{ flex: 1 }}
                columns={[
                  { key: 'id', title: 'ID', width: 50 },
                  { key: 'name', title: 'Name', width: 150 },
                  { key: 'email', title: 'Email', width: 250 },
                  { key: 'role', title: 'Role', width: 150 },
                  { key: 'status', title: 'Status', width: 100 },
                ]}
                rows={ROWS}
              />
            </View>
          </Opener>
        </Section>
        <Section
          title="Without title"
          description="Render content without a heading."
        >
          <Opener label="Dialog without Title" dialog={plain}>
            <T>
              This is a dialog without title, you can use it when the title is
              not necessary.
            </T>
          </Opener>
        </Section>
        <Section
          title="Padding"
          description="Control spacing around dialog content."
        >
          <Opener
            label="Custom Paddings"
            dialog={{ kitStyle: { padding: 12 }, title: 'Custom Dialog Title' }}
          >
            <T>
              This is a custom dialog content, we can use paddings to control
              the layout and spacing within the dialog.
            </T>
          </Opener>
        </Section>
        <Section
          title="Custom style"
          description="Customize color, radius, and foreground."
        >
          <Opener
            label="Custom Dialog Style"
            dialog={{
              kitStyle: {
                borderRadius: theme.radiusLg,
                backgroundColor: theme.cyan,
                color: '#ffffff',
              },
              title: 'Custom Dialog Title',
            }}
          >
            <T style={{ color: '#ffffff' }}>This is a custom dialog content.</T>
          </Opener>
        </Section>
        <Section
          title="Custom content"
          description="Compose header, body, and footer explicitly."
        >
          <Opener
            label="Custom Width (400px)"
            dialog={{
              kitStyle: { width: 400 },
              title: 'Custom Width',
              description: 'This dialog has a custom width of 400px.',
              footerStyle: { justifyContent: 'center' },
              buttons: [
                { role: 'cancel', label: 'Cancel', outline: true, flex: true },
                {
                  role: 'cancel',
                  label: 'Done',
                  variant: 'primary',
                  flex: true,
                },
              ],
            }}
          >
            <T>
              Content area with custom width configuration, and the footer is
              used flex 1 button widths.
            </T>
          </Opener>
        </Section>
        <Section
          title="Selectable text"
          description="Embed selectable rich text."
        >
          <Opener
            label="TextView Dialog"
            dialog={{
              ...options,
              title: 'TextView Dialog',
              kitStyle: { padding: 0 },
              headerStyle: { padding: 16 },
              footerStyle: { padding: 16, backgroundColor: theme.muted },
              buttons: [
                { role: 'cancel', label: 'Cancel', outline: true },
                { role: 'ok', label: 'Confirm', variant: 'primary' },
              ],
            }}
          >
            <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 12 }}>
              <TextView
                selectable
                source="This is a dialog with a selectable TextView in it. This text should be selectable."
              />
            </View>
          </Opener>
        </Section>
        <View style={{ width: '100%', alignItems: 'center' }}>
          <View
            style={{
              width: '100%',
              maxWidth: 384,
              gap: 12,
              padding: 12,
              borderRadius: theme.radiusLg,
              backgroundColor: 'rgba(245, 245, 245, 0.45)',
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <View style={{ gap: 4 }}>
              <T style={{ fontWeight: '500' }}>Focus return check</T>
              <Text
                style={{
                  fontSize: 12,
                  lineHeight: 19.4,
                  color: theme.mutedForeground,
                }}
              >
                Type here, then open and close any dialog.
              </Text>
            </View>
            <View style={{ width: '100%', flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Input
                  placeholder="Type before opening a dialog"
                  style={{ width: '100%' }}
                />
              </View>
              <Button
                outline
                label="Run Action"
                tooltip="Verify actions still dispatch after a dialog closes."
                onPress={() => notify.push('You have clicked the TestAction.')}
              />
            </View>
          </View>
        </View>
      </View>
    </StoryFrame>
  );
}
