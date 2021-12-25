import { SignalService } from "./signal.service";
import { ApiService } from "./api.service";
import { CandlesObject } from "./models";

const pair = "MATICUSDT";
const signalService = new SignalService();
const apiService = new ApiService();

apiService.chartListener(pair, (candlesObject: CandlesObject) => {
  const signals = signalService.calculateSignals(pair, candlesObject);

  console.log(signals.stoch);
});
