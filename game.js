// 甜心數獨 - Cute Sudoku Game
class SudokuGame {
    constructor() {
        this.board = [];
        this.solution = [];
        this.selectedCell = null;
        this.notesMode = false;
        this.notes = [];
        this.mistakes = 0;
        this.maxMistakes = 10;
        this.timer = 0;
        this.timerInterval = null;
        this.gameOver = false;
        this.difficulty = 'medium';
        this.difficultySettings = {
            easy: 38,      // 38 cells revealed
            medium: 30,    // 30 cells revealed
            hard: 24       // 24 cells revealed
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createFloatingDecorations();
        this.newGame();
    }

    newGame() {
        this.difficulty = document.getElementById('difficulty').value;
        this.board = Array(9).fill(null).map(() => Array(9).fill(0));
        this.notes = Array(9).fill(null).map(() =>
            Array(9).fill(null).map(() => new Set())
        );
        this.selectedCell = null;
        this.mistakes = 0;
        this.gameOver = false;
        this.timer = 0;

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
                    isError: false
                };
            }
        }

        // Remove numbers based on difficulty
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

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.style.setProperty('--cell-index', row * 9 + col);

                const cellData = this.board[row][col];

                if (cellData.fixed) {
                    cell.classList.add('fixed');
                    cell.textContent = cellData.value;
                } else if (cellData.value !== 0) {
                    cell.textContent = cellData.value;
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

    selectCell(row, col) {
        if (this.gameOver) return;

        // Clear previous selection
        document.querySelectorAll('.sudoku-cell').forEach(cell => {
            cell.classList.remove('selected', 'highlighted', 'same-number', 'error-highlight');
        });

        this.selectedCell = { row, col };
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
        if (!this.selectedCell || this.gameOver) return;

        const { row, col } = this.selectedCell;
        const cellData = this.board[row][col];

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
            } else {
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
        this.selectCell(row, col);
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
            this.showMessage('🎉', '恭喜完成！', `用時：${this.formatTime(this.timer)}`);
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

    updateMistakes() {
        document.getElementById('mistakes').textContent = `${this.mistakes}/${this.maxMistakes}`;
    }

    updateNumberCounts() {
        // Count how many of each number are placed
        const counts = Array(10).fill(0);
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const val = this.board[i][j].value;
                if (val > 0) counts[val]++;
            }
        }

        // Disable buttons for numbers that are complete (9 of them)
        document.querySelectorAll('.num-btn[data-num]').forEach(btn => {
            const num = parseInt(btn.dataset.num);
            if (num > 0 && counts[num] >= 9) {
                btn.classList.add('disabled');
            } else {
                btn.classList.remove('disabled');
            }
        });
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
        const colors = ['#ff6b9d', '#c9b1ff', '#98e4c9', '#ffcba4', '#fff3b0', '#ff7e79'];

        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = `${Math.random() * 2}s`;
            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), 5000);
        }
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

        // Keyboard support
        document.addEventListener('keydown', (e) => {
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
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new SudokuGame();
});
