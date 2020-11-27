"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HumanPlayer = {
    name: "玩家",
    token: "⭕️",
    value: 1,
};
const AIPlayer = {
    name: "人工智障",
    token: "❌",
    value: 2,
};
const BoardTokenMap = {
    [HumanPlayer.value]: HumanPlayer.token,
    [AIPlayer.value]: AIPlayer.token,
};
class Game {
    constructor(board, BoardSize = 3, WinCount = 3) {
        this.board = board;
        this.BoardSize = BoardSize;
        this.WinCount = WinCount;
        this.PlayerTurnOrder = [HumanPlayer, AIPlayer];
        this.currentTurn = 0;
        /**
         * 渲染棋盘，考虑由外部实现。传参or继承
         */
        this.renderBoard = () => {
            this.board.innerHTML = "";
            this.board.appendChild(document.createTextNode(`第${this.currentTurn + 1}回合，轮到${this.PlayerTurnOrder[this.currentTurn % 2].name}操作`));
            this.board.appendChild(document.createElement("br"));
            for (let i = 0; i < this.BoardSize; i++) {
                for (let j = 0; j < this.BoardSize; j++) {
                    if (j === 0 && i !== 0) {
                        this.board.appendChild(document.createElement("br"));
                    }
                    const square = document.createElement("div");
                    square.setAttribute("class", "square");
                    square.appendChild(document.createTextNode(BoardTokenMap[this.pattern[i][j]] || ""));
                    square.addEventListener("click", () => {
                        if (this.PlayerTurnOrder[this.currentTurn % 2].value ===
                            HumanPlayer.value &&
                            !this.pattern[i][j]) {
                            this.humanMove({ row: i, col: j });
                        }
                    });
                    this.board.appendChild(square);
                }
            }
        };
        /**
         * 检查位置是否和否
         * @param pos 想要落子的位置
         */
        this.posInRange = (pos) => pos.row >= 0 &&
            pos.row < this.BoardSize &&
            pos.col >= 0 &&
            pos.col < this.BoardSize;
        /**
         * 统计某个点在指定方向上有多少个和他相同且相连的棋子，同时统计正向和方向
         * @param startPos 起始位置
         * @param direction 方向
         * @returns 返回连子数及两边空的位置数（棋盘外、对手棋子都算边界）
         */
        this.countByDirection = (pattern, startPos, direction) => {
            let count = 1;
            let spaceCount = 0;
            const byVector = (vector) => {
                let nextPos = {
                    row: startPos.row + vector[0],
                    col: startPos.col + vector[1],
                };
                while (this.posInRange(nextPos)) {
                    if (pattern[startPos.row][startPos.col] ===
                        pattern[nextPos.row][nextPos.col]) {
                        nextPos = {
                            row: nextPos.row + vector[0],
                            col: nextPos.col + vector[1],
                        };
                        count++;
                    }
                    else {
                        if (pattern[nextPos.row][nextPos.col] === 0) {
                            spaceCount++;
                        }
                        break;
                    }
                }
            };
            byVector(direction);
            byVector([-direction[0], -direction[1]]);
            return [count, spaceCount];
        };
        /** 人工移动 */
        this.humanMove = (p) => {
            const currentPlayer = this.PlayerTurnOrder[this.currentTurn % 2];
            this.pattern[p.row][p.col] = currentPlayer.value;
            if (this.checkWin(this.pattern, p)) {
                this.currentTurn++;
                this.renderBoard();
                window.alert(`${currentPlayer.name} 胜利 !`);
            }
            else {
                this.currentTurn++;
                this.renderBoard();
                setTimeout(() => {
                    this.AIMove();
                }, 0);
            }
        };
        /** AI移动 */
        this.AIMove = () => {
            const currentPlayer = this.PlayerTurnOrder[this.currentTurn % 2];
            const bestChoice = this.findBestChoice();
            if (bestChoice) {
                const p = bestChoice[1];
                this.pattern[p.row][p.col] = currentPlayer.value;
                this.currentTurn++;
                if (this.checkWin(this.pattern, p)) {
                    window.alert(`${currentPlayer.name} 胜利 !`);
                }
            }
            this.renderBoard();
        };
        /**
         * 根据局面计算一个评分。
         * 目前采用比较简单的评分方式
         */
        this.evalPattern = (pattern, player) => {
            const Base = 10;
            let score = 0;
            for (let i = 0; i < this.BoardSize; i++) {
                for (let j = 0; j < this.BoardSize; j++) {
                    if (!pattern[i][j])
                        continue;
                    for (let dir of Game.directions) {
                        // 注意！此处因为统计时没去重，会导致评分额外放大，4颗连续棋子分数会额外放大4倍
                        const [count, spaceCount] = this.countByDirection(pattern, { row: i, col: j }, dir);
                        let evalScore = Math.pow(Base, count);
                        if (count < this.WinCount && spaceCount < 1) {
                            evalScore / Base;
                        }
                        if (pattern[i][j] === player.value) {
                            score += evalScore;
                        }
                    }
                }
            }
            return score;
        };
        /**
         * 寻找当前玩家的「最佳」选择。
         * @param alpha 第一个玩家能获得的最大分数
         * @param beta 第二个玩家能获得的最大分数
         * @param deep 最大搜索深度
         */
        this.findBestChoice = (alpha = 0, beta = 0, deep = 4) => {
            /** 根据当前回合数确定当前的玩家 */
            const player = this.PlayerTurnOrder[this.currentTurn % 2];
            // 让己方局面最优的位置及分数
            let maxChoice = null;
            let win = false;
            // 为了缩小规模只考虑已有棋子附近的位置
            const notSoFar = (p) => {
                for (let dir of Game.directions) {
                    for (let dis = 1; dis <= 1; dis++) {
                        const positive = {
                            row: p.row + dir[0] * dis,
                            col: p.col + dir[1] * dis,
                        };
                        if (this.posInRange(positive) &&
                            this.pattern[positive.row][positive.col]) {
                            return true;
                        }
                        const negative = {
                            row: p.row - dir[0] * dis,
                            col: p.col - dir[1] * dis,
                        };
                        if (this.posInRange(negative) &&
                            this.pattern[negative.row][negative.col]) {
                            return true;
                        }
                    }
                }
                return false;
            };
            // 目前简单粗暴的遍历所有可以下的位置
            for (let i = 0; i < this.BoardSize; i++) {
                for (let j = 0; j < this.BoardSize; j++) {
                    if (!this.pattern[i][j] && notSoFar({ row: i, col: j })) {
                        this.pattern[i][j] = player.value;
                        // 评估下该子后，己方的局面评分
                        let score = this.evalPattern(this.pattern, player);
                        // alpha-beta 剪枝。如果当前局面分数小于alpha-beta的分数，对手的选择只会让该分数减小而不会增大。可以不用继续递归。
                        // 第一个玩家取alpha，第二个玩家取beta
                        if (this.currentTurn % 2 === 0 && score < alpha) {
                            // continue前恢复棋盘
                            this.pattern[i][j] = 0;
                            continue;
                        }
                        else if (this.currentTurn % 2 === 1 && score < beta) {
                            // 恢复
                            this.pattern[i][j] = 0;
                            continue;
                        }
                        // 检查此时是否已经胜利
                        win = win || this.checkWin(this.pattern, { row: i, col: j });
                        // 剪枝，若已经可以胜利则不继续搜索。另外若计算步数较多也不再继续
                        if (!win && deep) {
                            this.currentTurn++;
                            // 评估下该子后，对方的的最佳选择。
                            // deep每轮-1
                            const opBest = this.findBestChoice(alpha, beta, deep - 1);
                            // 恢复
                            this.currentTurn--;
                            if (opBest) {
                                // 综合当前分数和对方可以下出的最佳分数
                                score = score - opBest[0];
                            }
                        }
                        if (!maxChoice || score > maxChoice[0]) {
                            maxChoice = [score, { row: i, col: j }];
                        }
                        if (this.currentTurn % 2 === 0) {
                            alpha = Math.max(alpha, score);
                        }
                        else {
                            beta = Math.max(beta, score);
                        }
                        // 恢复
                        this.pattern[i][j] = 0;
                    }
                }
            }
            return maxChoice;
        };
        this.pattern = Array.from({ length: BoardSize }, () => []);
        this.renderBoard();
    }
    /**
     * 检查下完当前棋子后是否胜利
     * @param pattern 当前局面
     * @param point 最后下的位置
     */
    checkWin(pattern, point) {
        for (let dir of Game.directions) {
            const [count] = this.countByDirection(pattern, point, dir);
            if (count >= this.WinCount)
                return true;
        }
        return false;
    }
}
/** 棋子连接方向。需要注意的是，并不用写八个向量，因为相反的两个向量是一起统计的，检查时生成相反反向即可 */
Game.directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
];
exports.default = Game;
