"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcCorrelation = (x, y) => {
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;
    let sumY2 = 0;
    const minLength = (x.length = y.length = Math.min(x.length, y.length));
    const reduce = (xi, idx) => {
        const yi = y[idx];
        sumX += xi;
        sumY += yi;
        sumXY += xi * yi;
        sumX2 += xi * xi;
        sumY2 += yi * yi;
    };
    x.forEach(reduce);
    const corr = (minLength * sumXY - sumX * sumY) / Math.sqrt((minLength * sumX2 - sumX * sumX) * (minLength * sumY2 - sumY * sumY));
    return corr > 1 ? 0 : corr;
};
exports.linearRegression = (x, y) => {
    const lr = {};
    const n = y.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    let sumYY = 0;
    for (let i = 0; i < y.length; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXY += x[i] * y[i];
        sumXX += x[i] * x[i];
        sumYY += y[i] * y[i];
    }
    lr.slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    lr.intercept = (sumY - lr.slope * sumX) / n;
    lr.r2 = Math.pow((n * sumXY - sumX * sumY) / Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY)), 2);
    return lr;
};
exports.createMinArray = (brokenArray) => {
    const arrayOfMin = [];
    brokenArray.forEach((chunk) => {
        const lows = chunk.map((t) => [+t.time, +t.low]);
        let min = [null, 10000000000];
        lows.forEach((low) => {
            if (low[1] < min[1]) {
                min = low;
            }
        });
        arrayOfMin.push(min);
    });
    return arrayOfMin;
};
exports.createMaxArray = (brokenArray) => {
    const arrayOfMin = [];
    brokenArray.forEach((chunk) => {
        const highs = chunk.map((t) => [+t.time, +t.high]);
        let max = [null, 0];
        highs.forEach((low) => {
            if (low[1] > max[1]) {
                max = low;
            }
        });
        arrayOfMin.push(max);
    });
    return arrayOfMin;
};
exports.createArrayChunks = (historicalPrices, chunksize) => {
    let iterator = 0;
    const brokenArray = [[]];
    historicalPrices.forEach((tick) => {
        if (iterator < chunksize) {
            brokenArray[brokenArray.length - 1].push(tick);
            iterator++;
        }
        else {
            brokenArray.push([]);
            iterator = 0;
        }
    });
    return brokenArray;
};
const getExtremeLines = (historicalPrices, endTime) => {
    let candles = [...historicalPrices];
    candles.splice(candles.length - 3, 3);
    const highestPrice = Math.max(...candles.map(x => x.high));
    const lowestPrice = Math.min(...candles.map(x => x.low));
    const highestPriceMapper = x => x.high === highestPrice;
    const lowestPriceMapper = x => x.low === lowestPrice;
    const highestPriceCandle = candles.find(highestPriceMapper);
    const highestPriceCandleIndex = candles.findIndex(highestPriceMapper);
    const lowestPriceCandle = candles.find(lowestPriceMapper);
    const lowestPriceCandleIndex = candles.findIndex(lowestPriceMapper);
    const beginTime = historicalPrices[0].time;
    const isResistanceFrontToBack = highestPriceCandleIndex < candles.length - 1 - highestPriceCandleIndex;
    const isSupportFrontToBack = lowestPriceCandleIndex < candles.length - 1 - lowestPriceCandleIndex;
    let backToFrontResistanceSlope = -10e99;
    let backToFrontSecondHighestPriceCandle = null;
    for (let index = candles.length - 1; index > highestPriceCandleIndex; index--) {
        const currentCandle = candles[index];
        const currentResistanceSlope = (currentCandle.high - highestPriceCandle.high) / (currentCandle.time - highestPriceCandle.time);
        if (currentResistanceSlope > backToFrontResistanceSlope) {
            backToFrontResistanceSlope = currentResistanceSlope;
            backToFrontSecondHighestPriceCandle = currentCandle;
        }
    }
    let backToFrontSupportSlope = 10e99;
    let backToFrontSecondLowestPriceCandle = null;
    for (let index = candles.length - 1; index > lowestPriceCandleIndex; index--) {
        const currentCandle = candles[index];
        const currentSupportSlope = (currentCandle.low - lowestPriceCandle.low) / (currentCandle.time - lowestPriceCandle.time);
        if (currentSupportSlope < backToFrontSupportSlope) {
            backToFrontSupportSlope = currentSupportSlope;
            backToFrontSecondLowestPriceCandle = currentCandle;
        }
    }
    let frontToBackResistanceSlope = -10e99;
    let frontToBackSecondHighestPriceCandle = null;
    for (let index = 0; index < highestPriceCandleIndex; index++) {
        const currentCandle = candles[index];
        const currentResistanceSlope = (currentCandle.high - highestPriceCandle.high) / (currentCandle.time - highestPriceCandle.time);
        if (currentResistanceSlope > frontToBackResistanceSlope) {
            frontToBackResistanceSlope = currentResistanceSlope;
            frontToBackSecondHighestPriceCandle = currentCandle;
        }
    }
    let frontToBackSupportSlope = 10e99;
    let frontToBackSecondLowestPriceCandle = null;
    for (let index = 0; index < lowestPriceCandleIndex; index++) {
        const currentCandle = candles[index];
        const currentSupportSlope = (currentCandle.low - lowestPriceCandle.low) / (currentCandle.time - lowestPriceCandle.time);
        if (currentSupportSlope < frontToBackSupportSlope) {
            frontToBackSupportSlope = currentSupportSlope;
            frontToBackSecondLowestPriceCandle = currentCandle;
        }
    }
    let supportLine = null;
    let resistanceLine = null;
    let resistanceSlope = null;
    let supportSlope = null;
    let secondLowestPriceCandle = null;
    let secondHighestPriceCandle = null;
    const backToFrontResistanceIntercept = highestPriceCandle.high - backToFrontResistanceSlope * (highestPriceCandle.time - beginTime);
    const backToFrontSupportIntercept = lowestPriceCandle.low - backToFrontSupportSlope * (lowestPriceCandle.time - beginTime);
    const frontToBackResistanceIntercept = highestPriceCandle.high - backToFrontResistanceSlope * (highestPriceCandle.time - beginTime);
    const frontToBackSupportIntercept = lowestPriceCandle.low - backToFrontSupportSlope * (lowestPriceCandle.time - beginTime);
    if (isResistanceFrontToBack) {
        resistanceLine = [
            { x: beginTime, y: frontToBackResistanceIntercept },
            {
                x: endTime,
                y: frontToBackResistanceSlope * (endTime - beginTime) + frontToBackResistanceIntercept
            }
        ];
        resistanceSlope = frontToBackResistanceSlope;
        secondHighestPriceCandle = frontToBackSecondHighestPriceCandle;
    }
    else {
        resistanceLine = [
            {
                x: highestPriceCandle.time,
                y: backToFrontResistanceSlope * (highestPriceCandle.time - beginTime) + backToFrontResistanceIntercept
            },
            {
                x: endTime,
                y: backToFrontResistanceSlope * (endTime - beginTime) + backToFrontResistanceIntercept
            }
        ];
        resistanceSlope = backToFrontResistanceSlope;
        secondHighestPriceCandle = backToFrontSecondHighestPriceCandle;
    }
    if (isSupportFrontToBack) {
        supportLine = [
            { x: beginTime, y: frontToBackSupportIntercept },
            { x: endTime, y: frontToBackSupportSlope * (endTime - beginTime) + frontToBackSupportIntercept }
        ];
        supportSlope = frontToBackSupportSlope;
        secondLowestPriceCandle = frontToBackSecondLowestPriceCandle;
    }
    else {
        supportLine = [
            {
                x: lowestPriceCandle.time,
                y: backToFrontSupportSlope * (lowestPriceCandle.time - beginTime) + backToFrontSupportIntercept
            },
            { x: endTime, y: backToFrontSupportSlope * (endTime - beginTime) + backToFrontSupportIntercept }
        ];
        supportSlope = backToFrontSupportSlope;
        secondLowestPriceCandle = backToFrontSecondLowestPriceCandle;
    }
    return {
        supportLine,
        resistanceLine,
        supportSlope,
        resistanceSlope,
        highestPriceCandle,
        secondHighestPriceCandle,
        lowestPriceCandle,
        secondLowestPriceCandle
    };
};
exports.getExtremeSupportReistanceLines = (historicalPrices) => {
    const endTime = historicalPrices[historicalPrices.length - 1].time;
    let output = {
        support: [],
        resistance: []
    };
    let candles = [...historicalPrices];
    const fullWidtLines = getExtremeLines(candles, endTime);
    output.support.push({
        line: fullWidtLines.supportLine,
        slope: fullWidtLines.supportSlope,
        lowestPriceCandle: fullWidtLines.lowestPriceCandle,
        secondLowestPriceCandle: fullWidtLines.secondLowestPriceCandle
    });
    output.resistance.push({
        line: fullWidtLines.resistanceLine,
        slope: fullWidtLines.resistanceSlope,
        highestPriceCandle: fullWidtLines.highestPriceCandle,
        secondHighestPriceCandle: fullWidtLines.secondHighestPriceCandle
    });
    return output;
};
//# sourceMappingURL=regression-logic.js.map