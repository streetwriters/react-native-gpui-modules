import React, { memo, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
  type TextStyle,
} from 'react-native';
import {
  Button,
  Clipboard,
  Icon,
  Input,
  Select,
  Sidebar,
  ThemeRegistry,
  type SidebarEntry,
  type ThemeRegistryHandle,
  type ThemeRegistryState,
} from '@react-native-gpui/gpui-kit';
import { StoryFrame, StoryToolbar, theme, useNotify } from './StoryKit';
import { THEME_KEYS } from './data/themeKeys';

/** `crates/story/src/stories/theme_story/color_theme_story.rs` of gpui-component v0.9.1. */

type ColorEntry = {
  name: string;
  color: string;
  hex: string;
  explicit: boolean;
};
type ColorCategory = { name: string; entries: ColorEntry[] };

const titleCase = (text: string) =>
  text
    .split(/[_.]/)
    .map(part => (part ? part[0].toUpperCase() + part.slice(1) : ''))
    .join(' ');

/** `mapper::parse_theme_key`. */
function parseKey(key: string) {
  if (key.includes('.')) {
    const [category, ...rest] = key.split('.');
    return {
      category: titleCase(category),
      name: titleCase(rest.join('.')),
      canonical: key,
    };
  }
  const known = THEME_KEYS[key];
  if (known)
    return {
      category: titleCase(known[0]),
      name: titleCase(known[1]),
      canonical: known[2],
    };
  if (key.includes('_')) {
    const at = key.indexOf('_');
    return {
      category: titleCase(key.slice(0, at)),
      name: titleCase(key.slice(at + 1)),
      canonical: key,
    };
  }
  return { category: 'Global', name: titleCase(key), canonical: key };
}

const PRIORITY = [
  'Global',
  'Primary',
  'Secondary',
  'Accent',
  'Base',
  'Background',
  'Foreground',
  'Structure',
];

/** `format_colors`. */
function formatColors(state: ThemeRegistryState): ColorCategory[] {
  const explicit = new Set(state.explicit);
  const byCategory = new Map<string, ColorEntry[]>();
  for (const [key, hex] of Object.entries(state.colors)) {
    const parsed = parseKey(key);
    const list = byCategory.get(parsed.category) ?? [];
    list.push({
      name: parsed.name,
      color: `#${hex}`,
      hex,
      explicit: explicit.has(parsed.canonical),
    });
    byCategory.set(parsed.category, list);
  }
  const categories = [...byCategory.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([name, entries]) => ({
      name,
      entries: entries.sort((a, b) =>
        a.name < b.name ? -1 : a.name > b.name ? 1 : 0,
      ),
    }));
  return categories.sort((a, b) => {
    const pa = PRIORITY.indexOf(a.name);
    const pb = PRIORITY.indexOf(b.name);
    if (pa >= 0 && pb >= 0) return pa - pb;
    if (pa >= 0) return -1;
    if (pb >= 0) return 1;
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
  });
}

const filterCategories = (
  categories: ColorCategory[],
  keep: (entry: ColorEntry) => boolean,
) =>
  categories
    .map(category => ({ ...category, entries: category.entries.filter(keep) }))
    .filter(category => category.entries.length > 0);

const sm = (extra: TextStyle = {}): TextStyle => ({
  fontSize: 14,
  lineHeight: 22.65,
  ...extra,
});

