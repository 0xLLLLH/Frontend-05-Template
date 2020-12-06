const EOF = Symbol("EOF");

// 有限状态机的各个状态
type Input = string | typeof EOF;
type State = (ch: Input) => State;

function data(ch: Input): State {
  switch (ch) {
    case "<": {
      return tagOpen;
    }
    case EOF: {
      return;
    }
    default: {
      // TODO: parse TextNode
      return data;
    }
  }
}

function tagOpen(ch: Input): State {
  switch (ch) {
    case "/": {
      return endTagOpen;
    }
    case EOF: {
      // TODO: throw error
      return;
    }
    default: {
      if (/^[a-zA-Z]$/.test(ch)) {
        return tagName(ch);
      }
      return tagOpen;
    }
  }
}

function endTagOpen(ch: Input): State {
  switch (ch) {
    case ">": {
      return;
    }
    case EOF: {
      return;
    }
    default: {
      if (/^[a-zA-Z]$/.test(ch)) {
        return tagName(ch);
      }
      return;
    }
  }
}

function tagName(ch: Input): State {
  switch (ch) {
    case "/": {
      return selfClosingStartTag;
    }
    case ">": {
      return data;
    }
    case EOF: {
      return;
    }
    default: {
      if (/^[\t\n\f ]$/.test(ch)) {
        return beforeAttributeName;
      }
      return tagName;
    }
  }
}

function beforeAttributeName(ch: Input): State {
  switch (ch) {
    case "=": {
      return beforeAttributeName;
    }
    case ">": {
      return data;
    }
    case EOF: {
      return;
    }
    default: {
      if (/^[\t\n\f ]$/.test(ch)) {
        return beforeAttributeName;
      }
      return beforeAttributeName;
    }
  }
}

function selfClosingStartTag(ch: Input): State {
  switch (ch) {
    case ">": {
      // TODO: set token.isSelfClosingTag = true
      return data;
    }
    default: {
      // TODO: throw Error
      return;
    }
  }
}
export default function parseHTML(html: string) {
  debugger;
  let state: State = data;

  for (let c of html) {
    state = state(c);
  }

  state = state(EOF);
}
