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
      const d = getLastElement(stoch, "d");
      stochObject[timeFrame] = {
        k: {
          value: roundNumber(k, 0.01),
          color: numberToGreenRedColor(100 - k, 0, 100),
          angle: calculateAngleOfChange(stoch.map((s) => s.k)),
        },
        d: {
          value: roundNumber(d, 0.01),
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
      stoch: this.calculateStoch(pair, candlesObject),
    };
  }
}