/** `Checkerboard`: 12 point squares, white and light grey (or two dark greys). */
const Checkerboard = memo(function Checkerboard({
  dark,
  width,
  height,
}: {
  dark: boolean;
  width: number;
  height: number;
}) {
  const square = 12;
  const [c1, c2] = dark ? ['#1a1a1a', '#212121'] : ['#ffffff', '#f2f2f2'];
  const rows = Math.ceil(height / square);
  const cols = Math.ceil(width / square);
  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width,
        height,
        backgroundColor: c1,
      }}
    >
      {Array.from({ length: rows }, (_, row) => (
        <View key={row} style={{ flexDirection: 'row', height: square }}>
          {Array.from({ length: cols }, (_, col) => (
            <View
              key={col}
              style={{
                width: square,
                height: square,
                backgroundColor: (row + col) % 2 === 0 ? c2 : undefined,
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
});

export function ThemeColorsStory() {
  const registry = useRef<ThemeRegistryHandle>(null);
  const notify = useNotify();
  const [selected, setSelected] = useState<string>();
  const [state, setState] = useState<ThemeRegistryState>();
  const [showAll, setShowAll] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  const [forceOpen, setForceOpen] = useState<boolean | null>(null);
  const [filterValue, setFilterValue] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [panel, setPanel] = useState({ width: 0, height: 0 });
  const [hovered, setHovered] = useState<string | null>(null);

  const all = useMemo(() => (state ? formatColors(state) : []), [state]);
  const categories = useMemo(() => {
    let list = all;
    if (filterValue !== null)
      list = filterCategories(list, entry => entry.hex === filterValue);
    else if (!showAll) list = filterCategories(list, entry => entry.explicit);
    const q = query.trim().toLowerCase();
    if (q) {
      const hex = q.startsWith('#') ? q.slice(1) : q;
      list = list
        .map(category => {
          const categoryMatches = category.name.toLowerCase().includes(q);
          return {
            ...category,
            entries: category.entries.filter(
              entry =>
                categoryMatches ||
                entry.name.toLowerCase().includes(q) ||
                entry.hex.startsWith(hex),
            ),
          };
        })
        .filter(category => category.entries.length > 0);
    }
    return list;
  }, [all, filterValue, showAll, query]);

  const isolated = state?.isolated;
  const expand = (open: boolean) => () => {
    setRenderKey(key => key + 1);
    setForceOpen(open);
  };

  const sidebarGroups = [
    {
      label: '',
      items: categories.map((category, idx): SidebarEntry => ({
        label: category.name,
        open: forceOpen ?? idx === 0,
        clickToOpen: true,
        contextMenu: [
          { label: 'Expand All', onSelect: expand(true) },
          { label: 'Collapse All', onSelect: expand(false) },
        ],
        children: category.entries.map(entry => ({
          label: entry.name,
          suffix: (
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              {!entry.explicit && (
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: theme.foreground,
                  }}
                />
              )}
              <View
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: theme.radius / 2,
                  backgroundColor: entry.color,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              />
            </View>
          ),
          contextMenu:
            filterValue !== null
              ? [
                  {
                    label: 'Show All Values',
                    onSelect: () => setFilterValue(null),
                  },
                ]
              : [
                  {
                    label: 'Filter By Value',
                    onSelect: () => setFilterValue(entry.hex),
                  },
                ],
        })),
      })),
    },
  ];

  return (
    <StoryFrame fill testID="story-theme_colors">
      <ThemeRegistry ref={registry} selected={selected} onChange={setState} />
      <View
        style={{ width: '100%', height: '100%', gap: 16, overflow: 'hidden' }}
      >
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ width: 300 }}>
              <Select
                style={{ width: 300, height: 32 }}
                value={state?.selected}
                items={(state?.themes ?? []).map(item => ({
                  title: item.name,
                  icon: item.name === state?.active ? 'check' : undefined,
                }))}
                onChange={event => {
                  setSelected(event.nativeEvent.value);
                  setFilterValue(null);
                }}
              />
            </View>
            <Button
              variant="primary"
              label="Set Theme"
              onPress={() => state && registry.current?.apply(state.selected)}
            />
          </View>
          <View style={{ width: '100%' }}>
            <StoryToolbar
              items={[
                {
                  label: 'Options',
                  menu: [
                    {
                      label: 'Inherited Colors',
                      checked: showAll,
                      onSelect: () => setShowAll(value => !value),
                    },
                    {
                      label: 'Expand All',
                      checked: forceOpen === true,
                      onSelect: () => {
                        setRenderKey(key => key + 1);
                        setForceOpen(forceOpen !== true);
                      },
                    },
                  ],
                },
              ]}
            />
          </View>
        </View>
        <View
          style={{
            flex: 1,
            minHeight: 0,
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 16,
          }}
        >
          <Sidebar
            key={renderKey}
            width={300}
            style={{ height: '100%' }}
            kitStyle={{ borderWidth: 0 }}
            header={
              <Input
                prefix={<Icon name="search" size="small" />}
                placeholder="Search..."
                value={query}
                onChangeText={setQuery}
                style={{ width: '100%' }}
              />
            }
            groups={sidebarGroups}
          />
          <View
            style={{
              flex: 1,
              height: '100%',
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: isolated ? `#${isolated.border}` : theme.border,
              borderRadius: theme.radiusLg,
            }}
            onLayout={event => {
              const { width, height } = event.nativeEvent.layout;
              setPanel({ width, height });
            }}
          >
            <Checkerboard
              dark={state?.dark ?? false}
              width={panel.width}
              height={panel.height}
            />
            <ScrollView style={{ flex: 1 }}>
              <View style={{ paddingHorizontal: 16 }}>
                {categories.map((category, ix) => (
                  <View
                    key={category.name}
                    style={{
                      width: '100%',
                      gap: 12,
                      paddingTop: 16,
                      paddingBottom: ix === categories.length - 1 ? 16 : 0,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        lineHeight: 25.9,
                        fontWeight: '600',
                        paddingBottom: 8,
                        borderBottomWidth: 1,
                        borderColor: isolated
                          ? `#${isolated.border}`
                          : theme.border,
                        color: isolated
                          ? `#${isolated.foreground}`
                          : theme.foreground,
                      }}
                    >
                      {category.name}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        gap: 16,
                      }}
                    >
                      {category.entries.map(entry => (
                        <Pressable
                          key={entry.name}
                          onHoverIn={() => setHovered(entry.name)}
                          onHoverOut={() =>
                            setHovered(name =>
                              name === entry.name ? null : name,
                            )
                          }
                          style={{
                            width: 220,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 12,
                          }}
                        >
                          <View
                            style={{
                              width: 64,
                              height: 64,
                              borderRadius: theme.radius,
                              backgroundColor: entry.color,
                              borderWidth: 1,
                              borderColor: isolated
                                ? `#${isolated.border}`
                                : theme.border,
                            }}
                          />
                          <View style={{ flex: 1, gap: 4 }}>
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 8,
                              }}
                            >
                              {!entry.explicit && (
                                <View
                                  style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: isolated
                                      ? `#${isolated.foreground}`
                                      : theme.foreground,
                                  }}
                                />
                              )}
                              <Text
                                style={sm({
                                  fontWeight: '500',
                                  color: isolated
                                    ? `#${
                                        entry.explicit
                                          ? isolated.foreground
                                          : isolated.mutedForeground
                                      }`
                                    : theme.foreground,
                                })}
                              >
                                {entry.name}
                              </Text>
                            </View>
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <Text
                                style={sm({
                                  color: isolated
                                    ? `#${isolated.mutedForeground}`
                                    : theme.mutedForeground,
                                })}
                              >
                                {`#${entry.hex}`}
                              </Text>
                              <View
                                style={{
                                  opacity: hovered === entry.name ? 1 : 0,
                                }}
                              >
                                <Clipboard
                                  value={`#${entry.hex}`}
                                  onCopied={() =>
                                    notify.push(
                                      `Copied #${entry.hex} to clipboard`,
                                    )
                                  }
                                />
                              </View>
                            </View>
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </StoryFrame>
  );
}
