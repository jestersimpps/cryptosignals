import { getLastElement } from "./util";
import { Candle, StochObject, CandlesObject, Signals } from "./models";
import { numberToGreenRedColor } from "./color";
const Stochastic = require("technicalindicators").Stochastic;

let signalHistory = {
  stoch: {},
};

export class SignalService {
  constructor() {}

  private calculateStoch(candlesObject: CandlesObject): StochObject {
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
      const d = getLastElement(stoch, "d");
      stochObject[timeFrame] = {
        k: {
          value: k,
          color: numberToGreenRedColor(k, 0, 100),
          angle: getLastElement(stoch, "k"),
        },
        d: {
          value: d,
          color: numberToGreenRedColor(d, 0, 100),
          angle: getLastElement(stoch, "d"),
        },
      };
    }

    return stochObject;
  }

  calculateSignals(pair: string, candlesObject: CandlesObject): Signals {
    return {
      stoch: this.calculateStoch(candlesObject),
    };
  }
}
