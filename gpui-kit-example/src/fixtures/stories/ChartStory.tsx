import React, { useState } from 'react';
import { ScrollView, Text, View, type LayoutChangeEvent } from 'react-native';
import { Chart, Icon } from '@react-native-gpui/gpui-kit';
import { StoryFrame, StoryToolbar, theme } from './StoryKit';
import dailyDevices from './data/chart/daily-devices.json';
import metrics from './data/chart/monthly-metrics.json';
import stockPrices from './data/chart/stock-prices.json';
import tslaIncome from './data/chart/tsla-income-statement.json';
import trafficSources from './data/chart/traffic-sources.json';
import browsers from './data/chart/browsers.json';
import plans from './data/chart/plans.json';
import regions from './data/chart/regions.json';
import products from './data/chart/products.json';
import pages from './data/chart/pages.json';
import productScores from './data/chart/product-scores.json';
import intraday from './data/chart/intraday-prices.json';

/** `crates/story/src/stories/chart_story.rs` of gpui-component v0.9.1. */
const CARD_HEIGHT = 400;
const CARD_GAP = 16;
const MIN_CARD_WIDTH = 280;
const INSET = 16;

const columnsFor = (width: number) =>
  Math.max(
    1,
    Math.floor((width - INSET * 2 + CARD_GAP) / (MIN_CARD_WIDTH + CARD_GAP)),
  );

