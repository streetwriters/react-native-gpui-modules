import React, { useState } from 'react';
import { Text, View } from 'react-native';
import {
  Editor,
  Tabs,
  type EditorGutterDecoration,
  type EditorOverviewRulerDecoration,
  type EditorProps,
} from '@react-native-gpui/gpui-kit';
import { StoryFrame, StoryToolbar, theme } from './StoryKit';
import { EDITOR_PREVIEW } from './data/editorPreview';

/** `crates/story/src/stories/editor_story.rs` of gpui-component v0.9.1. */

const COMPLETION_WORDS = [
  'flag',
  'profile',
  'file_loader',
  'fallback',
  'dialog_log',
  'catalog',
];

const COMPLETION_HIGHLIGHTS = [
  ['Prefix', 'prefix'],
  ['Contains', 'contains'],
  ['Characters', 'characters'],
] as const;

const FONT_FAMILIES = ['Menlo', 'Consolas', 'Monaco'];
const FONT_SIZES = [11, 13, 16, 20];

const DECORATION_TEXT =
  'Decoration styles\nColor highlights important text.\nItalic adds emphasis.\nUnderline marks review text.\n\nFill: marks a tracked range.\n\nFrame: outlines a tracked range.';

const span = (text: string) => {
  const start = DECORATION_TEXT.indexOf(text);
  return { start, end: start + text.length };
};

const italicStart = DECORATION_TEXT.indexOf('Italic');
const underlineStart = DECORATION_TEXT.indexOf('Underline');
const fillStart = DECORATION_TEXT.indexOf('marks a tracked range.');
const italicLine = { start: italicStart, end: underlineStart };
const underlineLine = {
  start: underlineStart,
  end: underlineStart + 'Underline marks review text.\n'.length,
};
const deleted = fillStart - 'Fill: '.length;
const deletedLine = { start: deleted, end: deleted };

const MODIFIED = { token: 'status.modified' };
const ADDED = { token: 'status.created' };
const REMOVED = { token: 'status.deleted' };

const DECORATIONS: Pick<
  EditorProps,
  | 'decorations'
  | 'rangeDecorations'
  | 'gutterDecorations'
  | 'overviewRulerDecorations'
> = {
  decorations: [
    {
      ...span('Decoration styles'),
      backgroundColor: { token: 'warning', opacity: 0.2 },
      bold: true,
      color: { token: 'danger' },
    },
    {
      ...span('Color'),
      color: { token: 'success' },
      bold: true,
      italic: true,
    },
    { ...span('Italic'), color: { token: 'info' }, italic: true },
    {
      ...span('Underline'),
      underline: { color: { token: 'warning' }, thickness: 2, wavy: true },
    },
  ],
  rangeDecorations: [
    { ...span('marks a tracked range.'), style: 'fill' },
    span('outlines a tracked range.'),
  ],
  gutterDecorations: [
    { ...italicLine, color: MODIFIED },
    { ...underlineLine, color: ADDED },
    { ...deletedLine, color: REMOVED },
  ] as EditorGutterDecoration[],
  overviewRulerDecorations: (
    [
      [italicLine, 'status.modified'],
      [underlineLine, 'status.created'],
      [deletedLine, 'status.deleted'],
    ] as const
  ).map(([range, token]) => ({
    ...range,
    lane: 'left',
    color: { token, opacity: 0.6 },
  })) as EditorOverviewRulerDecoration[],
};

export function EditorStory() {
  const [tab, setTab] = useState(0);
  const [readonly, setReadonly] = useState(false);
  const [fontFamily, setFontFamily] = useState<string | undefined>();
  const [fontSize, setFontSize] = useState(13);
  const [highlight, setHighlight] = useState(0);
  // The three editors stay mounted, as the story keeps their states.
  const pane = (index: number) =>
    ({
      width: '100%',
      height: '100%',
      display: tab === index ? 'flex' : 'none',
    }) as const;
  const shared: Partial<EditorProps> = {
    readonly,
    fontFamily,
    fontSize,
    bordered: true,
    style: { width: '100%', height: '100%' },
  };
  return (
    <StoryFrame fill testID="story-editor">
      <View style={{ width: '100%', height: '100%', gap: 12 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Tabs
            style={{ width: 420 }}
            variant="underline"
            selectedIndex={tab}
            onSelect={event => setTab(event.nativeEvent.index)}
            tabs={['Code', 'Decorations', 'Completions'].map(label => ({
              label,
            }))}
          />
          <StoryToolbar
            items={[
              {
                label: 'Options',
                menu: [
                  {
                    label: 'Readonly',
                    checked: readonly,
                    onSelect: () => setReadonly(value => !value),
                  },
                  { separator: true },
                  { label: 'Font family', heading: true },
                  ...[undefined, ...FONT_FAMILIES].map(family => ({
                    label: family ?? 'Theme default',
                    checked: fontFamily === family,
                    onSelect: () => setFontFamily(family),
                  })),
                  { separator: true },
                  { label: 'Font size', heading: true },
                  ...FONT_SIZES.map(size => ({
                    label: `${size}px`,
                    checked: fontSize === size,
                    onSelect: () => setFontSize(size),
                  })),
                  { separator: true },
                  { label: 'Completion highlight', heading: true },
                  ...COMPLETION_HIGHLIGHTS.map(([label], index) => ({
                    label,
                    checked: highlight === index,
                    onSelect: () => setHighlight(index),
                  })),
                ],
              },
            ]}
          />
        </View>
        <View style={{ flex: 1, minHeight: 0 }}>
          <View style={pane(0)}>
            <Editor
              {...shared}
              language="rust"
              folding
              tabSize={4}
              defaultValue={EDITOR_PREVIEW}
            />
          </View>
          <View style={pane(1)}>
            <Editor
              {...shared}
              language="text"
              defaultValue={DECORATION_TEXT}
              {...DECORATIONS}
            />
          </View>
          <View style={[pane(2), { gap: 8 }]}>
            <Text
              style={{
                fontSize: 14,
                lineHeight: 22.65,
                color: theme.mutedForeground,
              }}
            >
              Type fl or log to compare highlights.
            </Text>
            <View style={{ flex: 1, minHeight: 0 }}>
              <Editor
                {...shared}
                language="text"
                completions={{
                  items: COMPLETION_WORDS,
                  match: COMPLETION_HIGHLIGHTS[highlight][1],
                }}
              />
            </View>
          </View>
        </View>
      </View>
    </StoryFrame>
  );
}
