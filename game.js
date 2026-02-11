// 2048 遊戲類別
class Game2048 {
    constructor(size = 4) {
        this.size = size;
        this.grid = Array(size).fill(null).map(() => Array(size).fill(0));
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem(`best2048Score_${size}`) || '0');
        this.gameOver = false;
        this.won = false;
        this.addRandomTile();
        this.addRandomTile();
    }

    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }
        if (emptyCells.length > 0) {
            const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[row][col] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    move(direction) {
        let moved = false;
        const oldGrid = JSON.stringify(this.grid);

        if (direction === 'up') {
            for (let col = 0; col < this.size; col++) {
                const column = this.grid.map(row => row[col]).filter(val => val !== 0);
                const merged = this.mergeTiles(column);
                for (let row = 0; row < this.size; row++) {
                    this.grid[row][col] = merged[row] || 0;
                }
            }
        } else if (direction === 'down') {
            for (let col = 0; col < this.size; col++) {
                const column = this.grid.map(row => row[col]).filter(val => val !== 0).reverse();
                const merged = this.mergeTiles(column).reverse();
                // 從底部開始填充
                while (merged.length < this.size) merged.unshift(0);
                for (let row = 0; row < this.size; row++) {
                    this.grid[row][col] = merged[row];
                }
            }
        } else if (direction === 'left') {
            for (let row = 0; row < this.size; row++) {
                const line = this.grid[row].filter(val => val !== 0);
                this.grid[row] = this.mergeTiles(line);
                while (this.grid[row].length < this.size) this.grid[row].push(0);
            }
        } else if (direction === 'right') {
            for (let row = 0; row < this.size; row++) {
                const line = this.grid[row].filter(val => val !== 0).reverse();
                const merged = this.mergeTiles(line).reverse();
                this.grid[row] = merged;
                while (this.grid[row].length < this.size) this.grid[row].unshift(0);
            }
        }

        moved = oldGrid !== JSON.stringify(this.grid);

        if (moved) {
            this.addRandomTile();
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                localStorage.setItem(`best2048Score_${this.size}`, this.bestScore.toString());
            }
            this.checkGameStatus();
        }

        return moved;
    }

    mergeTiles(line) {
        const result = [];
        let i = 0;
        while (i < line.length) {
            if (i < line.length - 1 && line[i] === line[i + 1]) {
                const value = line[i] * 2;
                result.push(value);
                this.score += value;
                if (value === 2048) this.won = true;
                i += 2;
            } else {
                result.push(line[i]);
                i++;
            }
        }
        return result;
    }

    checkGameStatus() {
        // Check if game is over
        if (this.canMove()) {
            this.gameOver = false;
        } else {
            this.gameOver = true;
        }
    }

    canMove() {
        // Check for empty cells
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) return true;
            }
        }

        // Check for possible merges
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const current = this.grid[i][j];
                if (j < this.size - 1 && current === this.grid[i][j + 1]) return true;
                if (i < this.size - 1 && current === this.grid[i + 1][j]) return true;
            }
        }

        return false;
    }
}

// Oh h1 遊戲類別 - 二進制邏輯益智遊戲
class GameOhh1 {
    constructor(size = 6) {
        this.size = size;
        this.grid = Array(size).fill(null).map(() => Array(size).fill(0));
        this.fixed = Array(size).fill(null).map(() => Array(size).fill(false));
        this.gameOver = false;
        this.generatePuzzle();
    }

    generatePuzzle() {
        // 生成完整解答
        this.generateSolution();

        // 移除部分格子作為謎題
        const totalCells = this.size * this.size;
        const cellsToReveal = Math.floor(totalCells * 0.35); // 約 35% 預填

        const positions = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                positions.push([i, j]);
            }
        }

        // 隨機打亂
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }

        // 保留部分格子為固定
        for (let i = 0; i < cellsToReveal; i++) {
            const [row, col] = positions[i];
            this.fixed[row][col] = true;
        }

        // 清空非固定格子
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (!this.fixed[i][j]) {
                    this.grid[i][j] = 0;
                }
            }
        }
    }

    generateSolution() {
        // 簡化版：使用回溯法生成有效解答
        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
        this.backtrack(0, 0);
    }

    backtrack(row, col) {
        if (row === this.size) return true;

        const nextRow = col === this.size - 1 ? row + 1 : row;
        const nextCol = col === this.size - 1 ? 0 : col + 1;

        const colors = [1, 2];
        for (let i = colors.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [colors[i], colors[j]] = [colors[j], colors[i]];
        }

        for (const color of colors) {
            this.grid[row][col] = color;

            if (this.isValidPlacement(row, col) && this.backtrack(nextRow, nextCol)) {
                return true;
            }

            this.grid[row][col] = 0;
        }

        return false;
    }

    isValidPlacement(row, col) {
        const color = this.grid[row][col];

        // 檢查橫向連續三個
        if (col >= 2) {
            if (this.grid[row][col] === this.grid[row][col - 1] &&
                this.grid[row][col] === this.grid[row][col - 2]) {
                return false;
            }
        }
        if (col >= 1 && col < this.size - 1) {
            if (this.grid[row][col] === this.grid[row][col - 1] &&
                this.grid[row][col] === this.grid[row][col + 1]) {
                return false;
            }
        }

        // 檢查縱向連續三個
        if (row >= 2) {
            if (this.grid[row][col] === this.grid[row - 1][col] &&
                this.grid[row][col] === this.grid[row - 2][col]) {
                return false;
            }
        }
        if (row >= 1 && row < this.size - 1) {
            if (this.grid[row][col] === this.grid[row - 1][col] &&
                this.grid[row][col] === this.grid[row + 1][col]) {
                return false;
            }
        }

        // 檢查該列顏色數量不超標
        let count1 = 0, count2 = 0;
        for (let c = 0; c < this.size; c++) {
            if (this.grid[row][c] === 1) count1++;
            if (this.grid[row][c] === 2) count2++;
        }
        if (count1 > this.size / 2 || count2 > this.size / 2) return false;

        // 檢查該欄顏色數量不超標
        count1 = 0;
        count2 = 0;
        for (let r = 0; r < this.size; r++) {
            if (this.grid[r][col] === 1) count1++;
            if (this.grid[r][col] === 2) count2++;
        }
        if (count1 > this.size / 2 || count2 > this.size / 2) return false;

        return true;
    }

    toggleCell(row, col) {
        if (this.fixed[row][col] || this.gameOver) return false;

        // 循環：0 → 1 → 2 → 0
        this.grid[row][col] = (this.grid[row][col] + 1) % 3;

        return true;
    }

    checkWin() {
        // 檢查是否所有格子都填滿
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) return false;
            }
        }

        // 檢查所有規則
        return this.validateAll();
    }

    validateAll() {
        // 檢查無連續三個
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size - 2; j++) {
                // 橫向
                if (this.grid[i][j] === this.grid[i][j + 1] &&
                    this.grid[i][j] === this.grid[i][j + 2] &&
                    this.grid[i][j] !== 0) {
                    return false;
                }
                // 縱向
                if (this.grid[j][i] === this.grid[j + 1][i] &&
                    this.grid[j][i] === this.grid[j + 2][i] &&
                    this.grid[j][i] !== 0) {
                    return false;
                }
            }
        }

        // 檢查每列每欄顏色數量相等
        for (let i = 0; i < this.size; i++) {
            let rowCount1 = 0, rowCount2 = 0;
            let colCount1 = 0, colCount2 = 0;

            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 1) rowCount1++;
                if (this.grid[i][j] === 2) rowCount2++;
                if (this.grid[j][i] === 1) colCount1++;
                if (this.grid[j][i] === 2) colCount2++;
            }

            if (rowCount1 !== rowCount2) return false;
            if (colCount1 !== colCount2) return false;
        }

        return true;
    }
}

// Nonogram 遊戲類別 - 數織/繪圖方塊益智遊戲
class GameNonogram {
    constructor(size = 5) {
        this.size = size;
        this.solution = Array(size).fill(null).map(() => Array(size).fill(0));
        this.grid = Array(size).fill(null).map(() => Array(size).fill(0));
        this.rowHints = [];
        this.colHints = [];
        this.gameOver = false;
        this.generatePuzzle();
    }

    generatePuzzle() {
        // 生成隨機圖案
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                // 約50%機率填滿，但確保不會全空或全滿
                this.solution[i][j] = Math.random() < 0.5 ? 1 : 0;
            }
        }

        // 確保至少有一些填滿的格子
        let filledCount = 0;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.solution[i][j] === 1) filledCount++;
            }
        }

        // 如果太少或太多，重新生成
        const minFilled = Math.floor(this.size * this.size * 0.2);
        const maxFilled = Math.floor(this.size * this.size * 0.8);
        if (filledCount < minFilled || filledCount > maxFilled) {
            return this.generatePuzzle();
        }

        // 計算提示數字
        this.calculateAllHints();
    }

    calculateAllHints() {
        // 計算每行的提示
        this.rowHints = [];
        for (let i = 0; i < this.size; i++) {
            this.rowHints.push(this.calculateHints(this.solution[i]));
        }

        // 計算每列的提示
        this.colHints = [];
        for (let j = 0; j < this.size; j++) {
            const col = [];
            for (let i = 0; i < this.size; i++) {
                col.push(this.solution[i][j]);
            }
            this.colHints.push(this.calculateHints(col));
        }
    }

    calculateHints(line) {
        const hints = [];
        let count = 0;

        for (let i = 0; i < line.length; i++) {
            if (line[i] === 1) {
                count++;
            } else if (count > 0) {
                hints.push(count);
                count = 0;
            }
        }

        if (count > 0) {
            hints.push(count);
        }

        return hints.length > 0 ? hints : [0];
    }

    toggleCell(row, col) {
        if (this.gameOver) return false;

        // 循環：0（空）→ 1（填滿）→ 2（標記X）→ 0
        this.grid[row][col] = (this.grid[row][col] + 1) % 3;

        return true;
    }

    checkWin() {
        // 改為驗證玩家答案是否符合所有行列提示（支援多種正確解法）

        // 檢查每行提示
        for (let i = 0; i < this.size; i++) {
            const row = [];
            for (let j = 0; j < this.size; j++) {
                row.push(this.grid[i][j] === 1 ? 1 : 0);
            }
            const playerHints = this.calculateHints(row);
            if (JSON.stringify(playerHints) !== JSON.stringify(this.rowHints[i])) {
                return false;
            }
        }

        // 檢查每列提示
        for (let j = 0; j < this.size; j++) {
            const col = [];
            for (let i = 0; i < this.size; i++) {
                col.push(this.grid[i][j] === 1 ? 1 : 0);
            }
            const playerHints = this.calculateHints(col);
            if (JSON.stringify(playerHints) !== JSON.stringify(this.colHints[j])) {
                return false;
            }
        }

        return true;
    }
}

// Nerdle 遊戲類別 - 數學算式猜謎
class GameNerdle {
    constructor(maxGuesses = 6) {
        this.equation = this.generateEquation(); // 正確答案（8位字串）
        this.guesses = [];      // 已猜測的算式
        this.results = [];      // 每次猜測的顏色結果
        this.maxGuesses = maxGuesses; // 猜測次數
        this.currentInput = ''; // 當前輸入
        this.gameOver = false;
        this.won = false;
    }

    // 生成有效的 8 位數學算式
    generateEquation() {
        const equations = [];

        // 生成 a op b = c 格式的算式
        for (let a = 1; a <= 99; a++) {
            for (let b = 1; b <= 99; b++) {
                // 加法
                let result = a + b;
                let eq = `${a}+${b}=${result}`;
                if (eq.length === 8) equations.push(eq);

                // 減法
                if (a > b) {
                    result = a - b;
                    eq = `${a}-${b}=${result}`;
                    if (eq.length === 8) equations.push(eq);
                }

                // 乘法
                result = a * b;
                eq = `${a}*${b}=${result}`;
                if (eq.length === 8) equations.push(eq);

                // 除法（整除）
                if (b !== 0 && a % b === 0) {
                    result = a / b;
                    eq = `${a}/${b}=${result}`;
                    if (eq.length === 8) equations.push(eq);
                }
            }
        }

        // 隨機選擇一個
        return equations[Math.floor(Math.random() * equations.length)];
    }

    // 驗證玩家輸入的算式是否有效
    validateInput(input) {
        if (input.length !== 8) return { valid: false, error: 'Must have 8 characters' };

        // 檢查格式：必須包含一個等號
        const eqIndex = input.indexOf('=');
        if (eqIndex === -1) return { valid: false, error: 'Must include equal sign' };
        if (input.indexOf('=', eqIndex + 1) !== -1) return { valid: false, error: 'Must include only one equal sign' };

        const leftSide = input.substring(0, eqIndex);
        const rightSide = input.substring(eqIndex + 1);

        // 右邊必須是數字
        if (!/^\d+$/.test(rightSide)) return { valid: false, error: 'Right side must be a number' };

        // 左邊必須是有效算式
        if (!/^[\d+\-*/]+$/.test(leftSide)) return { valid: false, error: 'Left side contains invalid characters' };
        if (/^[+\-*/]/.test(leftSide) || /[+\-*/]$/.test(leftSide)) {
            return { valid: false, error: 'Operator position is incorrect' };
        }

        // 計算左邊
        try {
            const calculated = Function('"use strict"; return (' + leftSide + ')')();
            if (calculated !== parseInt(rightSide)) {
                return { valid: false, error: 'equation is not correct' };
            }
        } catch (e) {
            return { valid: false, error: 'invalid equation' };
        }

        return { valid: true };
    }

