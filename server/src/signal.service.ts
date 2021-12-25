import { CandlesObject } from "./models";
const Stochastic = require("technicalindicators").Stochastic;

let signalHistory = {
  stoch: {},
};

const calculateStoch = (candlesObject: CandlesObject) => {
  const stochObject;

  
  let inputStoch = {
    high: Object.values(candles1).map((t) => t["high"]),
    low: Object.values(candles1).map((t) => t["low"]),
    close: Object.values(candles1).map((t) => t["close"]),
    period: 20,
    signalPeriod: 6,
  };
  const stoch = Stochastic.calculate(inputStoch);
  const stoch0 = stoch[stoch.length - 1];
  if (!lastStoch) {
    lastStoch = stoch0;
  }
};

export const calculateSignals = (pair: string, candlesObject: CandlesObject) => {};
