import React, { useState } from 'react';
import { Text, View, type TextStyle } from 'react-native';
import {
  Badge,
  Breadcrumb,
  Icon,
  Separator,
  Sidebar,
  SidebarToggle,
  Switch,
  type IconName,
  type SidebarEntry,
} from '@react-native-gpui/gpui-kit';
import { StoryFrame, StoryToolbar, theme } from './StoryKit';

/** `crates/story/src/stories/sidebar_story.rs` of gpui-component v0.9.1. */

type Item =
  | 'Playground'
  | 'Models'
  | 'Documentation'
  | 'Settings'
  | 'Design Engineering'
  | 'Sales and Marketing'
  | 'Travel';

const ICONS: Record<Item, IconName> = {
  Playground: 'square-terminal',
  Models: 'bot',
  Documentation: 'book-open',
  Settings: 'settings-2',
  'Design Engineering': 'frame',
  'Sales and Marketing': 'chart-pie',
  Travel: 'map',
};

const SUB_ITEMS: Partial<Record<Item, string[]>> = {
  Playground: ['History', 'Starred', 'Settings'],
  Models: ['Genesis', 'Explorer', 'Quantum'],
  Documentation: ['Introduction', 'Get Started', 'Tutorial', 'Changelog'],
  Settings: ['General', 'Team', 'Billing', 'Limits'],
};

const PLATFORM: Item[] = ['Playground', 'Models', 'Documentation', 'Settings'];
const PROJECTS: Item[] = [
  'Design Engineering',
  'Sales and Marketing',
  'Travel',
];

/** `red_500()`. */
const RED_500 = '#ef4444';
const SUCCESS_FOREGROUND = '#ffffff';

const text = (size: number, extra: TextStyle = {}): TextStyle => ({
  fontSize: size,
  lineHeight: size * 1.618,
  color: theme.foreground,
  ...extra,
});

const STATS = [
  ['Active projects', '12', '+2 this week'],
  ['Team members', '28', '4 online'],
  ['Tasks completed', '84%', '+6% this month'],
];

const ACTIVITY: [IconName, string, string][] = [
  ['circle-check', 'Design review completed', '12 minutes ago'],
  ['file', 'Project brief updated', '1 hour ago'],
  ['circle-user', 'Maya joined the workspace', '3 hours ago'],
];

