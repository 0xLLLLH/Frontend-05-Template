const EOF = Symbol("EOF");

// 有限状态机的各个状态
type Input = string | typeof EOF;
type State = (ch: Input) => State;
type Token =
  | {
      type: "EOF";
    }
  | {
      type: "text";
      content: string;
    }
  | {
      type: "startTag";
      tagName: string;
      isSelfClosing?: boolean;
    }
  | {
      type: "endTag";
      tagName: string;
    };
interface Attribute {
  name: string;
  value: string;
}

let currentToken: Token | null = null;
let currentAttribute: Attribute | null = null;

function emit(token: Token) {
  if (token.type !== "text") console.log(token);
}

function data(ch: Input): State {
  switch (ch) {
    case "<": {
      return tagOpen;
    }
    case EOF: {
      emit({
        type: "EOF",
      });
      return;
    }
    default: {
      emit({
        type: "text",
        content: ch,
      });
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
        currentToken = {
          type: "startTag",
          tagName: "",
        };
        return tagName(ch);
      }
      return;
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
        currentToken = {
          type: "endTag",
          tagName: "",
        };
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
      emit(currentToken);
      return data;
    }
    case EOF: {
      return;
    }
    default: {
      if (/^[\t\n\f ]$/.test(ch)) {
        return beforeAttributeName;
      } else if (
        /^[a-zA-Z]$/.test(ch) &&
        currentToken &&
        (currentToken.type === "startTag" || currentToken.type === "endTag")
      ) {
        currentToken.tagName += ch;
        return tagName;
      }
      return tagName;
    }
  }
}

function beforeAttributeName(ch: Input): State {
  switch (ch) {
    case "=": {
      return;
    }
    case "/":
    case ">":
    case EOF: {
      return afterAttributeName(ch);
    }
    default: {
      if (/^[\t\n\f ]$/.test(ch)) {
        return beforeAttributeName;
      }
      currentAttribute = {
        name: "",
        value: "",
      };
      return attributeName(ch);
    }
  }
}

function attributeName(ch: Input): State {
  switch (ch) {
    case "/":
    case EOF:
    case ">": {
      return afterAttributeName(ch);
    }
    case "=": {
      return beforeAttributeValue;
    }
    case '"': {
      return;
    }
    case "'": {
      return afterAttributeName(ch);
    }
    case "<": {
      return afterAttributeName(ch);
    }
    default: {
      if (/^[\t\n\f ]$/.test(ch)) {
        return afterAttributeName(ch);
      }
      currentAttribute.name += ch;
      return attributeName;
    }
  }
}

function afterAttributeName(ch: Input): State {
  switch (ch) {
    case "=": {
      return beforeAttributeName;
    }
    case "/": {
      return selfClosingStartTag;
    }
    case ">": {
      emit(currentToken);
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

function beforeAttributeValue(ch: Input): State {
  switch (ch) {
    case ">":
    case EOF:
    case "/": {
      return beforeAttributeValue;
    }
    case '"': {
      return doubleQuotedAttributeValue;
    }

    case "'": {
      return singleQuotedAttributeValue;
    }
    default: {
      if (/^[\t\n\f ]$/.test(ch)) {
        return beforeAttributeValue;
      }
      return UnQuotedAttributeValue(ch);
    }
  }
}

function afterQuotedAttributeValue(ch: Input): State {
  debugger;
  switch (ch) {
    case ">": {
      currentToken[currentAttribute.name] = currentAttribute.value;
      emit(currentToken);
      return data;
    }
    case EOF: {
      return;
    }
    case "/": {
      return selfClosingStartTag;
    }
    default: {
      if (/^[\t\n\f ]$/.test(ch)) {
        return beforeAttributeName;
      }
      currentAttribute.value += ch;
      return doubleQuotedAttributeValue;
    }
  }
}

function doubleQuotedAttributeValue(ch: Input): State {
  switch (ch) {
    case '"': {
      currentToken[currentAttribute.name] = currentAttribute.value;
      return afterQuotedAttributeValue;
    }

    case EOF: {
      return;
    }
    default: {
      currentAttribute.value += ch;
      return doubleQuotedAttributeValue;
    }
  }
}

function singleQuotedAttributeValue(ch: Input): State {
  switch (ch) {
    case "'": {
      currentToken[currentAttribute.name] = currentAttribute.value;
      return afterQuotedAttributeValue;
    }

    case EOF: {
      emit({
        type: "EOF",
      });
      return;
    }
    default: {
      currentAttribute.value += ch;
      return singleQuotedAttributeValue;
    }
  }
}

function UnQuotedAttributeValue(ch: Input): State {
  switch (ch) {
    case "/": {
      currentToken[currentAttribute.name] = currentAttribute.value;
      return selfClosingStartTag;
    }
    case ">": {
      currentToken[currentAttribute.name] = currentAttribute.value;
      emit(currentToken);
      return data;
    }
    case "=":
    case '"':
    case "'":
    case "`":
    case "<":
    case EOF: {
      return;
    }
    default: {
      if (/^[\t\n\f ]$/.test(ch)) {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return beforeAttributeName;
      }
      currentAttribute.value += ch;
      return UnQuotedAttributeValue;
    }
  }
}

// https://whatwg-cn.github.io/html/multipage/parsing.html#self-closing-start-tag-state
function selfClosingStartTag(ch: Input): State {
  switch (ch) {
    case ">": {
      if (currentToken && currentToken.type === "startTag") {
        currentToken.isSelfClosing = true;
      }
      emit(currentToken);
      return data;
    }
    default: {
      emit({
        type: "EOF",
      });
      // TODO: throw Error
      return;
    }
  }
}
export default function parseHTML(html: string) {
  let state: State = data;

  for (let c of html) {
    state = state && state(c);
  }

  state = state && state(EOF);
}
