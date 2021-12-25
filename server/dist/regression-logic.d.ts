import { Candle, Point } from './models';
export interface LinearReg {
    r2: number;
    intercept: number;
    slope: number;
    correlation: number;
}
export interface Regression {
    bestPeriod: Candle[];
    supportRegression: LinearReg;
    resistanceRegression: LinearReg;
}
export declare const calcCorrelation: (x: number[], y: number[]) => number;
export declare const linearRegression: (x: number[], y: number[]) => LinearReg;
export declare const createMinArray: (brokenArray: Candle[][]) => number[][];
export declare const createMaxArray: (brokenArray: Candle[][]) => number[][];
export declare const createArrayChunks: (historicalPrices: Candle[], chunksize: number) => Candle[][];
export declare const getExtremeSupportReistanceLines: (historicalPrices: Candle[]) => {
    support: {
        line: Point[];
        slope: number;
        lowestPriceCandle: Candle;
        secondLowestPriceCandle: Candle;
    }[];
    resistance: {
        line: Point[];
        slope: number;
        highestPriceCandle: Candle;
        secondHighestPriceCandle: Candle;
    }[];
};