const compact = (value: number) => {
  const magnitude = Math.abs(value);
  if (magnitude >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (magnitude >= 10_000) return `${(value / 1_000).toFixed(0)}K`;
  if (magnitude >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(0);
};
const money = (value: number) =>
  value < 0 ? `-$${compact(-value)}` : `$${compact(value)}`;
const changePercent = (latest: number, previous: number) =>
  Math.abs(previous) < Number.EPSILON
    ? 0
    : ((latest - previous) / Math.abs(previous)) * 100;
const latestChange = (values: number[]) =>
  values.length < 2
    ? 0
    : changePercent(values[values.length - 1], values[values.length - 2]);
const windowedChange = (values: number[], window: number) => {
  if (values.length < window * 2) return 0;
  const sum = (items: number[]) => items.reduce((a, b) => a + b, 0);
  return changePercent(
    sum(values.slice(-window)),
    sum(values.slice(-window * 2, -window)),
  );
};
const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

type Metric = (typeof metrics)[number];
const column = (key: keyof Metric) => metrics.map(row => row[key] as number);

const PALETTE = {
  chart_1: '#93c5fd',
  chart_2: '#3b82f6',
  chart_3: '#2563eb',
  chart_4: '#1d4ed8',
  chart_5: '#1e40af',
  chart_bullish: theme.green,
  chart_bearish: theme.red,
} as const;
type Token = keyof typeof PALETTE;

const withAlpha = (hex: string, alpha: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};
const shade = (token: Token, index: number): [Token, number] => [
  token,
  1 - 0.14 * index,
];
const shadeColor = (spec: [Token, number]) =>
  withAlpha(PALETTE[spec[0]], spec[1]);
const colorIndex = (name: string) => {
  switch (name) {
    case 'Direct':
    case 'Chrome':
    case 'Free':
    case 'N. America':
      return 0;
    case 'Organic Search':
    case 'Safari':
    case 'Starter':
    case 'Europe':
      return 1;
    case 'Social':
    case 'Edge':
    case 'Pro':
    case 'APAC':
      return 2;
    case 'Referral':
    case 'Firefox':
    case 'Enterprise':
    case 'LatAm':
      return 3;
    default:
      return 4;
  }
};

type Headline =
  { trend: number; period: string } | { text: string } | undefined;
interface CardSpec {
  title: string;
  period: string;
  legend?: [string, string][];
  chart: object;
  headline?: Headline;
  note: string;
  centered?: boolean;
  overlay?: React.ReactNode;
}

const trend = (percent: number, period = 'this month') => ({
  trend: percent,
  period,
});
const gradient = (color: Token) => ({ gradient: color });
const withColors = <T extends object>(rows: T[], key: keyof T, token: Token) =>
  rows.map(row => ({
    ...row,
    color: shade(token, colorIndex(String(row[key]))),
  }));

const tsla = tslaIncome.list.map(statement => {
  const index = new Map(statement.nodes.map((n, i) => [n.key, i]));
  return {
    period: statement.period,
    nodes: statement.nodes.map(n => ({
      name: n.name,
      value: Number(n.value) || 0,
      growth: n.growth === '' || n.growth == null ? null : Number(n.growth),
      color: n.color,
    })),
    links: statement.links.flatMap(l => {
      const source = index.get(l.source);
      const target = index.get(l.target);
      const value = Number(l.value);
      return source === undefined || target === undefined || Number.isNaN(value)
        ? []
        : [{ source, target, value }];
    }),
  };
});

const candlestick = (
  variant: string,
  bodyWidthRatio: number,
  tickMargin: number,
  id: string,
): CardSpec => {
  const first = stockPrices[0];
  const last = stockPrices[stockPrices.length - 1];
  const high = Math.max(...stockPrices.map(d => d.high));
  const low = Math.min(...stockPrices.map(d => d.low));
  return {
    title: 'ACME Daily',
    period: `${first.date} – ${last.date} 2025 · ${variant}`,
    chart: {
      kind: 'candlestick',
      id,
      rows: stockPrices,
      bodyWidthRatio,
      tickMargin,
      tooltipFormat: 'usd2',
    },
    headline: trend(changePercent(last.close, first.open), 'over 40 sessions'),
    note: `Closed at $${last.close.toFixed(2)}; ranged $${low.toFixed(
      2,
    )} – $${high.toFixed(2)}`,
  };
};

const barBase = (
  id: string,
  rows: object[],
  band: string,
  value: string,
  name: string,
) => ({ kind: 'bar', id, rows, band, value, name, label: 'compact' });
const accent: Token = 'chart_2';
const mid: Token = 'chart_3';
const deep: Token = 'chart_4';
const solid = (color: Token) => ({ mode: 'solid', color });
const shaded = (color: Token) => ({ mode: 'shaded', color });
const monthly =
  (key: keyof Metric) =>
  (rows = metrics) =>
    rows.map(row => ({ ...row, [key]: row[key] }));
void monthly;
const monthTrend = (key: keyof Metric) => trend(latestChange(column(key)));

const cashFlow = metrics.map(d => ({ ...d, revenue: d.revenue - d.expenses }));

const cards = (): Record<string, CardSpec> => {
  const total = (rows: { visitors: number }[]) =>
    sum(rows.map(r => r.visitors));
  const sourcesTotal = total(trafficSources);
  const topSource = trafficSources.reduce((a, b) =>
    b.visitors > a.visitors ? b : a,
  );
  const plansTotal = sum(plans.map(p => p.accounts));
  const paid = sum(plans.filter(p => p.plan !== 'Free').map(p => p.accounts));
  const regionsTotal = sum(regions.map(r => r.revenue));
  const average = sum(productScores.map(d => d.alpha)) / productScores.length;
  const alphaSum = sum(productScores.map(d => d.alpha));
  const betaSum = sum(productScores.map(d => d.beta));
  const days = dailyDevices.slice(0, 8);
  const net = sum(cashFlow.map(d => d.revenue));
  const leader = browsers[0];
  const minutes = intraday.slice(0, Math.floor((intraday.length * 4) / 5));
  const prices = minutes.map(d => d.price);
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  const radarCommon = {
    kind: 'radar',
    rows: productScores,
    label: 'dimension',
    maxValue: 100,
  };
  const card: Record<string, CardSpec> = {
    AreaStacked: {
      title: 'Visitors',
      period: 'April – June 2025',
      legend: [
        [PALETTE[accent], 'Desktop'],
        [PALETTE[deep], 'Mobile'],
      ],
      chart: {
        kind: 'area',
        id: 'area-chart-stacked',
        rows: dailyDevices,
        x: 'date',
        series: [
          {
            y: 'desktop',
            stroke: accent,
            fill: gradient(accent),
            name: 'Desktop',
          },
          { y: 'mobile', stroke: deep, fill: gradient(deep), name: 'Mobile' },
        ],
        tickMargin: 8,
      },
      headline: trend(
        windowedChange(
          dailyDevices.map(d => d.desktop + d.mobile),
          7,
        ),
        'this week',
      ),
      note: `${compact(
        sum(dailyDevices.map(d => d.desktop + d.mobile)),
      )} visitors over the last three months`,
    },
    Pie: {
      title: 'Traffic Sources',
      period: 'June 2025',
      centered: true,
      legend: trafficSources.map(s => [
        shadeColor(shade(mid, colorIndex(s.source))),
        s.source,
      ]),
      chart: {
        kind: 'pie',
        id: 'pie-chart',
        rows: withColors(trafficSources, 'source', mid),
        value: 'visitors',
        outerRadius: 90,
        name: 'Visitors',
      },
      headline: {
        text: `${topSource.source} brings ${(
          (topSource.visitors / sourcesTotal) *
          100
        ).toFixed(0)}% of traffic`,
      },
      note: `${compact(sourcesTotal)} visitors across five channels`,
    },
    PieDonut: {
      title: 'Browser Share',
      period: 'June 2025',
      centered: true,
      legend: browsers.map(b => [
        shadeColor(shade(mid, colorIndex(b.browser))),
        b.browser,
      ]),
      chart: {
        kind: 'pie',
        id: 'pie-chart-donut',
        rows: withColors(browsers, 'browser', mid),
        value: 'share',
        innerRadius: 58,
        outerRadius: 90,
        name: 'Share',
      },
      overlay: (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 24,
              lineHeight: 32,
              fontWeight: '600',
              color: theme.foreground,
            }}
          >
            {`${leader.share.toFixed(0)}%`}
          </Text>
          <Text
            style={{
              fontSize: 12,
              lineHeight: 19.4,
              color: theme.mutedForeground,
            }}
          >
            {leader.browser}
          </Text>
        </View>
      ),
      headline: {
        text: `${leader.browser} leads by ${(
          leader.share - browsers[1].share
        ).toFixed(0)} points`,
      },
      note: 'Share of sessions by browser family',
    },
    PiePadAngle: {
      title: 'Plan Mix',
      period: 'June 2025',
      centered: true,
      legend: plans.map(p => [
        shadeColor(shade(mid, colorIndex(p.plan))),
        p.plan,
      ]),
      chart: {
        kind: 'pie',
        id: 'pie-chart-pad-angle',
        rows: withColors(plans, 'plan', mid),
        value: 'accounts',
        innerRadius: 56,
        outerRadius: 90,
        padAngle: 0.04,
        name: 'Accounts',
      },
      headline: {
        text: `${((paid / plansTotal) * 100).toFixed(
          0,
        )}% of accounts are on a paid plan`,
      },
      note: `${compact(plansTotal)} accounts in total`,
    },
    PieLabel: {
      title: 'Revenue by Region',
      period: 'Q2 2025',
      centered: true,
      chart: {
        kind: 'pie',
        id: 'pie-chart-label',
        rows: withColors(regions, 'region', mid),
        value: 'revenue',
        innerRadius: 48,
        outerRadius: 76,
        label: 'region',
        name: 'Revenue',
      },
      headline: {
        text: `${money(regions[0].revenue + regions[1].revenue)} of ${money(
          regionsTotal,
        )} comes from the two largest regions`,
      },
      note: 'Recognized revenue, in US dollars',
    },
    Radar: {
      title: 'Product Score',
      period: 'Alpha, Q2 review',
      centered: true,
      chart: {
        ...radarCommon,
        id: 'radar-chart',
        series: [
          {
            value: 'alpha',
            stroke: accent,
            fill: [accent, 0.3],
            name: 'Alpha',
          },
        ],
        tooltipFormat: 'score',
      },
      headline: { text: `Scores ${average.toFixed(0)} on average` },
      note: 'Six review dimensions, scored out of 100',
    },
    RadarMultiple: {
      title: 'Alpha vs Beta',
      period: 'Q2 review',
      centered: true,
      legend: [
        [PALETTE[accent], 'Alpha'],
        [PALETTE[deep], 'Beta'],
      ],
      chart: {
        ...radarCommon,
        id: 'radar-chart-multiple',
        series: [
          {
            value: 'alpha',
            stroke: accent,
            fill: [accent, 0.25],
            name: 'Alpha',
          },
          { value: 'beta', stroke: deep, fill: [deep, 0.25], name: 'Beta' },
        ],
      },
      headline: {
        text:
          alphaSum >= betaSum
            ? `Alpha leads by ${(alphaSum - betaSum).toFixed(0)} points overall`
            : `Beta leads by ${(betaSum - alphaSum).toFixed(0)} points overall`,
      },
      note: 'Alpha wins on usability, Beta on reliability',
    },
    RadarDots: {
      title: 'Review Grades',
      period: 'Alpha, Q2 review',
      centered: true,
      chart: {
        ...radarCommon,
        id: 'radar-chart-dots',
        labelKind: 'grade',
        gradeField: 'alpha',
        series: [
          {
            value: 'alpha',
            stroke: accent,
            fill: [accent, 0.25],
            name: 'Alpha',
          },
        ],
        dot: true,
        outerRadius: 64,
      },
      headline: { text: 'Two dimensions graded A' },
      note: 'A from 85, B from 70, C below',
    },
    RadarLinesOnly: {
      title: 'Beta Profile',
      period: 'Q2 review',
      centered: true,
      legend: [[PALETTE[deep], 'Beta']],
      chart: {
        ...radarCommon,
        id: 'radar-chart-lines-only',
        series: [
          { value: 'beta', stroke: deep, fill: 'transparent', name: 'Beta' },
        ],
        gridLevels: 5,
      },
      headline: { text: 'Strongest on reliability and support' },
      note: 'Outline only, five grid rings',
    },
    Bar: {
      title: 'Monthly Revenue',
      period: '2025',
      chart: {
        kind: 'bar',
        id: 'bar-chart',
        rows: metrics,
        band: 'month',
        value: 'revenue',
        name: 'Revenue',
        fill: solid(accent),
        corners: 'tip',
        valueAxis: true,
        valueTickCount: 3,
        valueTickFormat: 'money',
        gridDashed: false,
        bandTickCount: 6,
      },
      headline: monthTrend('revenue'),
      note: `${money(sum(column('revenue')))} recognized this year`,
    },
    BarMixed: {
      title: 'Revenue by Region',
      period: 'Q2 2025',
      legend: regions.map(r => [
        shadeColor(shade(mid, colorIndex(r.region))),
        r.region,
      ]),
      chart: {
        ...barBase(
          'bar-chart-mixed',
          withColors(regions, 'region', mid),
          'region',
          'revenue',
          'Revenue',
        ),
        label: 'money',
        fill: { mode: 'rows' },
        corners: 'tip',
        paddingInner: 0.6,
        paddingOuter: 0.1,
      },
      headline: {
        text: `${regions[0].region} ahead of ${regions[1].region} by ${money(
          regions[0].revenue - regions[1].revenue,
        )}`,
      },
      note: 'One shade per region',
    },
    BarStacked: {
      title: 'Visitors by Device',
      period: 'First week of April',
      legend: [
        [PALETTE.chart_4, 'Desktop'],
        [PALETTE.chart_3, 'Mobile'],
        [PALETTE.chart_2, 'Tablet'],
        [PALETTE.chart_1, 'Watch'],
      ],
      chart: { kind: 'stacked', rows: days },
      headline: {
        text: `${compact(
          sum(days.map(d => d.desktop + d.mobile + d.tablet + d.watch)),
        )} visitors in eight days`,
      },
      note: 'Stacked by device, a custom Plot',
    },
    BarRounded: {
      title: 'Signups',
      period: '2025',
      chart: {
        ...barBase('bar-chart-rounded', metrics, 'month', 'signups', 'Signups'),
        fill: solid(accent),
        corners: 'all',
        cornerRadius: 8,
      },
      headline: monthTrend('signups'),
      note: `${compact(
        sum(column('signups')),
      )} new accounts this year; fully rounded bars`,
    },
    BarBottomAligned: {
      title: 'Orders',
      period: '2025',
      chart: {
        ...barBase('bar-chart-bottom', metrics, 'month', 'orders', 'Orders'),
        fill: solid(accent),
      },
      headline: monthTrend('orders'),
      note: 'Bottom aligned: bars grow up from the axis',
    },
    BarTopAligned: {
      title: 'Refunds',
      period: '2025',
      chart: {
        ...barBase('bar-chart-top', metrics, 'month', 'refunds', 'Refunds'),
        fill: solid(mid),
        alignment: 'top',
      },
      headline: monthTrend('refunds'),
      note: 'Top aligned: bars hang from the axis',
    },
    BarLeftAligned: {
      title: 'Top Products',
      period: 'Units sold, Q2 2025',
      chart: {
        ...barBase('bar-chart-left', products, 'product', 'sales', 'Units'),
        fill: solid(accent),
        alignment: 'left',
      },
      headline: {
        text: `${products[0].product} outsells the next product by ${compact(
          products[0].sales - products[1].sales,
        )}`,
      },
      note: 'Left aligned: labels beside horizontal bars',
    },
    BarRightAligned: {
      title: 'Page Views',
      period: 'June 2025',
      chart: {
        ...barBase('bar-chart-right', pages, 'page', 'views', 'Views'),
        fill: solid(deep),
        alignment: 'right',
      },
      headline: { text: `${pages[0].page} is the most visited page` },
      note: 'Right aligned: bars grow leftward',
    },
    BarNegative: {
      title: 'Net Cash Flow',
      period: '2025',
      legend: [
        [theme.green, 'Surplus'],
        [theme.red, 'Deficit'],
      ],
      chart: {
        ...barBase('bar-chart-negative', cashFlow, 'month', 'revenue', 'Net'),
        label: 'money',
        fill: {
          mode: 'sign',
          pos: 'chart_bullish',
          neg: 'chart_bearish',
          key: 'revenue',
        },
        valueAxis: true,
        signed: true,
      },
      headline: { text: `${money(net)} net for the year` },
      note: 'Revenue less expenses; the axis sits at zero',
    },
    BarGradientBottom: {
      title: 'Downloads',
      period: '2025',
      chart: {
        ...barBase(
          'bar-chart-gradient-bottom',
          metrics,
          'month',
          'downloads',
          'Downloads',
        ),
        fill: shaded(accent),
        bandTickCount: 4,
      },
      headline: monthTrend('downloads'),
      note: 'Shaded across the width, not along the length',
    },
    BarGradientTop: {
      title: 'Refunds',
      period: '2025',
      chart: {
        ...barBase(
          'bar-chart-gradient-top',
          metrics,
          'month',
          'refunds',
          'Refunds',
        ),
        alignment: 'top',
        fill: shaded(deep),
      },
      headline: monthTrend('refunds'),
      note: 'The shading stays with the bar as it hangs',
    },
    BarGradientLeft: {
      title: 'Page Views',
      period: 'June 2025',
      chart: {
        ...barBase('bar-chart-gradient-left', pages, 'page', 'views', 'Views'),
        alignment: 'left',
        fill: shaded(accent),
      },
      headline: {
        text: `${compact(
          sum(pages.map(d => d.views)),
        )} views across the top five pages`,
      },
      note: 'Horizontal bars shade top to bottom',
    },
    BarGradientRight: {
      title: 'Top Products',
      period: 'Units sold, Q2 2025',
      chart: {
        ...barBase(
          'bar-chart-gradient-right',
          products,
          'product',
          'sales',
          'Units',
        ),
        alignment: 'right',
        fill: shaded(deep),
      },
      headline: {
        text: `${compact(
          sum(products.map(d => d.sales)),
        )} units across the catalogue`,
      },
      note: 'The same shading on right-aligned bars',
    },
    BarGradientPerBar: {
      title: 'Sessions',
      period: '2025',
      chart: {
        ...barBase(
          'bar-chart-gradient-per-bar',
          metrics,
          'month',
          'sessions',
          'Sessions',
        ),
        fill: shaded(mid),
        corners: 'all',
        cornerRadius: 6,
      },
      headline: monthTrend('sessions'),
      note: 'Fully rounded bars keep their shading',
    },
    BarGradientDiagonal: {
      title: 'Orders',
      period: '2025',
      chart: {
        ...barBase(
          'bar-chart-gradient-diagonal',
          metrics,
          'month',
          'orders',
          'Orders',
        ),
        fill: { mode: 'diagonal', from: 'chart_1', to: 'chart_5' },
      },
      headline: monthTrend('orders'),
      note: 'One diagonal gradient across all bars',
    },
    Line: {
      title: 'Monthly Recurring Revenue',
      period: '2025',
      chart: {
        kind: 'line',
        id: 'line-chart',
        rows: metrics,
        x: 'month',
        y: 'mrr',
        stroke: accent,
        name: 'MRR',
        yAxis: true,
        yFormat: 'money',
        xTickCount: 4,
        tooltipFormat: 'money',
      },
      headline: monthTrend('mrr'),
      note: `${money(
        metrics[metrics.length - 1].mrr,
      )} MRR in December, up from ${money(metrics[0].mrr)} in January`,
    },
    LineLinear: {
      title: 'Conversion Rate',
      period: '2025',
      chart: {
        kind: 'line',
        id: 'line-chart-linear',
        rows: metrics,
        x: 'month',
        y: 'conversion',
        stroke: deep,
        mode: 'linear',
        name: 'Conversion %',
      },
      headline: monthTrend('conversion'),
      note: 'Visitors who signed up; straight segments',
    },
    LineStepAfter: {
      title: 'Active Subscriptions',
      period: '2025',
      chart: {
        kind: 'line',
        id: 'line-chart-step-after',
        rows: metrics,
        x: 'month',
        y: 'subscriptions',
        stroke: accent,
        mode: 'stepAfter',
        name: 'Subscriptions',
      },
      headline: monthTrend('subscriptions'),
      note: 'Counts change on renewal day; step after',
    },
    LineDots: {
      title: 'Deploys',
      period: 'Per month, 2025',
      chart: {
        kind: 'line',
        id: 'line-chart-dots',
        rows: metrics,
        x: 'month',
        y: 'deploys',
        dot: true,
        stroke: 'chart_5',
        name: 'Deploys',
      },
      headline: monthTrend('deploys'),
      note: `${compact(sum(column('deploys')))} production deploys this year`,
    },
    Area: {
      title: 'Active Users',
      period: '2025',
      chart: {
        kind: 'area',
        id: 'area-chart',
        rows: metrics,
        x: 'month',
        series: [
          {
            y: 'active_users',
            stroke: accent,
            fill: [accent, 0.3],
            name: 'Active users',
          },
        ],
      },
      headline: monthTrend('active_users'),
      note: 'Monthly active users; a flat fill',
    },
    AreaLinear: {
      title: 'Sessions',
      period: '2025',
      chart: {
        kind: 'area',
        id: 'area-chart-linear',
        rows: metrics,
        x: 'month',
        series: [
          { y: 'sessions', stroke: deep, fill: [deep, 0.3], name: 'Sessions' },
        ],
        mode: 'linear',
      },
      headline: monthTrend('sessions'),
      note: 'Straight segments between months',
    },
    AreaGradient: {
      title: 'Revenue vs Last Year',
      period: '2025',
      legend: [
        [PALETTE[accent], '2025'],
        [PALETTE.chart_1, '2024'],
      ],
      chart: {
        kind: 'area',
        id: 'area-chart-gradient',
        rows: metrics,
        x: 'month',
        series: [
          {
            y: 'last_year',
            stroke: 'chart_1',
            fill: gradient('chart_1'),
            name: '2024',
          },
          {
            y: 'revenue',
            stroke: accent,
            fill: gradient(accent),
            name: '2025',
          },
        ],
        tooltip: 'compare',
      },
      headline: trend(
        changePercent(sum(column('revenue')), sum(column('last_year'))),
        'year over year',
      ),
      note: 'Gradient fills fade to the baseline',
    },
    AreaInProgress: {
      title: 'Intraday Price',
      period: 'Today, in progress',
      chart: {
        kind: 'area',
        id: 'area-chart-in-progress',
        rows: minutes,
        x: 'time',
        series: [
          {
            y: 'price',
            stroke: accent,
            fill: gradient(accent),
            name: 'Price',
          },
        ],
        mode: 'linear',
        yDomainLow: low - (high - low) / 4,
        yDomainHigh: high,
        pointCount: intraday.length,
        xTickCount: 4,
      },
      headline: trend(
        changePercent(prices[prices.length - 1], prices[0]),
        'since the open',
      ),
      note: 'A pinned y axis, and room for the minutes still to come',
    },
    Candlestick: candlestick('Daily', 0.8, 5, 'candlestick-chart'),
    CandlestickNarrow: candlestick(
      'Narrow bodies',
      0.5,
      5,
      'candlestick-chart-narrow',
    ),
    CandlestickWide: candlestick(
      'Wide bodies',
      1.0,
      5,
      'candlestick-chart-wide',
    ),
    CandlestickTickMargin: candlestick(
      'Every tenth label',
      0.8,
      10,
      'candlestick-chart-tick-margin',
    ),
  };
  tsla.forEach((statement, index) => {
    const revenue = statement.nodes[0];
    card[`Sankey${index}`] = {
      title: 'TSLA Income Statement',
      period: statement.period,
      chart: {
        kind: 'sankey',
        id: `sankey-chart-${index}`,
        nodes: statement.nodes,
        links: statement.links,
        detailed: index === 0,
      },
      headline: {
        text: revenue
          ? `${money(revenue.value)} of revenue, ${
              revenue.growth === null
                ? 'flat year over year'
                : revenue.growth >= 0
                  ? `up ${revenue.growth.toFixed(1)}% year over year`
                  : `down ${(-revenue.growth).toFixed(1)}% year over year`
            }`
          : 'No revenue reported',
      },
      note: 'How revenue flows into profit and expenses',
    };
  });
  return card;
};

