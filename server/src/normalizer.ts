/**
 * Non-linear normalization of data for learning a neural network
 * the data of one parameter is the STRING or COLUMN (param isCol) of the matrix
 *
 * The parameter "a" affects the degree of non-linearity of the variable change in the normalized interval.
 * In addition, when using the values a < 0.5, there is no need to additionally
 * specify the width of the extrapolation corridor.
 *
 * @function nonLinear.normalize
 * @param data {Array<Array{Number}>} - matrix of numbers
 * @param maxmin {Array<{ max: Number, min: Number}>} - array of object with max min properties for each row data
 * @param a {number} - parameter determining the degree of nonlinearity, default: 1
 */
export const nonLinearNormalize = ({ data, maxmin, a = 1 }) => {
  const callback = ({ max, min, el }) => 1 / (Math.exp(a * ((max - min) / 2) - a * el) + 1);

  return enumeration(data, maxmin, callback);
};

/**
 * Non-linear denormalization of data for learning a neural network
 * the data of one parameter is the STRING or COLUMN (param isCol) of the matrix
 *
 * The parameter "a" affects the degree of non-linearity of the variable change in the normalized interval.
 * In addition, when using the values a < 0.5, there is no need to additionally
 * specify the width of the extrapolation corridor.
 *
 * @param data {Array<Array{Number}>} - matrix of numbers
 * @param maxmin {Array<{ max: Number, min: Number}>} - array of object with max min properties for each row data
 * @param a {number} - parameter determining the degree of nonlinearity, default: 1
 */
const nonLinearDeNormalize = ({ data, maxmin, a = 1 }) => {
  const callback = ({ max, min, el }) => (max - min) / 2 - (1 / a) * Math.log(1 / el - 1);

  return enumeration(data, maxmin, callback);
};

const transpose = (m) => m[0].map((x, i) => m.map((x) => x[i]));

/**
 * Generate new matrix with 0 in value
 * @param rows {Number}
 * @param cols {Number}
 * @returns {Array<Array<Number>>}
 */
function generateMatrix(rows, cols) {
  const matrix = [];

  let y = rows;
  for (; y >= 0; y--) {
    matrix[y] = [];
    let x = cols;
    for (; x >= 0; x--) {
      matrix[y][x] = 0;
    }
  }
  return matrix;
}

/**
 * Enumeration of data
 *
 * @private
 * @param data {Array<Array{Number}>} - matrix of numbers
 * @param maxmin {Array<{ max: Number, min: Number}>|undefined} - array of object with max min properties for each column data
 * @param callback {function} - callback from circle by row Or col (the isCol parameter affects)
 */
function enumeration(data, maxmin, callback) {
  const rowMax = data.length - 1;
  const colMax = data[0].length - 1;
  const answer = generateMatrix(rowMax, colMax);

  let c = colMax;
  while (c >= 0) {
    let r = rowMax;
    while (r >= 0) {
      answer[r][c] = callback({ ...maxmin[c], el: data[r][c] });
      r--;
    }
    c--;
  }

  return answer;
}

/**
 * Linear denormalization of data for learning a neural network
 * the data of one parameter is the STRING or COLUMN (param isCol) of the matrix
 *
 * @param data {Array<Array{Number}>} - matrix of numbers
 * @param maxmin {Array<{ max: Number, min: Number}>} - array of object with max min properties for each row data
 */
export const linearDeNormalize = ({ data, maxmin }) => {
  const callback = ({ max, min, el }) => min + el * (max - min);

  return enumeration(data, maxmin, callback);
};

/**
 * Linear normalization of data for learning a neural network
 * the data of one parameter is the STRING or COLUMN (param isCol) of the matrix
 *
 * @param data {Array<Array{Number}>} - matrix of numbers
 * @param maxmin {Array<{ max: Number, min: Number}>} - array of object with max min properties for each row data
 * default: normalizeInput
 */
export const linearNormalize = ({ data, maxmin }): number[][] => {
  const callback = ({ max, min, el }) => (max - min === 0 ? 0 : (el - min) / (max - min));

  return data ? enumeration(data, maxmin, callback) : [];
};

/**
 * Get array of max/min values for column of Array
 * @param data
 * @returns {Array<{ max: Number, min: Number }>}
 */
export const getMaxMin = (data: number[][]): { max: number; min: number }[] => {
  const rowMax = data.length - 1;
  const colMax = data[0].length - 1;
  const answer = new Array(colMax);

  let c = colMax;
  while (c >= 0) {
    let max: number;
    let min: number;

    // find max & min elements
    let r = rowMax;
    while (r >= 0) {
      let el = data[r][c];
      max = max !== undefined && el < max ? max : el;
      min = min !== undefined && el > min ? min : el;
      r--;
    }

    answer[c] = { max, min };
    c--;
  }
  return answer;
};
