import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import {
  DataTable,
  Spinner,
  type DataTableCell,
  type DataTableColumn,
  type DataTableHandle,
  type MenuEntry,
} from '@react-native-gpui/gpui-kit';
import COUNTERS from './data/counters.json';
import STOCKS from './data/stocks.json';
import { StoryFrame, StoryToolbar, theme, writeClipboard } from './StoryKit';

/**
 * `crates/story/src/stories/data_table_story.rs` of gpui-component v0.9.1.
 * Rows come from `data/stocks.json` (512 quotes) and `data/counters.json`
 * by id, the same way the vendored story draws them, instead of random ones.
 * "Rows: 1,000,000" is not offered: every cell crosses the bridge as a prop.
 */
type Quote = (typeof STOCKS)[number];
type Stock = Quote & { id: number; symbol: string; market: string; name: string };

let nextId = 0;

function randomStocks(size: number): Stock[] {
  const start = nextId;
  nextId += size + 1;
  return Array.from({ length: size }, (_, offset) => {
    const id = start + offset;
    const counter = COUNTERS[(id * 7 + 3) % COUNTERS.length];
    return { ...STOCKS[id % STOCKS.length], id, ...counter };
  });
}

const symbolCode = (stock: Stock) =>
  stock.symbol.includes('.') ? stock.symbol : `${stock.symbol}.${stock.market}`;

const UNITS: [number, string][] = [
  [1e12, 'T'],
  [1e9, 'B'],
  [1e6, 'M'],
  [1e3, 'K'],
];

function compact(value: number) {
  const unit = UNITS.find(([scale]) => Math.abs(value) >= scale);
  return unit ? `${(value / unit[0]).toFixed(2)}${unit[1]}` : value.toFixed(2);
}

const signed = (value: number, digits = 2) =>
  `${value < 0 ? '' : '+'}${value.toFixed(digits)}`;
const percent = (value: number, signedValue = false) =>
  signedValue ? `${signed(value * 100)}%` : `${(value * 100).toFixed(2)}%`;
const fixed = (value: number) => value.toFixed(2);
const whole = (value: number) => value.toFixed(0);

/** `format_cell`: the text of a column, and its weight. */
function formatCell(stock: Stock, key: string): [string, number] | undefined {
  const s = stock as Stock & Record<string, number>;
  const text = (value: string): [string, number] => [value, 400];
  switch (key) {
    case 'id':
      return text(String(stock.id));
    case 'market':
      return text(stock.market);
    case 'symbol':
      return [symbolCode(stock), 500];
    case 'name':
      return text(stock.name);
    case 'price':
      return [fixed(stock.price), 600];
    case 'change':
    case 'preMarketChange':
    case 'postMarketChange':
      return text(signed(s[key]));
    case 'changePercent':
    case 'yearChangePercent':
    case 'preMarketPercent':
    case 'postMarketPercent':
      return text(percent(s[key], true));
    case 'volume':
    case 'turnover':
    case 'marketCap':
    case 'ttm':
    case 'bidVolume':
    case 'askVolume':
    case 'preMarketCap':
    case 'postMarketCap':
    case 'floatCap':
    case 'shares':
    case 'sharesFloat':
      return text(compact(s[key]));
    case 'fiveMinsRanking':
    case 'th60DaysRanking':
    case 'day5Ranking':
    case 'day10Ranking':
    case 'day30Ranking':
    case 'day120Ranking':
    case 'day250Ranking':
      return text(whole(s[key]));
    case 'bid':
    case 'ask':
    case 'open':
    case 'prevClose':
    case 'high':
    case 'low':
    case 'peStatus':
    case 'pbStatus':
    case 'volumeRatio':
    case 'bidAskRatio':
    case 'latestPreClose':
    case 'latestPostClose':
      return text(fixed(s[key]));
    case 'turnoverRate':
    case 'riseRate':
    case 'amplitude':
      return text(percent(s[key]));
    default:
      return undefined;
  }
}

