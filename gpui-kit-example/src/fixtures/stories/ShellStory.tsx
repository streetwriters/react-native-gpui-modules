import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button, Tabs } from '@react-native-gpui/gpui-kit';
import { Section, StoryFrame, T, theme } from './StoryKit';

/**
 * `crates/story/src/stories/shell_story.rs` of gpui-component v0.9.1. The
 * script half of the official story is a gpui-shell JavaScript view; here both
 * boards are React Native. The board is the same deterministic feed in f32
 * arithmetic, and it opens after 20 ticks with the feed selected but not
 * running until a feed is chosen, so the opening frame is the same on every
 * run. The counters are renders and ticks per second of this app.
 */
const BOARD: [string, string, number][] = [
  ['AAPL.US', 'Apple', 214.29],
  ['NVDA.US', 'NVIDIA', 118.11],
  ['MSFT.US', 'Microsoft', 421.53],
  ['TSLA.US', 'Tesla', 249.83],
  ['AMZN.US', 'Amazon', 186.34],
  ['GOOGL.US', 'Alphabet', 165.27],
  ['META.US', 'Meta', 502.18],
  ['700.HK', 'Tencent', 372.4],
  ['9988.HK', 'Alibaba', 78.15],
  ['0005.HK', 'HSBC', 62.05],
];

type Quote = {
  symbol: string;
  name: string;
  open: number;
  last: number;
  volume: number;
  watched: boolean;
};
type Market = { quotes: Quote[]; ticks: number; seed: [number, number] };

const f32 = Math.fround;

/** xorshift64 on two 32-bit halves; answers the new state modulo `modulo`. */
function nextModulo(market: Market, modulo: number) {
  let [hi, lo] = market.seed;
  hi = (hi ^ ((hi << 13) | (lo >>> 19))) >>> 0;
  lo = (lo ^ (lo << 13)) >>> 0;
  lo = (lo ^ ((lo >>> 7) | (hi << 25))) >>> 0;
  hi = (hi ^ (hi >>> 7)) >>> 0;
  hi = (hi ^ ((hi << 17) | (lo >>> 15))) >>> 0;
  lo = (lo ^ (lo << 17)) >>> 0;
  market.seed = [hi, lo];
  return (((hi % modulo) * (4294967296 % modulo)) % modulo + (lo % modulo)) % modulo;
}

function tickMarket(market: Market): Market {
  const next: Market = {
    ticks: market.ticks + 1,
    seed: market.seed,
    quotes: market.quotes.map(quote => ({ ...quote })),
  };
  for (const quote of next.quotes) {
    const drift = f32(f32(nextModulo(next, 2001) / 1000) - 1);
    const traded = nextModulo(next, 4000);
    const scaled = f32(1 + f32(drift * f32(0.0012)));
    quote.last = Math.max(f32(quote.last * scaled), f32(0.01));
    quote.volume += traded;
  }
  return next;
}

function openMarket(): Market {
  let market: Market = {
    ticks: 0,
    seed: [0x2545f491, 0x4f6cdd1d],
    quotes: BOARD.map(([symbol, name, open]) => ({
      symbol,
      name,
      open: f32(open),
      last: f32(open),
      volume: 0,
      watched: false,
    })),
  };
  for (let index = 0; index < 20; index++) market = tickMarket(market);
  return market;
}

const change = (quote: Quote) => f32(quote.last - quote.open);
const changePercent = (quote: Quote) =>
  quote.open === 0 ? 0 : f32(f32(change(quote) / quote.open) * 100);
const direction = (quote: Quote) =>
  change(quote) > f32(0.0005) ? 1 : change(quote) < -f32(0.0005) ? -1 : 0;
const thousands = (value: number) =>
  String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const moved = (quote: Quote) =>
  direction(quote) > 0
    ? theme.green
    : direction(quote) < 0
      ? theme.red
      : theme.foreground;

const FEEDS = [
  { caption: 'Off', detail: 'nothing is driving the board', ms: 0 },
  { caption: 'Quotes · 50 ms', detail: 'every price moves every 50 ms', ms: 50 },
  { caption: 'Quotes · 16 ms', detail: 'every price moves every 16 ms', ms: 16 },
  {
    caption: 'Repaint only · 16 ms',
    detail: 'the view is redrawn every 16 ms',
    ms: 16,
  },
];

