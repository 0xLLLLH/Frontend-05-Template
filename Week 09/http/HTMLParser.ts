import * as css from "css";

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

interface DOMElement {
  type: string;
  parent?: DOMElement;
  children?: DOMElement[];
  tagName?: string;
  attributes?: Array<{ name: string; value: string }>;
  content?: string;
  computedStyle?: Object;
}

let currentToken: Token | null = null;
let currentAttribute: Attribute | null = null;
let currentTextNode: DOMElement | null = null;
const stack: DOMElement[] = [{ type: "document", children: [] }];
const rules: Array<css.Rule> = [];

function emit(token: Token) {
  let top = stack[stack.length - 1];

  if (token.type === "startTag") {
    let el: DOMElement = {
      type: "element",
      children: [],
      attributes: [],
    };

    el.tagName = token.tagName;

    for (let p in token) {
      // FIXME: 实际上这样的写法会导致<input type="text" />出问题
      if (p != "type" && p != "tagName") {
        el.attributes.push({
          name: p,
          value: token[p],
        });
      }
    }

    computeCSS(el);

    el.parent = top;
    top.children.push(el);

    if (!token.isSelfClosing) {
      stack.push(el);
    }
    currentTextNode = null;
  } else if (token.type === "endTag") {
    if (top.tagName !== token.tagName) {
      throw new Error("Tag start end doesn't match!");
    } else {
      if (top.tagName === "style") {
        addCSSRules(top.children[0].content);
      }
      stack.pop();
    }
    currentTextNode = null;
  } else if (token.type === "text") {
    if (!currentTextNode) {
      currentTextNode = {
        type: "text",
        content: "",
      };

      top.children.push(currentTextNode);
    }
    currentTextNode.content += token.content;
  }
}

function addCSSRules(text: string) {
  var ast = css.parse(text);

  rules.push(...ast.stylesheet.rules);
}

function specificity(selector: string) {
  const point = [0, 0, 0, 0];
  const selectorParts = selector.split(" ").filter((p) => p.length);

  for (let part of selectorParts) {
    const ps = part.split(/([#\.]\w+)/).filter((x) => x.length);
    for (let p of ps) {
      if (p.startsWith("#")) {
        point[1]++;
      } else if (p.startsWith(".")) {
        point[2]++;
      } else {
        point[3]++;
      }
    }
  }

  return point;
}

function compareSpecificity(sp1: number[], sp2: number[]) {
  if (sp1[0] - sp2[0]) {
    return sp1[0] - sp2[0];
  }
  if (sp1[1] - sp2[1]) {
    return sp1[1] - sp2[1];
  }
  if (sp1[2] - sp2[2]) {
    return sp1[2] - sp2[2];
  }
  return sp1[3] - sp2[3];
}

function computeCSS(el: DOMElement) {
  // 反向匹配提高效率
  const parents = stack.slice().reverse();

  if (!el.computedStyle) {
    el.computedStyle = {};
  }

  for (let rule of rules) {
    const selectorParts = rule.selectors[0].split(" ").reverse();

    if (!match(el, selectorParts[0])) {
      continue;
    }

    let matched = false;

    let j = 1;

    for (let i = 0; i < parents.length; i++) {
      if (match(parents[i], selectorParts[j])) j++;
    }

    if (j === selectorParts.length) {
      matched = true;
    }

    if (matched) {
      const sp = specificity(rule.selectors[0]);
      let computed = el.computedStyle;

      for (let declare of rule.declarations as css.Declaration[]) {
        if (!computed[declare.property]) {
          computed[declare.property] = {};
        }
        if (!computed[declare.property].specificity) {
          computed[declare.property].value = declare.value;
          computed[declare.property].specificity = sp;
        } else if (
          compareSpecificity(sp, computed[declare.property].specificity) > 0
        ) {
          computed[declare.property].value = declare.value;
          computed[declare.property].specificity = sp;
        }
      }
      console.log(el.computedStyle);
    }
  }
}

function match(el: DOMElement, selector: string): boolean {
  // 文本节点没有attributes
  if (!selector || !el.attributes) {
    return false;
  }
  if (el.tagName === selector) {
    return true;
  } else if (selector.startsWith("#")) {
    const attr = el.attributes.filter((attr) => attr.name === "id")[0];

    return attr && attr.value === selector.slice(1);
  } else if (selector.startsWith(".")) {
    const attr = el.attributes.filter((attr) => attr.name === "class")[0];

    return attr && attr.value === selector.slice(1);
  }
  return false;
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

  console.log(stack);
  debugger;
}