const col = (
  key: string,
  title: string,
  extra: Partial<DataTableColumn> = {},
): DataTableColumn => ({ key, title, ...extra });
const right = { align: 'right' } as const;
const flush = { align: 'right', flush: true } as const;

const BASE_COLUMNS: DataTableColumn[] = [
  col('id', 'ID', {
    width: 60,
    fixed: 'left',
    resizable: true,
    minWidth: 40,
    maxWidth: 100,
  }),
  col('market', 'Market', {
    width: 60,
    fixed: 'left',
    resizable: true,
    minWidth: 50,
  }),
  col('name', 'Name', {
    width: 180,
    fixed: 'left',
    maxWidth: 300,
    truncate: true,
  }),
  col('symbol', 'Symbol', { width: 100, fixed: 'left', sortable: true }),
  col('change', 'Chg', { sortable: true, ...flush }),
  col('changePercent', 'Chg%', { sortable: true, ...flush }),
  col('volume', 'Volume', flush),
  col('turnover', 'Turnover', flush),
  col('marketCap', 'Market Cap', flush),
  col('ttm', 'TTM', flush),
  col('fiveMinsRanking', '5m Ranking', flush),
  col('th60DaysRanking', '60d Ranking', right),
  col('yearChangePercent', 'Year Chg%', right),
  col('bid', 'Bid', flush),
  col('bidVolume', 'Bid Vol', flush),
  col('ask', 'Ask', flush),
  col('askVolume', 'Ask Vol', flush),
  col('open', 'Open', flush),
  col('prevClose', 'Prev Close', flush),
  col('high', 'High', flush),
  col('low', 'Low', flush),
  col('turnoverRate', 'Turnover Rate', right),
  col('riseRate', 'Rise Rate', right),
  col('amplitude', 'Amplitude', right),
  col('peStatus', 'P/E', right),
  col('pbStatus', 'P/B', right),
  col('volumeRatio', 'Volume Ratio', flush),
  col('bidAskRatio', 'Bid Ask Ratio', flush),
  col('latestPreClose', 'Latest Pre Close', right),
  col('latestPostClose', 'Latest Post Close', right),
  col('preMarketCap', 'Pre Mkt Cap', right),
  col('preMarketPercent', 'Pre Mkt%', right),
  col('preMarketChange', 'Pre Mkt Chg', right),
  col('postMarketCap', 'Post Mkt Cap', right),
  col('postMarketPercent', 'Post Mkt%', right),
  col('postMarketChange', 'Post Mkt Chg', right),
  col('floatCap', 'Float Cap', right),
  col('shares', 'Shares', right),
  col('sharesFloat', 'Float Shares', right),
  col('day5Ranking', '5d Ranking', right),
  col('day10Ranking', '10d Ranking', right),
  col('day30Ranking', '30d Ranking', right),
  col('day120Ranking', '120d Ranking', right),
  col('day250Ranking', '250d Ranking', right),
  col('price', 'Price', { fixed: 'right', sortable: true, ...flush }),
];

const group = (label: string, span: number) => ({ label, span });
const groupHeaders = (trailing: number) => [
  [
    group('Stock', 4),
    group('Market Data', 9),
    group('Quotes', 8),
    group('Stats', 7),
    group('Extended Hours', 8),
    group('Shares & Rankings', 8 + trailing),
    group('Quote', 1),
  ],
  [
    group('Identity', 4),
    group('Change', 2),
    group('Turnover', 4),
    group('Momentum', 3),
    group('Order Book', 4),
    group('Session', 4),
    group('Activity', 3),
    group('Valuation', 2),
    group('Ratios', 2),
    group('Pre & Post Market', 8),
    group('Shares', 3),
    group('Rankings', 5 + trailing),
    group('Last', 1),
  ],
];

