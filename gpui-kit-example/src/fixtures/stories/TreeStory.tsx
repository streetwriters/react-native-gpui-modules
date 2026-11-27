import React, { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import {
  Button,
  Label,
  Tree,
  type TreeEntry,
  type TreeHandle,
} from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame, T, theme } from './StoryKit';

/**
 * `crates/story/src/stories/tree_story.rs` of gpui-component v0.9.1. The
 * official story lists its working directory; the parity spec starts the
 * reference in `desktop/e2e/fixtures/tree-root`, whose listing (folders
 * first, then by label, all collapsed) is this data.
 */

const file = (id: string): TreeEntry => ({
  id,
  label: id.slice(id.lastIndexOf('/') + 1),
});
const folder = (id: string, children: TreeEntry[]): TreeEntry => ({
  ...file(id),
  children,
});

const ROOT = './gpui-component';
const ITEMS: TreeEntry[] = [
  folder(ROOT, [
    folder(`${ROOT}/crates`, [
      folder(`${ROOT}/crates/story`, [
        folder(`${ROOT}/crates/story/src`, [
          file(`${ROOT}/crates/story/src/gallery.rs`),
          file(`${ROOT}/crates/story/src/tree_story.rs`),
        ]),
      ]),
      folder(`${ROOT}/crates/ui`, [
        folder(`${ROOT}/crates/ui/src`, [
          file(`${ROOT}/crates/ui/src/mod.rs`),
          file(`${ROOT}/crates/ui/src/tree.rs`),
        ]),
        file(`${ROOT}/crates/ui/Cargo.toml`),
      ]),
    ]),
    file(`${ROOT}/README.md`),
  ]),
];

export function TreeStory() {
  const tree = useRef<TreeHandle>(null);
  const [selected, setSelected] = useState<{ index: number; id: string }>();
  return (
    <StoryFrame testID="story-tree">
      <View style={{ width: '100%', gap: 12 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Button
            outline
            label="Select Item"
            onPress={() => {
              const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
              tree.current?.selectItem(item.id);
            }}
          />
        </View>
        <Section
          title="File tree"
          subTitle={
            <T>Press `enter` to rename. Right-click for context menu.</T>
          }
          style={{ width: 480 }}
        >
          <View style={{ width: '100%', gap: 16 }}>
            <Tree
              ref={tree}
              items={ITEMS}
              indent={16}
              indentOffset={12}
              rowStyle={{ borderRadius: theme.radius, paddingHorizontal: 12 }}
              kitStyle={{
                padding: 4,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: theme.radius,
              }}
              style={{ width: '100%', height: 540 }}
              contextMenu={[
                { label: 'Open', filesOnly: true },
                { label: 'Rename' },
                { separator: true },
                { label: 'Delete' },
              ]}
              onSelect={event => setSelected(event.nativeEvent)}
            />
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              {selected && (
                <Text style={{ fontSize: 16, color: theme.foreground }}>
                  {`Selected Index: ${selected.index}`}
                </Text>
              )}
              {selected && <Label text="Selected:" secondary={selected.id} />}
            </View>
          </View>
        </Section>
      </View>
    </StoryFrame>
  );
}
