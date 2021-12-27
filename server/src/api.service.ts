import { Candle, CandlesObject, DepthObject } from "./models";

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

    setInterval(() => {
      const timeFrameArray = Object.keys(candlesObject);
      if (timeFrameArray.every((tf) => candlesObject[tf].length)) returnCandlesObject(candlesObject);
    }, UPDATE_TIME);
  };

  depthListener = (pair: string, returnDepthObject: (depthObject: DepthObject) => void, numberOfWalls = 7) => {
    const UPDATE_TIME = 1000;
    let depthObject: DepthObject = {
      buyWalls: [],
      sellWalls: [],
    };

    binance.websockets.depthCache([pair], (symbol, depth) => {
      const bids = binance.sortBids(depth.bids);
      const asks = binance.sortAsks(depth.asks);
      let topBids = [];
      let topAsks = [];
      Object.keys(bids).forEach((price) => {
        const volume = bids[price];
        if (volume > Math.max(...topBids.map((b) => b.volume))) {
          topBids = [...topBids, { price: +price, volume }];
          if (topBids.length > numberOfWalls) {
            topBids.shift();
          }
        }
      });
      Object.keys(asks).forEach((price) => {
        const volume = asks[price];
        if (volume > Math.max(...topAsks.map((b) => b.volume))) {
          topAsks = [...topAsks, { price: +price, volume }];
          if (topAsks.length > numberOfWalls) {
            topAsks.shift();
          }
        }
      });
      depthObject = {
        buyWalls: topBids,
        sellWalls: topAsks,
      };
    });

    setInterval(() => returnDepthObject(depthObject), UPDATE_TIME);
  };
}
