import React, { useState } from 'react';
import { View } from 'react-native';
import {
  AlertDialog,
  Button,
  Icon,
  type AlertDialogProps,
  type ButtonProps,
} from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame, T, theme, useNotify } from './StoryKit';

/** `crates/story/src/stories/alert_dialog_story.rs` of gpui-component v0.9.1. */
function Trigger({
  button,
  dialog,
}: {
  button: ButtonProps;
  dialog: AlertDialogProps;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button outline {...button} onPress={() => setOpen(true)} />
      <AlertDialog {...dialog} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function AlertDialogStory() {
  const notify = useNotify();
  const say = (text: string) => () => notify.push(text);
  return (
    <StoryFrame testID="story-alert_dialog">
      <View style={{ gap: 24 }}>
        <Section
          title="Default"
          description="Compose the header, message, and footer actions."
        >
          <Trigger
            button={{ label: 'Discard Draft' }}
            dialog={{
              title: 'Discard unsaved changes?',
              description:
                'Your edits since the last save will be permanently lost.',
              kitStyle: { padding: 0 },
              headerStyle: { padding: 16 },
              footerStyle: {
                padding: 16,
                borderTopWidth: 1,
                borderColor: theme.border,
                backgroundColor: theme.muted,
              },
              buttons: [
                { role: 'cancel', label: 'Cancel', outline: true },
                { role: 'ok', label: 'Discard', variant: 'danger' },
              ],
              onOk: say('Draft discarded'),
              onCancel: say('Continuing to edit'),
            }}
          />
        </Section>
        <Section
          title="Imperative API"
          description="Open an alert directly from the window."
        >
          <Trigger
            button={{ label: 'Delete File' }}
            dialog={{
              icon: <Icon name="info" color={theme.danger} />,
              title: 'Delete File',
              description:
                'Are you sure you want to delete this file? This action cannot be undone.',
              confirm: true,
              okText: 'Delete',
              okVariant: 'danger',
              onOk: say('File deleted'),
            }}
          />
        </Section>
        <Section title="Icon" description="Add a visual cue above the title.">
          <Trigger
            button={{ label: 'Request Permission' }}
            dialog={{
              kitStyle: { width: 320 },
              headerStyle: { alignItems: 'center' },
              footerStyle: { flexDirection: 'column' },
              icon: (
                <Icon
                  name="triangle-alert"
                  customSize={40}
                  color={theme.warning}
                />
              ),
              title: 'Network Permission Required',
              description:
                'We need your permission to access the network to provide better services. Please allow network access in your system settings.',
              buttons: [
                {
                  role: 'ok',
                  label: 'Allow',
                  variant: 'primary',
                  fullWidth: true,
                },
                {
                  role: 'cancel',
                  label: 'Deny',
                  outline: true,
                  fullWidth: true,
                },
              ],
              onOk: say('Thank you for allowing network access'),
            }}
          />
        </Section>
        <Section
          title="Destructive"
          description="Use a destructive action for irreversible choices."
        >
          <Trigger
            button={{ label: 'Delete Account', variant: 'danger' }}
            dialog={{
              title: 'Delete Account',
              description:
                'This will permanently delete your account and all associated data. This action cannot be undone.',
              buttons: [
                { role: 'cancel', label: 'Cancel', outline: true, flex: true },
                {
                  role: 'ok',
                  label: 'Delete',
                  outline: true,
                  variant: 'danger',
                  flex: true,
                },
              ],
              onOk: say('Your account has been deleted'),
            }}
          />
        </Section>
        <Section
          title="Without title"
          description="Render content without a heading."
        >
          <Trigger
            button={{ label: 'Continue without Title' }}
            dialog={{
              confirm: true,
              children: <T>Continue with this action?</T>,
            }}
          />
        </Section>
        <Section
          title="Custom footer"
          description="Replace the default action row."
        >
          <Trigger
            button={{ label: 'Show Session Expiry' }}
            dialog={{
              title: 'Session Expired',
              description:
                'Your session has expired due to inactivity.Please log in again to continue.',
              footerStyle: {},
              buttons: [
                {
                  role: 'ok',
                  label: 'Sign in',
                  variant: 'primary',
                  flex: true,
                },
              ],
              onOk: say('Redirecting to login...'),
            }}
          />
        </Section>
        <Section
          title="Custom content"
          description="Style header and footer regions independently."
        >
          <Trigger
            button={{ label: 'Install Update' }}
            dialog={{
              title: 'Update Available',
              description:
                'A new version (v2.0.0) is available.This update includes new features and bug fixes.',
              footerStyle: { backgroundColor: theme.muted },
              buttons: [
                { role: 'cancel', label: 'Later', outline: true, flex: true },
                { role: 'ok', label: 'Update', variant: 'primary', flex: true },
              ],
              onOk: say('Starting update...'),
              onCancel: say('Update postponed'),
            }}
          />
        </Section>
        <Section
          title="Keyboard"
          description="Disable keyboard dismissal when required."
        >
          <Trigger
            button={{ label: 'Review Notice' }}
            dialog={{
              title: 'Important Notice',
              description:
                'Please read this important notice carefully before proceeding.',
              okText: 'Got It',
              keyboard: false,
            }}
          />
        </Section>
        <Section
          title="Confirm mode"
          description="Provide standard OK and Cancel actions."
        >
          <Trigger
            button={{ label: 'Open Confirmation' }}
            dialog={{
              confirm: true,
              title: 'Are you sure?',
              children: <T>Continue with this action?</T>,
            }}
          />
        </Section>
        <Section
          title="Prevent close"
          description="Callbacks can keep the dialog open."
        >
          <Trigger
            button={{ label: 'Close During Sync' }}
            dialog={{
              title: 'Sync in progress',
              closeButton: true,
              description:
                'Your changes are still syncing. The dialog remains open until syncing finishes.',
              confirm: true,
              okText: 'Close',
              cancelText: 'Wait',
              closeOnOk: false,
              closeOnCancel: false,
              onOk: say('Cannot close: Process still running'),
              onCancel: say('Waiting...'),
            }}
          />
        </Section>
      </View>
    </StoryFrame>
  );
}