type Size = 'xsmall' | 'small' | 'medium' | 'large' | 48;
const SIZES: [string, Size][] = [
  ['48px', 48],
  ['Large', 'large'],
  ['Medium', 'medium'],
  ['Small', 'small'],
  ['XSmall', 'xsmall'],
];
const sizeName = (size: Size) =>
  size === 48 ? 'Size(48px)' : SIZES.find(([, value]) => value === size)![0];

const trend = (value: number) =>
  value > 0 ? 'green' : value < 0 ? 'red' : undefined;

function cellOf(stock: Stock, key: string): DataTableCell | string {
  const formatted = formatCell(stock, key);
  if (!formatted) return { text: '--', color: 'muted-foreground' };
  const [text, weight] = formatted;
  const s = stock as Stock & Record<string, number>;
  switch (key) {
    case 'id':
      return { text, color: 'muted-foreground' };
    case 'market':
      return { text, color: stock.market === 'US' ? 'blue' : 'magenta' };
    case 'change':
    case 'preMarketChange':
    case 'postMarketChange':
      return { text, color: trend(s[key]) };
    case 'changePercent':
    case 'yearChangePercent':
    case 'preMarketPercent':
    case 'postMarketPercent':
      return {
        text,
        color: trend(s[key === 'changePercent' ? 'changePercent' : key]),
        background: trend(s[key]),
      };
    default:
      return weight === 400 ? text : { text, weight };
  }
}

const sourceIndex = (columns: DataTableColumn[], extra: number, ix: number) => {
  const rightStart = columns.findIndex(column => column.fixed === 'right');
  const start = rightStart < 0 ? columns.length : rightStart;
  if (ix < start) return ix;
  return ix < start + extra ? -1 : ix - extra;
};