const SECTIONS: { rule: boolean; cards: string[] }[] = [
  { rule: false, cards: ['AreaStacked'] },
  { rule: false, cards: ['Pie', 'PieDonut', 'PiePadAngle', 'PieLabel'] },
  {
    rule: true,
    cards: ['Radar', 'RadarMultiple', 'RadarDots', 'RadarLinesOnly'],
  },
  {
    rule: true,
    cards: [
      'Bar',
      'BarMixed',
      'BarStacked',
      'BarRounded',
      'BarBottomAligned',
      'BarTopAligned',
      'BarLeftAligned',
      'BarRightAligned',
      'BarNegative',
      'BarGradientBottom',
      'BarGradientTop',
      'BarGradientLeft',
      'BarGradientRight',
      'BarGradientPerBar',
      'BarGradientDiagonal',
    ],
  },
  { rule: true, cards: ['Line', 'LineLinear', 'LineStepAfter', 'LineDots'] },
  {
    rule: true,
    cards: ['Area', 'AreaLinear', 'AreaGradient', 'AreaInProgress'],
  },
  {
    rule: true,
    cards: [
      'Candlestick',
      'CandlestickNarrow',
      'CandlestickWide',
      'CandlestickTickMargin',
    ],
  },
  { rule: true, cards: tsla.map((_, index) => `Sankey${index}`) },
];

