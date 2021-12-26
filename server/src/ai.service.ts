import { getMaxMin, linearNormalize } from "./normalizer";
import { clearData, getDataRowsFromCsv, storeDataRowsToCsv } from "./file-helper";
import { Candle } from "./models";
import { roundNumber } from "./util";
const brain = require("brain.js");

const TIME_BEFORE_PROFIT_CHECK = 60 * 1000 * 30;

export class AiService {
  net;
  maxmin: { max: number; min: number }[] = [];
  normalizedData;

  constructor() {}

  calculateSellProfit(rowTimestamp: number, candles: Candle[]) {
    const candle = candles.find((c) => c.time > rowTimestamp);
    if (candle) {
      const priceAtTimeStamp = candle.close;
      const pricesAfterTimeStamp = candles.filter((c) => c.time > rowTimestamp).map((c) => c.close);
      const lowestCloseAfterTimeStamp = Math.min(...pricesAfterTimeStamp);
      return priceAtTimeStamp - lowestCloseAfterTimeStamp;
    }
    return null;
  }

  async train() {
    const trainingData = this.normalizedData.map((row) => ({ output: [row.pop()], input: row }));
    this.net = new brain.NeuralNetwork({
      binaryThresh: 0.5,
      hiddenLayers: [7, 5, 3], // array of ints for the sizes of the hidden layers in the network
      activation: "sigmoid", // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
      leakyReluAlpha: 0.01, // supported for activation type 'leaky-relu'
    });
    const trained = await this.net.trainAsync(trainingData, {
      iterations: 20000, // the maximum times to iterate the training data --> number greater than 0
      errorThresh: 0.005, // the acceptable error percentage from training data --> number between 0 and 1
      log: true, // true to use console.log, when a function is supplied it is used --> Either true or a function
      logPeriod: 10, // iterations between logging out --> number greater than 0
      learningRate: 0.3, // scales with delta to effect training rate --> number between 0 and 1
      momentum: 0.1, // scales with next layer's change value --> number between 0 and 1
      timeout: Infinity, // the max number of milliseconds to train for --> number greater than 0
    });
    console.log(trained);
  }

  async normalizeTrained() {
    const data: number[][] = await getDataRowsFromCsv("trained");
    data.forEach((row) => row.shift());
    this.maxmin = getMaxMin(data);
    console.log(this.maxmin);
    this.normalizedData = linearNormalize({ data, maxmin: this.maxmin });
  }

  async addDataRow(inputs: number[], candles: Candle[]) {
    const currentLocalTimeStamp = Date.now();
    const inputData: number[][] = await getDataRowsFromCsv("input");
    const trainedData: number[][] = await getDataRowsFromCsv("trained");
    for (let index = 0; index < inputData.length; index++) {
      const row: number[] = inputData[index];
      const rowTimestamp = row[0];

      if (!trainedData.some((r) => r[0] === rowTimestamp)) {
        if (+rowTimestamp + TIME_BEFORE_PROFIT_CHECK < currentLocalTimeStamp) {
          const profit = this.calculateSellProfit(+rowTimestamp, candles);
          if (profit) {
            const profitRow = [...row, profit];
            await storeDataRowsToCsv("trained", [profitRow]);
          }
        }
      }
    }
    const newRow = [currentLocalTimeStamp, ...inputs];
    await storeDataRowsToCsv("input", [newRow]);

    // run neuralnet over row inputs
    newRow.shift();
    const normalizedInput = linearNormalize({ data: [newRow], maxmin: this.maxmin });
    const nn = this.net.run(normalizedInput[0]);
    console.log(roundNumber(nn[0] * 100, 0.01), "% chance for good sell opportunity");
  }
}