const FEED_NOTE = [
  'No feed: hovering the script panel draws frames and runs no script.',
  'The script reads the prices, so every tick invalidates its snapshot: script renders track the feed, not the frame rate.',
  'The script reads the prices, so every tick invalidates its snapshot: script renders track the feed, not the frame rate.',
  'Nothing the script reads changed, so every tick repaints the snapshot it already published: frames climb, script renders stay at zero.',
];

const body = (color: string = theme.foreground, size = 11) => ({
  fontSize: size,
  lineHeight: size * 1.4,
  color,
  position: 'relative' as const,
  top: 0.5,
});
const title = {
  fontSize: 13,
  lineHeight: 13 * 1.3,
  fontWeight: '600' as const,
  color: theme.foreground,
  position: 'relative' as const,
  top: 0.5,
};

function Heading({
  total,
  watched,
  ticks,
  caption,
}: {
  total: number;
  watched: number;
  ticks: number;
  caption: string;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 8,
      }}
    >
      <View style={{ gap: 2 }}>
        <Text style={title}>Live quotes</Text>
        <Text style={body(theme.mutedForeground)}>{caption}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 2 }}>
        <Text style={body()}>{`${watched} / ${total} watched`}</Text>
        <Text style={body(theme.mutedForeground)}>{`tick ${ticks}`}</Text>
      </View>
    </View>
  );
}

const COLUMN = { symbol: 78, price: 68, percent: 66, volume: 82 };
const cell = (width: number, right = false) => ({
  width,
  flexShrink: 0,
  flexGrow: 0,
  ...(right ? { alignItems: 'flex-end' as const } : {}),
});

function HeaderRow() {
  const muted = body(theme.mutedForeground);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 8,
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
      }}
    >
      <View style={cell(COLUMN.symbol)}>
        <Text style={muted}>Symbol</Text>
      </View>
      <View style={{ flex: 1 }} />
      <View style={cell(COLUMN.price, true)}>
        <Text style={muted}>Last</Text>
      </View>
      <View style={cell(COLUMN.percent, true)}>
        <Text style={muted}>Change</Text>
      </View>
      <View style={cell(COLUMN.volume, true)}>
        <Text style={muted}>Volume</Text>
      </View>
      <View style={cell(6)} />
    </View>
  );
}

function Row({ quote, onPress }: { quote: Quote; onPress: () => void }) {
  const color = moved(quote);
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={`Watch ${quote.name}`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: theme.radius,
      }}
    >
      <View style={cell(COLUMN.symbol)}>
        <Text style={{ ...body(), fontWeight: '500' }}>{quote.symbol}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={body(theme.mutedForeground)}>
          {quote.name}
        </Text>
      </View>
      <View style={cell(COLUMN.price, true)}>
        <Text style={body(color)}>{quote.last.toFixed(2)}</Text>
      </View>
      <View style={cell(COLUMN.percent, true)}>
        <Text style={body(color)}>
          {`${changePercent(quote) < 0 ? '' : '+'}${changePercent(quote).toFixed(2)}%`}
        </Text>
      </View>
      <View style={cell(COLUMN.volume, true)}>
        <Text style={body(theme.mutedForeground)}>
          {thousands(quote.volume)}
        </Text>
      </View>
      <View
        style={{
          width: 6,
          height: 6,
          flexShrink: 0,
          borderRadius: 3,
          backgroundColor: quote.watched ? theme.primary : undefined,
        }}
      />
    </Pressable>
  );
}

