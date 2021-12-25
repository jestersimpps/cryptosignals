"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("./api");
api_1.chartListener("MATICUSDT", (chartObject) => {
    console.log(Object.keys(chartObject).map((k) => `${k} ${chartObject[k].length}`));
});
//# sourceMappingURL=main.js.map