"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TrunkedBodyParserStatus;
(function (TrunkedBodyParserStatus) {
    TrunkedBodyParserStatus[TrunkedBodyParserStatus["WAITING_LENGTH"] = 0] = "WAITING_LENGTH";
    TrunkedBodyParserStatus[TrunkedBodyParserStatus["WAITING_LENGTH_LINE_END"] = 1] = "WAITING_LENGTH_LINE_END";
    TrunkedBodyParserStatus[TrunkedBodyParserStatus["READING_TRUNK"] = 2] = "READING_TRUNK";
    TrunkedBodyParserStatus[TrunkedBodyParserStatus["WAITING_NEWLINE"] = 3] = "WAITING_NEWLINE";
    TrunkedBodyParserStatus[TrunkedBodyParserStatus["WAITING_NEWLINE_END"] = 4] = "WAITING_NEWLINE_END";
})(TrunkedBodyParserStatus || (TrunkedBodyParserStatus = {}));
class TrunkedBodyParser {
    constructor() {
        this.status = TrunkedBodyParserStatus.WAITING_LENGTH;
        this.isFinished = false;
        this.length = 0;
        this.contentButter = [];
    }
    receiveChar(ch) {
        switch (this.status) {
            case TrunkedBodyParserStatus.WAITING_LENGTH:
                if (ch === "\r") {
                    // 块长为0代表body结束
                    if (this.length === 0) {
                        this.isFinished = true;
                    }
                    this.status = TrunkedBodyParserStatus.WAITING_LENGTH_LINE_END;
                }
                else {
                    this.length *= 16;
                    this.length += parseInt(ch, 16);
                }
                break;
            case TrunkedBodyParserStatus.WAITING_LENGTH_LINE_END:
                if (ch === "\n") {
                    this.status = TrunkedBodyParserStatus.READING_TRUNK;
                }
                break;
            case TrunkedBodyParserStatus.READING_TRUNK:
                this.contentButter.push(ch);
                this.length--;
                if (this.length === 0) {
                    this.status = TrunkedBodyParserStatus.WAITING_NEWLINE;
                }
                break;
            case TrunkedBodyParserStatus.WAITING_NEWLINE:
                if (ch === "\r") {
                    this.status = TrunkedBodyParserStatus.WAITING_NEWLINE_END;
                }
                break;
            case TrunkedBodyParserStatus.WAITING_NEWLINE_END:
                if (ch === "\n") {
                    this.status = TrunkedBodyParserStatus.WAITING_LENGTH;
                }
                break;
        }
    }
    get content() {
        return this.contentButter.join("");
    }
}
exports.default = TrunkedBodyParser;
