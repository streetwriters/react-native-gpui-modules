let s = 12345;
const rnd = () => {
  s |= 0;
  s = (s + 0x6d2b79f5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const r = (a, b) => +(a + (b - a) * rnd()).toFixed(6);
const out = [];
for (let i = 0; i < 512; i++) {
  const price = r(5, 999),
    cp = r(-0.1, 0.1),
    change = price * cp,
    shares = Math.floor(r(1e6, 3e9)),
    volume = r(1e4, 5e7);
  const o = {
    price,
    change,
    changePercent: cp,
    volume,
    turnover: volume * price,
    marketCap: price * shares,
    ttm: r(5, 80),
    fiveMinsRanking: r(0, 1000),
    th60DaysRanking: r(0, 1000),
    yearChangePercent: r(-1, 1),
    bid: price * (1 - r(0, 0.01)),
    bidVolume: r(100, 5e4),
    ask: price * (1 + r(0, 0.01)),
    askVolume: r(100, 5e4),
    open: price * (1 + r(-0.05, 0.05)),
    prevClose: price - change,
    high: price * (1 + r(0, 0.08)),
    low: price * (1 - r(0, 0.08)),
    turnoverRate: r(0, 0.2),
    riseRate: r(0, 1),
    amplitude: r(0, 0.15),
    peStatus: r(5, 60),
    pbStatus: r(0.5, 12),
    volumeRatio: r(0, 3),
    bidAskRatio: r(0, 3),
    latestPreClose: price * (1 + r(-0.03, 0.03)),
    latestPostClose: price * (1 + r(-0.03, 0.03)),
    preMarketCap: price * shares,
    preMarketPercent: r(-0.05, 0.05),
    preMarketChange: price * r(-0.05, 0.05),
    postMarketCap: price * shares,
    postMarketPercent: r(-0.05, 0.05),
    postMarketChange: price * r(-0.05, 0.05),
    floatCap: price * shares * r(0.3, 1),
    shares,
    sharesFloat: Math.floor(shares * r(0.3, 1)),
    day5Ranking: r(0, 1000),
    day10Ranking: r(0, 1000),
    day30Ranking: r(0, 1000),
    day120Ranking: r(0, 1000),
    day250Ranking: r(0, 1000),
  };
  for (const k in o)
    if (typeof o[k] === 'number' && !Number.isInteger(o[k]))
      o[k] = +o[k].toFixed(6);
  out.push(o);
}
require('fs').writeFileSync(process.argv[2], JSON.stringify(out));
