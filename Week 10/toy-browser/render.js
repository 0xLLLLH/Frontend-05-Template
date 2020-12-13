"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const images = require("images");
function render(viewport, el) {
    if (el.layoutStyle) {
        const img = images(el.layoutStyle.width, el.layoutStyle.height);
        if (el.layoutStyle["background-color"]) {
            let color = el.layoutStyle["background-color"] || "rgb(0,0,0)";
            color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            img.fill(Number(RegExp.$1), Number(RegExp.$2), Number(RegExp.$3));
            viewport.draw(img, el.layoutStyle.left || 0, el.layoutStyle.top || 0);
        }
    }
    if (el.children) {
        for (let child of el.children) {
            render(viewport, child);
        }
    }
}
exports.render = render;
