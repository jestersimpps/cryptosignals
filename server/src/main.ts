import { calculateSignals } from "./signal.service";
import { chartListener } from "./api.service";
import { CandlesObject } from "./models";

const pair = "MATICUSDT";

chartListener(pair, (candlesObject: CandlesObject) => {
  const signals = calculateSignals(pair, candlesObject);

  console.log(signals);
});