    // 比對猜測並返回顏色陣列
    checkGuess(guess) {
        const result = new Array(8).fill('black');
        const answerChars = this.equation.split('');
        const guessChars = guess.split('');
        const usedAnswer = new Array(8).fill(false);
        const usedGuess = new Array(8).fill(false);

        // 第一輪：找出綠色（位置正確）
        for (let i = 0; i < 8; i++) {
            if (guessChars[i] === answerChars[i]) {
                result[i] = 'green';
                usedAnswer[i] = true;
                usedGuess[i] = true;
            }
        }

        // 第二輪：找出紫色（存在但位置錯誤）
        for (let i = 0; i < 8; i++) {
            if (!usedGuess[i]) {
                for (let j = 0; j < 8; j++) {
                    if (!usedAnswer[j] && guessChars[i] === answerChars[j]) {
                        result[i] = 'purple';
                        usedAnswer[j] = true;
                        break;
                    }
                }
            }
        }

        return result;
    }

    // 提交猜測
    submitGuess(guess) {
        if (this.gameOver) return { success: false, error: '遊戲已結束' };

        const validation = this.validateInput(guess);
        if (!validation.valid) return { success: false, error: validation.error };

        const result = this.checkGuess(guess);
        this.guesses.push(guess);
        this.results.push(result);

        // 檢查是否獲勝
        if (guess === this.equation) {
            this.won = true;
            this.gameOver = true;
        } else if (this.guesses.length >= this.maxGuesses) {
            this.gameOver = true;
        }

        this.currentInput = '';
        return { success: true, result };
    }

    // 輸入字元
    inputChar(char) {
        if (this.gameOver) return false;
        if (this.currentInput.length < 8) {
            this.currentInput += char;
            return true;
        }
        return false;
    }

    // 刪除字元
    deleteChar() {
        if (this.currentInput.length > 0) {
            this.currentInput = this.currentInput.slice(0, -1);
            return true;
        }
        return false;
    }
}

// Minesweeper 踩地雷遊戲類別
class GameMinesweeper {
    constructor(rows, cols, totalMines) {
        this.rows = rows;
        this.cols = cols;
        this.totalMines = totalMines;
        this.grid = Array(rows).fill(null).map(() =>
            Array(cols).fill(null).map(() => ({
                mine: false,
                revealed: false,
                flagged: false,
                adjacentMines: 0
            }))
        );
        this.gameOver = false;
        this.won = false;
        this.minesPlaced = false;
        this.flagCount = 0;
        this.revealedCount = 0;
        this.safeCells = rows * cols - totalMines;
    }

    placeMines(firstRow, firstCol) {
        // 佈雷，保證首次點擊的 3×3 區域無雷
        const safeZone = new Set();
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const r = firstRow + dr, c = firstCol + dc;
                if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
                    safeZone.add(`${r},${c}`);
                }
            }
        }

        let placed = 0;
        while (placed < this.totalMines) {
            const r = Math.floor(Math.random() * this.rows);
            const c = Math.floor(Math.random() * this.cols);
            if (!this.grid[r][c].mine && !safeZone.has(`${r},${c}`)) {
                this.grid[r][c].mine = true;
                placed++;
            }
        }

        this.calculateAdjacent();
        this.minesPlaced = true;
    }

    calculateAdjacent() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c].mine) continue;
                let count = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        const nr = r + dr, nc = c + dc;
                        if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols && this.grid[nr][nc].mine) {
                            count++;
                        }
                    }
                }
                this.grid[r][c].adjacentMines = count;
            }
        }
    }

    reveal(row, col) {
        if (this.gameOver) return 'gameover';
        const cell = this.grid[row][col];
        if (cell.revealed || cell.flagged) return 'skip';

        if (!this.minesPlaced) {
            this.placeMines(row, col);
        }

        cell.revealed = true;
        this.revealedCount++;

        if (cell.mine) {
            this.gameOver = true;
            this.won = false;
            return 'mine';
        }

        // 空白格自動展開（flood fill）
        if (cell.adjacentMines === 0) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = row + dr, nc = col + dc;
                    if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
                        this.reveal(nr, nc);
                    }
                }
            }
        }

        // 檢查勝利
        if (this.revealedCount === this.safeCells) {
            this.gameOver = true;
            this.won = true;
            return 'win';
        }

        return 'ok';
    }

    toggleFlag(row, col) {
        if (this.gameOver) return false;
        const cell = this.grid[row][col];
        if (cell.revealed) return false;

        cell.flagged = !cell.flagged;
        this.flagCount += cell.flagged ? 1 : -1;
        return true;
    }

    revealAll() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                this.grid[r][c].revealed = true;
            }
        }
    }
}

// Mastermind 猜色碼遊戲類別
class GameMastermind {
    constructor(positions, colors, maxGuesses) {
        this.positions = positions;
        this.numColors = colors;
        this.maxGuesses = maxGuesses;
        this.colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange', 'brown', 'white'].slice(0, colors);
        this.colorMap = {
            red: '#ef4444',
            green: '#22c55e',
            blue: '#3b82f6',
            yellow: '#eab308',
            purple: '#a855f7',
            orange: '#f97316',
            brown: '#92400e',
            white: '#e5e7eb'
        };
        this.secretCode = this.generateCode();
        this.guesses = [];
        this.feedback = [];
        this.currentGuess = [];
        this.gameOver = false;
        this.won = false;
    }

    generateCode() {
        const code = [];
        for (let i = 0; i < this.positions; i++) {
            code.push(this.colors[Math.floor(Math.random() * this.numColors)]);
        }
        return code;
    }

    addColorToGuess(color) {
        if (this.currentGuess.length < this.positions) {
            this.currentGuess.push(color);
            return true;
        }
        return false;
    }

    removeLastColor() {
        if (this.currentGuess.length > 0) {
            this.currentGuess.pop();
            return true;
        }
        return false;
    }

    clearGuess() {
        this.currentGuess = [];
    }

    submitGuess() {
        if (this.currentGuess.length !== this.positions) {
            return { success: false, error: 'Incomplete guess' };
        }

        const feedback = this.calculateFeedback(this.currentGuess);
        this.guesses.push([...this.currentGuess]);
        this.feedback.push(feedback);
        this.currentGuess = [];

        // Check win
        if (feedback.black === this.positions) {
            this.gameOver = true;
            this.won = true;
        } else if (this.guesses.length >= this.maxGuesses) {
            this.gameOver = true;
            this.won = false;
        }

        return { success: true, feedback };
    }

    calculateFeedback(guess) {
        const secretCopy = [...this.secretCode];
        const guessCopy = [...guess];
        let black = 0;
        let white = 0;

        // First pass: find black pegs (exact matches)
        for (let i = this.positions - 1; i >= 0; i--) {
            if (guessCopy[i] === secretCopy[i]) {
                black++;
                secretCopy.splice(i, 1);
                guessCopy.splice(i, 1);
            }
        }

        // Second pass: find white pegs (color matches in wrong position)
        for (let i = 0; i < guessCopy.length; i++) {
            const index = secretCopy.indexOf(guessCopy[i]);
            if (index !== -1) {
                white++;
                secretCopy.splice(index, 1);
            }
        }

        return { black, white };
    }
}

// KenKen 算術拉丁方遊戲類別
class GameKenKen {
    constructor(size, maxMistakes = 5) {
        this.size = size;
        this.solution = this.generateLatinSquare();
        this.cages = [];
        this.partitionIntoCages();
        this.assignOperations();

        // Player grid
        this.grid = Array(size).fill(null).map(() =>
            Array(size).fill(null).map(() => ({ value: 0, notes: new Set() }))
        );

        this.selectedCell = null;
        this.mistakes = 0;
        this.maxMistakes = maxMistakes;
        this.gameOver = false;
    }

    // Generate a valid Latin square using backtracking
    generateLatinSquare() {
        const grid = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
        const numbers = Array.from({ length: this.size }, (_, i) => i + 1);

        const backtrack = (row, col) => {
            if (row === this.size) return true;

            const nextRow = col === this.size - 1 ? row + 1 : row;
            const nextCol = col === this.size - 1 ? 0 : col + 1;

            // Shuffle numbers for randomness
            const shuffled = [...numbers].sort(() => Math.random() - 0.5);

            for (const num of shuffled) {
                if (this.isValidPlacement(grid, row, col, num)) {
                    grid[row][col] = num;
                    if (backtrack(nextRow, nextCol)) return true;
                    grid[row][col] = 0;
                }
            }
            return false;
        };

        backtrack(0, 0);
        return grid;
    }

    isValidPlacement(grid, row, col, num) {
        // Check row
        for (let c = 0; c < this.size; c++) {
            if (grid[row][c] === num) return false;
        }
        // Check column
        for (let r = 0; r < this.size; r++) {
            if (grid[r][col] === num) return false;
        }
        return true;
    }

    // Partition grid into cages using region growing
    partitionIntoCages() {
        const visited = Array(this.size).fill(null).map(() => Array(this.size).fill(false));
        const cages = [];

        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (!visited[r][c]) {
                    const cage = this.growCage(r, c, visited);
                    cages.push(cage);
                }
            }
        }

        this.cages = cages;
    }

    growCage(startRow, startCol, visited) {
        const maxSize = Math.min(4, this.size); // Cages up to 4 cells
        const targetSize = Math.floor(Math.random() * maxSize) + 1;
        const cage = [{ row: startRow, col: startCol }];
        visited[startRow][startCol] = true;

        while (cage.length < targetSize) {
            const neighbors = this.getUnvisitedNeighbors(cage, visited);
            if (neighbors.length === 0) break;

            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            cage.push(next);
            visited[next.row][next.col] = true;
        }

        return cage;
    }

    getUnvisitedNeighbors(cage, visited) {
        const neighbors = [];
        const cageSet = new Set(cage.map(c => `${c.row},${c.col}`));

        for (const cell of cage) {
            const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
            for (const [dr, dc] of dirs) {
                const nr = cell.row + dr;
                const nc = cell.col + dc;
                const key = `${nr},${nc}`;

                if (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size &&
                    !visited[nr][nc] && !cageSet.has(key)) {
                    if (!neighbors.find(n => n.row === nr && n.col === nc)) {
                        neighbors.push({ row: nr, col: nc });
                    }
                }
            }
        }

        return neighbors;
    }

    // Assign operations and targets to cages
    assignOperations() {
        for (const cage of this.cages) {
            const values = cage.map(c => this.solution[c.row][c.col]);

            if (cage.length === 1) {
                cage.operation = null;
                cage.target = values[0];
            } else if (cage.length === 2) {
                // Can use any operation
                const ops = ['+', '-', '×', '÷'];
                const validOps = [];

                for (const op of ops) {
                    if (op === '÷' && Math.max(...values) % Math.min(...values) !== 0) continue;
                    validOps.push(op);
                }

                const selectedOp = validOps[Math.floor(Math.random() * validOps.length)];
                cage.operation = selectedOp;
                cage.target = this.calculateTarget(selectedOp, values);
            } else {
                // 3+ cells: only + or ×
                const op = Math.random() < 0.7 ? '+' : '×';
                cage.operation = op;
                cage.target = this.calculateTarget(op, values);
            }
        }
    }

    calculateTarget(op, values) {
        if (op === '+') return values.reduce((a, b) => a + b, 0);
        if (op === '×') return values.reduce((a, b) => a * b, 1);
        if (op === '-') return Math.abs(values[0] - values[1]);
        if (op === '÷') return Math.max(...values) / Math.min(...values);
        return values[0];
    }

    // Get cage containing a cell
    getCageForCell(row, col) {
        return this.cages.find(cage =>
            cage.some(c => c.row === row && c.col === col)
        );
    }

    // Get cage index
    getCageIndex(row, col) {
        return this.cages.findIndex(cage =>
            cage.some(c => c.row === row && c.col === col)
        );
    }

    // Set cell value
    setValue(row, col, value) {
        if (this.gameOver) return false;

        this.grid[row][col].value = value;
        this.grid[row][col].notes.clear();

        // Check for mistakes
        if (value !== 0 && value !== this.solution[row][col]) {
            this.mistakes++;

            // Check if mistakes exceed limit
            if (this.mistakes >= this.maxMistakes) {
                this.gameOver = true;
            }
        }

        return true;
    }

    // Toggle note
    toggleNote(row, col, note) {
        if (this.grid[row][col].value !== 0) return;

        if (this.grid[row][col].notes.has(note)) {
            this.grid[row][col].notes.delete(note);
        } else {
            this.grid[row][col].notes.add(note);
        }
    }

    // Check if puzzle is complete and correct
    checkWin() {
        // Check if all cells filled
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c].value === 0) return false;
            }
        }

        // Check Latin square constraints
        for (let r = 0; r < this.size; r++) {
            const row = this.grid[r].map(cell => cell.value);
            if (new Set(row).size !== this.size) return false;
        }

        for (let c = 0; c < this.size; c++) {
            const col = this.grid.map(row => row[c].value);
            if (new Set(col).size !== this.size) return false;
        }

        // Check all cage constraints
        for (const cage of this.cages) {
            const values = cage.map(c => this.grid[c.row][c.col].value);
            const actual = this.calculateTarget(cage.operation || '+', values);
            if (actual !== cage.target) return false;
        }

        this.gameOver = true;
        return true;
    }

    // Get conflicts for UI highlighting
    getConflicts(row, col) {
        const conflicts = new Set();
        const value = this.grid[row][col].value;
        if (value === 0) return conflicts;

        // Check row conflicts
        for (let c = 0; c < this.size; c++) {
            if (c !== col && this.grid[row][c].value === value) {
                conflicts.add(`${row},${c}`);
            }
        }

        // Check column conflicts
        for (let r = 0; r < this.size; r++) {
            if (r !== row && this.grid[r][col].value === value) {
                conflicts.add(`${r},${col}`);
            }
        }

    }
}

