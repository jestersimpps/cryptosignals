export const roundNumber = (value: number, precision: number) => +parseFloat((+value || 0).toFixed(precision.toString().length < 2 ? 0 : precision.toString().length - 2));
export const getLastElement = (array: any[], property?: string) => {
  return array.length ? (property ? array[array.length - 1][property] : array[array.length - 1]) : null;
};
