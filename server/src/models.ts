export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
export interface Point {
  x: number;
  y: number;
}

export interface CandlesObject {
  t1m: Candle[];
  t5m: Candle[];
  t15m: Candle[];
  t30m: Candle[];
  t1h: Candle[];
  t2h: Candle[];
  t4h: Candle[];
  t1d: Candle[];
}

export interface SingleStochObject {
  k: {
    value: number;
    color: string;
    angle: number;
  };
  d: {
    value: number;
    color: string;
    angle: number;
  };
  cross: "UP" | "DOWN";
}
export interface StochObject {
  t1m: SingleStochObject;
  t5m: SingleStochObject;
  t15m: SingleStochObject;
  t30m: SingleStochObject;
  t1h: SingleStochObject;
  t2h: SingleStochObject;
  t4h: SingleStochObject;
  t1d: SingleStochObject;
}

export interface SingleAdxObject {
  adx: number;
  pdi: number;
  mdi: number;
}
export interface AdxObject {
  t1m: SingleAdxObject;
  t5m: SingleAdxObject;
  t15m: SingleAdxObject;
  t30m: SingleAdxObject;
  t1h: SingleAdxObject;
  t2h: SingleAdxObject;
  t4h: SingleAdxObject;
  t1d: SingleAdxObject;
}

export interface RocObject {
  t1m: number;
  t5m: number;
  t15m: number;
  t30m: number;
  t1h: number;
  t2h: number;
  t4h: number;
  t1d: number;
}
export interface RsiObject {
  t1m: number;
  t5m: number;
  t15m: number;
  t30m: number;
  t1h: number;
  t2h: number;
  t4h: number;
  t1d: number;
}
export interface Signals {
  price: number;
  volume: number;
  stoch: StochObject;
  adx: AdxObject;
  rsi: RsiObject;
  roc: RocObject;
}

export interface DepthObject {
  buyWalls: { price: number; volume: number }[];
  sellWalls: { price: number; volume: number }[];
}