// Pipe / Netwalk Game
class GamePipe {
    constructor(size) {
        this.size = size;
        this.grid = Array(size).fill(null).map(() => Array(size).fill(null));
        this.source = { row: Math.floor(size / 2), col: Math.floor(size / 2) };
        this.moves = 0;
        this.gameOver = false;

        this.generatePuzzle();
    }

    generatePuzzle() {
        // Step 1: Generate a spanning tree using DFS
        const visited = Array(this.size).fill(null).map(() => Array(this.size).fill(false));
        const connections = Array(this.size).fill(null).map(() =>
            Array(this.size).fill(null).map(() => ({ top: false, right: false, bottom: false, left: false }))
        );

        // DFS to create spanning tree with more branches (more bulbs)
        const dfs = (row, col, depth = 0) => {
            visited[row][col] = true;

            // Get neighbors in random order
            const directions = [
                { dr: -1, dc: 0, dir: 'top', opposite: 'bottom' },
                { dr: 0, dc: 1, dir: 'right', opposite: 'left' },
                { dr: 1, dc: 0, dir: 'bottom', opposite: 'top' },
                { dr: 0, dc: -1, dir: 'left', opposite: 'right' }
            ];

            // Shuffle directions
            for (let i = directions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [directions[i], directions[j]] = [directions[j], directions[i]];
            }

            // Limit connections per node to create more branches and leaf nodes (bulbs)
            // Source and early nodes can have more connections, later nodes have fewer
            const maxConnections = depth === 0 ? 4 : (depth < 3 ? 3 : 2);
            let connectionsMade = 0;

            for (const { dr, dc, dir, opposite } of directions) {
                if (connectionsMade >= maxConnections) break; // Limit connections to create more bulbs

                const newRow = row + dr;
                const newCol = col + dc;

                if (newRow >= 0 && newRow < this.size &&
                    newCol >= 0 && newCol < this.size &&
                    !visited[newRow][newCol]) {

                    // Create connection
                    connections[row][col][dir] = true;
                    connections[newRow][newCol][opposite] = true;
                    connectionsMade++;

                    dfs(newRow, newCol, depth + 1);
                }
            }
        };

        // Start DFS from source
        dfs(this.source.row, this.source.col);

        // Step 2: Convert connections to pipe types and rotations
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const conn = connections[r][c];
                const dirs = [];
                if (conn.top) dirs.push('top');
                if (conn.right) dirs.push('right');
                if (conn.bottom) dirs.push('bottom');
                if (conn.left) dirs.push('left');

                if (dirs.length === 0) continue;

                // Determine pipe type based on number of connections
                let type, correctRotation;

                if (dirs.length === 1) {
                    // Dead end - use bulb (light bulb terminal)
                    type = 'bulb';
                    // Determine bulb rotation based on connection direction
                    if (dirs[0] === 'top') correctRotation = 0;
                    else if (dirs[0] === 'right') correctRotation = 1;
                    else if (dirs[0] === 'bottom') correctRotation = 2;
                    else correctRotation = 3; // left
                } else if (dirs.length === 2) {
                    // Check if opposite sides (straight) or adjacent (corner)
                    if ((dirs.includes('top') && dirs.includes('bottom')) ||
                        (dirs.includes('left') && dirs.includes('right'))) {
                        type = 'straight';
                        correctRotation = dirs.includes('top') ? 1 : 0;
                    } else {
                        type = 'corner';
                        // Determine corner rotation
                        if (dirs.includes('top') && dirs.includes('right')) correctRotation = 0;
                        else if (dirs.includes('right') && dirs.includes('bottom')) correctRotation = 1;
                        else if (dirs.includes('bottom') && dirs.includes('left')) correctRotation = 2;
                        else correctRotation = 3; // top-left
                    }
                } else if (dirs.length === 3) {
                    type = 't';
                    // T-junction rotation
                    if (!dirs.includes('top')) correctRotation = 2; // bottom
                    else if (!dirs.includes('right')) correctRotation = 3; // left
                    else if (!dirs.includes('bottom')) correctRotation = 0; // top
                    else correctRotation = 1; // right
                } else {
                    type = 'cross';
                    correctRotation = 0;
                }

                // Randomize rotation
                const randomRotation = Math.floor(Math.random() * 4);

                this.grid[r][c] = {
                    type: type,
                    rotation: randomRotation,
                    correctRotation: correctRotation,
                    connected: false
                };
            }
        }

        // Mark source
        this.grid[this.source.row][this.source.col] = {
            type: 'source',
            rotation: 0,
            correctRotation: 0,
            connected: true
        };

        // Update initial connections
        this.updateConnections();
    }

    rotatePipe(row, col) {
        if (this.gameOver) return;
        if (!this.grid[row][col]) return;
        if (this.grid[row][col].type === 'source') return;

        this.grid[row][col].rotation = (this.grid[row][col].rotation + 1) % 4;
        this.moves++;
        this.updateConnections();
    }

    updateConnections() {
        // Reset all connections except source
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] && this.grid[r][c].type !== 'source') {
                    this.grid[r][c].connected = false;
                }
            }
        }

        // BFS from source
        const queue = [{ row: this.source.row, col: this.source.col }];
        const visited = new Set();
        visited.add(`${this.source.row},${this.source.col}`);

        while (queue.length > 0) {
            const { row, col } = queue.shift();
            const pipe = this.grid[row][col];
            if (!pipe) continue;

            // Get connections from this pipe
            const connections = this.getPipeConnections(pipe.type, pipe.rotation);

            // Check each direction
            const directions = [
                { dr: -1, dc: 0, dir: 'top', opposite: 'bottom' },
                { dr: 0, dc: 1, dir: 'right', opposite: 'left' },
                { dr: 1, dc: 0, dir: 'bottom', opposite: 'top' },
                { dr: 0, dc: -1, dir: 'left', opposite: 'right' }
            ];

            for (const { dr, dc, dir, opposite } of directions) {
                if (!connections[dir]) continue;

                const newRow = row + dr;
                const newCol = col + dc;
                const key = `${newRow},${newCol}`;

                if (newRow < 0 || newRow >= this.size ||
                    newCol < 0 || newCol >= this.size ||
                    visited.has(key)) continue;

                const neighborPipe = this.grid[newRow][newCol];
                if (!neighborPipe) continue;

                const neighborConnections = this.getPipeConnections(
                    neighborPipe.type,
                    neighborPipe.rotation
                );

                // Check if neighbor connects back
                if (neighborConnections[opposite]) {
                    neighborPipe.connected = true;
                    visited.add(key);
                    queue.push({ row: newRow, col: newCol });
                }
            }
        }
    }

    getPipeConnections(type, rotation) {
        const connections = { top: false, right: false, bottom: false, left: false };

        if (type === 'source') {
            return { top: true, right: true, bottom: true, left: true };
        }

        // Base connections (rotation 0)
        let base;
        if (type === 'bulb') {
            // Bulb has only one connection point (top for rotation 0)
            base = { top: true, right: false, bottom: false, left: false };
        } else if (type === 'straight') {
            base = { top: false, right: true, bottom: false, left: true }; // horizontal
        } else if (type === 'corner') {
            base = { top: true, right: true, bottom: false, left: false }; // top-right
        } else if (type === 't') {
            base = { top: true, right: true, bottom: true, left: false }; // no left
        } else if (type === 'cross') {
            return { top: true, right: true, bottom: true, left: true };
        }

        // Rotate connections clockwise
        // rotation 0: no change
        // rotation 1: top->right, right->bottom, bottom->left, left->top
        // rotation 2: top->bottom, right->left, bottom->top, left->right
        // rotation 3: top->left, right->top, bottom->right, left->bottom
        const dirs = ['top', 'right', 'bottom', 'left'];
        for (let i = 0; i < 4; i++) {
            const sourceDir = dirs[i];
            const targetDir = dirs[(i + rotation) % 4];
            connections[targetDir] = base[sourceDir];
        }

        return connections;
    }

    checkWin() {
        // All bulbs must be connected (lit)
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const cell = this.grid[r][c];
                if (cell && cell.type === 'bulb' && !cell.connected) {
                    return false; // Found an unlit bulb
                }
            }
        }
        this.gameOver = true;
        return true;
    }
}

// 甜心數獨 - Cute Sudoku Game


