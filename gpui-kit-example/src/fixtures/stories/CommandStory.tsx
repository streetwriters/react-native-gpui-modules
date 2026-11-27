import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import {
  Button,
  Command,
  Dialog,
  Icon,
  Kbd,
  type CommandEntry,
  type CommandListEntry,
} from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame, T, theme } from './StoryKit';

/** `crates/story/src/stories/command_story.rs` of gpui-component v0.9.1. */
const SUGGESTIONS: CommandListEntry[] = [
  {
    group: 'Suggestions',
    items: [
      { label: 'Calendar', icon: 'calendar' },
      {
        label: 'Search Emoji',
        icon: 'search',
        checked: true,
        keywords: ['smile', 'icon'],
      },
      { label: 'Calculator', icon: 'frame', disabled: true },
    ],
  },
  'separator',
  {
    group: 'Settings',
    items: [
      { label: 'Profile', icon: 'user', shortcut: 'secondary-p' },
      { label: 'Billing', icon: 'circle-user', shortcut: 'secondary-b' },
      { label: 'Settings', icon: 'settings', shortcut: 'secondary-s' },
    ],
  },
];

const SCROLLABLE: CommandListEntry[] = [
  {
    group: 'Navigation',
    items: [
      { label: 'Home', icon: 'layout-dashboard', shortcut: 'secondary-h' },
      { label: 'Inbox', icon: 'inbox', shortcut: 'secondary-i' },
      { label: 'Documents', icon: 'file', shortcut: 'secondary-d' },
      { label: 'Folders', icon: 'folder', shortcut: 'secondary-f' },
    ],
  },
  'separator',
  {
    group: 'Actions',
    items: [
      { label: 'New File', icon: 'plus', shortcut: 'secondary-n' },
      { label: 'Copy', icon: 'copy', shortcut: 'secondary-c' },
      { label: 'Delete', icon: 'delete', shortcut: 'secondary-backspace' },
    ],
  },
  'separator',
  {
    group: 'Account',
    items: [
      { label: 'Profile', icon: 'user' },
      { label: 'Notifications', icon: 'bell' },
      { label: 'Help & Support', icon: 'info' },
    ],
  },
  'separator',
  {
    group: 'Tools',
    items: [
      { label: 'Palette', icon: 'palette' },
      { label: 'Terminal', icon: 'square-terminal' },
      { label: 'Globe', icon: 'globe' },
    ],
  },
];

const QUICK: CommandEntry[] = [
  { label: 'New File', icon: 'plus' },
  { label: 'Duplicate', icon: 'copy' },
  { label: 'Move to Trash', icon: 'delete' },
];

const sm = { fontSize: 14, lineHeight: 20, color: theme.foreground };
const xs = { fontSize: 12, lineHeight: 16, color: theme.mutedForeground };

const VARIABLE: CommandEntry[] = [
  {
    label: 'small-row',
    content: (
      <View style={{ width: '100%', paddingVertical: 4 }}>
        <Text style={sm}>Compact custom row</Text>
      </View>
    ),
  },
  {
    label: 'large-row',
    content: (
      <View style={{ width: '100%', paddingVertical: 16, gap: 4 }}>
        <Text style={sm}>Expanded custom row</Text>
        <Text style={xs}>
          Its extra detail gives this row a different height.
        </Text>
      </View>
    ),
  },
];

type Stock = [string, string, string, number];
const STOCKS: Stock[] = [
  ['AAPL.US', 'Apple Inc.', '228.52', 1.24],
  ['NVDA.US', 'NVIDIA Corporation', '134.81', -0.62],
  ['TSLA.US', 'Tesla, Inc.', '251.44', 3.18],
  ['MSFT.US', 'Microsoft Corporation', '428.02', 0.41],
  ['AMZN.US', 'Amazon.com, Inc.', '186.33', -1.07],
  ['700.HK', 'Tencent Holdings Ltd.', '412.60', 0.87],
  ['9988.HK', 'Alibaba Group Holding Ltd.', '82.15', -2.31],
  ['3690.HK', 'Meituan', '128.90', 1.66],
  ['600519.SH', 'Kweichow Moutai Co., Ltd.', '1482.00', -0.34],
  ['000858.SZ', 'Wuliangye Yibin Co., Ltd.', '142.77', 0.19],
];

function stockItem([symbol, name, price, change]: Stock): CommandEntry {
  return {
    label: name,
    keywords: [symbol],
    content: (
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ gap: 2 }}>
          <Text style={sm}>{symbol}</Text>
          <Text style={xs}>{name}</Text>
        </View>
        <View style={{ gap: 2, alignItems: 'flex-end' }}>
          <Text style={sm}>{price}</Text>
          <Text style={[xs, { color: change < 0 ? theme.red : theme.green }]}>
            {`${change >= 0 ? '+' : ''}${change.toFixed(2)}%`}
          </Text>
        </View>
      </View>
    ),
  };
}

function KeyHint({ keys, label }: { keys: string[]; label: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
      {keys.map(key => (
        <Kbd key={key} keystroke={key} />
      ))}
      <Text style={xs}>{label}</Text>
    </View>
  );
}

