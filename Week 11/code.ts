function match(selector: string, element: HTMLElement) {
  const fragment = selector.split(" ").reverse();
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

    if (items.length === 1) {
      return false;
    }

    let allMatch = true;

    for (const f of items) {
      if (!matchFragment(f, el)) {
        allMatch = false;
        break;
      }
    }

    return allMatch;
  };

  if (matchFragment(fragment[0], element)) {
    let el = element.parentElement;
    let idx = 1;
    while (
      el &&
      el.parentElement !== el &&
      idx < fragment.length &&
      matchFragment(fragment[idx], el)
    ) {
      idx++;
      el = el.parentElement;
    }

    return idx === fragment.length;
  }

  return false;
}

match("div #id.class", document.getElementById("id"));
