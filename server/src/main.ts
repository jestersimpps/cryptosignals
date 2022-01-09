import { SignalService } from "./signal.service";
import { ApiService } from "./api.service";
import { CandlesObject, DepthObject, Signals } from "./models";
import { stochOutput, wallsOutput } from "./output";
import { AiService } from "./ai.service";
import { sendPrivateTelegramMessage } from "./telegram-api";
import { roundNumber } from "./util";

const prompts = require("prompts");
const PAIR = "MATICUSDT";
const TELEGRAM_GROUP_ID = "-799174803";
let lastMessage = null;
const LAST_MESSAGE_TIMEOUT = 5 * 60 * 1000;

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
        apiService.chartListener(PAIR, (candlesObject: CandlesObject) => {
          const signals = signalService.calculateSignals(PAIR, candlesObject);
          stochOutput(signals);
        });
      }
      break;

    case 2:
      {
        const signalService = new SignalService();
        const apiService = new ApiService();
        let signals;
        apiService.chartListener(PAIR, (candlesObject: CandlesObject) => {
          signals = signalService.calculateSignals(PAIR, candlesObject);
        });
        apiService.depthListener(PAIR, (depthObject: DepthObject) => {
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
          PAIR,
          (candlesObject: CandlesObject) => {
            const signals: Signals = signalService.calculateSignals(PAIR, candlesObject);
            const inputs = generateInputs(signals);
            aiService.addDataRow(inputs, candlesObject.t1m);
          },
          60 * 1000
        );
        // run net
        apiService.chartListener(
          PAIR,
          async (candlesObject: CandlesObject) => {
            const signals: Signals = signalService.calculateSignals(PAIR, candlesObject);
            const inputs = generateInputs(signals);
            const result = await aiService.runNet(inputs);
            console.log("buy%:", roundNumber(result.nnb, 0.001), "sell%:", roundNumber(result.nns, 0.001));
            if (!lastMessage || lastMessage + LAST_MESSAGE_TIMEOUT < Date.now()) {
              if (result.nnb > 50 * result.nns) {
                // potential buy
                sendPrivateTelegramMessage(TELEGRAM_GROUP_ID, `BUY ${PAIR} at ${signals.price} - buy%: ${roundNumber(result.nnb, 0.01)} sell%: ${roundNumber(result.nns, 0.01)}`);
                lastMessage = Date.now();
              }
              if (result.nns > 50 * result.nnb) {
                // potential sell
                sendPrivateTelegramMessage(TELEGRAM_GROUP_ID, `SELL ${PAIR} at ${signals.price} - buy%: ${roundNumber(result.nnb, 0.01)} sell%: ${roundNumber(result.nns, 0.01)}`);
                lastMessage = Date.now();
              }
            }
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
