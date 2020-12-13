import images = require("images");
import { DOMElement } from "./HTMLParser";

export function render(viewport: images.Image, el: DOMElement) {
  if (el.layoutStyle) {
    const img = images(
      el.layoutStyle.width as number,
      el.layoutStyle.height as number
    );

    if (el.layoutStyle["background-color"]) {
      let color: string =
        (el.layoutStyle["background-color"] as string) || "rgb(0,0,0)";

      color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      img.fill(Number(RegExp.$1), Number(RegExp.$2), Number(RegExp.$3));

      viewport.draw(
        img,
        (el.layoutStyle.left as number) || 0,
        (el.layoutStyle.top as number) || 0
      );
    }
  }

  if (el.children) {
    for (let child of el.children) {
      render(viewport, child);
    }
  }
}
