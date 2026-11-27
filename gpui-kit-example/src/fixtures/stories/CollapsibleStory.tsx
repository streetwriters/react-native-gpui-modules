import React, { useState, type ReactNode } from 'react';
import {
  Pressable,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import {
  Avatar,
  Button,
  Checkbox,
  Collapsible,
  GroupBox,
  Icon,
  Progress,
  Tag,
  type IconName,
} from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame, theme } from './StoryKit';

/** `crates/story/src/stories/collapsible_story.rs` of gpui-component v0.9.1. */
const ORDER_DETAILS = [
  ['Shipping address', '100 Market St, San Francisco'],
  ['Items', '2x Studio Headphones'],
];
const USAGE_ITEMS = [
  ['Requests', '$210.84'],
  ['Active CPU', '$21.95'],
  ['Events', '$21.20'],
  ['Storage', '$20.45'],
];
const NOTIFICATIONS = [
  ['push', 'Push notifications'],
  ['email', 'Email notifications'],
  ['sms', 'SMS notifications'],
];
const API_KEY_ROWS = [
  ['Production', 'PRDK230454*242SDIFPPL'],
  ['Development', 'DUILO30454*242SDIFUIP'],
  ['Staging', 'IPPODAS230454*242SDI'],
];
const PROFILE_FIELDS: [IconName, string, string][] = [
  ['inbox', 'Last activity', '2 hours ago'],
  ['calendar', 'Online since', 'Today, 9:00 AM'],
  ['globe', 'Location', 'Hong Kong'],
];

const sm: TextStyle = {
  fontSize: 14,
  lineHeight: 22.65,
  color: theme.foreground,
};
const xs: TextStyle = {
  fontSize: 12,
  lineHeight: 19.4,
  color: theme.foreground,
};
const muted = { color: theme.mutedForeground };
const row: ViewStyle = { flexDirection: 'row', alignItems: 'center' };
const accent = '#f5f5f5';

function panelRow(extra?: ViewStyle): ViewStyle {
  return {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    alignItems: 'center',
    borderRadius: theme.radiusLg,
    borderWidth: 1,
    borderColor: theme.border,
    ...extra,
  };
}

function Chevron({ open }: { open: boolean }) {
  return (
    <Icon
      name={open ? 'chevron-down' : 'chevron-right'}
      size="xsmall"
      color={theme.mutedForeground}
    />
  );
}

function HoverRow({
  onPress,
  children,
}: {
  onPress?: () => void;
  children: ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[
        row,
        {
          height: 28,
          paddingHorizontal: 8,
          gap: 8,
          borderRadius: theme.radius,
          backgroundColor: hovered ? accent : undefined,
        },
      ]}
    >
      {children}
    </Pressable>
  );
}

function FileRow({ name }: { name: string }) {
  return (
    <HoverRow>
      <View style={{ width: 12 }} />
      <Icon name="file" size="xsmall" color={theme.mutedForeground} />
      <Text style={sm}>{name}</Text>
    </HoverRow>
  );
}

