import React, { useRef, useState } from 'react';
import { Text, View, type TextStyle } from 'react-native';
import {
  Button,
  ButtonGroup,
  GridItem,
  GridLayout,
  Switch,
  type GridArea,
  type GridLayoutHandle,
} from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame, theme } from './StoryKit';

/** `crates/story/src/stories/grid_layout_story.rs` of gpui-component v0.9.1. */

type Tile = { id: string; title: string; value: string; detail: string };

const TILES: Tile[] = [
  {
    id: 'revenue',
    title: 'Revenue',
    value: '$48,210',
    detail: 'Up 12% from last week',
  },
  {
    id: 'orders',
    title: 'Orders',
    value: '1,284',
    detail: '312 awaiting shipment',
  },
  {
    id: 'visitors',
    title: 'Visitors',
    value: '23,906',
    detail: 'Peak at 14:00',
  },
  {
    id: 'conversion',
    title: 'Conversion',
    value: '5.4%',
    detail: 'Target 6%',
  },
  { id: 'refunds', title: 'Refunds', value: '18', detail: 'Two need review' },
  {
    id: 'inventory',
    title: 'Inventory',
    value: '92%',
    detail: 'Three products low',
  },
  {
    id: 'notes',
    title: 'Notes',
    value: 'Pinned',
    detail: 'Locked in place: other tiles flow around it',
  },
];

const DEFAULT_LAYOUT: GridArea[] = [
  { id: 'revenue', colSpan: 6, rowSpan: 4, minSpan: [3, 2] },
  { id: 'orders', col: 6, colSpan: 3, rowSpan: 2 },
  { id: 'visitors', col: 9, colSpan: 3, rowSpan: 2 },
  { id: 'conversion', col: 6, row: 2, colSpan: 6, rowSpan: 2, maxSpan: [8, 4] },
  { id: 'refunds', row: 4, colSpan: 4, rowSpan: 3 },
  { id: 'inventory', col: 4, row: 4, colSpan: 4, rowSpan: 3 },
  { id: 'notes', col: 8, row: 4, colSpan: 4, rowSpan: 3, locked: true },
];

const HANDLE_LAYOUT: GridArea[] = [
  { id: 'revenue', colSpan: 3, rowSpan: 3 },
  { id: 'orders', col: 3, colSpan: 3, rowSpan: 3 },
  { id: 'visitors', row: 3, colSpan: 2, rowSpan: 2 },
  { id: 'conversion', col: 2, row: 3, colSpan: 4, rowSpan: 2 },
];

const COMPACTIONS = ['vertical', 'horizontal', 'none'] as const;
const COMPACTION_LABELS = {
  vertical: 'Vertical',
  horizontal: 'Horizontal',
  none: 'Free',
};

const sm: TextStyle = { fontSize: 14, lineHeight: 22.65 };

/** `tile_card`: the surface every tile shares. */
const card = {
  overflowX: 'hidden',
  borderRadius: theme.radiusLg,
  borderWidth: 1,
  borderColor: theme.border,
  backgroundColor: theme.background,
} as const;

function TileTitle({ tile }: { tile: Tile }) {
  return (
    <Text style={[sm, { fontWeight: '500', color: theme.mutedForeground }]}>
      {tile.title}
    </Text>
  );
}

function TileBody({ tile }: { tile: Tile }) {
  return (
    <View style={{ gap: 4 }}>
      <Text
        style={{
          fontSize: 24,
          lineHeight: 38.8,
          fontWeight: '600',
          color: theme.foreground,
        }}
      >
        {tile.value}
      </Text>
      <Text style={[sm, { color: theme.mutedForeground }]}>{tile.detail}</Text>
    </View>
  );
}

const describe = (
  areas: {
    id: string;
    col: number;
    row: number;
    colSpan: number;
    rowSpan: number;
  }[],
) =>
  areas
    .map(
      area =>
        `${area.id} (${area.col}, ${area.row}) ${area.colSpan}×${area.rowSpan}`,
    )
    .join('  ·  ');

