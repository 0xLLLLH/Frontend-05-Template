"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EOF = Symbol("EOF");
let currentToken = null;
let currentAttribute = null;
function emit(token) {
    if (token.type !== "text")
        console.log(token);
}
function data(ch) {
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
function tagOpen(ch) {
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
function endTagOpen(ch) {
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
function tagName(ch) {
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
            }
            else if (/^[a-zA-Z]$/.test(ch) &&
                currentToken &&
                (currentToken.type === "startTag" || currentToken.type === "endTag")) {
                currentToken.tagName += ch;
                return tagName;
            }
            return tagName;
        }
    }
}
function beforeAttributeName(ch) {
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
function attributeName(ch) {
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
function afterAttributeName(ch) {
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
function beforeAttributeValue(ch) {
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
function afterQuotedAttributeValue(ch) {
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
function doubleQuotedAttributeValue(ch) {
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
function singleQuotedAttributeValue(ch) {
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
function UnQuotedAttributeValue(ch) {
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
function selfClosingStartTag(ch) {
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
function parseHTML(html) {
    let state = data;
    for (let c of html) {
        state = state && state(c);
    }
    state = state && state(EOF);
}
exports.default = parseHTML;
