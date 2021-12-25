import { SignalService } from "./signal.service";
import { ApiService } from "./api.service";
import { CandlesObject, DepthObject } from "./models";
import { stochOutput, wallsOutput } from "./output";
const prompts = require("prompts");

const pair = "MATICUSDT";
const signalService = new SignalService();
const apiService = new ApiService();
let signals;

const init = async () => {
  const response = await prompts([
    {
      type: "select",
      name: "value",
      message: "Select a script",
      choices: [
        { title: "MTF Stochs", value: 1 },
        { title: "Walls", value: 2 },
      ],
      initial: 1,
    },
  ]);
  switch (response.value) {
    case 1:
      apiService.chartListener(pair, (candlesObject: CandlesObject) => {
        signals = signalService.calculateSignals(pair, candlesObject);
        stochOutput(signals);
      });
      break;
    case 2:
      apiService.chartListener(pair, (candlesObject: CandlesObject) => {
        signals = signalService.calculateSignals(pair, candlesObject);
      });
      apiService.depthListener(pair, (depthObject: DepthObject) => {
        wallsOutput(depthObject, signals);
      });
    default:
      break;
  }
};

init();
