export const roundNumber = (value: number, precision: number) => +parseFloat((+value || 0).toFixed(precision.toString().length < 2 ? 0 : precision.toString().length - 2));
