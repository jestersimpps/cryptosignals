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
