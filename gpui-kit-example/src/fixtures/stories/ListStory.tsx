import React, { useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import {
  Icon,
  Label,
  List,
  type ListHandle,
  type ListSection,
} from '@react-native-gpui/gpui-kit';
import COMPANIES from './data/companies.json';
import { StoryFrame, StoryToolbar, theme } from './StoryKit';

/**
 * `crates/story/src/stories/list_story.rs` of gpui-component v0.9.1. Both this
 * port and the vendored story read `data/companies.json` in order instead of
 * random companies: the first 100, then the prices of the next 100, which the
 * story's refresh puts in place.
 */
type Company = {
  name: string;
  industry: string;
  lastDone: number;
  prevClose: number;
};

const companies: Company[] = COMPANIES.slice(0, 100).map((company, index) => ({
  ...company,
  lastDone: COMPANIES[100 + index].lastDone,
  prevClose: COMPANIES[100 + index].prevClose,
}));

/** `extend_more`: the next companies of the fixture, in order and repeating, instead of random ones. */
function moreCompanies(from: number, count: number): Company[] {
  return Array.from({ length: count }, (_, offset) => {
    const company = COMPANIES[(200 + from + offset) % COMPANIES.length];
    return { ...company };
  });
}

function groupByIndustry(list: Company[]) {
  const industries: string[] = [];
  const groups: Company[][] = [];
  for (const company of list) {
    let ix = industries.indexOf(company.industry);
    if (ix < 0) {
      ix = industries.push(company.industry) - 1;
      groups.push([]);
    }
    groups[ix].push(company);
  }
  return { industries, groups };
}

const muted = { color: theme.mutedForeground };

function Row({ company }: { company: Company }) {
  const change = (company.lastDone - company.prevClose) / company.prevClose;
  const trend =
    change > 0 ? theme.green : change < 0 ? theme.red : theme.foreground;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
      }}
    >
      <View style={{ maxWidth: 500, overflow: 'hidden' }}>
        <Label text={company.name} />
      </View>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <Text
          style={{
            width: 65,
            fontSize: 16,
            lineHeight: 25.9,
            color: theme.foreground,
          }}
        >
          {company.lastDone.toFixed(2)}
        </Text>
        <View
          style={{
            width: 65,
            flexDirection: 'row',
            justifyContent: 'flex-end',
          }}
        >
          <Text
            style={{
              fontSize: 12,
              lineHeight: 19.4,
              paddingHorizontal: 4,
              color: trend,
            }}
          >
            {`${change.toFixed(2)}%`}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function ListStory() {
  const [selectable, setSelectable] = useState(true);
  const [searchable, setSearchable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [lazyLoad, setLazyLoad] = useState(false);
  const [draggable, setDraggable] = useState(false);
  const list = useRef<ListHandle>(null);
  const [all, setAll] = useState(companies);
  const [grouped, setGrouped] = useState(() => groupByIndustry(companies));
  const [pending, setPending] = useState(false);
  const eof = all.length >= 6000;
  const loadMore = () => {
    if (pending) return;
    setPending(true);
    setTimeout(() => {
      setAll(current => {
        const next = [...current, ...moreCompanies(current.length - 100, 200)];
        setGrouped(groupByIndustry(next));
        return next;
      });
      setPending(false);
    }, 1000);
  };
  const sections = useMemo<ListSection[]>(() => {
    const { industries, groups } = grouped;
    return industries.map((industry, section) => ({
      header: (
        <View
          style={{
            flexDirection: 'row',
            paddingBottom: 4,
            paddingHorizontal: 8,
            gap: 8,
            alignItems: 'center',
          }}
        >
          <Icon name="folder" color={theme.mutedForeground} />
          <Text style={[{ fontSize: 14, lineHeight: 22.65 }, muted]}>
            {industry}
          </Text>
          <Text
            style={[{ fontSize: 14, lineHeight: 22.65 }, muted]}
          >{`(section: ${section})`}</Text>
        </View>
      ),
      footer: (
        <Text
          style={[
            {
              paddingTop: 4,
              paddingBottom: 20,
              paddingHorizontal: 8,
              fontSize: 12,
              lineHeight: 19.4,
            },
            muted,
          ]}
        >
          {`Total ${groups[section].length} items in section.`}
        </Text>
      ),
      rows: [0, 2, 3].includes(section)
        ? []
        : groups[section].map(company => ({
            label: company.name,
            content: <Row company={company} />,
          })),
    }));
  }, [grouped]);
  /** The section and row of a row by its index among all rows. */
  const locate = (index: number) => {
    let at = index;
    for (let section = 0; section < sections.length; section++) {
      const count = sections[section].rows.length;
      if (at < count) return { section, row: at };
      at -= count;
    }
    return null;
  };
  const move = (from: number, to: number, position: 'before' | 'after') => {
    const source = locate(from);
    const target = locate(to);
    if (!source || !target) return;
    setGrouped(({ industries, groups }) => {
      const next = groups.map(group => [...group]);
      // The shown rows of a section are its group, except the sections the
      // story leaves empty.
      const [company] = next[source.section].splice(source.row, 1);
      let row = position === 'before' ? target.row : target.row + 1;
      if (source.section === target.section && source.row < row) row -= 1;
      next[target.section].splice(
        Math.min(row, next[target.section].length),
        0,
        company,
      );
      return { industries, groups: next };
    });
  };
  return (
    <StoryFrame fill testID="story-list">
      <View style={{ flex: 1, gap: 16 }}>
        <StoryToolbar
          items={[
            {
              label: 'Go To',
              menu: [
                {
                  label: 'Top',
                  onSelect: () => list.current?.scrollToItem(0, 0),
                },
                {
                  label: 'Selected',
                  onSelect: () => list.current?.scrollToSelected(),
                },
                {
                  label: 'Section 5, Row 1',
                  onSelect: () => list.current?.scrollToItem(5, 1, 'center'),
                },
                {
                  label: 'Bottom',
                  onSelect: () => {
                    const last = sections.length - 1;
                    list.current?.scrollToItem(
                      last,
                      Math.max(sections[last].rows.length - 1, 0),
                    );
                  },
                },
              ],
            },
            {
              label: 'Options',
              menu: [
                {
                  label: 'Selectable',
                  checked: selectable,
                  onSelect: () => setSelectable(v => !v),
                },
                {
                  label: 'Searchable',
                  checked: searchable,
                  onSelect: () => setSearchable(v => !v),
                },
                {
                  label: 'Loading',
                  checked: loading,
                  onSelect: () => setLoading(v => !v),
                },
                {
                  label: 'Lazy Load',
                  checked: lazyLoad,
                  onSelect: () => setLazyLoad(v => !v),
                },
                {
                  label: 'Draggable',
                  checked: draggable,
                  onSelect: () => setDraggable(v => !v),
                },
              ],
            },
          ]}
        />
        <List
          ref={list}
          style={{ flex: 1, width: '100%' }}
          sections={sections}
          searchable={searchable}
          selectable={selectable}
          loading={loading}
          hasMore={lazyLoad && !eof && !pending}
          loadMoreThreshold={150}
          onLoadMore={() => lazyLoad && loadMore()}
          draggableRows={draggable}
          onMove={move}
          itemStyle={{
            paddingHorizontal: 8,
            paddingVertical: 4,
            overflowX: 'hidden',
            borderWidth: 1,
            borderRadius: theme.radius,
          }}
          kitStyle={{
            padding: 8,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: theme.radius,
          }}
        />
      </View>
    </StoryFrame>
  );
}