function ScriptAction({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={{
        height: 20,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.radius,
        borderWidth: 1,
        borderColor: theme.border,
        backgroundColor: theme.background,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Text style={{ ...body(), lineHeight: 11 }}>{label}</Text>
    </Pressable>
  );
}

type Summary = {
  leader: string;
  leaderPercent: string;
  laggard: string;
  laggardPercent: string;
  average: string;
};

function summarise(quotes: Quote[]): Summary {
  const pct = (quote: Quote) => changePercent(quote);
  const signed = (value: number) =>
    `${value < 0 ? '' : '+'}${value.toFixed(2)}%`;
  let best = quotes[0];
  let worst = quotes[0];
  for (const quote of quotes) {
    if (pct(quote) >= pct(best)) best = quote;
    if (pct(quote) < pct(worst)) worst = quote;
  }
  const average =
    quotes.reduce((sum, quote) => f32(sum + pct(quote)), 0) / quotes.length;
  return {
    leader: best.symbol,
    leaderPercent: signed(pct(best)),
    laggard: worst.symbol,
    laggardPercent: signed(pct(worst)),
    average: signed(f32(average)),
  };
}

function Board({
  market,
  script,
  paused,
  onWatch,
  onWatchAll,
}: {
  market: Market;
  script: boolean;
  paused?: boolean;
  onWatch: (symbol: string) => void;
  onWatchAll: (on: boolean) => void;
}) {
  const { quotes } = market;
  const watched = quotes.filter(quote => quote.watched).length;
  const [summary, setSummary] = useState<Summary | undefined>();
  const [loading, setLoading] = useState(false);
  const line = loading
    ? 'Reading the session…'
    : summary
      ? `${summary.leader} ${summary.leaderPercent} · ${summary.laggard} ${summary.laggardPercent} · avg ${summary.average}`
      : watched === 0
        ? 'Nothing on the watchlist'
        : '';
  void paused;
  return (
    <View style={{ gap: 12 }}>
      <Heading
        total={quotes.length}
        watched={watched}
        ticks={market.ticks}
        caption={
          script
            ? 'Drawn by main.js · prices imported from "market"'
            : 'Drawn by shell_story.rs · prices read from Entity<Market>'
        }
      />
      <HeaderRow />
      <View style={{ gap: 2 }}>
        {quotes.map(quote => (
          <Row
            key={quote.symbol}
            quote={quote}
            onPress={() => onWatch(quote.symbol)}
          />
        ))}
      </View>
      <View style={{ height: 1, backgroundColor: theme.border }} />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <Text style={body(theme.mutedForeground)}>{script ? line : watched === 0 ? 'Nothing on the watchlist' : ''}</Text>
        <View style={{ flexDirection: 'row', gap: script ? 4 : 4 }}>
          {script ? (
            <ScriptAction
              label="Summary"
              disabled={loading}
              onPress={() => {
                setLoading(true);
                setSummary(undefined);
                setTimeout(() => {
                  setSummary(summarise(quotes));
                  setLoading(false);
                }, 900);
              }}
            />
          ) : null}
          {script ? (
            <ScriptAction
              label="Watch all"
              disabled={watched === quotes.length}
              onPress={() => onWatchAll(true)}
            />
          ) : (
            <Button
              size="xsmall"
              outline
              label="Watch all"
              disabled={watched === quotes.length}
              onPress={() => onWatchAll(true)}
            />
          )}
          {script ? (
            <ScriptAction
              label="Clear"
              disabled={watched === 0}
              onPress={() => onWatchAll(false)}
            />
          ) : (
            <Button
              size="xsmall"
              outline
              label="Clear"
              disabled={watched === 0}
              onPress={() => onWatchAll(false)}
            />
          )}
        </View>
      </View>
    </View>
  );
}

function Reading({
  caption,
  value,
  detail,
}: {
  caption: string;
  value: string;
  detail: string;
}) {
  const small = {
    fontSize: 12,
    lineHeight: 18,
    color: theme.mutedForeground,
    position: 'relative' as const,
    top: 0.5,
  };
  return (
    <View style={{ gap: 4 }}>
      <Text style={small}>{caption}</Text>
      <T style={{ fontWeight: '600', lineHeight: 24, position: 'relative', top: 0.5 }}>{value}</T>
      <Text style={small}>{detail}</Text>
    </View>
  );
}

const REST_LEFT = 20;
const TRAVEL = 180;

function MotionBoard() {
  const [spring, setSpring] = useState(false);
  const [active, setActive] = useState(false);
  const [pose, setPose] = useState({ left: REST_LEFT, width: 132, opacity: 0.72 });
  const poseRef = useRef(pose);
  poseRef.current = pose;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const from = poseRef.current;
    const to = {
      left: active ? REST_LEFT + TRAVEL : REST_LEFT,
      width: active ? 148 : 132,
      opacity: active ? 1 : 0.72,
    };
    const durations = { left: 340, width: 260, opacity: 180 };
    const start = Date.now();
    let frame = 0;
    const ease = (t: number, key: keyof typeof to) => {
      if (spring)
        return 1 - Math.exp(-6 * t) * Math.cos(10 * t) * (key === 'opacity' ? 0 : 1) - (key === 'opacity' ? Math.exp(-6 * t) : 0);
      return key === 'left' ? (1 - Math.cos(Math.PI * t)) / 2 : 1 - (1 - t) * (1 - t);
    };
    const step = () => {
      const elapsed = Date.now() - start;
      const next = { ...to };
      let done = true;
      (Object.keys(to) as (keyof typeof to)[]).forEach(key => {
        const t = Math.min(1, elapsed / (spring ? 600 : durations[key]));
        if (t < 1) done = false;
        next[key] = from[key] + (to[key] - from[key]) * (t < 1 ? ease(t, key) : 1);
      });
      setPose(next);
      if (!done) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [active, spring]);

  const segment = (label: string, on: boolean, onPress: () => void) => (
    <Pressable
      onPress={onPress}
      style={{
        height: 30,
        paddingHorizontal: 12.5,
        justifyContent: 'center',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: on ? theme.border : theme.muted,
        backgroundColor: on ? theme.background : theme.muted,
      }}
    >
      <Text
        style={{
          fontSize: 12, lineHeight: 19.42, position: 'relative', top: 0.5,
          fontWeight: '500',
          color: on ? theme.foreground : theme.mutedForeground,
        }}
      >
        {on ? `${label} ✓` : label}
      </Text>
    </Pressable>
  );
  const mark = { fontSize: 9, lineHeight: 14.56, color: theme.mutedForeground, position: 'absolute' as const, top: 18.5 };
  return (
    <View style={{ gap: 12 }}>
      <View style={{ gap: 4 }}>
        <Text style={{ fontSize: 14, lineHeight: 22.65, position: 'relative', top: 0.5, fontWeight: '600', color: theme.foreground }}>
          Native motion
        </Text>
        <Text style={{ fontSize: 12, lineHeight: 19.42, position: 'relative', top: 0.5, color: theme.mutedForeground }}>
          {spring
            ? 'Spring samples pixel left, width, and opacity targets on native frames.'
            : 'Transition samples pixel left, width, and opacity targets on native frames.'}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            flexDirection: 'row',
            gap: 2,
            padding: 2,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.muted,
          }}
        >
          {segment('Transition', !spring, () => setSpring(false))}
          {segment('Spring', spring, () => setSpring(true))}
        </View>
        <Pressable
          onPress={() => setActive(value => !value)}
          style={{
            height: 36,
            paddingHorizontal: 14,
            justifyContent: 'center',
            borderRadius: 6,
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.background,
          }}
        >
          <Text style={{ fontSize: 12, lineHeight: 19.42, position: 'relative', top: 0.5, fontWeight: '500', color: theme.foreground }}>
            {active ? 'Send back' : 'Run motion'}
          </Text>
        </Pressable>
      </View>
      <View
        style={{
          height: 176,
          overflow: 'hidden',
          borderRadius: 6,
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: theme.muted,
        }}
      >
        <Text style={{ ...mark, left: REST_LEFT }}>OPEN</Text>
        <Text style={{ ...mark, left: REST_LEFT + TRAVEL }}>LIVE TICK</Text>
        <View
          style={{
            position: 'absolute',
            top: 88,
            left: REST_LEFT + 4,
            width: TRAVEL + 148 - 12,
            height: 1,
            backgroundColor: theme.border,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 84,
            left: REST_LEFT,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: theme.muted,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 84,
            left: REST_LEFT + TRAVEL + 148 - 8,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: theme.border,
          }}
        />
        <Text
          style={{
            position: 'absolute',
            top: 144.5,
            left: REST_LEFT,
            right: REST_LEFT,
            fontSize: 10, lineHeight: 16.18,
            color: theme.mutedForeground,
          }}
        >
          Native frames interpolate the card; JavaScript only changes its target.
        </Text>
        <View
          style={{
            position: 'absolute',
            top: 48,
            left: pose.left,
            width: pose.width,
            height: 80,
            gap: 8,
            padding: 12,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: `rgba(229,229,229,${pose.opacity})`,
            backgroundColor: `rgba(255,255,255,${pose.opacity})`,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 12, lineHeight: 19.42, position: 'relative', top: 0.5, fontWeight: '600', color: `rgba(10,10,10,${pose.opacity})` }}>
              AAPL
            </Text>
            <View style={{ flex: 1 }} />
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: `rgba(245,245,245,${pose.opacity})` }} />
            <Text style={{ fontSize: 10, lineHeight: 16.18, position: 'relative', top: 0.5, color: `rgba(245,245,245,${pose.opacity})` }}>Live</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 16, lineHeight: 25.89, position: 'relative', top: 0.5, fontWeight: '600', color: `rgba(10,10,10,${pose.opacity})` }}>
              $228.26
            </Text>
            <Text style={{ fontSize: 11, lineHeight: 17.8, position: 'relative', top: 0.5, fontWeight: '500', color: `rgba(245,245,245,${pose.opacity})` }}>
              +1.84%
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function Boundary({ call, detail }: { call: string; detail: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
      <View style={{ width: 192 }}>
        <Text style={{ fontSize: 12, lineHeight: 18, position: 'relative', top: 0.5, fontWeight: '500', color: theme.foreground }}>
          {call}
        </Text>
      </View>
      <Text style={{ fontSize: 12, lineHeight: 18, position: 'relative', top: 0.5, color: theme.mutedForeground }}>
        {detail}
      </Text>
    </View>
  );
}

