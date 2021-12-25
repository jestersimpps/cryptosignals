"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roundNumber = (value, precision) => +parseFloat((+value || 0).toFixed(precision.toString().length < 2 ? 0 : precision.toString().length - 2));
//# sourceMappingURL=util.js.map