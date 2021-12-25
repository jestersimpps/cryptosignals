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

export interface Signals {
  stoch: StochObject;
}