export function SidebarStory() {
  const [, setActiveItems] = useState<Set<Item>>(
    () => new Set<Item>(['Playground']),
  );
  const [lastActive, setLastActive] = useState<Item>('Playground');
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [collapsible, setCollapsible] = useState<'icon' | 'offcanvas' | 'none'>(
    'icon',
  );
  const [right, setRight] = useState(false);
  const [clickToOpen, setClickToOpen] = useState(false);
  const [dynamicChildren, setDynamicChildren] = useState(false);
  const [checked, setChecked] = useState(false);
  const iconCollapsed = collapsed && collapsible === 'icon';
  const toggleCollapsed = collapsed && collapsible !== 'none';
  const side = right ? 'right' : 'left';

  const pressItem = (item: Item) => () => {
    setActiveItems(current => {
      const next = new Set(current);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
    setLastActive(item);
    setActiveSub(null);
  };
  const pressSub = (item: Item, sub: string) => () => {
    setActiveItems(current => new Set(current).add(item));
    setLastActive(item);
    setActiveSub(sub);
  };

  const platform: SidebarEntry[] = PLATFORM.map((item, ix) => {
    const active = lastActive === item && activeSub === null;
    return {
      label: item,
      icon: ICONS[item],
      active,
      open: ix === 0,
      clickToOpen,
      kitStyle: active ? { borderWidth: 1, borderColor: '#ffffff' } : undefined,
      contextMenu:
        ix === 0
          ? [
              {
                label: 'About',
                href: 'https://github.com/longbridge/gpui-kit',
              },
            ]
          : undefined,
      onPress: pressItem(item),
      children: (SUB_ITEMS[item] ?? []).map((sub, subIx) => ({
        label: sub,
        active: activeSub === sub && lastActive === item,
        disabled: sub === 'Quantum',
        onPress: pressSub(item, sub),
        ...(subIx === 0
          ? {
              suffix: (
                <Switch
                  size="xsmall"
                  checked={checked}
                  onChange={event => setChecked(event.nativeEvent.state)}
                />
              ),
              labelStyle: { color: RED_500 },
              contextMenu: [{ label: 'This is a label', heading: true }],
            }
          : {}),
      })),
    };
  });

  const projects: SidebarEntry[] = PROJECTS.map((item, ix) => ({
    label: item,
    icon: ICONS[item],
    active: lastActive === item && activeSub === null,
    disabled: item === 'Travel',
    clickToOpen,
    open: ix === 0 && dynamicChildren,
    children:
      ix === 0 && dynamicChildren
        ? [{ label: 'Child A' }, { label: 'Child B' }]
        : undefined,
    suffix:
      ix === 0 ? (
        <Badge dot count={1}>
          <View style={{ padding: 2 }}>
            <Icon name="bell" />
          </View>
        </Badge>
      ) : ix === 1 ? (
        <Icon name="settings-2" />
      ) : undefined,
    onPress: pressItem(item),
  }));

  const sidebar = (
    <Sidebar
      side={side}
      collapsible={collapsible}
      collapsed={collapsed}
      width={220}
      style={{ height: '100%' }}
      kitStyle={{ gap: 0 }}
      kitHeader
      header={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={
              iconCollapsed
                ? { width: 16, height: 16, alignItems: 'center' }
                : {
                    width: 32,
                    height: 32,
                    borderRadius: theme.radius,
                    backgroundColor: theme.success,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }
            }
          >
            <Icon
              name="gallery-vertical-end"
              color={iconCollapsed ? theme.foreground : SUCCESS_FOREGROUND}
            />
          </View>
          {!iconCollapsed && (
            <View style={{ flexShrink: 1, overflow: 'hidden' }}>
              <Text numberOfLines={1} style={text(14, { lineHeight: 17.5 })}>
                Company Name
              </Text>
              <Text numberOfLines={1} style={text(12, { lineHeight: 15 })}>
                Enterprise
              </Text>
            </View>
          )}
          {!iconCollapsed && <Icon name="chevrons-up-down" />}
        </View>
      }
      headerMenu={[
        { label: 'Twitter Inc.' },
        { label: 'Meta Platforms' },
        { label: 'Google Inc.' },
      ]}
      kitFooter
      footer={
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="circle-user" />
            {!iconCollapsed && <Text style={text(14)}>Jason Lee</Text>}
          </View>
          {!iconCollapsed && <Icon name="chevrons-up-down" />}
        </View>
      }
      groups={[
        { label: 'Platform', items: platform },
        { label: 'Projects', items: projects },
      ]}
    />
  );

  const content = (
    <View style={{ width: '100%', flex: 1, minHeight: 0, gap: 16 }}>
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <View style={{ minWidth: 0, gap: 4 }}>
          <Text style={text(24, { fontWeight: '600' })}>{lastActive}</Text>
          <Text style={text(14, { color: theme.mutedForeground })}>
            A quick view of your workspace activity.
          </Text>
        </View>
        <StoryToolbar
          items={[
            {
              label: 'Options',
              menu: [
                {
                  label: 'Icon mode',
                  checked: collapsible === 'icon',
                  onSelect: () => setCollapsible('icon'),
                },
                {
                  label: 'Offcanvas mode',
                  checked: collapsible === 'offcanvas',
                  onSelect: () => setCollapsible('offcanvas'),
                },
                {
                  label: 'Fixed mode',
                  checked: collapsible === 'none',
                  onSelect: () => setCollapsible('none'),
                },
                { separator: true },
                {
                  label: 'Right Side',
                  checked: right,
                  onSelect: () => setRight(value => !value),
                },
                {
                  label: 'Click to Open',
                  checked: clickToOpen,
                  onSelect: () => setClickToOpen(value => !value),
                },
                {
                  label: 'Dynamic Children',
                  checked: dynamicChildren,
                  onSelect: () => setDynamicChildren(value => !value),
                },
              ],
            },
          ]}
        />
      </View>
      <View style={{ width: '100%', flexDirection: 'row', gap: 12 }}>
        {STATS.map(([label, value, detail]) => (
          <View
            key={label}
            style={{
              flex: 1,
              minWidth: 0,
              gap: 8,
              padding: 16,
              borderRadius: theme.radiusLg,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <Text style={text(14, { color: theme.mutedForeground })}>
              {label}
            </Text>
            <Text style={text(24, { fontWeight: '600' })}>{value}</Text>
            <Text style={text(12, { color: theme.mutedForeground })}>
              {detail}
            </Text>
          </View>
        ))}
      </View>
      <View
        style={{
          width: '100%',
          flex: 1,
          minHeight: 0,
          marginTop: 8,
          borderRadius: theme.radiusLg,
          borderWidth: 1,
          borderColor: theme.border,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <Text style={text(16, { fontWeight: '500' })}>Recent activity</Text>
          <Text style={text(12, { color: theme.mutedForeground })}>Today</Text>
        </View>
        <Separator orientation="horizontal" />
        {ACTIVITY.map(([icon, title, time]) => (
          <View
            key={title}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: theme.muted,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name={icon} size="small" />
            </View>
            <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
              <Text style={text(14)}>{title}</Text>
              <Text style={text(12, { color: theme.mutedForeground })}>
                {time}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const toolbarRow = (
    <View
      style={{
        flexDirection: right && collapsible !== 'none' ? 'row-reverse' : 'row',
        justifyContent:
          right && collapsible !== 'none' ? 'space-between' : 'flex-start',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {collapsible !== 'none' && (
        <SidebarToggle
          side={side}
          collapsed={toggleCollapsed}
          onPress={() => setCollapsed(value => !value)}
        />
      )}
      {collapsible !== 'none' && (
        <Separator orientation="vertical" style={{ height: 16 }} />
      )}
      <Breadcrumb
        items={[
          { label: 'Breadcrumb' },
          { label: 'Home', onPress: () => setLastActive('Playground') },
          { label: lastActive, onPress: () => setActiveSub(null) },
          ...(activeSub ? [{ label: activeSub }] : []),
        ]}
      />
    </View>
  );

  return (
    <StoryFrame fill testID="story-sidebar">
      <View
        style={{
          width: '100%',
          height: '100%',
          flexDirection: right ? 'row-reverse' : 'row',
          borderRadius: theme.radius,
          borderWidth: 1,
          borderColor: theme.border,
          overflow: 'hidden',
        }}
      >
        {sidebar}
        <View
          style={{
            height: '100%',
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            gap: 16,
            padding: 16,
          }}
        >
          {toolbarRow}
          {content}
        </View>
      </View>
    </StoryFrame>
  );
}