const small = { fontSize: 14, lineHeight: 22.65 };

function Card({ spec }: { spec: CardSpec }) {
  const centered = spec.centered === true;
  const align = centered ? ({ textAlign: 'center' } as const) : {};
  const head = spec.headline;
  return (
    <View
      style={{
        flex: 1,
        minWidth: 0,
        height: CARD_HEIGHT,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: theme.radiusLg,
        padding: 16,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: centered ? 'center' : 'space-between',
        }}
      >
        <View style={{ flexShrink: 0 }}>
          <Text
            style={{
              fontSize: 16,
              lineHeight: 25.9,
              fontWeight: '600',
              color: theme.foreground,
              ...align,
            }}
          >
            {spec.title}
          </Text>
          <Text style={{ ...small, color: theme.mutedForeground, ...align }}>
            {spec.period}
          </Text>
        </View>
        {spec.legend && !centered ? <Legend entries={spec.legend} /> : null}
      </View>
      {spec.legend && centered ? (
        <View style={{ paddingTop: 8 }}>
          <Legend entries={spec.legend} center />
        </View>
      ) : null}
      <View style={{ flex: 1, minHeight: 0, paddingVertical: 16 }}>
        <Chart
          spec={spec.chart}
          style={{ flex: 1, width: undefined, height: undefined }}
        />
        {spec.overlay}
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: centered ? 'center' : 'flex-start',
          gap: 6,
        }}
      >
        <Text
          style={{
            ...small,
            fontWeight: '600',
            color: theme.foreground,
            ...align,
          }}
        >
          {head && 'trend' in head
            ? `Trending ${head.trend >= 0 ? 'up' : 'down'} by ${Math.abs(
                head.trend,
              ).toFixed(1)}% ${head.period}`
            : head && 'text' in head
              ? head.text
              : ''}
        </Text>
        {head && 'trend' in head ? (
          <Icon
            name={head.trend >= 0 ? 'trending-up' : 'trending-down'}
            customSize={16}
            color={head.trend >= 0 ? theme.success : theme.danger}
          />
        ) : null}
      </View>
      <Text style={{ ...small, color: theme.mutedForeground, ...align }}>
        {spec.note}
      </Text>
    </View>
  );
}

