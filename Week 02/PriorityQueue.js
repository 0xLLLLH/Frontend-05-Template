/**
 * 基于二叉堆的优先队列
 * 注释中的「大」和「小」都是按大顶堆来表述，以便于理解
 */
export default class PriorityQueue {
    constructor(compareFn, data = []) {
        /** 使用数组存储树，下标从1开始 */
        this.data = [];
        this.inRange = (idx) => idx >= 1 && idx <= this.lastIdx;
        /** 返回父节点索引，如果是根节点，返回null */
        this.parentIdx = (idx) => idx === 1 ? null : Math.floor(idx / 2);
        /**
         * 用于判断某个节点的左右孩子哪个值比较「大」
         * 叶子节点返回null
         */
        this.childIdx = (idx) => {
            const left = idx * 2;
            const right = idx * 2 + 1;
            if (this.inRange(left) && this.inRange(right)) {
                return this.compareFn(this.data[left], this.data[right]) > 0
                    ? left
                    : right;
            }
            else {
                return this.inRange(left) ? left : this.inRange(right) ? right : null;
            }
        };
        this.compareFn = compareFn;
        for (const x of data) {
            this.enqueue(x);
        }
    }
    get lastIdx() {
        return this.data.length - 1;
    }
    empty() {
        return this.data.length <= 1;
    }
    swap(ida, idb) {
        this.data[0] = this.data[ida];
        this.data[ida] = this.data[idb];
        this.data[idb] = this.data[0];
    }
    /**
     * 入队列
     */
    enqueue(item) {
        // 如果是空数组。额外push一个来占位
        if (!this.data.length) {
            this.data.push(item);
        }
        this.data.push(item);
        // 从最后一个元素开始向上整形
        // 获取最后一个元素的下标
        let idx = this.lastIdx;
        let parentIdx = this.parentIdx(idx);
        while (parentIdx) {
            // 比较结果小于0，父节点「小」于子节点，需要进行交换
            if (this.compareFn(this.data[parentIdx], this.data[idx]) < 0) {
                this.swap(idx, parentIdx);
                // 往根节点移动
                idx = parentIdx;
                parentIdx = this.parentIdx(idx);
            }
            else {
                break;
            }
        }
    }
    /**
     * 出队列
     */
    dequeue() {
        if (this.empty()) {
            return null;
        }
        if (this.lastIdx === 1) {
            return this.data.pop();
        }
        // 1代表根节点
        let idx = 1;
        // 先将根节点移动到最后
        this.swap(idx, this.lastIdx);
        const result = this.data.pop();
        // 注意需要在pop后进行childIdx的计算
        let childIdx = this.childIdx(idx);
        // 向下整形
        while (childIdx) {
            if (this.compareFn(this.data[idx], this.data[childIdx]) < 0) {
                this.swap(idx, childIdx);
                idx = childIdx;
                childIdx = this.childIdx(idx);
            }
            else {
                break;
            }
        }
        return result;
    }
}
