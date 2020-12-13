import TrunkedBodyParser from "./TrunkedBodyParser";

// 响应解析器当前所处的状态
enum ResponseParserStatus {
  WAITING_STATUS_LINE = 0,
  WAITING_STATUS_LINE_END = 1,
  WAITING_HEADER_NAME = 2,
  WAITING_HEADER_SPACE = 3,
  WAITING_HEADER_VALUE = 4,
  WAITING_HEADER_LINE_END = 5,
  WAITING_HEADER_BLOCK_END = 6,
  WAITING_BODY = 7,
}

export default class ResponseParser {
  currentStatus = ResponseParserStatus.WAITING_STATUS_LINE;
  statusLine = "";
  headers: Record<string, string> = {};
  headerName = "";
  headerValue = "";
  bodyParser?: TrunkedBodyParser = null;

  receive(data: string) {
    for (let ch of data) {
      this.receiveChar(ch);
    }
  }

  get isFinished() {
    return this.bodyParser && this.bodyParser.isFinished;
  }

  receiveChar(ch: string) {
    switch (this.currentStatus) {
      case ResponseParserStatus.WAITING_STATUS_LINE:
        if (ch === "\r") {
          this.currentStatus = ResponseParserStatus.WAITING_STATUS_LINE_END;
        } else {
          this.statusLine += ch;
        }
        break;
      case ResponseParserStatus.WAITING_STATUS_LINE_END:
        if (ch === "\n") {
          this.currentStatus = ResponseParserStatus.WAITING_HEADER_NAME;
        }
        break;

      case ResponseParserStatus.WAITING_HEADER_NAME:
        if (ch === ":") {
          this.currentStatus = ResponseParserStatus.WAITING_HEADER_SPACE;
        } else if (ch === "\r") {
          this.currentStatus = ResponseParserStatus.WAITING_HEADER_BLOCK_END;

          if (this.headers["Transfer-Encoding"] === "chunked") {
            this.bodyParser = new TrunkedBodyParser();
          }
        } else {
          this.headerName += ch;
        }
        break;

      case ResponseParserStatus.WAITING_HEADER_SPACE:
        if (ch === " ") {
          this.currentStatus = ResponseParserStatus.WAITING_HEADER_VALUE;
        }
        break;

      case ResponseParserStatus.WAITING_HEADER_VALUE:
        if (ch === "\r") {
          this.currentStatus = ResponseParserStatus.WAITING_HEADER_LINE_END;
          this.headers[this.headerName] = this.headerValue;
          this.headerName = "";
          this.headerValue = "";
        } else {
          this.headerValue += ch;
        }
        break;
      case ResponseParserStatus.WAITING_HEADER_LINE_END:
        if (ch === "\n") {
          this.currentStatus = ResponseParserStatus.WAITING_HEADER_NAME;
        } else {
          this.headerValue += ch;
        }
        break;
      case ResponseParserStatus.WAITING_HEADER_BLOCK_END:
        if (ch === "\n") {
          this.currentStatus = ResponseParserStatus.WAITING_BODY;
        }
        break;
      case ResponseParserStatus.WAITING_BODY:
        this.bodyParser.receiveChar(ch);
        break;
    }
  }

  get response() {
    this.statusLine.match(/HTTP\/1\.1 ([0-9]+) ([\s\S]+)/);
    return {
      statusCode: RegExp.$1,
      statusText: RegExp.$2,
      headers: this.headers,
      body: this.bodyParser.content,
    };
  }
}
