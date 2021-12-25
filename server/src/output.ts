import { DepthObject, Signals } from "./models";
var asciichart = require("asciichart");

let history = {
  prices: [],
  sellWall1: [],
  sellWall2: [],
  sellWall3: [],
  buyWall1: [],
  buyWall2: [],
  buyWall3: [],
};
const chalk = require("chalk");

const mid = "\u25B6";
const up = "\u25B2";
const midup = "\u25E5";
const down = "\u25BC";
const middown = "\u25E2";

const getAngleSymbol = (angle: number) => {
  if (angle < 45) {
    return up;
  }
  if (angle >= 45 && angle < 70) {
    return midup;
  }
  if (angle >= 70 && angle < 90) {
    return mid;
  }
  if (angle >= 90 && angle < 110) {
    return middown;
  }
  if (angle >= 110) {
    return down;
  }
};

export const stochOutput = (signals: Signals) => {
  let output = `${signals.price} - `;

  Object.keys(signals.stoch).map((key) => {
    const valuek = signals.stoch[key].k.value;
    const anglek = signals.stoch[key].k.angle;
    const cross = signals.stoch[key].cross;

    const colorsk = signals.stoch[key].k.color.replace("rgb(", "").replace(")", "");
    const rk = colorsk.split(",")[0];
    const gk = colorsk.split(",")[1];
    const bk = colorsk.split(",")[2];
    const kValue = chalk.rgb(rk, gk, bk)(` ${Math.floor(valuek)}${getAngleSymbol(anglek)} `);

    const valued = signals.stoch[key].d.value;
    const angled = signals.stoch[key].d.angle;
    const colorsd = signals.stoch[key].d.color.replace("rgb(", "").replace(")", "");
    const rd = colorsd.split(",")[0];
    const gd = colorsd.split(",")[1];
    const bd = colorsd.split(",")[2];
    const dValue = chalk.rgb(rd, gd, bd)(` ${Math.floor(valued)}${getAngleSymbol(angled)} `);

    output += cross === "UP" ? chalk.bgGreen(kValue + dValue) + "|" : cross === "DOWN" ? chalk.bgRed(kValue + dValue) + "|" : kValue + dValue + "|";
  });
  console.log(output);
};

export const wallsOutput = (depth: DepthObject, signals: Signals) => {
  const WIDTH = 60;
  if (depth.buyWalls.length && depth.sellWalls.length) {
    history.prices = [...history.prices, signals.price];
    history.sellWall1 = [...history.sellWall1, depth.sellWalls[0].price];
    history.sellWall2 = [...history.sellWall2, depth.sellWalls[1].price];
    history.sellWall3 = [...history.sellWall3, depth.sellWalls[2].price];
    history.buyWall1 = [...history.buyWall1, depth.buyWalls[0].price];
    history.buyWall2 = [...history.buyWall2, depth.buyWalls[1].price];
    history.buyWall3 = [...history.buyWall3, depth.buyWalls[2].price];
    if (history.prices.length > WIDTH) {
      history.prices.shift();
    }
    if (history.sellWall1.length > WIDTH) {
      history.sellWall1.shift();
    }
    if (history.sellWall2.length > WIDTH) {
      history.sellWall2.shift();
    }
    if (history.sellWall3.length > WIDTH) {
      history.sellWall3.shift();
    }
    if (history.buyWall1.length > WIDTH) {
      history.buyWall1.shift();
    }
    if (history.buyWall2.length > WIDTH) {
      history.buyWall2.shift();
    }
    if (history.buyWall3.length > WIDTH) {
      history.buyWall3.shift();
    }
    const config = {
      offset: 3, // axis offset from the left (min 2)
      padding: "       ", // padding string for label formatting (can be overridden)
      height: 50, // any height you want
      colors: [asciichart.red, asciichart.red, asciichart.red, asciichart.green, asciichart.green, asciichart.green, asciichart.yellow],
    };
    console.clear();
    console.log(asciichart.plot([history.sellWall1, history.sellWall2, history.sellWall3, history.buyWall1, history.buyWall2, history.buyWall3, history.prices], config));
  }
};
