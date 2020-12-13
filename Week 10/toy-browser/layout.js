"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getStyle = (el) => {
    if (!el.layoutStyle) {
        el.layoutStyle = {};
    }
    for (let prop in el.computedStyle) {
        el.layoutStyle[prop] = el.computedStyle[prop].value;
        if (el.layoutStyle[prop].toString().match(/px$/)) {
            el.layoutStyle[prop] = parseInt(el.layoutStyle[prop].toString(), 10);
        }
        if (el.layoutStyle[prop].toString().match(/^[0-9\.]+$/)) {
            el.layoutStyle[prop] = parseInt(el.layoutStyle[prop].toString(), 10);
        }
    }
    return el.layoutStyle;
};
exports.layout = (el) => {
    // 如果没有已计算过的css属性，说明没有匹配的样式，直接返回
    if (!el.computedStyle)
        return;
    let elementStyle = getStyle(el);
    // 如果布局不是flex，直接返回。目前只支持flex布局
    if (elementStyle.display !== "flex")
        return;
    const items = el.children.filter((e) => e.type === "element");
    items.sort((a, b) => (a.order || 0) - (b.order || 0));
    let style = elementStyle;
    ["width", "height"].forEach((size) => {
        if (style[size] === "auto" || style[size] === "auto") {
            style[size] = null;
        }
    });
    if (!style.flexDirection || style.flexDirection === "auto") {
        style.flexDirection = "row";
    }
    if (!style.alignItems || style.alignItems === "auto") {
        style.alignItems = "stretch";
    }
    if (!style.justifyContent || style.justifyContent === "auto") {
        style.justifyContent = "flex-start";
    }
    if (!style.flexWrap || style.flexWrap === "auto") {
        style.flexWrap = "nowrap";
    }
    if (!style.alignContent || style.alignContent === "auto") {
        style.alignContent = "stretch";
    }
    let mainSize, mainStart, mainEnd, mainSign, mainBase, crossSize, crossStart, crossEnd, crossSign, crossBase;
    if (style.flexDirection === "row") {
        mainSize = "width";
        mainStart = "left";
        mainEnd = "right";
        mainSign = 1;
        mainBase = 0;
        crossSize = "height";
        crossStart = "top";
        crossEnd = "bottom";
    }
    if (style.flexDirection === "row-reverse") {
        mainSize = "width";
        mainStart = "right";
        mainEnd = "left";
        mainSign = -1;
        mainBase = style.width;
        crossSize = "height";
        crossStart = "top";
        crossEnd = "bottom";
    }
    if (style.flexDirection === "column") {
        mainSize = "height";
        mainStart = "top";
        mainEnd = "bottom";
        mainSign = 1;
        mainBase = 0;
        crossSize = "width";
        crossStart = "left";
        crossEnd = "right";
    }
    if (style.flexDirection === "column-reverse") {
        mainSize = "height";
        mainStart = "bottom";
        mainEnd = "top";
        mainSign = -1;
        mainBase = style.height;
        crossSize = "width";
        crossStart = "left";
        crossEnd = "right";
    }
    if (style.flexWrap === "wrap-reverse") {
        let tmp = crossStart;
        crossStart = crossEnd;
        crossEnd = tmp;
        crossSign = -1;
    }
    else {
        crossBase = 0;
        crossSign = 1;
    }
    let isAutoMainSize = false;
    // 父元素未提供主轴尺寸，进入AutoMainSize模式，由子元素撑开
    if (!style[mainSize]) {
        style[mainSize] = 0;
        for (let i = 0; i < items.length; i++) {
            let itemStyle = getStyle(items[i]);
            if (itemStyle[mainSize] !== null || itemStyle[mainSize] !== void 0) {
                style[mainSize] =
                    style[mainSize] + itemStyle[mainSize];
            }
        }
        isAutoMainSize = true;
    }
    let flexLine = [];
    let flexLines = [flexLine];
};
