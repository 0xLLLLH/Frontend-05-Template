export function StringToNumber(str) {
    return Number(str);
}
export function NumberToString(num, radix) {
    let prefix = {
        [2]: "0b",
        [8]: "0o",
        [16]: "0x",
    };
    return (prefix[radix] || "") + num.toString(radix);
}
