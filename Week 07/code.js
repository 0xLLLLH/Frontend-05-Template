"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function StringToNumber(str) {
    return Number(str);
}
exports.StringToNumber = StringToNumber;
function NumberToString(num, radix) {
    let prefix = {
        [2]: "0b",
        [8]: "0o",
        [16]: "0x",
    };
    return (prefix[radix] || "") + num.toString(radix);
}
exports.NumberToString = NumberToString;