export function ShellStory() {
  const [market, setMarket] = useState(openMarket);
  const [rustFrozen, setRustFrozen] = useState<Market | undefined>();
  const [scriptPaused, setScriptPaused] = useState(false);
  const [scriptView, setScriptView] = useState<Market | undefined>();
  const [feed, setFeed] = useState(1);
  const [running, setRunning] = useState(false);
  const [rate, setRate] = useState({ script: 0, frames: 0 });
  const counts = useRef({ script: 0, frames: 0 });

  useEffect(() => {
    const ms = FEEDS[feed].ms;
    if (!running || !ms) return;
    const timer = setInterval(() => {
      counts.current.frames++;
      if (feed === 3) return;
      counts.current.script++;
      setMarket(current => tickMarket(current));
    }, ms);
    return () => clearInterval(timer);
  }, [feed, running]);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setRate({ ...counts.current });
      counts.current = { script: 0, frames: 0 };
    }, 1000);
    return () => clearInterval(timer);
  }, [running]);

  const watch = (symbol: string) =>
    setMarket(current => ({
      ...current,
      quotes: current.quotes.map(quote =>
        quote.symbol === symbol ? { ...quote, watched: !quote.watched } : quote,
      ),
    }));
  const watchAll = (on: boolean) =>
    setMarket(current => ({
      ...current,
      quotes: current.quotes.map(quote => ({ ...quote, watched: on })),
    }));

  const rustShown = rustFrozen ?? market;
  const scriptShown = scriptPaused && scriptView ? scriptView : market;
  const pause = (
    paused: boolean,
    onPress: () => void,
  ) => (
    <Button
      size="xsmall"
      outline
      label={paused ? 'Resume' : 'Pause'}
      onPress={onPress}
    />
  );
  const small = { fontSize: 11, lineHeight: 15.4, color: theme.mutedForeground, position: 'relative' as const, top: 0.5 };
  return (
    <StoryFrame testID="story-shell">
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
          <View style={{ flex: 1 }}>
            <Section
              title="Rust"
              column
              subTitle={pause(rustFrozen !== undefined, () =>
                setRustFrozen(current => (current ? undefined : market)),
              )}
            >
              <View style={{ width: '100%' }}>
                <Board
                  market={rustShown}
                  script={false}
                  onWatch={watch}
                  onWatchAll={watchAll}
                />
              </View>
            </Section>
          </View>
          <View style={{ flex: 1 }}>
            <Section
              title="JavaScript · gpui-shell"
              column
              subTitle={
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  {pause(scriptPaused, () => {
                    setScriptView(market);
                    setScriptPaused(value => !value);
                  })}
                  <Button
                    size="xsmall"
                    outline
                    label="Reload script"
                    onPress={() => setScriptView(undefined)}
                  />
                </View>
              }
            >
              <View style={{ width: '100%' }}>
                <Board
                  market={scriptShown}
                  script
                  onWatch={watch}
                  onWatchAll={watchAll}
                />
              </View>
            </Section>
          </View>
        </View>
        <Section
          title="Render frequency"
          description="A script render and a GPUI frame are not the same event. Change the feed and watch the two counters come apart."
          column
          subTitle={
            <View style={{ flex: 1, minWidth: 0, maxWidth: 512 }}>
              <Tabs
                variant="segmented"
                style={{ width: '100%' }}
                selectedIndex={feed}
                onSelect={event => {
                  setFeed(event.nativeEvent.index);
                  setRunning(true);
                }}
                tabs={FEEDS.map(({ caption }) => ({
                  label: caption,
                  kitStyle: { flex: 1 },
                }))}
              />
            </View>
          }
        >
          <View style={{ width: '100%', gap: 8 }}>
            <View style={{ flexDirection: 'row', gap: 24 }}>
              <Reading
                caption="Script renders"
                value={`${rate.script}/s`}
                detail="0.00 ms describing · 0.00 ms in host calls"
              />
              <Reading
                caption="Frames drawn"
                value={`${rate.frames}/s`}
                detail="0.00 ms each"
              />
              <Reading
                caption="Feed"
                value={FEEDS[feed].caption}
                detail={FEEDS[feed].detail}
              />
            </View>
            {rustFrozen || scriptPaused ? (
              <Text style={small}>
                {rustFrozen && scriptPaused
                  ? 'Both halves are paused. The feed still runs, so the counters show what the window costs when neither board is following it.'
                  : rustFrozen
                    ? 'The Rust half is paused: it is drawing a copy of what it last read, because its render has no snapshot of its own to hold.'
                    : 'The script half is paused: nobody is telling it its description went stale, so it keeps drawing the one it already published — and the script render count is zero while the board next to it moves.'}
              </Text>
            ) : null}
            <Text style={small}>Slowest single script render this run: 0.00 ms</Text>
            <Text style={small}>
              No rebuild has had a previous description to compare with yet.
            </Text>
            <Text style={{ fontSize: 12, lineHeight: 21, color: theme.mutedForeground, position: 'relative', top: 0.5 }}>
              {FEED_NOTE[feed]}
            </Text>
          </View>
        </Section>
        <View style={{ marginTop: -1 }}>
        <Section
          title="Native motion · gpui-shell"
          description="A separate ScriptView with pixel targets. Clicking a control retargets transition or spring tracks; GPUI owns every in-between frame."
          column
          subTitle={<Button size="xsmall" outline label="Reload motion" />}
        >
          <View style={{ width: '100%' }}>
            <MotionBoard />
          </View>
        </Section>
        </View>
        <Section
          title="Where the boundary is"
          description='The script holds no host object. Market data crosses the one native module this story registered; appearance comes from gpui-shell&apos;s call-scoped context.'
          column
        >
          <View style={{ width: '100%', gap: 4 }}>
            <Boundary
              call='native("market")'
              detail="quotes() · ticks() · watch(symbol) · watch_all(on)"
            />
            <Boundary
              call="cx.theme()"
              detail="read-only semantic colors, spacing, radius and mode"
            />
            <Boundary
              call="Editing main.js"
              detail="needs no rebuild: press Reload script above"
            />
          </View>
        </Section>
      </View>
    </StoryFrame>
  );
}