export function DataTableStory() {
  const table = useRef<DataTableHandle>(null);
  const [stocks, setStocks] = useState(() => {
    nextId = 0;
    return randomStocks(5000);
  });
  const [base, setBase] = useState(BASE_COLUMNS);
  const [size, setSize] = useState<Size>('medium');
  const [headerHeight, setHeaderHeight] = useState<number | undefined>();
  const [extra, setExtra] = useState(0);
  const [stripe, setStripe] = useState(false);
  const [flags, setFlags] = useState({
    loop: true,
    resize: true,
    order: true,
    sortable: true,
    column: true,
    row: true,
    cell: false,
    header: true,
    fixed: true,
    groups: true,
  });
  const [fullLoading, setFullLoading] = useState(false);
  const [lazy, setLazy] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [eof, setEof] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [visible, setVisible] = useState([0, 0, 0, 0]);
  const [cell, setCell] = useState<[number, number] | undefined>();
  const toggle = (key: keyof typeof flags) =>
    setFlags(current => ({ ...current, [key]: !current[key] }));

  const columns = useMemo(() => {
    const rightStart = base.findIndex(column => column.fixed === 'right');
    const at = rightStart < 0 ? base.length : rightStart;
    const added = Array.from({ length: extra }, (_, n) =>
      col(`extra_${n + 1}`, `Column ${n + 1}`),
    );
    return [...base.slice(0, at), ...added, ...base.slice(at)];
  }, [base, extra]);

  const rows = useMemo(
    () =>
      stocks.map(stock =>
        columns.map(column =>
          column.key.startsWith('extra_') ? '--' : cellOf(stock, column.key),
        ),
      ),
    [stocks, columns],
  );

  useEffect(() => {
    if (!refresh) return;
    const timer = setInterval(() => {
      setStocks(current =>
        current.map((stock, ix) => {
          if (ix >= 2000 || ix % (3 + Math.floor(Math.random() * 7)) !== 0)
            return stock;
          const price = 5 + Math.random() * 994;
          const changePercent = (Math.random() - 0.5) * 0.2;
          return { ...stock, price, changePercent, change: price * changePercent };
        }),
      );
    }, 33);
    return () => clearInterval(timer);
  }, [refresh]);

  const changeRows = (count: number) => {
    if (count === stocks.length) return;
    setFullLoading(true);
    setTimeout(() => {
      nextId = 0;
      const next = randomStocks(count);
      setStocks(next);
      setEof(next.length <= 50);
      setLoadingMore(false);
      setFullLoading(false);
    }, 0);
  };

  const loadMore = () => {
    if (!lazy || loadingMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      setStocks(current => {
        const next = [...current, ...randomStocks(200)];
        setEof(next.length >= 6000);
        return next;
      });
      setLoadingMore(false);
    }, 1000);
  };

  const sort = (column: number, direction: string) => {
    const ix = sourceIndex(base, extra, column);
    const key = ix < 0 ? '' : base[ix].key;
    const descending = direction === 'descending';
    const byId = (a: Stock, b: Stock) => a.id - b.id;
    const order = (value: (stock: Stock) => number | string) =>
      descending
        ? (a: Stock, b: Stock) => (value(b) > value(a) ? 1 : value(b) < value(a) ? -1 : 0)
        : byId;
    if (key === 'id') setStocks(current => [...current].sort(order(s => s.id)));
    else if (key === 'symbol')
      setStocks(current => [...current].sort(order(s => s.symbol)));
    else if (key === 'change' || key === 'changePercent')
      setStocks(current => [...current].sort(order(s => s.change)));
  };

  const check = (label: string, checked: boolean, onSelect: () => void): MenuEntry => ({
    label,
    checked,
    onSelect,
  });

  const exportCsv = () => {
    const lines = [columns.map(column => column.title).join(',')];
    for (const stock of stocks)
      lines.push(
        columns
          .map(column => formatCell(stock, column.key)?.[0] ?? '')
          .map(text => (/[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text))
          .join(','),
      );
    writeClipboard(lines.join('\n'));
  };

  return (
    <StoryFrame fill testID="story-data_table">
      <View style={{ flex: 1, gap: 16 }}>
        <StoryToolbar
          items={[
            {
              label: `Size: ${sizeName(size)}`,
              menu: SIZES.map(([label, value]) =>
                check(label, size === value, () => setSize(value)),
              ),
            },
            {
              label: `Header Row Height: ${headerHeight ? `${headerHeight}px` : 'Default'}`,
              menu: [
                check('Default', headerHeight === undefined, () =>
                  setHeaderHeight(undefined),
                ),
                check('40px', headerHeight === 40, () => setHeaderHeight(40)),
                check('48px', headerHeight === 48, () => setHeaderHeight(48)),
              ],
            },
            {
              label: `Rows: ${stocks.length}`,
              menu: [
                [100, '100'],
                [500, '500'],
                [5000, '5,000'],
                [10000, '10,000'],
              ].map(([count, label]) =>
                check(label as string, stocks.length === count, () =>
                  changeRows(count as number),
                ),
              ),
            },
            {
              label: `Extra Columns: ${extra}`,
              menu: [
                [0, 'None'],
                [4, '4'],
                [8, '8'],
                [16, '16'],
                [32, '32'],
              ].map(([count, label]) =>
                check(label as string, extra === count, () => setExtra(count as number)),
              ),
            },
            {
              label: 'Options',
              menu: [
                check('Loop Selection', flags.loop, () => toggle('loop')),
                check('Column Resize', flags.resize, () => toggle('resize')),
                check('Column Order', flags.order, () => toggle('order')),
                check('Sortable', flags.sortable, () => toggle('sortable')),
                check('Column Selectable', flags.column, () => toggle('column')),
                check('Row Selectable', flags.row, () => toggle('row')),
                check('Cell Selectable', flags.cell, () => toggle('cell')),
                check('Row Header', flags.header, () => toggle('header')),
                check('Fixed Column', flags.fixed, () => toggle('fixed')),
                { separator: true },
                check('Striped Rows', stripe, () => setStripe(value => !value)),
                check('Loading', fullLoading, () => setFullLoading(value => !value)),
                check('Lazy Load', lazy, () => setLazy(value => !value)),
                check('Refresh Data', refresh, () => setRefresh(value => !value)),
                check('Group Headers', flags.groups, () => toggle('groups')),
                { separator: true },
                {
                  label: 'Clear Selection',
                  onSelect: () => table.current?.clearSelection(),
                },
              ],
            },
            {
              label: 'Go To',
              menu: [
                { label: 'Top', onSelect: () => table.current?.scrollToRow(0) },
                {
                  label: 'Bottom',
                  onSelect: () => table.current?.scrollToRow(stocks.length - 1),
                },
                { separator: true },
                {
                  label: 'Cell 5:3',
                  onSelect: () => table.current?.selectCell(5, 3),
                },
                {
                  label: 'Cell 10:7',
                  onSelect: () => table.current?.selectCell(10, 7),
                },
              ],
            },
            { label: 'Export CSV', onPress: exportCsv },
          ]}
        />
        <View style={{ flex: 1, minHeight: 0 }}>
          <DataTable
            ref={table}
            style={{ width: '100%', height: 'auto', flex: 1 }}
            columns={columns}
            rows={rows}
            size={size}
            headerRowHeight={headerHeight}
            stripe={stripe}
            loopSelection={flags.loop}
            columnResize={flags.resize}
            columnOrder={flags.order}
            sortable={flags.sortable}
            columnSelectable={flags.column}
            rowSelectable={flags.row}
            cellSelectable={flags.cell}
            rowHeader={flags.header}
            fixedColumns={flags.fixed}
            loading={fullLoading}
            hasMore={lazy && !loadingMore && !eof}
            loadMoreThreshold={150}
            groupHeaders={flags.groups ? groupHeaders(extra) : undefined}
            contextMenu={[
              { label: 'Selected Row: {row}' },
              { separator: true },
              ...SIZES.map(([label]) => ({ label: `Size ${label}` })),
            ]}
            onMenuSelect={(_, item) => {
              const picked = SIZES[item - 2];
              if (picked) setSize(picked[1]);
            }}
            onSort={event =>
              sort(event.nativeEvent.column, event.nativeEvent.direction)
            }
            onMoveColumn={(from, to) => {
              const a = sourceIndex(base, extra, from);
              const b = sourceIndex(base, extra, to);
              if (a < 0 || b < 0) return;
              setBase(current => {
                const next = [...current];
                const [moved] = next.splice(a, 1);
                next.splice(b, 0, moved);
                return next;
              });
            }}
            onLoadMore={loadMore}
            onSelectCell={event =>
              setCell([event.nativeEvent.row, event.nativeEvent.column])
            }
            onClearSelection={() => setCell(undefined)}
            onVisibleRangeChange={range =>
              setVisible([
                range.rowStart,
                range.rowEnd,
                range.columnStart,
                range.columnEnd,
              ])
            }
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: 36,
              gap: 12,
              paddingHorizontal: 12,
              backgroundColor: 'rgba(245,245,245,0.35)',
            }}
          >
            <Foot>{`Total · ${stocks.length} rows · ${columns.length} columns`}</Foot>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {loadingMore ? <Spinner size="xsmall" /> : null}
              <Foot>
                {`Current · rows ${visible[0]}..${visible[1]} · columns ${visible[2]}..${visible[3]}`}
              </Foot>
              {cell ? <Foot>{`· cell ${cell[0]}:${cell[1]}`}</Foot> : null}
              {eof ? <Foot>· complete</Foot> : null}
            </View>
          </View>
        </View>
      </View>
    </StoryFrame>
  );
}

function Foot({ children }: { children: string }) {
  return (
    <Text
      style={{ fontSize: 12, lineHeight: 19.4, color: theme.mutedForeground }}
    >
      {children}
    </Text>
  );
}
