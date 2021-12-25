
const hslToRgb = (h, s, l) => {
    let r, g, b;
  
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) {
          t += 1;
        }
        if (t > 1) {
          t -= 1;
        }
        if (t < 1 / 6) {
          return p + (q - p) * 6 * t;
        }
        if (t < 1 / 2) {
          return q;
        }
        if (t < 2 / 3) {
          return p + (q - p) * (2 / 3 - t) * 6;
        }
        return p;
      };
  
      let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      let p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
  
    return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
  };
  
  export const numberToGreenRedColor = (i, min, max) => {
    let ratio = i;
    if (i < min) {
      ratio = 0;
    } else if (i > max) {
      ratio = 1;
    } else {
      let range = max - min;
      ratio = (i - min) / range;
    }
  
    // as the function expects a value between 0 and 1, and red = 0° and green = 120°
    // we convert the input to the appropriate hue value
    let hue = (ratio * 1.2) / 3.6;
    //if (minMaxFactor!=1) hue /= minMaxFactor;
    //console.log(hue);
  
    // we convert hsl to rgb (saturation 100%, lightness 50%)
    let rgb = hslToRgb(hue, 1, 0.3);
    // we format to css value and return
    return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
  };
  