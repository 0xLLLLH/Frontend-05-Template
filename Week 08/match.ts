class State {
  // 当前状态匹配的字符
  ch: string;
  prev: State;
  next: State;

  constructor(ch: string, prev?: State, next?: State) {
    this.ch = ch;
    this.prev = prev || this;
    this.prev = next || this;
  }
  transfer(ch: string): State {
    if (ch === this.ch) {
      return this.next;
    }

    if (this.prev !== this) {
      return this.prev.transfer(ch);
    }

    return this;
  }
}

const STATE_END = "End";

function buildGraph(str: string) {
  const pre = Array(str.length).fill(0);
  // 根据KMP算法确定pre
  let j = 0;
  // 状态转移方程:
  // pre[0] = 0;
  // pre[1] = 0;
  // pre[i] = Pattern[i-1] === Pattern[pre[i-1]] ? pre[i-1] + 1 : 0;
  for (let i = 2; i < str.length; i++) {
    pre[i] = str[i - 1] === str[pre[i - 1]] ? pre[i - 1] + 1 : 0;
  }

  const stateList: State[] = [];

  for (const ch of str) {
    stateList.push(new State(ch));
  }

  // 结束状态
  stateList.push(new State(STATE_END));

  for (let i = 0; i < str.length; i++) {
    stateList[i].next = stateList[i + 1];
    // 每个字符匹配失败都回到前驱节点
    stateList[i].prev = stateList[pre[i]];
  }

  return stateList[0];
}

function match(source: string, initialState: State) {
  let state = initialState;

  for (const ch of source) {
    state = state.transfer(ch);
  }

  // 因为除了终止状态以外ch都是单个字符，所以可以直接这样判断
  return state.ch === STATE_END;
}

// 一次构建多次使用
const initialState = buildGraph("abcabx");

// 测试用例
console.log(match("abcabxabc", initialState) === true);
console.log(match("abc", initialState) === false);
console.log(match("abcabx", initialState) === true);
console.log(match("xxabcabxabc", initialState) === true);
console.log(match("xxabc", initialState) === false);
console.log(match("xxabcabx", initialState) === true);