export function GridLayoutStory() {
  const dashboard = useRef<GridLayoutHandle>(null);
  const [compaction, setCompaction] = useState<
    'vertical' | 'horizontal' | 'none'
  >('vertical');
  const [preventCollision, setPreventCollision] = useState(false);
  const [stacked, setStacked] = useState(false);
  const [editable, setEditable] = useState(true);
  const [lastChange, setLastChange] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <StoryFrame testID="story-grid_layout">
      <View style={{ width: '100%', gap: 24 }}>
        <Section
          title="Dashboard"
          description="Drag a tile to move it and drag its corner to resize it. Click a tile, then use the arrow keys to move it and Shift with the arrow keys to resize it."
          style={{ width: '100%' }}
        >
          <View style={{ width: '100%', gap: 12 }}>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <ButtonGroup outline size="small">
                {COMPACTIONS.map(value => (
                  <Button
                    key={value}
                    label={COMPACTION_LABELS[value]}
                    selected={compaction === value}
                    onPress={() => setCompaction(value)}
                  />
                ))}
              </ButtonGroup>
              <Switch
                label="Prevent collision"
                checked={preventCollision}
                onChange={event => setPreventCollision(event.nativeEvent.state)}
              />
              <Switch
                label="One column"
                checked={stacked}
                onChange={event => setStacked(event.nativeEvent.state)}
              />
              <Switch
                label="Editable"
                checked={editable}
                onChange={event => setEditable(event.nativeEvent.state)}
              />
              <Button
                outline
                size="small"
                label="Reset layout"
                onPress={() => {
                  setLastChange(null);
                  dashboard.current?.setAreas(DEFAULT_LAYOUT);
                }}
              />
            </View>
            <GridLayout
              ref={dashboard}
              style={{ width: '100%' }}
              label="Dashboard"
              compaction={compaction}
              preventCollision={preventCollision}
              draggable={editable}
              resizable={editable}
              reflow={stacked ? 1 : 0}
              onChange={areas => setLastChange(describe(areas))}
              onSelect={setSelected}
            >
              {TILES.map(tile => (
                <GridItem
                  key={tile.id}
                  {...DEFAULT_LAYOUT.find(area => area.id === tile.id)!}
                  label={tile.title}
                  kitStyle={{ borderRadius: theme.radiusLg }}
                  cardStyle={card}
                >
                  <View
                    style={{
                      flex: 1,
                      padding: 16,
                      gap: 12,
                      justifyContent: 'space-between',
                    }}
                  >
                    <TileTitle tile={tile} />
                    <TileBody tile={tile} />
                  </View>
                </GridItem>
              ))}
            </GridLayout>
            <Text
              style={{
                fontSize: 12,
                lineHeight: 19.4,
                fontFamily: 'Menlo',
                color: theme.mutedForeground,
              }}
            >
              {lastChange ??
                (selected
                  ? `Selected: ${selected}`
                  : 'Rearrange a tile to see the saved layout.')}
            </Text>
          </View>
        </Section>
        <Section
          title="Drag Handle"
          description="Tiles move only by their header, leaving the body free for its own pointer interaction."
          style={{ width: '100%' }}
        >
          <GridLayout style={{ width: '100%' }} columns={6}>
            {TILES.slice(0, 4).map(tile => (
              <GridItem
                key={tile.id}
                {...HANDLE_LAYOUT.find(area => area.id === tile.id)!}
                label={tile.title}
                dragHandleOnly
                kitStyle={{ borderRadius: theme.radiusLg }}
                cardStyle={card}
                handleStyle={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.muted,
                }}
                handle={<TileTitle tile={tile} />}
              >
                <View style={{ padding: 16 }}>
                  <TileBody tile={tile} />
                </View>
              </GridItem>
            ))}
          </GridLayout>
        </Section>
      </View>
    </StoryFrame>
  );
}