class SudokuGame {
    constructor() {
        this.board = [];
        this.solution = [];
        this.selectedCell = null;
        this.notesMode = false;
        this.notes = [];
        this.lastInputNumber = null; // 記錄上次輸入的數字
        this.mistakes = 0;
        this.maxMistakes = 10;
        this.timer = 0;
        this.timerInterval = null;
        this.gameOver = false;
        this.difficulty = 'medium';
        this.gameMode = 'normal'; // 'normal' 或 'killer' 或 '2048' 或 'ohh1' 或 'nonogram' 或 'nerdle'
        this.cages = []; // 殺手數獨的籠子
        this.cellToCage = []; // 每個格子對應的籠子索引
        this.game2048 = null; // 2048 遊戲實例
        this.gameOhh1 = null; // Oh h1 遊戲實例
        this.gameNonogram = null; // Nonogram 遊戲實例
        this.gameNerdle = null; // Nerdle 遊戲實例
        this.gameMinesweeper = null; // Minesweeper 遊戲實例
        this.gameMastermind = null; // Mastermind 遊戲實例
        this.gameKenKen = null; // KenKen 遊戲實例
        this.minesweeperMode = 'dig'; // 'dig' 或 'flag' - Minesweeper 操作模式
        this.difficultySettings = {
            easy: 38,      // 38 cells revealed
            medium: 30,    // 30 cells revealed
            hard: 24       // 24 cells revealed
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupMinesweeperControls();
        this.createFloatingDecorations();
        this.newGame();
    }

    newGame() {
        this.difficulty = document.getElementById('difficulty').value;
        this.gameMode = document.getElementById('game-mode').value;

        // 2048 模式
        if (this.gameMode === '2048') {
            // 根據難度選擇網格大小：簡單4x4、中等5x5、困難6x6
            const size = this.difficulty === 'easy' ? 4 :
                this.difficulty === 'medium' ? 5 : 6;
            this.game2048 = new Game2048(size);
            this.gameOhh1 = null;
            this.gameOver = false;
            this.timer = 0;
            document.getElementById('mistakes-label').textContent = 'Score';
            this.hideGameControls(); // 隱藏數獨專用控制項
            this.hideMinesweeperControls(); // 隱藏 Minesweeper 控制項
            this.updateTimerDisplay();
            this.startTimer();
            this.hideMessage();
            this.render2048();
            return;
        }

        // Oh h1 模式
        if (this.gameMode === 'ohh1') {
            const size = this.difficulty === 'easy' ? 6 :
                this.difficulty === 'medium' ? 8 : 10;
            this.gameOhh1 = new GameOhh1(size);
            this.game2048 = null;
            this.gameOver = false;
            this.timer = 0;
            document.getElementById('mistakes-label').textContent = 'State';
            document.getElementById('mistakes').textContent = 'Going';
            this.hideGameControls(); // 隱藏數獨專用控制項
            this.hideMinesweeperControls(); // 隱藏 Minesweeper 控制項
            this.updateTimerDisplay();
            this.startTimer();
            this.hideMessage();
            this.renderOhh1();
            return;
        }

        // Nonogram 模式
        if (this.gameMode === 'nonogram') {
            const size = this.difficulty === 'easy' ? 5 :
                this.difficulty === 'medium' ? 10 : 15;
            this.gameNonogram = new GameNonogram(size);
            this.game2048 = null;
            this.gameOhh1 = null;
            this.gameOver = false;
            this.timer = 0;
            document.getElementById('mistakes-label').textContent = 'State';
            document.getElementById('mistakes').textContent = 'Going';
            this.hideGameControls(); // 隱藏數獨專用控制項
            this.hideMinesweeperControls(); // 隱藏 Minesweeper 控制項
            this.updateTimerDisplay();
            this.startTimer();
            this.hideMessage();
            this.renderNonogram();
            return;
        }

        // Nerdle 模式
        if (this.gameMode === 'nerdle') {
            // 根據難度設定猜測次數：簡單7次、中等6次、困難5次
            const maxGuesses = this.difficulty === 'easy' ? 7 :
                this.difficulty === 'medium' ? 6 : 5;
            this.gameNerdle = new GameNerdle(maxGuesses);
            this.game2048 = null;
            this.gameOhh1 = null;
            this.gameNonogram = null;
            this.gameMinesweeper = null;
            this.gameOver = false;
            this.timer = 0;
            document.getElementById('mistakes-label').textContent = 'Left';
            document.getElementById('mistakes').textContent = this.gameNerdle.maxGuesses - this.gameNerdle.guesses.length;
            this.hideGameControls(); // 隱藏數獨專用控制項
            this.hideMinesweeperControls(); // 隱藏 Minesweeper 控制項
            this.updateTimerDisplay();
            this.startTimer();
            this.hideMessage();
            this.renderNerdle();
            return;
        }

        // Minesweeper 踩地雷模式
        if (this.gameMode === 'minesweeper') {
            const configs = {
                easy: { rows: 9, cols: 9, mines: 10 },
                medium: { rows: 12, cols: 12, mines: 30 },
                hard: { rows: 16, cols: 16, mines: 60 }
            };
            const cfg = configs[this.difficulty];
            this.gameMinesweeper = new GameMinesweeper(cfg.rows, cfg.cols, cfg.mines);
            this.game2048 = null;
            this.gameOhh1 = null;
            this.gameNonogram = null;
            this.gameNerdle = null;
            this.gameOver = false;
            this.timer = 0;
            document.getElementById('mistakes-label').textContent = '💣';
            document.getElementById('mistakes').textContent = cfg.mines;
            this.hideGameControls();
            this.showMinesweeperControls();
            this.minesweeperMode = 'dig'; // 重置為挖掘模式
            this.updateTimerDisplay();
            this.startTimer();
            this.hideMessage();
            this.renderMinesweeper();
            return;
        }

        // Mastermind 猜色碼模式
        if (this.gameMode === 'mastermind') {
            const configs = {
                easy: { positions: 4, colors: 6, guesses: 10 },
                medium: { positions: 5, colors: 7, guesses: 8 },
                hard: { positions: 6, colors: 8, guesses: 7 }
            };
            const cfg = configs[this.difficulty];
            this.gameMastermind = new GameMastermind(cfg.positions, cfg.colors, cfg.guesses);
            this.game2048 = null;
            this.gameOhh1 = null;
            this.gameNonogram = null;
            this.gameNerdle = null;
            this.gameMinesweeper = null;
            this.gameOver = false;
            this.timer = 0;
            document.getElementById('mistakes-label').textContent = 'Left';
            document.getElementById('mistakes').textContent = cfg.guesses;
            this.hideGameControls();
            this.hideMinesweeperControls();
            this.updateTimerDisplay();
            this.startTimer();
            this.hideMessage();
            this.renderMastermind();
            return;
        }

        // KenKen 算術拉丁方模式
        if (this.gameMode === 'kenken') {
            const configs = {
                easy: { size: 4, maxMistakes: 3 },
                medium: { size: 5, maxMistakes: 4 },
                hard: { size: 6, maxMistakes: 5 }
            };
            const config = configs[this.difficulty];
            this.gameKenKen = new GameKenKen(config.size, config.maxMistakes);
            this.game2048 = null;
            this.gameOhh1 = null;
            this.gameNonogram = null;
            this.gameNerdle = null;
            this.gameMinesweeper = null;
            this.gameMastermind = null;
            this.gameOver = false;
            this.timer = 0;
            document.getElementById('mistakes-label').textContent = 'Err';
            document.getElementById('mistakes').textContent = `0/${config.maxMistakes}`;

            // Show number pad with appropriate buttons for KenKen
            this.updateNumberPadForKenKen(config.size);

            // Hide Notes and Hint buttons (not applicable to KenKen)
            // Keep New Game button visible
            const notesBtn = document.getElementById('notes-btn');
            const hintBtn = document.getElementById('hint-btn');
            if (notesBtn) notesBtn.style.display = 'none';
            if (hintBtn) hintBtn.style.display = 'none';

            this.hideMinesweeperControls();
            this.updateTimerDisplay();
            this.startTimer();
            this.hideMessage();
            this.renderKenKen();
            return;
        }

        // Pipe / Netwalk 旋轉管線模式
        if (this.gameMode === 'pipe') {
            const configs = {
                easy: 5,
                medium: 7,
                hard: 9
            };
            const size = configs[this.difficulty];
            this.gamePipe = new GamePipe(size);
            this.game2048 = null;
            this.gameOhh1 = null;
            this.gameNonogram = null;
            this.gameNerdle = null;
            this.gameMinesweeper = null;
            this.gameMastermind = null;
            this.gameKenKen = null;
            this.gameOver = false;
            this.timer = 0;
            document.getElementById('mistakes-label').textContent = 'Moves';
            document.getElementById('mistakes').textContent = '0';

            // Hide number pad and game controls
            const numberPad = document.querySelector('.number-pad');
            if (numberPad) numberPad.style.display = 'none';
            const notesBtn = document.getElementById('notes-btn');
            const hintBtn = document.getElementById('hint-btn');
            if (notesBtn) notesBtn.style.display = 'none';
            if (hintBtn) hintBtn.style.display = 'none';

            this.hideMinesweeperControls();
            this.updateTimerDisplay();
            this.startTimer();
            this.hideMessage();
            this.renderPipe();
            return;
        }

        // 數獨/殺手數獨模式
        this.game2048 = null;
        this.gameOhh1 = null;
        this.gameNonogram = null;
        this.gameNerdle = null;
        this.gameMinesweeper = null;
        this.hideMinesweeperControls(); // 隱藏 Minesweeper 控制項
        document.getElementById('mistakes-label').textContent = 'Err';
        this.showGameControls(); // 顯示數獨專用控制項
        this.resetNumberPad(); // 重置數字按鍵（顯示所有 1-9 按鍵）
        this.board = Array(9).fill(null).map(() => Array(9).fill(0));
        this.notes = Array(9).fill(null).map(() =>
            Array(9).fill(null).map(() => new Set())
        );
        this.cages = [];
        this.cellToCage = Array(9).fill(null).map(() => Array(9).fill(-1));
        this.selectedCell = null;
        this.mistakes = 0;
        // 殺手模式允許更多錯誤次數
        this.maxMistakes = this.gameMode === 'killer' ? 20 : 10;
        this.gameOver = false;
        this.timer = 0;
        this.lastInputNumber = null;
        this.updateAutoFillHighlight();

        this.generatePuzzle();
        this.renderBoard();
        this.updateMistakes();
        this.startTimer();
        this.hideMessage();
    }

    generatePuzzle() {
        // Generate a complete valid Sudoku solution
        this.solution = Array(9).fill(null).map(() => Array(9).fill(0));
        this.fillBoard(this.solution);

        // Copy solution to board
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.board[i][j] = {
                    value: this.solution[i][j],
                    fixed: false,
                    isError: false,
                    cageIndex: -1
                };
            }
        }