export function CommandStory() {
  const [last, setLast] = useState<string>();
  const [dialog, setDialog] = useState(false);
  const [matches, setMatches] = useState(6);
  const [stocks, setStocks] = useState(false);
  const [results, setResults] = useState<Stock[]>(STOCKS.slice(0, 5));
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const confirm = (e: { nativeEvent: { section: number; row: number } }) =>
    setLast(`section ${e.nativeEvent.section}, row ${e.nativeEvent.row}`);
  useEffect(() => () => clearTimeout(timer.current), []);
  const onStockQuery = (text: string) => {
    const q = text.trim().toLowerCase();
    setQuery(q);
    clearTimeout(timer.current);
    if (!q) {
      setResults(STOCKS.slice(0, 5));
      setLoading(false);
      return;
    }
    setLoading(true);
    timer.current = setTimeout(() => {
      setResults(
        STOCKS.filter(
          ([symbol, name]) =>
            symbol.toLowerCase().includes(q) || name.toLowerCase().includes(q),
        ),
      );
      setLoading(false);
    }, 400);
  };
  return (
    <StoryFrame testID="story-command">
      <View style={{ width: '100%', gap: 24 }}>
        <Section
          title="Inline"
          description="A palette rendered in place, with groups, icons and shortcuts."
        >
          <Command
            style={{ width: 380 }}
            items={SUGGESTIONS}
            onConfirm={confirm}
          />
        </Section>
        <Section
          title="Dialog"
          description="A dialog palette with its search field focused, a live match count and key hints."
        >
          <Button outline label="Open Menu" onPress={() => setDialog(true)} />
        </Section>
        <Section
          title="Quick actions"
          description="A no-search palette focused on arrow-key navigation."
        >
          <Command
            style={{ width: 380 }}
            searchable={false}
            items={QUICK}
            onConfirm={confirm}
          />
        </Section>
        <Section
          title="Scrollable"
          description="More commands than fit, capped at 220px."
        >
          <Command
            style={{ width: 380 }}
            maxHeight={220}
            items={SCROLLABLE}
            onConfirm={confirm}
          />
        </Section>
        <Section
          title="Variable-height rows"
          description="Each custom row keeps its own intrinsic height while the list remains virtualized."
        >
          <Command
            style={{ width: 380 }}
            items={VARIABLE}
            onConfirm={confirm}
          />
        </Section>
        <Section
          title="Search panel"
          description={
            'A palette used as a search panel whose custom filter checks symbols before company names — try "a", "hk" or "tesla".'
          }
        >
          <Button
            outline
            label="Search Stocks"
            onPress={() => setStocks(true)}
          />
        </Section>
        {last !== undefined && (
          <Section
            title="Last confirmed"
            description="The value reported by the last on_confirm callback."
          >
            <T>{last}</T>
          </Section>
        )}
      </View>
      <Dialog
        open={dialog}
        closeButton={false}
        kitStyle={{ padding: 0 }}
        onClose={() => setDialog(false)}
      >
        <Command
          style={{ width: '100%' }}
          autoFocus
          bordered={false}
          kitStyle={{ borderRadius: theme.radiusLg }}
          placeholder="Type a command or search..."
          items={SUGGESTIONS}
          onQuery={(_, matched) => setMatches(matched)}
          onConfirm={e => {
            confirm(e);
            setDialog(false);
          }}
          header={
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderBottomWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Text style={sm}>Commands</Text>
              <Text style={sm}>{`${matches} matches`}</Text>
            </View>
          }
          footer={
            <View
              style={{
                flexDirection: 'row',
                gap: 12,
                alignItems: 'center',
                flexWrap: 'wrap',
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderTopWidth: 1,
                borderColor: theme.border,
              }}
            >
              <KeyHint keys={['up', 'down']} label="Navigate" />
              <KeyHint keys={['enter']} label="Select" />
              <KeyHint keys={['escape']} label="Close" />
            </View>
          }
        />
      </Dialog>
      <Dialog
        open={stocks}
        closeButton={false}
        kitStyle={{ padding: 0 }}
        onClose={() => {
          setStocks(false);
          onStockQuery('');
        }}
      >
        <Command
          style={{ width: '100%' }}
          autoFocus
          bordered={false}
          filterable={false}
          loading={loading}
          kitStyle={{ borderRadius: theme.radiusLg, minHeight: 320 }}
          maxHeight={320}
          placeholder="Search stocks..."
          items={
            query
              ? results.map(stockItem)
              : [{ group: 'Popular', items: results.map(stockItem) }]
          }
          empty={
            <View
              style={{
                width: '100%',
                alignItems: 'center',
                gap: 8,
                paddingVertical: 24,
              }}
            >
              <Icon
                name="search"
                customSize={32}
                color={theme.mutedForeground}
              />
              <Text style={[sm, { color: theme.mutedForeground }]}>
                No stock found.
              </Text>
            </View>
          }
          onQuery={text => onStockQuery(text)}
          onConfirm={e => {
            const stock =
              e.nativeEvent.section === 0
                ? results[e.nativeEvent.row]
                : undefined;
            if (!stock) return;
            setLast(stock[0]);
            setStocks(false);
          }}
        />
      </Dialog>
    </StoryFrame>
  );
}
