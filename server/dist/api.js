"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Binance = require("node-binance-api");
const binance = new Binance().options({
    APIKEY: "<key>",
    APISECRET: "<secret>",
});
const mapChartObject = (chart) => Object.keys(chart).map((k, i) => ({
    time: +k,
    open: +chart[k]["open"],
    high: +chart[k]["high"],
    low: +chart[k]["low"],
    close: +chart[k]["close"],
    volume: +chart[k]["volume"],
}));
exports.chartListener = (pair, returnCandlesObject) => {
    const UPDATE_TIME = 1000;
    let candlesObject = {
        t1m: [],
        t5m: [],
        t15m: [],
        t30m: [],
        t1h: [],
        t2h: [],
        t4h: [],
        t1d: [],
    };
    binance.websockets.chart(pair, "1m", (s, i, chart) => __awaiter(this, void 0, void 0, function* () {
        candlesObject.t1m = mapChartObject(chart);
    }));
    binance.websockets.chart(pair, "5m", (s, i, chart) => __awaiter(this, void 0, void 0, function* () {
        candlesObject.t5m = mapChartObject(chart);
    }));
    binance.websockets.chart(pair, "15m", (s, i, chart) => __awaiter(this, void 0, void 0, function* () {
        candlesObject.t15m = mapChartObject(chart);
    }));
    binance.websockets.chart(pair, "30m", (s, i, chart) => __awaiter(this, void 0, void 0, function* () {
        candlesObject.t30m = mapChartObject(chart);
    }));
    binance.websockets.chart(pair, "1h", (s, i, chart) => __awaiter(this, void 0, void 0, function* () {
        candlesObject.t1h = mapChartObject(chart);
    }));
    binance.websockets.chart(pair, "2h", (s, i, chart) => __awaiter(this, void 0, void 0, function* () {
        candlesObject.t2h = mapChartObject(chart);
    }));
    binance.websockets.chart(pair, "4h", (s, i, chart) => __awaiter(this, void 0, void 0, function* () {
        candlesObject.t4h = mapChartObject(chart);
    }));
    binance.websockets.chart(pair, "1d", (s, i, chart) => __awaiter(this, void 0, void 0, function* () {
        candlesObject.t1d = mapChartObject(chart);
    }));
    setInterval(() => returnCandlesObject(candlesObject), UPDATE_TIME);
};
//# sourceMappingURL=api.js.map