import { getLastElement, roundNumber } from "./util";
import { Candle, StochObject, CandlesObject, Signals, AdxObject, RsiObject, RocObject } from "./models";
import { numberToGreenRedColor } from "./color";
import { calculateAngleOfChange, getCross } from "./angle";
const Stochastic = require("technicalindicators").Stochastic;
const RSI = require("technicalindicators").RSI;
const ROC = require("technicalindicators").ROC;
const ADX = require("technicalindicators").ADX;

let signalHistory = {
  stoch: {},
};
const TIMEFRAME = 20;
export class SignalService {
  constructor() {}

  private calculateStoch(candlesObject: CandlesObject): StochObject {
    const timeFrameArray = Object.keys(candlesObject);
    let stochObject = {} as StochObject;

    for (const timeFrame of timeFrameArray) {
      const input = {
        high: candlesObject[timeFrame].map((t: Candle) => t.high),
        low: candlesObject[timeFrame].map((t: Candle) => t.low),
        close: candlesObject[timeFrame].map((t: Candle) => t.close),
        period: TIMEFRAME,
        signalPeriod: 6,
      };
      const stoch = Stochastic.calculate(input);
      const k = getLastElement(stoch, "k");
      const kValue = k < 0 ? 0 : k > 100 ? 100 : roundNumber(k, 0.01);
      const d = getLastElement(stoch, "d");
      const dValue = d < 0 ? 0 : d > 100 ? 100 : roundNumber(d, 0.01);

      stochObject[timeFrame] = {
        k: {
          value: kValue,
          color: numberToGreenRedColor(100 - k, 0, 100),
          angle: calculateAngleOfChange(stoch.map((s) => s.k)),
        },
        d: {
          value: dValue,
          color: numberToGreenRedColor(100 - d, 0, 100),
          angle: calculateAngleOfChange(stoch.map((s) => s.d)),
        },
        cross: getCross(stoch),
      };
    }

    return stochObject;
  }

  private calculateAdx(candlesObject: CandlesObject): AdxObject {
    const timeFrameArray = Object.keys(candlesObject);
    let adxObject = {} as AdxObject;

    for (const timeFrame of timeFrameArray) {
      const input = {
        high: candlesObject[timeFrame].map((t: Candle) => t.high),
        low: candlesObject[timeFrame].map((t: Candle) => t.low),
        close: candlesObject[timeFrame].map((t: Candle) => t.close),
        period: TIMEFRAME,
      };
      const adx = ADX.calculate(input);
      const adxValue = getLastElement(adx, "adx");
      const pdi = getLastElement(adx, "pdi");
      const mdi = getLastElement(adx, "mdi");
      adxObject[timeFrame] = {
        adx: adxValue,
        pdi,
        mdi,
      };
    }

    return adxObject;
  }

  private calculateRsi(candlesObject: CandlesObject): RsiObject {
    const timeFrameArray = Object.keys(candlesObject);
    let rsiObject = {} as RsiObject;

    for (const timeFrame of timeFrameArray) {
      const input = {
        values: candlesObject[timeFrame].map((t: Candle) => t.close),
        period: TIMEFRAME,
      };
      const rsi = RSI.calculate(input);
      const rsiValue = getLastElement(rsi);
      rsiObject[timeFrame] = rsiValue;
    }

    return rsiObject;
  }

  private calculateRoc(candlesObject: CandlesObject): RocObject {
    const timeFrameArray = Object.keys(candlesObject);
    let rocObject = {} as RsiObject;

    for (const timeFrame of timeFrameArray) {
      const input = {
        values: candlesObject[timeFrame].map((t: Candle) => t.close),
        period: TIMEFRAME,
      };
      const roc = ROC.calculate(input);
      const rocValue = getLastElement(roc);
      rocObject[timeFrame] = rocValue;
    }

    return rocObject;
  }

  calculateSignals(pair: string, candlesObject: CandlesObject): Signals {
    return {
      price: candlesObject.t1m.length ? candlesObject.t1m[candlesObject.t1m.length - 1].close : null,
      volume: candlesObject.t1m.length ? candlesObject.t1m[candlesObject.t1m.length - 1].volume : null,
      stoch: this.calculateStoch(candlesObject),
      adx: this.calculateAdx(candlesObject),
      rsi: this.calculateRsi(candlesObject),
      roc: this.calculateRoc(candlesObject),
    };
  }
}
