import React, { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import {
  Button,
  Diff,
  type DiffFileSource,
  type DiffHandle,
  type DiffRange,
} from '@react-native-gpui/gpui-kit';
import { StoryFrame, StoryToolbar, T, theme, useNotify } from './StoryKit';

/** `crates/story/src/stories/diff_story.rs` of gpui-component v0.9.1. */

const EXAMPLES = [
  'Pull request',
  'Added file',
  'Deleted file',
  'Unicode',
  'Long lines',
  'Large file',
  'Renamed file',
  'Missing final newline',
  'File mode',
  'Merge conflict',
  'Source file',
];

const INLINE = [
  ['Words', 'word'],
  ['Characters', 'character'],
  ['Whole lines', 'none'],
] as const;

const SEPARATORS = [
  ['Hunk header', 'metadata'],
  ['Hidden line count', 'line-info'],
  ['Divider', 'simple'],
] as const;

const INDICATORS = [
  ['Signs', 'signs'],
  ['Bars', 'bars'],
  ['None', 'none'],
] as const;

const MERGE_CONFLICT =
  'impl Default for RetryPolicy {\n    fn default() -> Self {\n        Self {\n<<<<<<< HEAD\n            max_attempts: 5,\n            base_delay: Duration::from_millis(100),\n=======\n            max_attempts: 3,\n            base_delay: Duration::from_millis(250),\n>>>>>>> retry-backoff\n        }\n    }\n}\n';
const SOURCE_FILE =
  'use std::time::Duration;\n\n/// How often a failed request is retried.\npub struct RetryPolicy {\n    pub max_attempts: u32,\n    pub base_delay: Duration,\n}\n\nimpl RetryPolicy {\n    /// Returns the delay before the next attempt.\n    pub fn delay(&self, attempt: u32) -> Duration {\n        self.base_delay * 2_u32.pow(attempt.min(6))\n    }\n}\n';
const ADDED_PATCH = `diff --git a/src/retry.rs b/src/retry.rs
new file mode 100644
--- /dev/null
+++ b/src/retry.rs
@@ -0,0 +1,3 @@
+pub fn retry_delay(attempt: u32) -> u64 {
+    100 * 2_u64.pow(attempt.min(6))
+}
`;
const DELETED_PATCH = `diff --git a/src/legacy_retry.rs b/src/legacy_retry.rs
deleted file mode 100644
--- a/src/legacy_retry.rs
+++ /dev/null
@@ -1,3 +0,0 @@
-pub fn retry_delay(_: u32) -> u64 {
-    1000
-}
`;
const UNICODE_PATCH =
  '--- a/src/greeting.rs\n+++ b/src/greeting.rs\n@@ -1,6 +1,6 @@\n-// Greeting for every visitor\n+// 为每位访客生成问候\n fn greeting(name: &str) -> String {\n-\tformat!("Hello, {name} 👋")\n+\tformat!("你好，{name} 🌏")\n }\n \n-// café: é, 中文，مرحبا\n+// café: é, 中文，مرحبا\n';
const RENAMED_PATCH = `diff --git a/src/retry.rs b/src/retry_policy.rs
similarity index 100%
rename from src/retry.rs
rename to src/retry_policy.rs
`;
const NO_NEWLINE_PATCH = `--- a/config/review.conf
+++ b/config/review.conf
@@ -1,2 +1,2 @@
 enabled=true
-limit=20
+limit=100
\\ No newline at end of file
`;
const MODE_PATCH = `diff --git a/scripts/review.sh b/scripts/review.sh
old mode 100644
new mode 100755
`;
const REVIEW_PATCH =
  'diff --git a/src/retry.rs b/src/retry.rs\nindex 30a471b..604db2a 100644\n--- a/src/retry.rs\n+++ b/src/retry.rs\n@@ -9,7 +9,7 @@ impl Default for RetryPolicy {\n impl Default for RetryPolicy {\n     fn default() -> Self {\n         Self {\n-            max_attempts: 3,\n+            max_attempts: 5,\n             base_delay: Duration::from_millis(100),\n         }\n     }\n@@ -18,7 +18,7 @@ impl RetryPolicy {\n impl RetryPolicy {\n     /// Returns the delay before the next attempt.\n     pub fn delay(&self, attempt: u32) -> Duration {\n-        self.base_delay * attempt\n+        self.base_delay * 2_u32.pow(attempt.min(6))\n     }\n \n     /// Whether another request may be attempted.\n@@ -29,4 +29,4 @@ impl RetryPolicy {\n \n pub fn describe(policy: &RetryPolicy) -> String {\n-    format!("{} attempts", policy.max_attempts)\n+    format!("Up to {} attempts", policy.max_attempts)\n }\n';

function largePatch() {
  let patch =
    '--- a/config/features.conf\n+++ b/config/features.conf\n@@ -1,5000 +1,5000 @@\n';
  for (let line = 1; line <= 5000; line++) {
    const name = `entry_${String(line).padStart(4, '0')}`;
    if (line === 40 || line === 4960)
      patch += `-${name} = enabled\n+${name} = disabled\n`;
    else if (line === 2500) patch += `-${name} = enabled\n+${name} = pending\n`;
    else patch += ` ${name} = enabled\n`;
  }
  return patch;
}

function exampleFiles(example: number): DiffFileSource[] {
  const patch = (text: string): DiffFileSource[] => [
    { kind: 'patch', patch: text },
  ];
  switch (example) {
    case 1:
      return patch(ADDED_PATCH);
    case 2:
      return patch(DELETED_PATCH);
    case 3:
      return patch(UNICODE_PATCH);
    case 4: {
      const prefix =
        'const ENDPOINT: &str = "https://api.example.com/v1/changes?';
      const scope = 'scope=repository&'.repeat(24);
      return patch(
        `--- a/src/endpoint.rs\n+++ b/src/endpoint.rs\n@@ -1 +1 @@\n-${prefix}${scope}&limit=20";\n+${prefix}${scope}&limit=100";\n`,
      );
    }
    case 5:
      return patch(largePatch());
    case 6:
      return patch(RENAMED_PATCH);
    case 7:
      return patch(NO_NEWLINE_PATCH);
    case 8:
      return patch(MODE_PATCH);
    case 9:
      return [
        { kind: 'conflicts', path: 'src/retry.rs', text: MERGE_CONFLICT },
      ];
    case 10:
      return [{ kind: 'unchanged', path: 'src/retry.rs', text: SOURCE_FILE }];
    default:
      return patch(REVIEW_PATCH + ADDED_PATCH + DELETED_PATCH + MODE_PATCH);
  }
}

type Comment = {
  id: string;
  range: DiffRange & { endSide?: 'original' | 'modified' };
  body: string;
  resolved: boolean;
};

export function DiffStory() {
  const diff = useRef<DiffHandle>(null);
  const notify = useNotify();
  const [example, setExample] = useState(0);
  const [hasChanges, setHasChanges] = useState(true);
  const [mode, setMode] = useState<'unified' | 'split'>('unified');
  const [context, setContext] = useState<number | 'all'>(3);
  const [inline, setInline] = useState(0);
  const [separator, setSeparator] = useState(0);
  const [indicator, setIndicator] = useState(0);
  const [background, setBackground] = useState(true);
  const [hover, setHover] = useState(false);
  const [wrap, setWrap] = useState(false);
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 'retry-delay-review',
      range: { path: 'src/retry.rs', side: 'modified', start: 21, end: 21 },
      body: 'Should callers be able to configure the 6.4-second delay cap?',
      resolved: false,
    },
  ]);
  const pickOne = <T,>(
    entries: readonly (readonly [string, T])[],
    current: number,
    set: (index: number) => void,
  ) =>
    entries.map(([label], index) => ({
      label,
      checked: current === index,
      onSelect: () => set(index),
    }));
  return (
    <StoryFrame testID="story-diff">
      <View style={{ width: '100%', gap: 12 }}>
        <View style={{ width: '100%', flexDirection: 'row', gap: 8 }}>
          <StoryToolbar
            items={[
              {
                label: 'Unified',
                selected: mode === 'unified',
                onPress: () => setMode('unified'),
              },
              {
                label: 'Split',
                selected: mode === 'split',
                onPress: () => setMode('split'),
              },
            ]}
          />
          <StoryToolbar
            items={[
              {
                icon: 'arrow-up',
                tooltip: 'Previous change',
                disabled: !hasChanges,
                onPress: () => diff.current?.previousChange(),
              },
              {
                icon: 'arrow-down',
                tooltip: 'Next change',
                disabled: !hasChanges,
                onPress: () => diff.current?.nextChange(),
              },
            ]}
          />
          <View style={{ flex: 1 }} />
          <StoryToolbar
            items={[
              {
                label: 'Options',
                menu: [
                  {
                    label: 'Example',
                    children: EXAMPLES.map((label, index) => ({
                      label,
                      checked: example === index,
                      onSelect: () => setExample(index),
                    })),
                  },
                  {
                    label: 'Context',
                    children: [
                      {
                        label: 'Three context lines',
                        checked: context === 3,
                        onSelect: () => setContext(3),
                      },
                      {
                        label: 'All supplied context',
                        checked: context === 'all',
                        onSelect: () => setContext('all'),
                      },
                      { separator: true },
                      {
                        label: 'Expand all',
                        onSelect: () => diff.current?.expandUnchanged(),
                      },
                      {
                        label: 'Collapse all',
                        onSelect: () => diff.current?.collapseUnchanged(),
                      },
                    ],
                  },
                  {
                    label: 'Inline changes',
                    children: pickOne(INLINE, inline, setInline),
                  },
                  {
                    label: 'Hunk separator',
                    children: pickOne(SEPARATORS, separator, setSeparator),
                  },
                  {
                    label: 'Change indicator',
                    children: pickOne(INDICATORS, indicator, setIndicator),
                  },
                  { separator: true },
                  {
                    label: 'Tint changed lines',
                    checked: background,
                    onSelect: () => setBackground(value => !value),
                  },
                  {
                    label: 'Highlight hovered line',
                    checked: hover,
                    onSelect: () => setHover(value => !value),
                  },
                  {
                    label: 'Wrap long lines',
                    checked: wrap,
                    onSelect: () => setWrap(value => !value),
                  },
                ],
              },
            ]}
          />
        </View>
        <View style={{ width: '100%', gap: 8 }}>
          <T style={{ fontWeight: '500' }}>{EXAMPLES[example]}</T>
          <Diff
            ref={diff}
            style={{ width: '100%', height: 512 }}
            files={exampleFiles(example)}
            mode={mode}
            contextLines={context}
            inlineUnit={INLINE[inline][1]}
            hunkSeparator={SEPARATORS[separator][1]}
            changeIndicator={INDICATORS[indicator][1]}
            changeBackground={background}
            hoverHighlight={hover ? 'both' : 'none'}
            softWrap={wrap}
            onFilesChange={setHasChanges}
            decorations={
              example === 0
                ? [
                    {
                      path: 'src/retry.rs',
                      side: 'modified',
                      start: 21,
                      end: 21,
                    },
                  ]
                : undefined
            }
            gutterMarkers={
              example === 0
                ? [
                    {
                      id: 'overflow',
                      path: 'src/retry.rs',
                      side: 'modified',
                      line: 21,
                      label: 'Possible overflow',
                      content: (
                        <Button
                          variant="ghost"
                          size="xsmall"
                          icon="triangle-alert"
                          tooltip="Possible overflow"
                          onPress={() =>
                            notify.push(
                              '2_u32.pow(attempt) overflows for attempts above 31',
                            )
                          }
                        />
                      ),
                    },
                  ]
                : undefined
            }
            annotations={
              example === 0
                ? comments.map(comment => ({
                    id: comment.id,
                    path: comment.range.path,
                    side: comment.range.endSide ?? comment.range.side,
                    line: comment.range.end,
                    content: (
                      <View style={{ width: '100%', gap: 8 }}>
                        <View
                          style={{
                            width: '100%',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 8,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 14,
                                lineHeight: 22.65,
                                fontWeight: '500',
                                color: theme.foreground,
                              }}
                            >
                              Alex
                            </Text>
                            <Text
                              style={{
                                fontSize: 12,
                                lineHeight: 19.4,
                                color: theme.mutedForeground,
                              }}
                            >
                              {comment.resolved ? 'Resolved' : 'Review comment'}
                            </Text>
                          </View>
                          <Button
                            variant="ghost"
                            size="xsmall"
                            label={comment.resolved ? 'Reopen' : 'Resolve'}
                            onPress={() =>
                              setComments(list =>
                                list.map(item =>
                                  item.id === comment.id
                                    ? { ...item, resolved: !item.resolved }
                                    : item,
                                ),
                              )
                            }
                          />
                        </View>
                        {!comment.resolved && (
                          <Text
                            style={{
                              fontSize: 14,
                              lineHeight: 22.65,
                              color: theme.foreground,
                            }}
                          >
                            {comment.body}
                          </Text>
                        )}
                      </View>
                    ),
                  }))
                : undefined
            }
            onAddAnnotation={
              example === 0
                ? range => {
                    const start = Math.min(range.start, range.end);
                    const end = Math.max(range.start, range.end);
                    const lines =
                      start === end ? `line ${end}` : `lines ${start}–${end}`;
                    setComments(list => [
                      ...list,
                      {
                        id: `comment-${list.length}`,
                        range,
                        body: `New comment on ${lines}.`,
                        resolved: false,
                      },
                    ]);
                  }
                : undefined
            }
          />
        </View>
      </View>
    </StoryFrame>
  );
}
