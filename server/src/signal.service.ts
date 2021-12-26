import { getLastElement, roundNumber } from "./util";
import { Candle, StochObject, CandlesObject, Signals } from "./models";
import { numberToGreenRedColor } from "./color";
import { calculateAngleOfChange, getCross } from "./angle";
const Stochastic = require("technicalindicators").Stochastic;

let signalHistory = {
  stoch: {},
};

export class SignalService {
  constructor() {}

  private calculateStoch(pair: string, candlesObject: CandlesObject): StochObject {
    const timeFrameArray = Object.keys(candlesObject);
    let stochObject = {} as StochObject;

    for (const timeFrame of timeFrameArray) {
      const inputStoch = {
        high: candlesObject[timeFrame].map((t: Candle) => t.high),
        low: candlesObject[timeFrame].map((t: Candle) => t.low),
        close: candlesObject[timeFrame].map((t: Candle) => t.close),
        period: 20,
        signalPeriod: 6,
      };
      const stoch = Stochastic.calculate(inputStoch);
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

  calculateSignals(pair: string, candlesObject: CandlesObject): Signals {
    return {
      price: candlesObject.t1m.length ? candlesObject.t1m[candlesObject.t1m.length - 1].close : null,
      stoch: this.calculateStoch(pair, candlesObject),
    };
  }
}
