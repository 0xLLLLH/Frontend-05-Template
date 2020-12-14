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
    if (!style["flex-direction"] || style["flex-direction"] === "auto") {
        style["flex-direction"] = "row";
    }
    if (!style["align-items"] || style["align-items"] === "auto") {
        style["align-items"] = "stretch";
    }
    if (!style["justify-content"] || style["justify-content"] === "auto") {
        style["justify-content"] = "flex-start";
    }
    if (!style["flex-wrap"] || style["flex-wrap"] === "auto") {
        style["flex-wrap"] = "nowrap";
    }
    if (!style["align-items"] || style["align-items"] === "auto") {
        style["align-items"] = "stretch";
    }
    let mainSize, mainStart, mainEnd, mainSign, mainBase, crossSize, crossStart, crossEnd, crossSign, crossBase;
    if (style["flex-direction"] === "row") {
        mainSize = "width";
        mainStart = "left";
        mainEnd = "right";
        mainSign = 1;
        mainBase = 0;
        crossSize = "height";
        crossStart = "top";
        crossEnd = "bottom";
    }
    if (style["flex-direction"] === "row-reverse") {
        mainSize = "width";
        mainStart = "right";
        mainEnd = "left";
        mainSign = -1;
        mainBase = style.width;
        crossSize = "height";
        crossStart = "top";
        crossEnd = "bottom";
    }
    if (style["flex-direction"] === "column") {
        mainSize = "height";
        mainStart = "top";
        mainEnd = "bottom";
        mainSign = 1;
        mainBase = 0;
        crossSize = "width";
        crossStart = "left";
        crossEnd = "right";
    }
    if (style["flex-direction"] === "column-reverse") {
        mainSize = "height";
        mainStart = "bottom";
        mainEnd = "top";
        mainSign = -1;
        mainBase = style.height;
        crossSize = "width";
        crossStart = "left";
        crossEnd = "right";
    }
    if (style["flex-wrap"] === "wrap-reverse") {
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
    let mainSpace = style[mainSize];
    let crossSpace = 0;
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        let itemStyle = getStyle(item);
        if (itemStyle[mainSize] === null) {
            itemStyle[mainSize] = 0;
        }
        if (itemStyle.flex) {
            flexLine.push(item);
        }
        else if (style["flex-wrap"] === "nowrap" && isAutoMainSize) {
            mainSpace -= itemStyle[mainSize];
            if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== void 0) {
                crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
            }
            flexLine.push(item);
        }
        else {
            if (itemStyle[mainSize] > style[mainSize]) {
                itemStyle[mainSize] = style[mainSize];
            }
            if (mainSpace < itemStyle[mainSize]) {
                flexLine.mainSpace = mainSpace;
                flexLine.crossSpace = crossSpace;
                flexLine = [item];
                flexLines.push(flexLine);
                mainSpace = style[mainSize];
                crossSpace = 0;
            }
            else {
                flexLine.push(item);
            }
            if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== void 0) {
                crossSpace = Math.max(crossSpace, itemStyle[crossSize]);
            }
            mainSpace -= itemStyle[mainSize];
        }
    }
    flexLine.mainSpace = mainSpace;
    // #region main axis
    if (style["flex-wrap"] === "nowrap" || isAutoMainSize) {
        flexLine.crossSpace =
            style[crossSize] !== undefined
                ? style[crossSize]
                : crossSpace;
    }
    else {
        flexLine.crossSpace = crossSpace;
    }
    if (mainSpace < 0) {
        let scale = style[mainSize] / (style[mainSize] - mainSpace);
        let currentMain = mainBase;
        for (let item of items) {
            let itemStyle = getStyle(item);
            // flex元素直接压为0
            if (itemStyle.flex) {
                itemStyle[mainSize] = 0;
            }
            itemStyle[mainSize] = itemStyle[mainSize] * scale;
            itemStyle[mainStart] = currentMain;
            itemStyle[mainEnd] =
                itemStyle[mainStart] +
                    mainSign * itemStyle[mainSize];
            currentMain = itemStyle[mainEnd];
        }
    }
    else {
        flexLines.forEach((items) => {
            let mainSpace = items.mainSpace;
            let flexTotal = 0;
            for (let item of items) {
                let itemStyle = getStyle(item);
                if (itemStyle.flex !== null && itemStyle.flex !== void 0) {
                    flexTotal += itemStyle.flex;
                }
            }
            if (flexTotal > 0) {
                // 有flex元素
                let currentMain = mainBase;
                for (let item of items) {
                    let itemStyle = getStyle(item);
                    if (itemStyle.flex) {
                        itemStyle[mainSize] =
                            (mainSpace / flexTotal) * itemStyle.flex;
                    }
                    itemStyle[mainStart] = currentMain;
                    itemStyle[mainEnd] =
                        itemStyle[mainStart] +
                            mainSign * itemStyle[mainSize];
                    currentMain = itemStyle[mainEnd];
                }
            }
            else {
                let currentMain = mainBase;
                let step = 0;
                if (style["justify-content"] === "flex-start") {
                    currentMain = mainBase;
                    step = 0;
                }
                if (style["justify-content"] === "flex-end") {
                    currentMain = mainSpace * mainSign + mainBase;
                    step = 0;
                }
                if (style["justify-content"] === "center") {
                    currentMain = (mainSpace * mainSign) / 2 + mainBase;
                    step = 0;
                }
                if (style["justify-content"] === "space-between") {
                    currentMain = mainBase;
                    step = (mainSpace / (items.length - 1)) * mainSign;
                }
                if (style["justify-content"] === "space-around") {
                    step = (mainSpace / items.length) * mainSign;
                    currentMain = step / 2 + mainBase;
                }
                for (let item of items) {
                    let itemStyle = getStyle(item);
                    itemStyle[mainStart] = currentMain;
                    itemStyle[mainEnd] =
                        itemStyle[mainStart] +
                            mainSign * itemStyle[mainSize];
                    currentMain = itemStyle[mainEnd] + step;
                }
            }
        });
    }
    // #endregion main axis
    // #region cross axis
    if (!style[crossSize]) {
        crossSpace = 0;
        elementStyle[crossSize] = 0;
        for (let line of flexLines) {
            elementStyle[crossSize] =
                elementStyle[crossSize] + line.crossSpace;
        }
    }
    else {
        crossSpace = style[crossSize];
        for (let line of flexLines) {
            crossSpace -= line.crossSpace;
        }
    }
    if (style["flex-wrap"] === "wrap-reverse") {
        crossBase = style[crossSize];
    }
    else {
        crossBase = 0;
    }
    let lineSize = style[crossSize] / flexLines.length;
    let step = 0;
    if (style["align-items"] === "flex-start") {
        crossBase += 0;
        step = 0;
    }
    if (style["align-items"] === "flex-end") {
        crossBase += crossSign * crossSpace;
        step = 0;
    }
    if (style["align-items"] === "center") {
        crossBase += (crossSign * crossSpace) / 2;
        step = 0;
    }
    if (style["align-items"] === "space-between") {
        crossBase += 0;
        step = crossSpace / (flexLines.length - 1);
    }
    if (style["align-items"] === "space-around") {
        step = crossSpace / flexLines.length;
        crossBase += (crossSign * step) / 2;
    }
    if (style["align-items"] === "stretch") {
        crossBase += 0;
        step = 0;
    }
    for (let line of flexLines) {
        let lineCrossSize = style["align-items"] === "stretch"
            ? line.crossSpace + crossSpace / flexLines.length
            : line.crossSpace;
        for (let item of line) {
            let itemStyle = getStyle(item);
            let align = itemStyle["align-self"] || style["align-items"];
            if (item === null) {
                itemStyle[crossSize] = align === "stretch" ? lineCrossSize : 0;
            }
            if (align === "flex-start") {
                itemStyle[crossStart] = crossBase;
                itemStyle[crossEnd] =
                    itemStyle[crossStart] +
                        crossSign * itemStyle[crossEnd];
            }
            if (align === "flex-end") {
                itemStyle[crossEnd] = crossBase + crossSign * lineCrossSize;
                itemStyle[crossStart] =
                    itemStyle[crossEnd] -
                        crossSign * itemStyle[crossSize];
            }
            if (align === "center") {
                itemStyle[crossStart] =
                    crossBase +
                        (crossSign * (lineCrossSize - itemStyle[crossSize])) / 2;
                itemStyle[crossEnd] =
                    itemStyle[crossStart] +
                        crossSign * itemStyle[crossSize];
            }
            if (align === "stretch") {
                itemStyle[crossStart] = crossBase;
                itemStyle[crossEnd] =
                    crossBase +
                        crossSign *
                            (itemStyle[crossSize] !== null && itemStyle[crossSize] !== undefined
                                ? itemStyle[crossSize]
                                : 0);
                itemStyle[crossSize] =
                    crossSign *
                        (itemStyle[crossEnd] - itemStyle[crossStart]);
            }
        }
        crossBase += crossSign * (lineCrossSize + step);
    }
    // #endregion
};
