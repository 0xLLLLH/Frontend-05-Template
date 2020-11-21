export function StringToNumber(str: string) {
  return Number(str);
}

export function NumberToString(num: number, radix: number) {
  let prefix: Record<number, string> = {
    [2]: "0b",
    [8]: "0o",
    [16]: "0x",
  };
  return (prefix[radix] || "") + num.toString(radix);
}