function Legend({
  entries,
  center,
}: {
  entries: [string, string][];
  center?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: center ? 'center' : 'flex-end',
        gap: 12,
        flexShrink: 1,
      }}
    >
      {entries.map(([color, label]) => (
        <View
          key={label}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            flexShrink: 0,
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: color,
            }}
          />
          <Text
            style={{
              fontSize: 12,
              lineHeight: 19.4,
              color: theme.mutedForeground,
            }}
          >
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function ChartStory() {
  const [generation, setGeneration] = useState(0);
  const [width, setWidth] = useState(STORY_WIDTH);
  const all = cards();
  const columns = columnsFor(width);
  const rows: ({ rule: true } | { cards: string[] })[] = [];
  for (const section of SECTIONS) {
    if (section.rule) rows.push({ rule: true });
    for (let at = 0; at < section.cards.length; at += columns) {
      rows.push({ cards: section.cards.slice(at, at + columns) });
    }
  }
  return (
    <StoryFrame fill testID="story-chart" paddings={0}>
      <View
        style={{ flex: 1 }}
        onLayout={(e: LayoutChangeEvent) =>
          setWidth(e.nativeEvent.layout.width)
        }
      >
        <View
          style={{
            paddingHorizontal: INSET,
            paddingTop: INSET,
            paddingBottom: CARD_GAP,
          }}
        >
          <StoryToolbar
            items={[
              {
                label: 'Replay',
                icon: 'rotate-cw',
                onPress: () => setGeneration(generation + 1),
              },
            ]}
          />
        </View>
        <ScrollView
          key={generation}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: INSET,
            paddingBottom: INSET,
            gap: CARD_GAP,
          }}
        >
          {rows.map((row, index) =>
            'rule' in row ? (
              <View
                key={index}
                style={{ height: 1, backgroundColor: theme.border }}
              />
            ) : (
              <View key={index} style={{ flexDirection: 'row', gap: CARD_GAP }}>
                {row.cards.map(name => (
                  <Card key={name} spec={all[name]} />
                ))}
              </View>
            ),
          )}
        </ScrollView>
      </View>
    </StoryFrame>
  );
}

const STORY_WIDTH = 960;
