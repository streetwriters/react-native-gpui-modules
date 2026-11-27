import React, { useState } from 'react';
import { View } from 'react-native';
import {
  Button,
  Theme,
  type NotificationPlacement,
} from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame, StoryToolbar, useNotify } from './StoryKit';

/** `crates/story/src/stories/notification_story.rs` of gpui-component v0.9.1. */
const NOTIFICATION_MARKDOWN = `
This is a custom notification.
- List item 1
- List item 2
- [Click here](https://github.com/longbridge/gpui-kit)
`;

const ANCHORS: [NotificationPlacement, string][] = [
  ['top-left', 'TopLeft'],
  ['top-center', 'TopCenter'],
  ['top-right', 'TopRight'],
  ['left-center', 'LeftCenter'],
  ['right-center', 'RightCenter'],
  ['bottom-left', 'BottomLeft'],
  ['bottom-center', 'BottomCenter'],
  ['bottom-right', 'BottomRight'],
];
const MAX_ITEMS = [1, 2, 3, 5, 10];

export function NotificationStory() {
  const notify = useNotify();
  const [placement, setPlacement] = useState<NotificationPlacement>();
  const [maxItems, setMaxItems] = useState<number>();
  const placementName =
    ANCHORS.find(([value]) => value === (placement ?? 'top-right'))?.[1] ?? '';
  return (
    <StoryFrame testID="story-notification">
      {(placement !== undefined || maxItems !== undefined) && (
        <Theme
          mode="light"
          notificationPlacement={placement}
          notificationMaxItems={maxItems}
        />
      )}
      <View style={{ width: '100%', gap: 12 }}>
        <StoryToolbar
          items={[
            {
              label: `Placement: ${placementName}`,
              menu: ANCHORS.map(([value, name]) => ({
                label: name,
                checked: value === (placement ?? 'top-right'),
                onSelect: () => setPlacement(value),
              })),
            },
            {
              label: `Max items: ${maxItems ?? 10}`,
              menu: MAX_ITEMS.map(count => ({
                label: String(count),
                checked: count === (maxItems ?? 10),
                onSelect: () => setMaxItems(count),
              })),
            },
          ]}
        />
        <Section title="Default" description="Show a short message.">
          <Button
            outline
            label="Show Notification"
            onPress={() => notify.push('This is a notification.')}
          />
        </Section>
        <Section
          title="Types"
          description="Use semantic treatments for common outcomes."
        >
          <Button
            variant="info"
            label="Info"
            onPress={() =>
              notify.push({
                kind: 'info',
                message: 'You have been saved file successfully.',
              })
            }
          />
          <Button
            variant="success"
            label="Success"
            onPress={() =>
              notify.push({
                kind: 'success',
                message: 'We have received your payment successfully.',
              })
            }
          />
          <Button
            variant="warning"
            label="Warning"
            onPress={() =>
              notify.push({
                kind: 'warning',
                message:
                  'The network is not stable, please check your connection.',
              })
            }
          />
          <Button
            variant="danger"
            label="Error"
            onPress={() =>
              notify.push({
                kind: 'error',
                message:
                  'There have some error occurred. Please try again later.',
              })
            }
          />
        </Section>
        <Section
          title="Title and description"
          description="Pair a concise title with supporting detail."
        >
          <Button
            variant="info"
            label="Info"
            onPress={() =>
              notify.push({
                kind: 'info',
                title: 'All changes saved',
                message:
                  'Your changes have been saved to the cloud and will sync across all of your devices.',
              })
            }
          />
          <Button
            variant="success"
            label="Success"
            onPress={() =>
              notify.push({
                kind: 'success',
                title: 'Payment received',
                message:
                  'Your payment of $99.00 was processed and a receipt has been emailed to you.',
              })
            }
          />
          <Button
            variant="warning"
            label="Warning"
            onPress={() =>
              notify.push({
                kind: 'warning',
                title: 'Connection unstable',
                message:
                  'Your network connection is unstable. Some changes may take longer to save.',
              })
            }
          />
          <Button
            variant="danger"
            label="Error"
            onPress={() =>
              notify.push({
                kind: 'error',
                title: 'Request failed',
                message:
                  "We couldn't reach the server. Check your internet connection and try again.",
              })
            }
          />
        </Section>
        <Section
          title="Unique"
          description="Replace duplicate notifications by type."
        >
          <Button
            outline
            label="Unique Notification"
            onPress={() =>
              notify.push({
                key: 'unique',
                kind: 'info',
                message: 'This is a unique notification.',
              })
            }
          />
        </Section>
        <Section
          title="Keyed"
          description="Keep separate unique notifications with keys."
        >
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Button
              outline
              label="A Notification"
              onPress={() =>
                notify.push({
                  key: 'keyed-1',
                  kind: 'info',
                  message: 'This is A unique notification.',
                })
              }
            />
            <Button
              outline
              label="B Notification"
              onPress={() =>
                notify.push({
                  key: 'keyed-2',
                  kind: 'info',
                  message: 'This is B unique notification.',
                })
              }
            />
          </View>
        </Section>
        <Section
          title="Action"
          description="Add an inline action to the notification."
        >
          <Button
            outline
            label="Notification with Title"
            onPress={() =>
              notify.push({
                key: 'test',
                title: 'Uh oh! Something went wrong.',
                message: 'There was a problem with your request.',
                action: { label: 'Retry', variant: 'primary' },
              })
            }
          />
        </Section>
        <Section
          title="Lifecycle"
          description="Handle body clicks and close events independently."
        >
          <Button
            outline
            label="Click vs Close"
            onPress={() =>
              notify.push({
                key: 'click-close',
                kind: 'info',
                title: 'on_click vs on_close',
                message:
                  'Click the body to fire on_click; click the X to close. Watch the console.',
                autohide: false,
              })
            }
          />
        </Section>
        <Section
          title="Placement per notification"
          description="Override the global placement for a single notification."
        >
          {ANCHORS.map(([value, name]) => (
            <Button
              key={value}
              outline
              label={name}
              onPress={() =>
                notify.push({
                  kind: 'info',
                  message: `This notification is at ${name}.`,
                  placement: value,
                })
              }
            />
          ))}
        </Section>
        <Section
          title="System notification"
          description="Deliver to the OS notification center; click the system notification to refocus the app. macOS shows them only when running from a bundled .app; Windows requires cx.set_app_identity()."
        >
          <Button
            outline
            label="System only"
            onPress={() =>
              notify.push({
                key: 'system',
                kind: 'info',
                title: 'Build finished',
                message: 'Delivered straight to the notification center.',
                delivery: 'system',
              })
            }
          />
          <Button
            outline
            label="In-app and system"
            onPress={() =>
              notify.push({
                key: 'system',
                kind: 'info',
                title: 'Build finished',
                message: 'Shown as a toast and in the notification center.',
                delivery: 'both',
                autohide: false,
              })
            }
          />
        </Section>
        <Section
          title="Custom content"
          description="Render application-owned notification content."
        >
          <Button
            outline
            label="Show Custom Notification"
            onPress={() => notify.push({ markdown: NOTIFICATION_MARKDOWN })}
          />
        </Section>
        <Section
          title="Manual close"
          description="Keep a notification visible until it is dismissed."
        >
          <Button
            outline
            label="Show"
            onPress={() =>
              notify.push({
                key: 'manual',
                message:
                  'You can close this notification by clicking the Close button.',
                autohide: false,
              })
            }
          />
          <Button
            outline
            label="Dismiss All"
            onPress={() => notify.remove('manual')}
          />
        </Section>
      </View>
    </StoryFrame>
  );
}
