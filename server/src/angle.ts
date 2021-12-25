const START_ANGLE = 90;

export const calculateAngleOfChange = (array: number[]) => {
  const lastValue = array[array.length - 2];
  const currentValue = array[array.length - 1];

  const percentageChange = currentValue / lastValue;
  return Math.floor(180 - START_ANGLE * percentageChange);
};

export const getCross = (stoch: { k: number; d: number }[]): "UP" | "DOWN" => {
  const lastValue = stoch[stoch.length - 2];
  const currentValue = stoch[stoch.length - 1];

  if (currentValue.k < currentValue.d && lastValue.k > lastValue.d) {
    return "DOWN";
  }
  if (currentValue.k > currentValue.d && lastValue.k < lastValue.d) {
    return "UP";
  }
};
