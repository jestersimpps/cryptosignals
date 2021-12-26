import { getMaxMin, linearNormalize } from "./normalizer";
import { clearData, getDataRowsFromCsv, storeDataRowsToCsv } from "./file-helper";
import { Candle } from "./models";
import { roundNumber } from "./util";
const brain = require("brain.js");

const CANDLES_BEFORE_PROFIT = 30;
const TIME_BEFORE_PROFIT_CHECK = 60 * 1000 * CANDLES_BEFORE_PROFIT;

export class AiService {
  sellNet;
  buyNet;
  sellMaxMin: { max: number; min: number }[] = [];
  buyMaxMin: { max: number; min: number }[] = [];
  normalizedSellData = [];
  normalizedBuyData = [];

  constructor() {}

  private calculateSellProfit(rowTimestamp: number, candles: Candle[]) {
    const candle = candles.find((c) => c.time > rowTimestamp);
    if (candle) {
      const priceAtTimeStamp = candle.close;
      const pricesAfterTimeStamp = candles
        .filter((c, i) => c.time > rowTimestamp)
        .filter((c, i) => i < CANDLES_BEFORE_PROFIT)
        .map((c) => c.close);
      const lowestCloseAfterTimeStamp = Math.min(...pricesAfterTimeStamp);
      return priceAtTimeStamp - lowestCloseAfterTimeStamp;
    }
    return null;
  }
  private calculateBuyProfit(rowTimestamp: number, candles: Candle[]) {
    const candle = candles.find((c) => c.time > rowTimestamp);
    if (candle) {
      const priceAtTimeStamp = candle.close;
      const pricesAfterTimeStamp = candles
        .filter((c, i) => c.time > rowTimestamp)
        .filter((c, i) => i < CANDLES_BEFORE_PROFIT)
        .map((c) => c.close);
      const highestCloseAfterTimeStamp = Math.max(...pricesAfterTimeStamp);
      return highestCloseAfterTimeStamp - priceAtTimeStamp;
    }
    return null;
  }

  private async generateTrainedData(candles: Candle[]) {
    const currentLocalTimeStamp = Date.now();
    const trainedSellData: number[][] = await getDataRowsFromCsv("trainedSellData");
    const trainedBuyData: number[][] = await getDataRowsFromCsv("trainedBuyData");

    const inputData: number[][] = await getDataRowsFromCsv("input");
    for (let index = 0; index < inputData.length; index++) {
      const row: number[] = inputData[index];
      const rowTimestamp = row[0];

      if (!trainedSellData.some((r) => r[0] === rowTimestamp)) {
        if (+rowTimestamp + TIME_BEFORE_PROFIT_CHECK < currentLocalTimeStamp) {
          const profit = this.calculateSellProfit(+rowTimestamp, candles);
          if (profit) {
            const profitRow = [...row, profit];
            await storeDataRowsToCsv("trainedSellData", [profitRow]);
          }
        }
      }
      if (!trainedBuyData.some((r) => r[0] === rowTimestamp)) {
        if (+rowTimestamp + TIME_BEFORE_PROFIT_CHECK < currentLocalTimeStamp) {
          const profit = this.calculateBuyProfit(+rowTimestamp, candles);
          if (profit) {
            const profitRow = [...row, profit];
            await storeDataRowsToCsv("trainedBuyData", [profitRow]);
          }
        }
      }
    }
  }

  private async storeNewInputData(inputs: number[]) {
    const currentLocalTimeStamp = Date.now();
    const newRow = [currentLocalTimeStamp, ...inputs];
    await storeDataRowsToCsv("input", [newRow]);
    return newRow;
  }

  async train() {
    const sellTrainingData = this.normalizedSellData.map((row) => ({ output: [row.pop()], input: row }));
    const buyTrainingData = this.normalizedBuyData.map((row) => ({ output: [row.pop()], input: row }));

    if (sellTrainingData.length && buyTrainingData.length) {
      const config = {
        binaryThresh: 0.5,
        hiddenLayers: [7, 5, 3], // array of ints for the sizes of the hidden layers in the network
        activation: "sigmoid", // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
        leakyReluAlpha: 0.01, // supported for activation type 'leaky-relu'
      };
      const trainingOptions = {
        iterations: 20000, // the maximum times to iterate the training data --> number greater than 0
        errorThresh: 0.005, // the acceptable error percentage from training data --> number between 0 and 1
        log: true, // true to use console.log, when a function is supplied it is used --> Either true or a function
        logPeriod: 10, // iterations between logging out --> number greater than 0
        learningRate: 0.3, // scales with delta to effect training rate --> number between 0 and 1
        momentum: 0.1, // scales with next layer's change value --> number between 0 and 1
        timeout: Infinity, // the max number of milliseconds to train for --> number greater than 0
      };
      this.sellNet = new brain.NeuralNetwork(config);
      this.buyNet = new brain.NeuralNetwork(config);
      const trainedSellNet = await this.sellNet.trainAsync(sellTrainingData, trainingOptions);
      const trainedBuyNet = await this.buyNet.trainAsync(buyTrainingData, trainingOptions);
      console.log("trainedSellNet", trainedSellNet, "trainedBuyNet", trainedBuyNet);
    }
  }

  async normalizeTrained() {
    const sellData: number[][] = await getDataRowsFromCsv("trainedSellData");
    const buyData: number[][] = await getDataRowsFromCsv("trainedBuyData");

    if (sellData.length && buyData.length) {
      sellData.forEach((row) => row.shift());
      this.sellMaxMin = getMaxMin(sellData);
      console.log(this.sellMaxMin);
      this.normalizedSellData = linearNormalize({ data: sellData, maxmin: this.sellMaxMin });
      buyData.forEach((row) => row.shift());
      this.buyMaxMin = getMaxMin(buyData);
      console.log(this.buyMaxMin);
      this.normalizedBuyData = linearNormalize({ data: buyData, maxmin: this.buyMaxMin });
    }
  }

  async addDataRow(inputs: number[], candles: Candle[]) {
    await this.generateTrainedData(candles);
    const newRow = await this.storeNewInputData(inputs);

    // run neuralnet over row inputs
    if (this.sellNet && this.buyNet) {
      newRow.shift();
      const normalizedSellInput = linearNormalize({ data: [newRow], maxmin: this.sellMaxMin });
      const normalizedBuyInput = linearNormalize({ data: [newRow], maxmin: this.buyMaxMin });
      const nns = this.sellNet.run(normalizedSellInput[0]);
      const nnb = this.buyNet.run(normalizedBuyInput[0]);
      console.log(roundNumber(nnb[0] * 100, 0.01), "% buy", roundNumber(nns[0] * 100, 0.01), "% sell");
    } else {
      console.log(`wait for script to gather data first...run it again in ${CANDLES_BEFORE_PROFIT} minutes...`);
    }
  }
}
