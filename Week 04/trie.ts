export default class Trie {
  static $ = Symbol("end of string");

  root = Object.create(null);

  add(str: string) {
    let node = this.root;
    for (let ch of str) {
      if (!node[ch]) {
        node[ch] = Object.create(null);
      }
      node = node[ch];
    }

    node[Trie.$] = (node[Trie.$] || 0) + 1;
  }

  count(str: string): number {
    let node = this.root;
    for (let ch of str) {
      if (!node[ch]) {
        return 0;
      }
      node = node[ch];
    }
    return node[Trie.$] || 0;
  }

  most(): [string, number] {
    let maxCount = 0;
    let mostWord = "";

    const dfs = (node: object, str: string) => {
      if (node[Trie.$] > maxCount) {
        maxCount = node[Trie.$];
        mostWord = str;
      }

      for (let ch in node) {
        dfs(node[ch], str + ch);
      }
    };

    dfs(this.root, "");

    return [mostWord, maxCount];
  }
}
