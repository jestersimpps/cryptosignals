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
  if (angle > 110) {
    return down;
  }
};

export const output = (signals) => {
  let output = ``;

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
