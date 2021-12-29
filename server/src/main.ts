import { SignalService } from "./signal.service";
import { ApiService } from "./api.service";
import { CandlesObject, DepthObject, Signals } from "./models";
import { stochOutput, wallsOutput } from "./output";
import { AiService } from "./ai.service";

const prompts = require("prompts");
const pair = "MATICUSDT";

const generateInputs = (signals: Signals) => [
  signals.stoch.t1m.k.value,
  signals.stoch.t1m.k.angle,
  signals.stoch.t1m.d.value,
  signals.stoch.t1m.d.angle,
  signals.stoch.t1m.cross ? (signals.stoch.t1m.cross === "UP" ? 1 : -1) : 0,
  signals.rsi.t1m,

  signals.stoch.t5m.k.value,
  signals.stoch.t5m.k.angle,
  signals.stoch.t5m.d.value,
  signals.stoch.t5m.d.angle,
  signals.stoch.t5m.cross ? (signals.stoch.t1m.cross === "UP" ? 1 : -1) : 0,
  signals.rsi.t5m,

  signals.stoch.t15m.k.value,
  signals.stoch.t15m.k.angle,
  signals.stoch.t15m.d.value,
  signals.stoch.t15m.d.angle,
  signals.stoch.t15m.cross ? (signals.stoch.t1m.cross === "UP" ? 1 : -1) : 0,
  signals.rsi.t15m,

  signals.stoch.t1h.k.value,
  signals.stoch.t1h.k.angle,
  signals.stoch.t1h.d.value,
  signals.stoch.t1h.d.angle,
  signals.stoch.t1h.cross ? (signals.stoch.t1m.cross === "UP" ? 1 : -1) : 0,
  signals.rsi.t1h,
];

const init = async () => {
  const response = await prompts([
    {
      type: "select",
      name: "value",
      message: "Select a script",
      choices: [
        { title: "MTF Stochs", value: 1 },
        { title: "Walls", value: 2 },
        { title: "Run Neural Net", value: 3 },
      ],
      initial: 1,
    },
  ]);
  switch (response.value) {
    case 1:
      {
        const apiService = new ApiService();
        const signalService = new SignalService();
        apiService.chartListener(pair, (candlesObject: CandlesObject) => {
          const signals = signalService.calculateSignals(pair, candlesObject);
          stochOutput(signals);
        });
      }
      break;

    case 2:
      {
        const signalService = new SignalService();
        const apiService = new ApiService();
        let signals;
        apiService.chartListener(pair, (candlesObject: CandlesObject) => {
          signals = signalService.calculateSignals(pair, candlesObject);
        });
        apiService.depthListener(pair, (depthObject: DepthObject) => {
          wallsOutput(depthObject, signals);
        });
      }
      break;

    case 3:
      {
        const aiService = new AiService();
        const signalService = new SignalService();
        const apiService = new ApiService();

        await aiService.normalizeTrained();
        await aiService.train();

        // add training data
        apiService.chartListener(
          pair,
          (candlesObject: CandlesObject) => {
            const signals: Signals = signalService.calculateSignals(pair, candlesObject);
            const inputs = generateInputs(signals);
            aiService.addDataRow(inputs, candlesObject.t1m);
          },
          60 * 1000
        );
        // run net
        apiService.chartListener(
          pair,
          async (candlesObject: CandlesObject) => {
            const signals: Signals = signalService.calculateSignals(pair, candlesObject);
            const inputs = generateInputs(signals);
            aiService.runNet(inputs);
          },
          1000
        );
      }
      break;

    default:
      break;
  }
};

init();
