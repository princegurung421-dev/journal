document.addEventListener('DOMContentLoaded', () => {
    const statusDisplay = document.getElementById('status');
    const cells = document.querySelectorAll('.cell');
    const resetBtn = document.getElementById('resetBtn');

    let gameActive = true;
    let currentPlayer = "X";
    let gameState = ["", "", "", "", "", "", "", "", ""];
    let vsComputer = true; // Default to VS Computer

    const winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    const winningMessage = () => `Player ${currentPlayer} Wins! 🎉`;
    const drawMessage = () => `Game Ended in a Draw!`;
    // const currentPlayerTurn = () => `Player ${currentPlayer}'s Turn`; // Simplified status
    const currentPlayerTurn = () => vsComputer && currentPlayer === 'O' ? "Computer's Turn..." : `Player ${currentPlayer}'s Turn`;

    statusDisplay.innerHTML = currentPlayerTurn();

    function handleCellPlayed(clickedCell, clickedCellIndex) {
        gameState[clickedCellIndex] = currentPlayer;
        clickedCell.innerHTML = currentPlayer;
        clickedCell.classList.add(currentPlayer.toLowerCase());
    }

    function handlePlayerChange() {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        statusDisplay.innerHTML = currentPlayerTurn();
    }

    function checkWinOrDraw() {
        let roundWon = false;
        let winningLine = [];

        for (let i = 0; i <= 7; i++) {
            const winCondition = winningConditions[i];
            let a = gameState[winCondition[0]];
            let b = gameState[winCondition[1]];
            let c = gameState[winCondition[2]];

            if (a === '' || b === '' || c === '') {
                continue;
            }
            if (a === b && b === c) {
                roundWon = true;
                winningLine = winCondition;
                break;
            }
        }

        if (roundWon) {
            statusDisplay.innerHTML = winningMessage();
            gameActive = false;
            highlightWinningCells(winningLine);
            return true;
        }

        let roundDraw = !gameState.includes("");
        if (roundDraw) {
            statusDisplay.innerHTML = drawMessage();
            gameActive = false;
            return true;
        }

        return false;
    }

    function highlightWinningCells(winningLine) {
        winningLine.forEach(index => {
            cells[index].classList.add('winner');
        });
    }

    function handleCellClick(clickedCellEvent) {
        const clickedCell = clickedCellEvent.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        if (gameState[clickedCellIndex] !== "" || !gameActive) {
            return;
        }

        handleCellPlayed(clickedCell, clickedCellIndex);

        if (checkWinOrDraw()) return;

        handlePlayerChange();

        // If playing vs Computer and it's O's turn (Computer)
        if (vsComputer && currentPlayer === "O" && gameActive) {
            setTimeout(computerMove, 500); // Add slight delay for realism
        }
    }

    function computerMove() {
        const availableMoves = gameState.map((val, idx) => val === "" ? idx : null).filter(val => val !== null);

        if (availableMoves.length > 0) {
            // Random move for now
            const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            const cell = document.querySelector(`.cell[data-index='${randomMove}']`);

            handleCellPlayed(cell, randomMove);
            if (!checkWinOrDraw()) {
                handlePlayerChange();
            }
        }
    }

    function handleRestartGame() {
        gameActive = true;
        currentPlayer = "X";
        gameState = ["", "", "", "", "", "", "", "", ""];
        statusDisplay.innerHTML = currentPlayerTurn();
        cells.forEach(cell => {
            cell.innerHTML = "";
            cell.classList.remove('x', 'o', 'winner');
        });
    }

    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    resetBtn.addEventListener('click', handleRestartGame);
});
