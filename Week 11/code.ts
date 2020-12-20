function match(selector: string, element: HTMLElement) {
  const fragment = selector.split(" ");
  const matchFragment = (frag: string, el: HTMLElement) => {
    if (!frag || frag === "*") {
      return true;
    }
    // div
    if (el.tagName === frag) {
      return true;
    }
    // .class
    if (el.classList.contains(frag.slice(1))) {
      return true;
    }
    // #id
    if (el.id === frag.slice(1)) {
      return true;
    }

    const items = frag
      .replace(/([\.#])/g, " $1")
      .split(" ")
      .filter((s) => !!s);

    let allMatch = true;

    items.forEach((f) => {
      if (!matchFragment(f, el)) {
        allMatch = false;
      }
    });

    return allMatch;
  };

  if (matchFragment(fragment[0], element)) {
    // 不断向上找
  }

  return false;
}

match("div #id.class", document.getElementById("id"));