export function CollapsibleStory() {
  const [open, setOpen] = useState(
    new Set(['settings', 'api-keys', 'components-dir', 'profile']),
  );
  const [checked, setChecked] = useState(new Set(['push']));
  const is = (key: string) => open.has(key);
  const toggle = (key: string) => () =>
    setOpen(previous => {
      const next = new Set(previous);
      if (!next.delete(key)) next.add(key);
      return next;
    });
  const folder = (key: string, name: string) => (
    <HoverRow onPress={toggle(key)}>
      <Chevron open={is(key)} />
      <Icon
        name={is(key) ? 'folder-open' : 'folder'}
        size="xsmall"
        color={theme.mutedForeground}
      />
      <Text style={sm}>{name}</Text>
    </HoverRow>
  );
  const section = { width: 360 } as const;
  return (
    <StoryFrame testID="story-collapsible">
      <View style={{ width: '100%', alignItems: 'center', gap: 24 }}>
        <Section
          title="Basic"
          description="A trigger beside the title, with a summary that stays visible."
          column
          style={section}
        >
          <Collapsible
            style={{ width: '100%' }}
            kitStyle={{ width: '100%', gap: 8 }}
            open={is('order')}
            trigger={
              <View style={{ gap: 8 }}>
                <View
                  style={[
                    row,
                    {
                      paddingHorizontal: 4,
                      justifyContent: 'space-between',
                      gap: 16,
                    },
                  ]}
                >
                  <Text style={[sm, { fontWeight: '600' }]}>Order #4189</Text>
                  <Button
                    variant="ghost"
                    size="xsmall"
                    icon="chevrons-up-down"
                    tooltip="Toggle details"
                    onPress={toggle('order')}
                  />
                </View>
                <View
                  style={panelRow({
                    justifyContent: 'space-between',
                    backgroundColor: 'rgba(245, 245, 245, 0.3)',
                  })}
                >
                  <Text style={[sm, muted]}>Status</Text>
                  <Tag variant="success" size="small" label="Shipped" />
                </View>
              </View>
            }
          >
            <View style={{ gap: 8 }}>
              {ORDER_DETAILS.map(([title, value]) => (
                <View
                  key={title}
                  style={panelRow({
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 0,
                  })}
                >
                  <Text style={[sm, { fontWeight: '500' }]}>{title}</Text>
                  <Text style={[sm, muted]}>{value}</Text>
                </View>
              ))}
            </View>
          </Collapsible>
        </Section>
        <Section
          title="Row trigger"
          description="The whole row is the trigger, as used by FAQ entries."
          column
          style={section}
        >
          <GroupBox variant="outline" style={{ width: '100%' }}>
            <Collapsible
              style={{ width: '100%' }}
              kitStyle={{ width: '100%' }}
              open={is('faq')}
              trigger={
                <Pressable
                  onPress={toggle('faq')}
                  style={[
                    row,
                    { width: '100%', justifyContent: 'space-between', gap: 8 },
                  ]}
                >
                  <Text style={sm}>How do I reset my password?</Text>
                  <Chevron open={is('faq')} />
                </Pressable>
              }
            >
              <Text style={[sm, muted, { paddingTop: 12 }]}>
                Click the Forgot Password link on the sign in page, and we will
                send you an email with instructions to create a new one.
              </Text>
            </Collapsible>
          </GroupBox>
        </Section>
        <Section
          title="Bottom trigger"
          description="The trigger sits on the bottom edge of the card it opens."
          column
          style={section}
        >
          <View style={{ width: '100%' }}>
            <GroupBox
              variant="outline"
              style={{ width: '100%' }}
              title={
                <View
                  style={[
                    row,
                    { width: '100%', justifyContent: 'space-between' },
                  ]}
                >
                  <Text style={[sm, muted, { lineHeight: 17.5 }]}>
                    3 days remaining in cycle
                  </Text>
                  <Button outline size="xsmall" label="Billing" />
                </View>
              }
            >
              <Collapsible
                style={{ width: '100%' }}
                kitStyle={{ width: '100%', gap: 12 }}
                open={is('usage')}
                trigger={
                  <View
                    style={panelRow({
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      gap: 8,
                      backgroundColor: 'rgba(245, 245, 245, 0.6)',
                    })}
                  >
                    <View style={[row, { justifyContent: 'space-between' }]}>
                      <Text style={[sm, { fontWeight: '500' }]}>
                        $18.08 / $20
                      </Text>
                      <Text style={[sm, { fontWeight: '500' }]}>$200</Text>
                    </View>
                    <Progress value={90} />
                  </View>
                }
              >
                <View style={{ gap: 8 }}>
                  {USAGE_ITEMS.map(([label, value]) => (
                    <View
                      key={label}
                      style={[row, { justifyContent: 'space-between' }]}
                    >
                      <Text style={[xs, muted, { fontWeight: '500' }]}>
                        {label}
                      </Text>
                      <Text style={[xs, { fontWeight: '500' }]}>{value}</Text>
                    </View>
                  ))}
                </View>
              </Collapsible>
            </GroupBox>
            <View
              style={[
                row,
                {
                  position: 'absolute',
                  bottom: -12,
                  left: 0,
                  right: 0,
                  justifyContent: 'center',
                },
              ]}
            >
              <Button
                outline
                size="xsmall"
                rounded="large"
                icon={is('usage') ? 'chevron-up' : 'chevron-down'}
                tooltip="Toggle details"
                kitStyle={{
                  borderRadius: 9999,
                  backgroundColor: theme.background,
                }}
                onPress={toggle('usage')}
              />
            </View>
          </View>
        </Section>
        <Section
          title="Settings"
          description="Holds optional controls, keeping the default view short."
          column
          style={section}
        >
          <Collapsible
            style={{ width: '100%' }}
            kitStyle={{ width: '100%', gap: 8 }}
            open={is('settings')}
            trigger={
              <Button
                outline
                style={{ width: '100%' }}
                kitStyle={{ width: '100%', justifyContent: 'flex-start' }}
                icon={is('settings') ? 'chevron-down' : 'chevron-right'}
                iconColor={theme.mutedForeground}
                iconCustomSize={12}
                label="Notification settings"
                onPress={toggle('settings')}
              />
            }
          >
            <View
              style={{
                width: '100%',
                borderRadius: theme.radiusLg,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              {NOTIFICATIONS.map(([key, label], ix) => (
                <View
                  key={key}
                  style={[
                    row,
                    { paddingHorizontal: 12, paddingVertical: 8 },
                    ix > 0
                      ? { borderTopWidth: 1, borderColor: theme.border }
                      : null,
                  ]}
                >
                  <Checkbox
                    label={label}
                    checked={checked.has(key)}
                    onChange={e =>
                      setChecked(previous => {
                        const next = new Set(previous);
                        if (e.nativeEvent.state) next.add(key);
                        else next.delete(key);
                        return next;
                      })
                    }
                  />
                </View>
              ))}
            </View>
          </Collapsible>
        </Section>
        <Section
          title="Row actions"
          description="Actions live beside the trigger, in the header and in every row."
          column
          style={section}
        >
          <GroupBox variant="outline" style={{ width: '100%' }}>
            <Collapsible
              style={{ width: '100%' }}
              kitStyle={{ width: '100%', gap: 12 }}
              open={is('api-keys')}
              trigger={
                <View style={[row, { width: '100%', gap: 8 }]}>
                  <Pressable
                    onPress={toggle('api-keys')}
                    style={[row, { flex: 1, gap: 8 }]}
                  >
                    <Chevron open={is('api-keys')} />
                    <Text style={[sm, { fontWeight: '500' }]}>API Keys</Text>
                  </Pressable>
                  <Button
                    variant="ghost"
                    size="xsmall"
                    icon="plus"
                    tooltip="Add key"
                  />
                </View>
              }
            >
              <View style={{ gap: 8 }}>
                {API_KEY_ROWS.map(([name, key]) => (
                  <View key={name} style={[row, { gap: 8 }]}>
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: theme.radius,
                        backgroundColor: theme.muted,
                      }}
                    >
                      <Icon name="asterisk" size="xsmall" color={theme.green} />
                    </View>
                    <Text style={[xs, { width: 80 }]}>{name}</Text>
                    <View
                      style={{
                        flex: 1,
                        overflow: 'hidden',
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: theme.radius,
                        backgroundColor: theme.muted,
                      }}
                    >
                      <Text style={xs} numberOfLines={1}>
                        {key}
                      </Text>
                    </View>
                    <Button
                      variant="ghost"
                      size="xsmall"
                      icon="ellipsis"
                      tooltip="More"
                    />
                  </View>
                ))}
              </View>
            </Collapsible>
          </GroupBox>
        </Section>
        <Section
          title="Nested"
          description="Panels nest to any depth, here as a file tree."
          column
          style={section}
        >
          <GroupBox variant="outline" style={{ width: '100%' }}>
            <View style={{ width: '100%' }}>
              <Collapsible
                style={{ width: '100%' }}
                kitStyle={{ width: '100%' }}
                open={is('components-dir')}
                trigger={folder('components-dir', 'components')}
              >
                <View style={{ paddingLeft: 12 }}>
                  <Collapsible
                    style={{ width: '100%' }}
                    kitStyle={{ width: '100%' }}
                    open={is('ui-dir')}
                    trigger={folder('ui-dir', 'ui')}
                  >
                    <View style={{ paddingLeft: 12 }}>
                      {['button.rs', 'card.rs', 'dialog.rs'].map(name => (
                        <FileRow key={name} name={name} />
                      ))}
                    </View>
                  </Collapsible>
                  <FileRow name="login_form.rs" />
                </View>
              </Collapsible>
              <FileRow name="main.rs" />
            </View>
          </GroupBox>
        </Section>
        <Section
          title="Profile"
          description="Shows who someone is, and their details only on request."
          column
          style={section}
        >
          <GroupBox variant="outline" style={{ width: '100%' }}>
            <Collapsible
              style={{ width: '100%' }}
              kitStyle={{ width: '100%', gap: 12 }}
              open={is('profile')}
              trigger={
                <Pressable
                  onPress={toggle('profile')}
                  style={[
                    row,
                    { width: '100%', justifyContent: 'space-between', gap: 8 },
                  ]}
                >
                  <View style={[row, { gap: 8 }]}>
                    <Avatar name="Jason Lee" size="xsmall" />
                    <Text style={[sm, { fontWeight: '500' }]}>@huacnlee</Text>
                  </View>
                  <Chevron open={is('profile')} />
                </Pressable>
              }
            >
              <View style={{ gap: 8 }}>
                {PROFILE_FIELDS.map(([icon, label, value]) => (
                  <View key={label} style={[row, { gap: 8 }]}>
                    <Icon
                      name={icon}
                      size="xsmall"
                      color={theme.mutedForeground}
                    />
                    <Text style={[xs, muted]}>{label}</Text>
                    <Text style={[xs, { fontWeight: '500' }]}>{value}</Text>
                  </View>
                ))}
              </View>
            </Collapsible>
          </GroupBox>
        </Section>
      </View>
    </StoryFrame>
  );
}
