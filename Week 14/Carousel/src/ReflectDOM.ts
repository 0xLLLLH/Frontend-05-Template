interface ReflectPropType {
  [key: string]: any;
  style?: CSSStyleDeclaration;
}
type ReflectChildrenType = Element[];

class Element<P = ReflectPropType> {
  root: HTMLElement | Text;
  props: P = Object.create(null);
  children: ReflectChildrenType = [];

  constructor(props?: P, children?: ReflectChildrenType) {
    if (props) {
      for (const p in props) {
        this.props[p] = props[p];
      }
    }

    this.children = children || [];
  }

  mount(target: HTMLElement) {
    // HTMLElement | Text都是Node，可以直接appendChild
    target.appendChild(this.root);
  }

  appendChild() {
    for (const child of this.children) {
      child.mount(this.root as HTMLElement);
    }
  }
}

class TextElement extends Element {
  root: Text;

  constructor(content: string) {
    super();
    this.root = document.createTextNode(content);
  }

  appendChild() {}
}

class DOMElement extends Element {
  root: HTMLElement;

  constructor(
    tagName: string,
    props: ReflectPropType,
    children: ReflectChildrenType
  ) {
    super(props, children);
    this.root = document.createElement(tagName);
    this.setAttributes();
    this.appendChild();
  }

  setAttributes() {
    for (const p in this.props) {
      if (p === "style") {
        for (const s in this.props.style) {
          this.root.style[s] = this.props.style[s];
        }
      } else {
        this.root.setAttribute(p, this.props[p]);
      }
    }
  }
}

export class Component<P = {}> extends Element<P> {
  constructor(props: P, children: ReflectChildrenType) {
    super(props, children);
    this.root = this.render()?.root;
  }

  mount(target: HTMLElement) {
    target.appendChild(this.root);
  }

  render(): Element | null {
    return null;
  }
}

type ReflectElement = TextElement | DOMElement | Component;

export function createElement(
  type: string | Component,
  props: ReflectPropType,
  ...children: Array<Element | string>
): ReflectElement {
  const childrenElements: Element[] = children
    .reduce((res, cur) => {
      // 在组件内直接使用children渲染会多一层
      if (Array.isArray(cur)) {
        return [...res, ...cur];
      }
      return [...res, cur];
    }, [])
    .map((child) => {
      if (typeof child === "string") {
        return new TextElement(child);
      }
      return child;
    });
  if (typeof type === "string") {
    return new DOMElement(type, props, childrenElements);
  } else {
    const ComponentType: Component = type;
    // @ts-ignore
    return new ComponentType(props, childrenElements);
  }
  console.log(type, props, childrenElements);

  return null;
}

export function render(el: ReflectElement, target: HTMLElement) {
  if (el) {
    target.innerHTML = "";
    el.mount(target);
  }
}