        if (this.gameMode === 'killer') {
            // 殺手數獨：生成籠子
            this.generateCages();

            // 根據難度決定要保留多少數字提示
            const killerHints = {
                easy: 12,      // 簡單：保留 12 個數字
                medium: 6,     // 中等：保留 6 個數字
                hard: 0        // 困難：不保留數字
            };
            const hintsToKeep = killerHints[this.difficulty];

            // 先將所有格子設為空
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    this.board[i][j].value = 0;
                    this.board[i][j].fixed = false;
                }
            }

            // 如果需要保留提示數字
            if (hintsToKeep > 0) {
                // 收集所有位置並隨機排序
                const positions = [];
                for (let i = 0; i < 9; i++) {
                    for (let j = 0; j < 9; j++) {
                        positions.push([i, j]);
                    }
                }
                this.shuffleArray(positions);

                // 保留指定數量的數字作為提示
                let kept = 0;
                for (const [row, col] of positions) {
                    if (kept >= hintsToKeep) break;
                    this.board[row][col].value = this.solution[row][col];
                    this.board[row][col].fixed = true;
                    kept++;
                }
            }
        } else {
            // 一般數獨：移除部分數字
            const cellsToReveal = this.difficultySettings[this.difficulty];
            const cellsToRemove = 81 - cellsToReveal;

            let removed = 0;
            const positions = [];
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    positions.push([i, j]);
                }
            }
            this.shuffleArray(positions);

            for (const [row, col] of positions) {
                if (removed >= cellsToRemove) break;
                this.board[row][col].value = 0;
                removed++;
            }

            // Mark remaining cells as fixed
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    if (this.board[i][j].value !== 0) {
                        this.board[i][j].fixed = true;
                    }
                }
            }
        }
    }

    generateCages() {
        // 生成殺手數獨的籠子
        const visited = Array(9).fill(null).map(() => Array(9).fill(false));
        const cageSizesByDifficulty = {
            easy: { min: 2, max: 3 },
            medium: { min: 2, max: 4 },
            hard: { min: 2, max: 5 }
        };
        const { min: minSize, max: maxSize } = cageSizesByDifficulty[this.difficulty];

        let cageIndex = 0;

        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (!visited[i][j]) {
                    const cage = this.growCage(i, j, visited, minSize, maxSize);
                    if (cage.cells.length > 0) {
                        // 計算籠子的總和
                        let sum = 0;
                        for (const [r, c] of cage.cells) {
                            sum += this.solution[r][c];
                            this.cellToCage[r][c] = cageIndex;
                            this.board[r][c].cageIndex = cageIndex;
                        }
                        cage.sum = sum;
                        cage.index = cageIndex;
                        this.cages.push(cage);
                        cageIndex++;
                    }
                }
            }
        }
    }

    growCage(startRow, startCol, visited, minSize, maxSize) {
        const cage = { cells: [], sum: 0 };
        const targetSize = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
        const queue = [[startRow, startCol]];
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];

        while (cage.cells.length < targetSize && queue.length > 0) {
            // 隨機選擇一個候選格子
            const randomIndex = Math.floor(Math.random() * queue.length);
            const [row, col] = queue.splice(randomIndex, 1)[0];

            if (visited[row][col]) continue;

            visited[row][col] = true;
            cage.cells.push([row, col]);

            // 添加相鄰的未訪問格子到候選隊列 
            for (const [dr, dc] of directions) {
                const newRow = row + dr;
                const newCol = col + dc;
                if (newRow >= 0 && newRow < 9 && newCol >= 0 && newCol < 9 && !visited[newRow][newCol]) {
                    queue.push([newRow, newCol]);
                }
            }
        }

        return cage;
    }

    getCageBorders(row, col) {
        // 計算格子在籠子中的邊框位置 
        const cageIndex = this.cellToCage[row][col];
        if (cageIndex === -1) return { top: false, right: false, bottom: false, left: false };

        const borders = { top: true, right: true, bottom: true, left: true };

        // 檢查相鄰格子是否在同一籠子
        if (row > 0 && this.cellToCage[row - 1][col] === cageIndex) borders.top = false;
        if (row < 8 && this.cellToCage[row + 1][col] === cageIndex) borders.bottom = false;
        if (col > 0 && this.cellToCage[row][col - 1] === cageIndex) borders.left = false;
        if (col < 8 && this.cellToCage[row][col + 1] === cageIndex) borders.right = false;

        return borders;
    }

    isTopLeftOfCage(row, col) {
        // 檢查是否是籠子的左上角（用於顯示總和）
        const cageIndex = this.cellToCage[row][col];
        if (cageIndex === -1) return false;

        const cage = this.cages[cageIndex];
        // 找到籠子中最左上的格子
        let minRow = 9, minCol = 9;
        for (const [r, c] of cage.cells) {
            if (r < minRow || (r === minRow && c < minCol)) {
                minRow = r;
                minCol = c;
            }
        }
        return row === minRow && col === minCol;
    }

    fillBoard(board) {
        const emptyCell = this.findEmptyCell(board);
        if (!emptyCell) return true;

        const [row, col] = emptyCell;
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.shuffleArray(numbers);

        for (const num of numbers) {
            if (this.isValidPlacement(board, row, col, num)) {
                board[row][col] = num;
                if (this.fillBoard(board)) return true;
                board[row][col] = 0;
            }
        }
        return false;
    }

    findEmptyCell(board) {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (board[i][j] === 0) return [i, j];
            }
        }
        return null;
    }

    isValidPlacement(board, row, col, num) {
        // Check row
        for (let j = 0; j < 9; j++) {
            if (board[row][j] === num) return false;
        }

        // Check column
        for (let i = 0; i < 9; i++) {
            if (board[i][col] === num) return false;
        }

        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                if (board[i][j] === num) return false;
            }
        }

        return true;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    renderBoard() {
        const boardElement = document.getElementById('sudoku-board');
        boardElement.innerHTML = '';
        boardElement.classList.remove('mode-2048', 'mode-ohh1', 'mode-nonogram', 'mode-nerdle', 'mode-minesweeper', 'mode-kenken', 'mode-mastermind'); // 移除所有模式的樣式
        // 移除所有格子大小類別
        boardElement.classList.remove('grid-4', 'grid-5', 'grid-6', 'grid-8', 'grid-9', 'grid-10', 'grid-12', 'grid-15', 'grid-16', 'grid-2048-4', 'grid-2048-5', 'grid-2048-6');

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.style.setProperty('--cell-index', row * 9 + col);

                const cellData = this.board[row][col];

                // 殺手數獨：添加籠子背景顏色和邊框
                if (this.gameMode === 'killer') {
                    cell.classList.add('killer-mode');
                    const cageIndex = this.cellToCage[row][col];
                    if (cageIndex !== -1) {
                        // 使用 8 種顏色循環
                        const colorIndex = cageIndex % 8;
                        cell.classList.add(`cage-color-${colorIndex}`);

                        // 添加籠子邊框
                        const borders = this.getCageBorders(row, col);
                        if (borders.top) cell.classList.add('cage-border-top');
                        if (borders.right) cell.classList.add('cage-border-right');
                        if (borders.bottom) cell.classList.add('cage-border-bottom');
                        if (borders.left) cell.classList.add('cage-border-left');
                    }

                    // 在籠子左上角顯示總和
                    if (this.isTopLeftOfCage(row, col)) {
                        const cage = this.cages[cageIndex];
                        const sumLabel = document.createElement('span');
                        sumLabel.className = 'cage-sum';
                        sumLabel.textContent = cage.sum;
                        cell.appendChild(sumLabel);
                    }
                }

                if (cellData.fixed) {
                    cell.classList.add('fixed');
                    // 保留籠子總和標籤（殺手模式）
                    const existingSum = cell.querySelector('.cage-sum');
                    if (existingSum) {
                        const valueSpan = document.createElement('span');
                        valueSpan.className = 'cell-value';
                        valueSpan.textContent = cellData.value;
                        cell.appendChild(valueSpan);
                    } else {
                        cell.textContent = cellData.value;
                    }
                } else if (cellData.value !== 0) {
                    // 保留籠子總和標籤
                    const existingSum = cell.querySelector('.cage-sum');
                    if (existingSum) {
                        const valueSpan = document.createElement('span');
                        valueSpan.className = 'cell-value';
                        valueSpan.textContent = cellData.value;
                        cell.appendChild(valueSpan);
                    } else {
                        cell.textContent = cellData.value;
                    }
                    if (cellData.isError) {
                        cell.classList.add('error');
                    }
                } else {
                    // Show notes
                    const notes = this.notes[row][col];
                    if (notes.size > 0) {
                        const notesDiv = document.createElement('div');
                        notesDiv.className = 'notes';
                        for (let n = 1; n <= 9; n++) {
                            const noteSpan = document.createElement('span');
                            noteSpan.textContent = notes.has(n) ? n : '';
                            notesDiv.appendChild(noteSpan);
                        }
                        cell.appendChild(notesDiv);
                    }
                }

                cell.addEventListener('click', () => this.selectCell(row, col));
                boardElement.appendChild(cell);
            }
        }

        this.updateNumberCounts();
    }

    render2048() {
        if (!this.game2048) return;

        const boardElement = document.getElementById('sudoku-board');
        boardElement.innerHTML = '';
        // 移除其他模式的樣式和 2048 的不同大小類別
        boardElement.classList.remove('mode-ohh1', 'mode-nonogram', 'mode-nerdle', 'mode-minesweeper',
            'grid-5', 'grid-6', 'grid-8', 'grid-9', 'grid-10', 'grid-12', 'grid-15', 'grid-16',
            'grid-2048-4', 'grid-2048-5', 'grid-2048-6');
        boardElement.classList.add('mode-2048', `grid-2048-${this.game2048.size}`);

        // 更新分數顯示
        document.getElementById('mistakes').textContent = `${this.game2048.score}`;

        for (let row = 0; row < this.game2048.size; row++) {
            for (let col = 0; col < this.game2048.size; col++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell tile-2048';
                const value = this.game2048.grid[row][col];

                if (value !== 0) {
                    cell.textContent = value;
                    cell.classList.add(`tile-${value}`);
                }

                boardElement.appendChild(cell);
            }
        }

        // 檢查遊戲結束
        if (this.game2048.gameOver) {
            this.showMessage('😢', '遊戲結束', `最終分數：${this.game2048.score}`);
            this.stopTimer();
        } else if (this.game2048.won) {
            this.showMessage('🎉', '恭喜過關,寶貝最聰明！', `2048分數：${this.game2048.score}`);
            this.game2048.won = false; // 允許繼續玩
        }
    }

    handle2048Move(direction) {
        if (!this.game2048 || this.game2048.gameOver) return;

        const moved = this.game2048.move(direction);
        if (moved) {
            this.render2048();
        } else {
            // 如果無法移動，檢查是否遊戲結束
            this.game2048.checkGameStatus();
            if (this.game2048.gameOver) {
                this.render2048(); // 重新渲染以顯示遊戲結束訊息
            }
        }
    }

    renderOhh1() {
        if (!this.gameOhh1) return;

        const boardElement = document.getElementById('sudoku-board');
        boardElement.innerHTML = '';
        boardElement.classList.remove('mode-2048', 'mode-nonogram', 'mode-nerdle', 'mode-minesweeper', 'grid-5', 'grid-6', 'grid-8', 'grid-9', 'grid-10', 'grid-12', 'grid-15', 'grid-16', 'grid-2048-4', 'grid-2048-5', 'grid-2048-6');
        boardElement.classList.add('mode-ohh1', `grid-${this.gameOhh1.size}`);

        for (let row = 0; row < this.gameOhh1.size; row++) {
            for (let col = 0; col < this.gameOhh1.size; col++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell ohh1-cell';
                const value = this.gameOhh1.grid[row][col];

                if (value === 0) {
                    cell.classList.add('ohh1-empty');
                } else if (value === 1) {
                    cell.classList.add('ohh1-red');
                } else {
                    cell.classList.add('ohh1-blue');
                }

                if (this.gameOhh1.fixed[row][col]) {
                    cell.classList.add('ohh1-fixed');
                }

                cell.addEventListener('click', () => {
                    if (this.gameOhh1.toggleCell(row, col)) {
                        this.renderOhh1();

                        if (this.gameOhh1.checkWin()) {
                            this.gameOhh1.gameOver = true;
                            this.showMessage('🎉', '恭喜過關,寶貝最棒！', '成功解開了 Oh h1 謎題！');
                            document.getElementById('mistakes').textContent = '完成';
                            this.stopTimer();
                        }
                    }
                });

                boardElement.appendChild(cell);
            }
        }
    }

    renderNonogram() {
        if (!this.gameNonogram) return;

        const boardElement = document.getElementById('sudoku-board');
        boardElement.innerHTML = '';
        // 移除所有遊戲模式的 CSS 類，確保切換時不會有殘留樣式
        boardElement.classList.remove('mode-2048', 'mode-ohh1', 'mode-nerdle', 'mode-minesweeper',
            'grid-5', 'grid-6', 'grid-8', 'grid-9', 'grid-10', 'grid-12', 'grid-15', 'grid-16',
            'grid-2048-4', 'grid-2048-5', 'grid-2048-6');
        boardElement.classList.add('mode-nonogram', `grid-${this.gameNonogram.size}`);

        // 渲染格子和提示數字
        // 第一行：左上角佔位 + 列提示
        const corner = document.createElement('div');
        corner.className = 'nonogram-corner';
        boardElement.appendChild(corner);

        for (let col = 0; col < this.gameNonogram.size; col++) {
            const hintCell = document.createElement('div');
            hintCell.className = 'nonogram-hint nonogram-hint-col';
            // 每個數字用 span 包裹，讓 CSS 可以用 flex-direction: column-reverse 排列
            this.gameNonogram.colHints[col].forEach(num => {
                const span = document.createElement('span');
                span.textContent = num;
                hintCell.appendChild(span);
            });
            boardElement.appendChild(hintCell);
        }

        // 渲染行（含行提示和格子）
        for (let row = 0; row < this.gameNonogram.size; row++) {
            // 行提示（左側）
            const hintCell = document.createElement('div');
            hintCell.className = 'nonogram-hint nonogram-hint-row';
            hintCell.textContent = this.gameNonogram.rowHints[row].join(' ');
            boardElement.appendChild(hintCell);

            // 格子
            for (let col = 0; col < this.gameNonogram.size; col++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell nonogram-cell';
                const value = this.gameNonogram.grid[row][col];

                if (value === 0) {
                    cell.classList.add('nonogram-empty');
                } else if (value === 1) {
                    cell.classList.add('nonogram-filled');
                } else {
                    cell.classList.add('nonogram-marked');
                    cell.textContent = 'X';
                }

                cell.addEventListener('click', () => {
                    if (this.gameNonogram.toggleCell(row, col)) {
                        this.renderNonogram();

                        // 調試：顯示當前狀態
                        console.log('玩家格子:', JSON.stringify(this.gameNonogram.grid));
                        console.log('正確答案:', JSON.stringify(this.gameNonogram.solution));
                        console.log('checkWin 結果:', this.gameNonogram.checkWin());

                        if (this.gameNonogram.checkWin()) {
                            this.gameNonogram.gameOver = true;
                            this.showMessage('🎉', '恭喜過關,寶貝超讚！', '成功解開了 Nonogram 謎題！');
                            document.getElementById('mistakes').textContent = '完成';
                            this.stopTimer();
                        }
                    }
                });

                boardElement.appendChild(cell);
            }
        }
    }

    renderMinesweeper() {
        if (!this.gameMinesweeper) return;
        const ms = this.gameMinesweeper;
        const boardElement = document.getElementById('sudoku-board');
        boardElement.innerHTML = '';
        // 移除所有遊戲模式的 CSS 類，確保切換時不會有殘留樣式
        boardElement.classList.remove('mode-2048', 'mode-ohh1', 'mode-nonogram', 'mode-nerdle',
            'grid-5', 'grid-6', 'grid-8', 'grid-9', 'grid-10', 'grid-12', 'grid-15', 'grid-16',
            'grid-2048-4', 'grid-2048-5', 'grid-2048-6');
        boardElement.classList.add('mode-minesweeper', `grid-${ms.cols}`);

        // 數字顏色映射（經典配色）
        const numColors = ['', '#2563eb', '#16a34a', '#dc2626', '#7c3aed', '#b91c1c', '#0891b2', '#1e293b', '#6b7280'];
        // 數字 emoji
        const numEmojis = ['', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣'];

        for (let row = 0; row < ms.rows; row++) {
            for (let col = 0; col < ms.cols; col++) {
                const cellData = ms.grid[row][col];
                const cell = document.createElement('div');
                cell.className = 'mine-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;

                if (cellData.revealed) {
                    cell.classList.add('mine-revealed');
                    if (cellData.mine) {
                        cell.classList.add('mine-exploded');
                        cell.textContent = '💣';
                    } else if (cellData.adjacentMines > 0) {
                        cell.classList.add(`mine-number-${cellData.adjacentMines}`);
                        cell.textContent = cellData.adjacentMines;
                        cell.style.color = numColors[cellData.adjacentMines];
                    }
                } else if (cellData.flagged) {
                    cell.classList.add('mine-flagged');
                    cell.textContent = '🚩';
                } else {
                    cell.classList.add('mine-hidden');
                }

                // 點擊事件（根據模式決定行為）
                cell.addEventListener('click', (e) => {
                    e.preventDefault();

                    if (this.minesweeperMode === 'flag') {
                        // 插旗模式
                        if (ms.toggleFlag(row, col)) {
                            this.renderMinesweeper();
                            document.getElementById('mistakes').textContent = ms.totalMines - ms.flagCount;
                        }
                    } else {
                        // 挖掘模式（原有邏輯）
                        if (ms.gameOver || cellData.flagged) return;
                        const result = ms.reveal(row, col);
                        if (result === 'mine') {
                            ms.revealAll();
                            this.renderMinesweeper();
                            this.stopTimer();
                            this.showMessage('💥', '踩到地雷了！', `堅持了 ${this.formatTime(this.timer)}`);
                        } else if (result === 'win') {
                            this.renderMinesweeper();
                            this.stopTimer();
                            this.showMessage('🎉', '恭喜過關！', `用時 ${this.formatTime(this.timer)} 清除所有地雷！`);
                            this.createConfetti();
                            this.createEmojiExplosion();
                        } else {
                            this.renderMinesweeper();
                        }
                        // 更新計時器（首次點擊才真正開始計時）
                        document.getElementById('mistakes').textContent = ms.totalMines - ms.flagCount;
                    }
                });

                // 右鍵插旗
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    if (ms.toggleFlag(row, col)) {
                        this.renderMinesweeper();
                        document.getElementById('mistakes').textContent = ms.totalMines - ms.flagCount;
                    }
                });

                // 長按插旗（行動裝置）
                let longPressTimer = null;
                cell.addEventListener('touchstart', (e) => {
                    longPressTimer = setTimeout(() => {
                        e.preventDefault();
                        if (ms.toggleFlag(row, col)) {
                            this.renderMinesweeper();
                            document.getElementById('mistakes').textContent = ms.totalMines - ms.flagCount;
                        }
                        longPressTimer = -1; // 標記為已觸發長按
                    }, 500);
                }, { passive: true });
                cell.addEventListener('touchend', (e) => {
                    if (longPressTimer === -1) {
                        e.preventDefault(); // 防止觸發 click
                    }
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                });
                cell.addEventListener('touchmove', () => {
                    clearTimeout(longPressTimer);
                    longPressTimer = null;
                }, { passive: true });

                boardElement.appendChild(cell);
            }
        }
    }

    renderNerdle() {
        if (!this.gameNerdle) return;

        const boardElement = document.getElementById('sudoku-board');
        boardElement.innerHTML = '';
        // 移除其他模式的樣式
        boardElement.classList.remove('mode-2048', 'mode-ohh1', 'mode-nonogram', 'mode-minesweeper',
            'grid-5', 'grid-6', 'grid-8', 'grid-9', 'grid-10', 'grid-12', 'grid-15', 'grid-16',
            'grid-2048-4', 'grid-2048-5', 'grid-2048-6');
        boardElement.classList.add('mode-nerdle');

        // 建立 Nerdle 容器
        const nerdleContainer = document.createElement('div');
        nerdleContainer.className = 'nerdle-container';

        // 渲染已猜測的算式（6行 × 8列）
        for (let row = 0; row < this.gameNerdle.maxGuesses; row++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'nerdle-row';

            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                cell.className = 'nerdle-cell';

                if (row < this.gameNerdle.guesses.length) {
                    // 已猜測的行
                    cell.textContent = this.gameNerdle.guesses[row][col];
                    cell.classList.add(`nerdle-${this.gameNerdle.results[row][col]}`);
                } else if (row === this.gameNerdle.guesses.length) {
                    // 當前輸入行
                    if (col < this.gameNerdle.currentInput.length) {
                        cell.textContent = this.gameNerdle.currentInput[col];
                    }
                    cell.classList.add('nerdle-current');
                }

                rowDiv.appendChild(cell);
            }

            nerdleContainer.appendChild(rowDiv);
        }

        boardElement.appendChild(nerdleContainer);

        // 渲染鍵盤
        const keyboard = document.createElement('div');
        keyboard.className = 'nerdle-keyboard';

        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '+', '-', '*', '/', '='];
        const row1 = document.createElement('div');
        row1.className = 'nerdle-keyboard-row';

        keys.forEach(key => {
            const btn = document.createElement('button');
            btn.className = 'nerdle-key';
            btn.textContent = key;
            btn.addEventListener('click', () => this.handleNerdleInput(key));
            row1.appendChild(btn);
        });
        keyboard.appendChild(row1);

        const row2 = document.createElement('div');
        row2.className = 'nerdle-keyboard-row';

        const enterBtn = document.createElement('button');
        enterBtn.className = 'nerdle-key nerdle-key-wide';
        enterBtn.textContent = '確認';
        enterBtn.addEventListener('click', () => this.submitNerdleGuess());
        row2.appendChild(enterBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'nerdle-key nerdle-key-wide';
        deleteBtn.textContent = '刪除';
        deleteBtn.addEventListener('click', () => this.handleNerdleDelete());
        row2.appendChild(deleteBtn);

        keyboard.appendChild(row2);
        boardElement.appendChild(keyboard);

        // 更新剩餘次數
        document.getElementById('mistakes').textContent = this.gameNerdle.maxGuesses - this.gameNerdle.guesses.length;
    }

    handleNerdleInput(char) {
        if (this.gameNerdle && this.gameNerdle.inputChar(char)) {
            this.renderNerdle();
        }
    }

    handleNerdleDelete() {
        if (this.gameNerdle && this.gameNerdle.deleteChar()) {
            this.renderNerdle();
        }
    }

    submitNerdleGuess() {
        if (!this.gameNerdle) return;

        const result = this.gameNerdle.submitGuess(this.gameNerdle.currentInput);

        if (!result.success) {
            // 顯示錯誤提示
            alert(result.error);
            return;
        }

        this.renderNerdle();

        // 檢查遊戲結束
        if (this.gameNerdle.won) {
            this.showMessage('🎉', '恭喜猜對了！', `答案是 ${this.gameNerdle.equation}`);
            this.stopTimer();
        } else if (this.gameNerdle.gameOver) {
            this.showMessage('😢', '遊戲結束', `正確答案是 ${this.gameNerdle.equation}`);
            this.stopTimer();
        }
    }

    renderMastermind() {
        if (!this.gameMastermind) return;
        const mm = this.gameMastermind;
        const boardElement = document.getElementById('sudoku-board');
        boardElement.innerHTML = '';
        boardElement.classList.remove('mode-2048', 'mode-ohh1', 'mode-nonogram', 'mode-nerdle', 'mode-minesweeper',
            'grid-5', 'grid-6', 'grid-8', 'grid-9', 'grid-10', 'grid-12', 'grid-15', 'grid-16',
            'grid-2048-4', 'grid-2048-5', 'grid-2048-6');
        boardElement.classList.add('mode-mastermind');

        // Create container
        const container = document.createElement('div');
        container.className = 'mastermind-container';

        // Guess history section
        const historySection = document.createElement('div');
        historySection.className = 'mastermind-history';

        // Display previous guesses
        for (let i = 0; i < mm.guesses.length; i++) {
            const guessRow = document.createElement('div');
            guessRow.className = 'mastermind-guess-row';

            // Color pegs
            const pegsContainer = document.createElement('div');
            pegsContainer.className = 'mastermind-pegs';
            for (const color of mm.guesses[i]) {
                const peg = document.createElement('div');
                peg.className = 'mastermind-peg';
                peg.style.backgroundColor = mm.colorMap[color];
                pegsContainer.appendChild(peg);
            }
            guessRow.appendChild(pegsContainer);

            // Feedback pegs
            const feedbackContainer = document.createElement('div');
            feedbackContainer.className = 'mastermind-feedback';
            const fb = mm.feedback[i];
            // Black pegs (correct position)
            for (let j = 0; j < fb.black; j++) {
                const feedbackPeg = document.createElement('div');
                feedbackPeg.className = 'mastermind-feedback-peg black';
                feedbackContainer.appendChild(feedbackPeg);
            }
            // White pegs (correct color, wrong position)
            for (let j = 0; j < fb.white; j++) {
                const feedbackPeg = document.createElement('div');
                feedbackPeg.className = 'mastermind-feedback-peg white';
                feedbackContainer.appendChild(feedbackPeg);
            }
            guessRow.appendChild(feedbackContainer);

            historySection.appendChild(guessRow);
        }
        container.appendChild(historySection);

        // Current guess section
        const currentSection = document.createElement('div');
        currentSection.className = 'mastermind-current';

        const currentLabel = document.createElement('div');
        currentLabel.className = 'mastermind-label';
        currentLabel.textContent = 'Current Guess:';
        currentSection.appendChild(currentLabel);

        const currentPegsContainer = document.createElement('div');
        currentPegsContainer.className = 'mastermind-pegs current';

        // Show current guess
        for (let i = 0; i < mm.positions; i++) {
            const peg = document.createElement('div');
            peg.className = 'mastermind-peg empty';
            if (i < mm.currentGuess.length) {
                peg.style.backgroundColor = mm.colorMap[mm.currentGuess[i]];
                peg.classList.remove('empty');
            }
            currentPegsContainer.appendChild(peg);
        }
        currentSection.appendChild(currentPegsContainer);
        container.appendChild(currentSection);

        // Color palette section
        const paletteSection = document.createElement('div');
        paletteSection.className = 'mastermind-palette';

        const paletteLabel = document.createElement('div');
        paletteLabel.className = 'mastermind-label';
        paletteLabel.textContent = 'Select Color:';
        paletteSection.appendChild(paletteLabel);

        const paletteContainer = document.createElement('div');
        paletteContainer.className = 'mastermind-colors';

        for (const color of mm.colors) {
            const colorBtn = document.createElement('div');
            colorBtn.className = 'mastermind-color-btn';
            colorBtn.style.backgroundColor = mm.colorMap[color];
            colorBtn.addEventListener('click', () => {
                if (!mm.gameOver && mm.addColorToGuess(color)) {
                    this.renderMastermind();
                }
            });
            paletteContainer.appendChild(colorBtn);
        }
        paletteSection.appendChild(paletteContainer);
        container.appendChild(paletteSection);

        // Control buttons section
        const controlsSection = document.createElement('div');
        controlsSection.className = 'mastermind-controls';

        const clearBtn = document.createElement('button');
        clearBtn.className = 'btn btn-mastermind';
        clearBtn.innerHTML = '<span class="btn-icon">🔄</span><span>Clear</span>';
        clearBtn.addEventListener('click', () => {
            if (!mm.gameOver) {
                mm.clearGuess();
                this.renderMastermind();
            }
        });
        controlsSection.appendChild(clearBtn);

        const undoBtn = document.createElement('button');
        undoBtn.className = 'btn btn-mastermind';
        undoBtn.innerHTML = '<span class="btn-icon">⬅️</span><span>Undo</span>';
        undoBtn.addEventListener('click', () => {
            if (!mm.gameOver && mm.removeLastColor()) {
                this.renderMastermind();
            }
        });
        controlsSection.appendChild(undoBtn);

        const submitBtn = document.createElement('button');
        submitBtn.className = 'btn btn-mastermind submit';
        submitBtn.innerHTML = '<span class="btn-icon">✓</span><span>Submit</span>';
        submitBtn.addEventListener('click', () => {
            if (mm.gameOver) return;
            const result = mm.submitGuess();
            if (result.success) {
                this.renderMastermind();
                document.getElementById('mistakes').textContent = mm.maxGuesses - mm.guesses.length;

                if (mm.won) {
                    this.stopTimer();
                    this.showMessage('🎉', 'Congratulations!', `You cracked the code in ${mm.guesses.length} guess${mm.guesses.length > 1 ? 'es' : ''}!`);
                    this.createConfetti();
                    this.createEmojiExplosion();
                } else if (mm.gameOver) {
                    this.stopTimer();
                    // Reveal secret code
                    const codeStr = mm.secretCode.map(c => `<span style="display:inline-block;width:20px;height:20px;border-radius:50%;background:${mm.colorMap[c]};margin:0 2px;vertical-align:middle;border:1px solid #999;"></span>`).join('');
                    this.showMessage('😢', 'Game Over', `The code was: ${codeStr}`);
                }
            } else {
                // Show error (incomplete guess)
                const msgEl = document.createElement('div');
                msgEl.className = 'mastermind-error';
                msgEl.textContent = result.error;
                controlsSection.appendChild(msgEl);
                setTimeout(() => msgEl.remove(), 2000);
            }
        });
        controlsSection.appendChild(submitBtn);

        container.appendChild(controlsSection);
        boardElement.appendChild(container);
    }

    renderKenKen() {
        if (!this.gameKenKen) return;
        const kk = this.gameKenKen;
        const boardElement = document.getElementById('sudoku-board');
        boardElement.innerHTML = '';
        boardElement.classList.remove('mode-2048', 'mode-ohh1', 'mode-nonogram', 'mode-nerdle', 'mode-minesweeper', 'mode-mastermind',
            'grid-5', 'grid-6', 'grid-8', 'grid-9', 'grid-10', 'grid-12', 'grid-15', 'grid-16',
            'grid-2048-4', 'grid-2048-5', 'grid-2048-6');
        boardElement.classList.add('mode-kenken', `grid-${kk.size}`);

        // Create cells
        for (let r = 0; r < kk.size; r++) {
            for (let c = 0; c < kk.size; c++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell kenken-cell';
                cell.dataset.row = r;
                cell.dataset.col = c;

                // Get cage info
                const cageIndex = kk.getCageIndex(r, c);
                const cage = kk.cages[cageIndex];

                // Add cage borders (check if adjacent cell is in same cage)
                const isTopEdge = !cage.some(cageCell => cageCell.row === r - 1 && cageCell.col === c);
                const isBottomEdge = !cage.some(cageCell => cageCell.row === r + 1 && cageCell.col === c);
                const isLeftEdge = !cage.some(cageCell => cageCell.row === r && cageCell.col === c - 1);
                const isRightEdge = !cage.some(cageCell => cageCell.row === r && cageCell.col === c + 1);

                if (isTopEdge) cell.classList.add('cage-border-top');
                if (isBottomEdge) cell.classList.add('cage-border-bottom');
                if (isLeftEdge) cell.classList.add('cage-border-left');
                if (isRightEdge) cell.classList.add('cage-border-right');

                // Add operation label to first cell of cage
                if (cage[0].row === r && cage[0].col === c) {
                    const label = document.createElement('div');
                    label.className = 'kenken-operation';
                    const opText = cage.operation ? `${cage.target}${cage.operation}` : `${cage.target}`;
                    label.textContent = opText;
                    cell.appendChild(label);
                }

                // Display value or notes
                const cellData = kk.grid[r][c];
                if (cellData.value !== 0) {
                    const valueDiv = document.createElement('div');
                    valueDiv.className = 'cell-value';
                    valueDiv.textContent = cellData.value;
                    cell.appendChild(valueDiv);

                    // Check if wrong
                    if (cellData.value !== kk.solution[r][c]) {
                        cell.classList.add('error');
                    }
                } else if (cellData.notes.size > 0) {
                    const notesDiv = document.createElement('div');
                    notesDiv.className = 'cell-notes';
                    for (let i = 1; i <= kk.size; i++) {
                        const noteSpan = document.createElement('span');
                        noteSpan.textContent = cellData.notes.has(i) ? i : '';
                        notesDiv.appendChild(noteSpan);
                    }
                    cell.appendChild(notesDiv);
                }

                // Highlight selected cell
                if (this.selectedCell && this.selectedCell.row === r && this.selectedCell.col === c) {
                    cell.classList.add('selected');
                }

                // Highlight conflicts
                const conflicts = kk.getConflicts(r, c);
                if (conflicts.has(`${r},${c}`)) {
                    cell.classList.add('error-highlight');
                }

                // Click event
                cell.addEventListener('click', () => {
                    this.selectedCell = { row: r, col: c };
                    this.renderKenKen();
                });

                boardElement.appendChild(cell);
            }
        }
    }

    renderPipe() {
        if (!this.gamePipe) return;
        const pipe = this.gamePipe;
        const boardElement = document.getElementById('sudoku-board');
        boardElement.innerHTML = '';
        boardElement.classList.remove('mode-2048', 'mode-ohh1', 'mode-nonogram', 'mode-nerdle', 'mode-minesweeper', 'mode-mastermind', 'mode-kenken',
            'grid-4', 'grid-5', 'grid-6', 'grid-7', 'grid-8', 'grid-9', 'grid-10', 'grid-12', 'grid-15', 'grid-16',
            'grid-2048-4', 'grid-2048-5', 'grid-2048-6');
        boardElement.classList.add('mode-pipe', `grid-${pipe.size}`);

        // Update moves display
        document.getElementById('mistakes').textContent = pipe.moves;

        // Render each cell
        for (let r = 0; r < pipe.size; r++) {
            for (let c = 0; c < pipe.size; c++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell pipe-cell';
                cell.dataset.row = r;
                cell.dataset.col = c;

                const pipeData = pipe.grid[r][c];
                if (pipeData) {
                    // Add pipe type and rotation classes
                    cell.classList.add(`pipe-${pipeData.type}`);
                    cell.classList.add(`pipe-rotation-${pipeData.rotation}`);

                    // Add connected class if powered
                    if (pipeData.connected) {
                        cell.classList.add('pipe-connected');
                    }

                    // Add source class
                    if (pipeData.type === 'source') {
                        cell.classList.add('pipe-source');
                    }

                    // Click handler to rotate
                    cell.addEventListener('click', () => {
                        if (pipeData.type === 'source') return;
                        if (pipe.gameOver) return;

                        pipe.rotatePipe(r, c);
                        this.renderPipe();

                        if (pipe.checkWin()) {
                            this.stopTimer();
                            this.showMessage('🎉', 'Perfect!', `All pipes connected! Moves: ${pipe.moves}`);
                            this.createConfetti();
                        }
                    });
                }

                boardElement.appendChild(cell);
            }
        }
    }


    selectCell(row, col) {
        if (this.gameOver) return;

        // KenKen mode handling
        if (this.gameMode === 'kenken') {
            this.selectedCell = { row, col };
            this.renderKenKen();
            return;
        }

        const cellData = this.board[row][col];
        const previousCell = this.selectedCell;

        // Clear previous selection
        document.querySelectorAll('.sudoku-cell').forEach(cell => {
            cell.classList.remove('selected', 'highlighted', 'same-number', 'error-highlight');
        });

        this.selectedCell = { row, col };

        // 自動帶入上次輸入的數字（殺手模式關閉此功能）
        // 條件：有上次輸入的數字、當前格子不是固定格子、當前格子是空的、不是選擇同一個格子、不是殺手模式
        if (this.gameMode !== 'killer' &&
            this.lastInputNumber !== null &&
            !cellData.fixed &&
            cellData.value === 0 &&
            !(previousCell && previousCell.row === row && previousCell.col === col)) {
            this.inputNumber(this.lastInputNumber);
            return; // inputNumber 會重新呼叫 selectCell，所以這裡直接返回
        }

        // 點擊有數字的格子時，等同於按下該數字按鍵（只在一般模式下）
        // 規則：點選有數字的格子 = 選擇該數字作為自動帶入數字
        // 再點一次相同數字的格子 = 關閉自動帶入模式
        if (this.gameMode !== 'killer' && cellData.value !== 0) {
            // 檢查是否是從 inputNumber 呼叫過來的（剛填入數字）
            // 使用 flag 來區分用戶點擊 vs 內部呼叫
            if (!this._internalSelectCall) {
                if (this.lastInputNumber === cellData.value) {
                    // 如果點擊的格子數字和當前選擇的數字相同，則關閉自動帶入
                    this.lastInputNumber = null;
                } else {
                    // 否則選擇該格子的數字作為自動帶入數字
                    this.lastInputNumber = cellData.value;
                }
                this.updateAutoFillHighlight();
            }
        }

        const selectedValue = this.board[row][col].value;

        // Highlight related cells
        document.querySelectorAll('.sudoku-cell').forEach(cell => {
            const r = parseInt(cell.dataset.row);
            const c = parseInt(cell.dataset.col);

            // Same row, column, or box
            const sameRow = r === row;
            const sameCol = c === col;
            const sameBox = Math.floor(r / 3) === Math.floor(row / 3) &&
                Math.floor(c / 3) === Math.floor(col / 3);

            if (sameRow || sameCol || sameBox) {
                cell.classList.add('highlighted');
            }

            // Same number
            if (selectedValue !== 0 && this.board[r][c].value === selectedValue) {
                cell.classList.add('same-number');
            }

            // Selected cell
            if (r === row && c === col) {
                cell.classList.add('selected');
            }
        });
    }

    inputNumber(num) {
        if (!this.selectedCell) return;

        // KenKen mode handling
        if (this.gameMode === 'kenken') {
            const { row, col } = this.selectedCell;

            // Check if deleting (num === 0)
            if (num === 0) {
                this.gameKenKen.setValue(row, col, 0);
            } else if (this.notesMode) {
                this.gameKenKen.toggleNote(row, col, num);
            } else {
                this.gameKenKen.setValue(row, col, num);

                // Update mistake display
                document.getElementById('mistakes').textContent =
                    `${this.gameKenKen.mistakes}/${this.gameKenKen.maxMistakes}`;

                // Check if game over due to mistakes
                if (this.gameKenKen.gameOver && !this.gameKenKen.checkWin()) {
                    this.stopTimer();
                    this.showMessage('😢', 'Game Over!', `Too many mistakes! (${this.gameKenKen.maxMistakes} allowed)`);
                    this.renderKenKen();
                    return;
                }

                // Check win
                if (this.gameKenKen.checkWin()) {
                    this.stopTimer();
                    this.showMessage('🎉', 'Excellent!', 'KenKen puzzle solved!');
                    this.createConfetti();
                }
            }
            this.renderKenKen();
            return;
        }

        if (this.gameOver) return;

        const { row, col } = this.selectedCell;
        const cellData = this.board[row][col];

        // 即使選到固定格子，也允許切換自動帶入功能（只在一般模式下）
        if (this.gameMode !== 'killer' && num !== 0) {
            // 如果再次點擊已經啟用的自動帶入數字
            if (this.lastInputNumber === num) {
                // 只有在「格子值已經等於該數字」或「固定格子」時才取消自動帶入
                if (cellData.value === num || cellData.fixed) {
                    this.lastInputNumber = null;
                    this.updateAutoFillHighlight();
                    if (cellData.fixed) return;
                    return; // 格子已有相同數字，不需要再填
                }
                // 如果是空格子或不同數字，保持自動帶入，繼續執行填入邏輯
            } else {
                // 切換到新的自動帶入數字
                this.lastInputNumber = num;
                this.updateAutoFillHighlight();
                if (cellData.fixed) return; // 固定格子不進行其他操作
            }
        }

        // 固定格子不能填入數字
        if (cellData.fixed) return;

        if (this.notesMode && num !== 0) {
            // Toggle note
            if (this.notes[row][col].has(num)) {
                this.notes[row][col].delete(num);
            } else {
                this.notes[row][col].add(num);
            }
            cellData.value = 0;
        } else {
            // Input number
            if (num === 0) {
                cellData.value = 0;
                cellData.isError = false;
                this.notes[row][col].clear();
                this.lastInputNumber = null; // 清除時重置上次輸入的數字
                this.updateAutoFillHighlight();
            } else {
                // 如果再次輸入已經填入的相同數字，直接返回（不算錯誤）
                if (cellData.value === num) {
                    return;
                }

                this.notes[row][col].clear();

                if (num !== this.solution[row][col]) {
                    // Wrong number
                    cellData.value = num;
                    cellData.isError = true;
                    this.mistakes++;
                    this.updateMistakes();

                    if (this.mistakes >= this.maxMistakes) {
                        this.endGame(false);
                    }
                } else {
                    // Correct number
                    cellData.value = num;
                    cellData.isError = false;

                    // Remove this number from notes in related cells
                    this.removeNoteFromRelatedCells(row, col, num);

                    // Check for win
                    if (this.checkWin()) {
                        this.endGame(true);
                    }
                }
            }
        }

        this.renderBoard();
        this.updateAutoFillHighlight(); // 更新放大效果
        this._internalSelectCall = true; // 標記這是內部呼叫，不要觸發切換邏輯
        this.selectCell(row, col);
        this._internalSelectCall = false;
    }

    updateAutoFillHighlight() {
        // 移除所有數字按鈕的自動帶入高亮
        document.querySelectorAll('.num-btn[data-num]').forEach(btn => {
            btn.classList.remove('auto-fill-active');
        });

        // 移除所有格子的放大效果
        document.querySelectorAll('.sudoku-cell').forEach(cell => {
            cell.classList.remove('auto-fill-enlarged');
        });

        // 殺手模式不顯示自動帶入高亮
        if (this.gameMode === 'killer' || this.gameMode === 'kenken') return;

        // 如果有記憶的數字，高亮對應按鈕並放大相同數字的格子
        if (this.lastInputNumber !== null && this.lastInputNumber !== 0) {
            const activeBtn = document.querySelector(`.num-btn[data-num="${this.lastInputNumber}"]`);
            if (activeBtn) {
                activeBtn.classList.add('auto-fill-active');
            }

            // 放大所有包含該數字的格子
            document.querySelectorAll('.sudoku-cell').forEach(cell => {
                const r = parseInt(cell.dataset.row);
                const c = parseInt(cell.dataset.col);
                if (this.board[r][c].value === this.lastInputNumber) {
                    cell.classList.add('auto-fill-enlarged');
                }
            });
        }
    }

    updateNumberPadForKenKen(size) {
        const numberPad = document.querySelector('.number-pad');
        if (!numberPad) return;

        // Show number pad
        numberPad.style.display = 'grid';

        // Show/hide buttons based on grid size
        const buttons = document.querySelectorAll('.num-btn[data-num]');
        buttons.forEach(btn => {
            const num = parseInt(btn.dataset.num);
            if (num === 0) {
                // Always show erase button
                btn.style.display = '';
            } else if (num <= size) {
                // Show buttons 1 to size
                btn.style.display = '';
            } else {
                // Hide buttons > size
                btn.style.display = 'none';
            }
        });
    }

    resetNumberPad() {
        const numberPad = document.querySelector('.number-pad');
        if (!numberPad) return;

        // Show number pad
        numberPad.style.display = 'grid';

        // Show all number buttons (1-9 and erase)
        const buttons = document.querySelectorAll('.num-btn[data-num]');
        buttons.forEach(btn => {
            btn.style.display = '';
        });
    }

    removeNoteFromRelatedCells(row, col, num) {
        // Remove from row
        for (let j = 0; j < 9; j++) {
            this.notes[row][j].delete(num);
        }

        // Remove from column
        for (let i = 0; i < 9; i++) {
            this.notes[i][col].delete(num);
        }

        // Remove from box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                this.notes[i][j].delete(num);
            }
        }
    }

    showHint() {
        if (this.gameOver) return;

        // Find an empty cell and reveal it
        const emptyCells = [];
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.board[i][j].value === 0) {
                    emptyCells.push([i, j]);
                }
            }
        }

        if (emptyCells.length === 0) return;

        // Random empty cell
        const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        this.board[row][col].value = this.solution[row][col];
        this.board[row][col].fixed = true;
        this.notes[row][col].clear();

        this.renderBoard();
        this.selectCell(row, col);

        // Check for win
        if (this.checkWin()) {
            this.endGame(true);
        }
    }

    toggleNotesMode() {
        this.notesMode = !this.notesMode;
        const btn = document.getElementById('notes-btn');
        btn.classList.toggle('active', this.notesMode);
    }

    checkWin() {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.board[i][j].value !== this.solution[i][j]) {
                    return false;
                }
            }
        }
        return true;
    }

    endGame(won) {
        this.gameOver = true;
        this.stopTimer();

        const board = document.getElementById('sudoku-board');

        if (won) {
            board.classList.add('victory');
            this.createConfetti();
            this.showMessage('🎉', '恭喜破關！\n寶貝 我愛你', `用時：${this.formatTime(this.timer)}`);
        } else {
            this.showMessage('😢', '遊戲結束', '錯誤次數已達上限');
        }
    }

    showMessage(icon, text, subtext = '') {
        const overlay = document.getElementById('message-overlay');
        document.getElementById('message-icon').textContent = icon;
        document.getElementById('message-text').textContent = text;
        document.getElementById('message-subtext').textContent = subtext;
        overlay.classList.add('show');
    }

    hideMessage() {
        document.getElementById('message-overlay').classList.remove('show');
        document.getElementById('sudoku-board').classList.remove('victory');
    }

    hideGameControls() {
        // 隱藏數獨專用的控制項（數字鍵盤和按鈕）
        const numberPad = document.querySelector('.number-pad');
        const gameControls = document.querySelector('.game-controls');
        if (numberPad) numberPad.style.display = 'none';
        if (gameControls) gameControls.style.display = 'none';
    }

    showGameControls() {
        // 顯示數獨專用的控制項
        const numberPad = document.querySelector('.number-pad');
        const gameControls = document.querySelector('.game-controls');
        if (numberPad) numberPad.style.display = 'grid';
        if (gameControls) gameControls.style.display = 'flex';
    }

    setupMinesweeperControls() {
        const digBtn = document.getElementById('mine-mode-btn');
        const flagBtn = document.getElementById('mine-flag-btn');

        if (digBtn) {
            digBtn.addEventListener('click', () => {
                this.minesweeperMode = 'dig';
                digBtn.classList.add('active');
                flagBtn.classList.remove('active');
            });
        }

        if (flagBtn) {
            flagBtn.addEventListener('click', () => {
                this.minesweeperMode = 'flag';
                flagBtn.classList.add('active');
                digBtn.classList.remove('active');
            });
        }
    }

    showMinesweeperControls() {
        const controls = document.getElementById('minesweeper-controls');
        if (controls) controls.style.display = 'flex';
        // 重置按鈕狀態
        const digBtn = document.getElementById('mine-mode-btn');
        const flagBtn = document.getElementById('mine-flag-btn');
        if (digBtn) digBtn.classList.add('active');
        if (flagBtn) flagBtn.classList.remove('active');
    }

    hideMinesweeperControls() {
        const controls = document.getElementById('minesweeper-controls');
        if (controls) controls.style.display = 'none';
    }

    updateMistakes() {
        document.getElementById('mistakes').textContent = `${this.mistakes}/${this.maxMistakes}`;
    }

    updateNumberCounts() {
        // Count how many of each number are placed (包含錯誤的)
        const counts = Array(10).fill(0);
        // Count how many of each number are correctly placed (只計算正確的)
        const correctCounts = Array(10).fill(0);

        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const val = this.board[i][j].value;
                if (val > 0) {
                    counts[val]++;
                    // 檢查是否與答案相符
                    if (val === this.solution[i][j]) {
                        correctCounts[val]++;
                    }
                }
            }
        }

        // Disable buttons for numbers that are complete (正確填入 9 個)
        document.querySelectorAll('.num-btn[data-num]').forEach(btn => {
            const num = parseInt(btn.dataset.num);
            if (num > 0 && correctCounts[num] >= 9) {
                btn.classList.add('disabled');
            } else {
                btn.classList.remove('disabled');
            }
        });

        // 當自動帶入的數字「全部正確」填滿 9 個時，才取消自動帶入功能
        if (this.lastInputNumber !== null && this.lastInputNumber > 0 && correctCounts[this.lastInputNumber] >= 9) {
            this.lastInputNumber = null;
            this.updateAutoFillHighlight();
        }
    }

    updateDifficultyLabels() {
        const gameMode = document.getElementById('game-mode').value;
        const difficultySelect = document.getElementById('difficulty');
        const options = difficultySelect.options;

        if (gameMode === '2048') {
            // 2048 模式顯示格子大小
            options[0].textContent = '4×4';
            options[1].textContent = '5×5';
            options[2].textContent = '6×6';
        } else if (gameMode === 'minesweeper') {
            // 踩地雷模式顯示格子大小
            options[0].textContent = '9×9';
            options[1].textContent = '12×12';
            options[2].textContent = '16×16';
        } else {
            // 其他模式顯示難度
            options[0].textContent = 'Easy';
            options[1].textContent = 'Mid';
            options[2].textContent = 'Hard';
        }
    }

    startTimer() {
        this.stopTimer();
        this.timer = 0;
        this.updateTimerDisplay();
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimerDisplay();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimerDisplay() {
        document.getElementById('timer').textContent = this.formatTime(this.timer);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    createFloatingDecorations() {
        const container = document.getElementById('floating-decorations');
        const decorations = ['🧩', '✨', '⭐', '💖', '🌸', '🎀', '💫'];

        for (let i = 0; i < 10; i++) {
            const decoration = document.createElement('div');
            decoration.className = 'decoration';
            decoration.textContent = decorations[Math.floor(Math.random() * decorations.length)];
            decoration.style.left = `${Math.random() * 100}%`;
            decoration.style.animationDelay = `${Math.random() * 8}s`;
            decoration.style.animationDuration = `${8 + Math.random() * 4}s`;
            container.appendChild(decoration);
        }
    }

    createConfetti() {
        // 華麗的破關慶祝特效！
        this.createConfettiWave(0);
        this.createConfettiWave(500);
        this.createConfettiWave(1000);
        this.createEmojiExplosion();
        this.createFireworks();
        this.createScreenFlash();
    }

    createConfettiWave(delay) {
        const colors = ['#ff6b9d', '#c9b1ff', '#98e4c9', '#ffcba4', '#fff3b0', '#ff7e79', '#87ceeb', '#ffd700', '#ff69b4', '#00ff7f'];
        const shapes = ['square', 'circle', 'triangle'];

        setTimeout(() => {
            for (let i = 0; i < 80; i++) {
                const confetti = document.createElement('div');
                const shape = shapes[Math.floor(Math.random() * shapes.length)];
                confetti.className = `confetti confetti-${shape}`;
                confetti.style.left = `${Math.random() * 100}%`;
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = `${Math.random() * 1.5}s`;
                confetti.style.animationDuration = `${2 + Math.random() * 2}s`;
                document.body.appendChild(confetti);

                setTimeout(() => confetti.remove(), 6000);
            }
        }, delay);
    }

    createEmojiExplosion() {
        const emojis = ['🎉', '🎊', '✨', '🌟', '💫', '⭐', '🏆', '👑', '💖', '🎯', '🔥', '💥', '🎆', '🎇'];

        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const emoji = document.createElement('div');
                emoji.className = 'emoji-explosion';
                emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                emoji.style.left = `${20 + Math.random() * 60}%`;
                emoji.style.top = `${20 + Math.random() * 60}%`;
                emoji.style.fontSize = `${1.5 + Math.random() * 2}rem`;
                emoji.style.animationDelay = `${Math.random() * 0.5}s`;
                document.body.appendChild(emoji);

                setTimeout(() => emoji.remove(), 3000);
            }, i * 100);
        }
    }

    createFireworks() {
        const colors = ['#ff0000', '#ffd700', '#00ff00', '#00bfff', '#ff69b4', '#ff4500'];

        for (let f = 0; f < 5; f++) {
            setTimeout(() => {
                const centerX = 20 + Math.random() * 60;
                const centerY = 20 + Math.random() * 40;

                for (let i = 0; i < 12; i++) {
                    const spark = document.createElement('div');
                    spark.className = 'firework-spark';
                    spark.style.left = `${centerX}%`;
                    spark.style.top = `${centerY}%`;
                    spark.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                    spark.style.setProperty('--angle', `${i * 30}deg`);
                    spark.style.setProperty('--distance', `${60 + Math.random() * 40}px`);
                    document.body.appendChild(spark);

                    setTimeout(() => spark.remove(), 1500);
                }
            }, f * 400);
        }
    }

    createScreenFlash() {
        const flash = document.createElement('div');
        flash.className = 'screen-flash';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 500);
    }

    setupEventListeners() {
        // Number pad
        document.querySelectorAll('.num-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const num = parseInt(btn.dataset.num);
                this.inputNumber(num);
            });
        });

        // Control buttons
        document.getElementById('notes-btn').addEventListener('click', () => this.toggleNotesMode());
        document.getElementById('hint-btn').addEventListener('click', () => this.showHint());
        document.getElementById('restart-btn').addEventListener('click', () => this.newGame());
        document.getElementById('play-again-btn').addEventListener('click', () => this.newGame());

        // Difficulty change
        document.getElementById('difficulty').addEventListener('change', () => this.newGame());

        // Game mode change
        document.getElementById('game-mode').addEventListener('change', () => {
            this.updateDifficultyLabels();
            this.newGame();
        });

        // Help button toggle
        document.getElementById('help-btn').addEventListener('click', () => {
            const panel = document.getElementById('help-panel');
            const btn = document.getElementById('help-btn');
            panel.classList.toggle('show');
            btn.classList.toggle('active');
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            // 2048 模式：方向鍵控制
            if (this.gameMode === '2048') {
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.handle2048Move('up');
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.handle2048Move('down');
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.handle2048Move('left');
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.handle2048Move('right');
                } else if (e.key === 'r' || e.key === 'R') {
                    this.newGame();
                }
                return;
            }

            // 數獨模式的鍵盤控制
            if (e.key >= '1' && e.key <= '9') {
                this.inputNumber(parseInt(e.key));
            } else if (e.key === '0' || e.key === 'Backspace' || e.key === 'Delete') {
                this.inputNumber(0);
            } else if (e.key === 'n' || e.key === 'N') {
                this.toggleNotesMode();
            } else if (e.key === 'h' || e.key === 'H') {
                this.showHint();
            } else if (e.key === 'r' || e.key === 'R') {
                this.newGame();
            } else if (e.key === 'ArrowUp' && this.selectedCell) {
                const newRow = Math.max(0, this.selectedCell.row - 1);
                this.selectCell(newRow, this.selectedCell.col);
            } else if (e.key === 'ArrowDown' && this.selectedCell) {
                const newRow = Math.min(8, this.selectedCell.row + 1);
                this.selectCell(newRow, this.selectedCell.col);
            } else if (e.key === 'ArrowLeft' && this.selectedCell) {
                const newCol = Math.max(0, this.selectedCell.col - 1);
                this.selectCell(this.selectedCell.row, newCol);
            } else if (e.key === 'ArrowRight' && this.selectedCell) {
                const newCol = Math.min(8, this.selectedCell.col + 1);
                this.selectCell(this.selectedCell.row, newCol);
            }
        });

        // 觸控滑動支援（僅在 2048 模式啟用）
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartScrollY = 0;

        document.getElementById('sudoku-board').addEventListener('touchstart', (e) => {
            if (this.gameMode !== '2048') return;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchStartScrollY = window.scrollY;
        }, { passive: true });

        document.getElementById('sudoku-board').addEventListener('touchmove', (e) => {
            if (this.gameMode !== '2048') return;
            // 減少畫面滾動幅度到 20%
            const currentY = e.touches[0].clientY;
            const deltaY = currentY - touchStartY;
            const reducedScroll = touchStartScrollY - (deltaY * 0.2);
            window.scrollTo(0, reducedScroll);
            e.preventDefault();
        }, { passive: false });

        document.getElementById('sudoku-board').addEventListener('touchend', (e) => {
            if (this.gameMode !== '2048') return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            const minSwipeDistance = 30;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 水平滑動
                if (Math.abs(deltaX) > minSwipeDistance) {
                    this.handle2048Move(deltaX > 0 ? 'right' : 'left');
                }
            } else {
                // 垂直滑動
                if (Math.abs(deltaY) > minSwipeDistance) {
                    this.handle2048Move(deltaY > 0 ? 'down' : 'up');
                }
            }
        });
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new SudokuGame();
});
