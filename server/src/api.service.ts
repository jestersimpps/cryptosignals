import { Candle, CandlesObject } from "./models";

const Binance = require("node-binance-api");
const binance = new Binance().options({
  APIKEY: "<key>",
  APISECRET: "<secret>",
});

export class ApiService {
  private mapChartObject = (chart) =>
    Object.keys(chart).map((k, i) => ({
      time: +k,
      open: +chart[k]["open"],
      high: +chart[k]["high"],
      low: +chart[k]["low"],
      close: +chart[k]["close"],
      volume: +chart[k]["volume"],
    }));

  chartListener = (pair: string, returnCandlesObject: (candlesObject: CandlesObject) => void) => {
    const UPDATE_TIME = 1000;
    let candlesObject: CandlesObject = {
      t1m: [],
      t5m: [],
      t15m: [],
      t30m: [],
      t1h: [],
      t2h: [],
      t4h: [],
      t1d: [],
    };

    binance.websockets.chart(pair, "1m", async (s, i, chart) => {
      candlesObject.t1m = this.mapChartObject(chart);
    });
    binance.websockets.chart(pair, "5m", async (s, i, chart) => {
      candlesObject.t5m = this.mapChartObject(chart);
    });
    binance.websockets.chart(pair, "15m", async (s, i, chart) => {
      candlesObject.t15m = this.mapChartObject(chart);
    });
    binance.websockets.chart(pair, "30m", async (s, i, chart) => {
      candlesObject.t30m = this.mapChartObject(chart);
    });
    binance.websockets.chart(pair, "1h", async (s, i, chart) => {
      candlesObject.t1h = this.mapChartObject(chart);
    });
    binance.websockets.chart(pair, "2h", async (s, i, chart) => {
      candlesObject.t2h = this.mapChartObject(chart);
    });
    binance.websockets.chart(pair, "4h", async (s, i, chart) => {
      candlesObject.t4h = this.mapChartObject(chart);
    });
    binance.websockets.chart(pair, "1d", async (s, i, chart) => {
      candlesObject.t1d = this.mapChartObject(chart);
    });

    setInterval(() => returnCandlesObject(candlesObject), UPDATE_TIME);
  };
}
