const START_ANGLE = 90;

export const calculateAngleOfChange = (array: number[]) => {
  const lastValue = array[array.length - 2];
  const currentValue = array[array.length - 1];

  const percentageChange = currentValue / lastValue;
  return Math.floor(180 - START_ANGLE * percentageChange);
};
