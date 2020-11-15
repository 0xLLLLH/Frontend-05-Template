function UTF8_Encoding(str: string) {
  const buffer = new ArrayBuffer(str.length * 6);
  var utf8view = new Uint8Array(buffer);
  let offset = 0;

  for (let ch of str) {
    let charCode = ch.charCodeAt(0);

    if (charCode < 128) {
      utf8view.set([charCode], offset);
      offset++;
    } else {
      let codes = encodeURI(ch);
      utf8view.set(
        codes
          .split("%")
          .filter(Boolean)
          .map((s) => Number("0x" + s)),
        offset
      );
    }
  }

  return Array.from(utf8view)
    .map((byte) => byte.toString(2).padStart(8, "0"))
    .join(",");
}
