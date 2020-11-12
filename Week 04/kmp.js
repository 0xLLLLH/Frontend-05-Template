export default function KMP(source, pattern) {
    const pre = Array(pattern.length).fill(0);
    let j = 0;
    // 状态转移方程:
    // pre[0] = 0;
    // pre[1] = 0;
    // pre[i] = Pattern[i-1] === Pattern[pre[i-1]] ? pre[i-1] + 1 : 0;
    for (let i = 2; i < pattern.length; i++) {
        pre[i] = pattern[i - 1] === pattern[pre[i - 1]] ? pre[i - 1] + 1 : 0;
    }
    console.log(pre);
    for (let i = 0; i < source.length; i++) {
        // 若不匹配则进行回退
        while (j && source[i] !== pattern[j]) {
            j = pre[j];
        }
        // 匹配则比较后续字符
        if (source[i] === pattern[j]) {
            j++;
        }
        // 匹配长度等于pattern长度，已完全匹配
        if (j === pattern.length) {
            return i - j + 1;
        }
    }
    return -1;
}
