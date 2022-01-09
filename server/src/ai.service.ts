import { getMaxMin, linearNormalize } from "./normalizer";
import { clearData, getDataRowsFromCsv, storeDataRowsToCsv } from "./file-helper";
import { Candle } from "./models";
const brain = require("brain.js");

const CANDLES_BEFORE_PROFIT = 30;
const TIME_BEFORE_PROFIT_CHECK = 60 * 1000 * CANDLES_BEFORE_PROFIT;
const TRAIN_EVERY_X = 2 * 60 * 60 * 1000;
const TRAINED_BUY_DATA_CSV = "trainedBuyData";
const TRAINED_SELL_DATA_CSV = "trainedSellData";
const INPUT_CSV = "input";

export class AiService {
  sellNet;
  buyNet;
  sellMaxMin: { max: number; min: number }[] = [];
  buyMaxMin: { max: number; min: number }[] = [];
  normalizedSellData = [];
  normalizedBuyData = [];
  trainCounter = 0;

  constructor() {
    setInterval(async () => {
      await this.normalizeTrained();
      await this.train();
    }, TRAIN_EVERY_X);
  }

  private calculateProfit(side: "SELL" | "BUY", rowTimestamp: number, candles: Candle[]) {
    const inputCandle = candles.find((c) => c.time > rowTimestamp);
    const startPrice = inputCandle.close;
    const futureCandles = candles.filter((c) => c.time > rowTimestamp);
    let cumulativeProfit = 0;
    if (futureCandles.length) {
      for (let index = 0; index < futureCandles.length; index++) {
        const futureCandle = futureCandles[index];
        if (side === "BUY") {
          cumulativeProfit += futureCandle.close / startPrice;
        }
        if (side === "SELL") {
          cumulativeProfit += startPrice / futureCandle.close;
        }
      }
      return cumulativeProfit;
    }
    return null;
  }

  private async storeNewInputData(inputs: number[]) {
    const currentLocalTimeStamp = Date.now();
    const newRow = [currentLocalTimeStamp, ...inputs];
    if (newRow.filter((e) => e.toString().indexOf("NaN") > -1).filter((e) => e.toString().indexOf("Infinity") > -1).length === 0) {
      await storeDataRowsToCsv("input", [newRow]);
      return newRow;
    }
    return null;
  }

  async train() {
    const sellTrainingData = this.normalizedSellData.map((row) => ({ output: [row.pop()], input: row }));
    const buyTrainingData = this.normalizedBuyData.map((row) => ({ output: [row.pop()], input: row }));

    if (sellTrainingData.length && buyTrainingData.length) {
      const config = {
        binaryThresh: 0.5,
        hiddenLayers: [24, 15, 7], // array of ints for the sizes of the hidden layers in the network
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
      const newBuyNet = new brain.NeuralNetwork(config);
      const newSellNet = new brain.NeuralNetwork(config);

      const sellError = await newSellNet.trainAsync(sellTrainingData, trainingOptions);
      const buyError = await newBuyNet.trainAsync(buyTrainingData, trainingOptions);

      this.sellNet = newSellNet;
      this.buyNet = newBuyNet;

      console.log("trainedSellNet", sellError, "trainedBuyNet", buyError);
    }
  }

  async normalizeTrained() {
    const sellData: number[][] = await getDataRowsFromCsv(TRAINED_SELL_DATA_CSV);
    const buyData: number[][] = await getDataRowsFromCsv(TRAINED_BUY_DATA_CSV);

    if (sellData.length && buyData.length) {
      sellData.forEach((row) => row.shift());
      this.sellMaxMin = getMaxMin(sellData);
      // console.log(this.sellMaxMin);
      this.normalizedSellData = linearNormalize({ data: sellData, maxmin: this.sellMaxMin });
      buyData.forEach((row) => row.shift());
      this.buyMaxMin = getMaxMin(buyData);
      // console.log(this.buyMaxMin);
      this.normalizedBuyData = linearNormalize({ data: buyData, maxmin: this.buyMaxMin });
    }
  }

  async addDataRow(inputs: number[], candles: Candle[]) {
    await this.storeNewInputData(inputs);
    const currentLocalTimeStamp = Date.now();
    const trainedSellData: number[][] = await getDataRowsFromCsv(TRAINED_SELL_DATA_CSV);
    const trainedBuyData: number[][] = await getDataRowsFromCsv(TRAINED_BUY_DATA_CSV);

    const inputData: number[][] = await getDataRowsFromCsv(INPUT_CSV);

    for (let index = 0; index < inputData.length; index++) {
      const row: number[] = inputData[index];
      const rowTimestamp = row[0];

      const hasTrainedBuyRow = trainedBuyData.some((r) => r[0] === rowTimestamp);
      const hasTrainedSellRow = trainedSellData.some((r) => r[0] === rowTimestamp);

      if (!hasTrainedBuyRow && !hasTrainedSellRow) {
        if (+rowTimestamp + TIME_BEFORE_PROFIT_CHECK < currentLocalTimeStamp) {
          const sellProfit = this.calculateProfit("SELL", +rowTimestamp, candles);
          const buyProfit = this.calculateProfit("BUY", +rowTimestamp, candles);
          if (sellProfit && buyProfit) {
            const sellProfitRow = [...row, sellProfit];
            const buyProfitRow = [...row, buyProfit];
            await storeDataRowsToCsv(TRAINED_SELL_DATA_CSV, [sellProfitRow]);
            await storeDataRowsToCsv(TRAINED_BUY_DATA_CSV, [buyProfitRow]);
          }
        }
      }
    }
  }

  async runNet(inputs: number[]): Promise<{ nns: number; nnb: number }> {
    // run neuralnet over row inputs
    if (this.sellNet && this.buyNet) {
      const normalizedSellInput = linearNormalize({ data: [inputs], maxmin: this.sellMaxMin });
      const normalizedBuyInput = linearNormalize({ data: [inputs], maxmin: this.buyMaxMin });
      if ([...normalizedBuyInput, ...normalizedBuyInput].filter((e) => e.toString().indexOf("NaN") > -1).filter((e) => e.toString().indexOf("Infinity") > -1).length === 0) {
        const nns = +this.sellNet.run(normalizedSellInput[0])[0] * 100;
        const nnb = +this.buyNet.run(normalizedBuyInput[0])[0] * 100;
        return { nns, nnb };
      } else {
        console.log(`wait for script to gather data first...run it again in ${CANDLES_BEFORE_PROFIT} minutes...`);
      }
    }
    return { nns: null, nnb: null };
  }
}
