"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EOF = Symbol("EOF");
function data(ch) {
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
                return tagName(ch);
            }
            return tagOpen;
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
function beforeAttributeName(ch) {
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
function selfClosingStartTag(ch) {
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
function parseHTML(html) {
    debugger;
    let state = data;
    for (let c of html) {
        state = state(c);
    }
    state = state(EOF);
}
exports.default = parseHTML;
