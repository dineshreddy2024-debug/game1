// script.js - Memory Duel

let scores = { p1: 0, p2: 0 };
let currentPlayer = 'p1';
let matrixPattern = [];
let userPattern = [];
let round1Winner = "";
let isShowingPattern = false;

let flippedCards = [];
let matchedIndices = [];
let pairsFound = 0;

const symbols = [
    '🍎','🍎','🍌','🍌','🍇','🍇','🍓','🍓',
    '🍒','🍒','🥝','🥝','🍍','🍍','🥥','🥥'
];

function initMatrix() {
    const board = document.getElementById('matrix-board');
    board.innerHTML = '';
    document.getElementById('matrix-status').innerText = 
        `Player ${currentPlayer === 'p1' ? '1' : '2'}: Memorize the pattern!`;

    for (let i = 0; i < 25; i++) {
        const cell = document.createElement('div');
        cell.className = 'matrix-cell';
        cell.onclick = () => handleMatrixClick(i, cell);
        board.appendChild(cell);
    }

    setTimeout(showFullPattern, 1200);
}

function showFullPattern() {
    isShowingPattern = true;
    matrixPattern = [];
    userPattern = [];

    while (matrixPattern.length < 7) {
        let r = Math.floor(Math.random() * 25);
        if (!matrixPattern.includes(r)) matrixPattern.push(r);
    }

    const cells = document.querySelectorAll('.matrix-cell');
    matrixPattern.forEach(idx => cells[idx].classList.add('highlight'));

    setTimeout(() => {
        matrixPattern.forEach(idx => cells[idx].classList.remove('highlight'));
        isShowingPattern = false;
        document.getElementById('matrix-status').innerText = "Now repeat the pattern!";
    }, 2000);
}

function handleMatrixClick(index, cell) {
    if (isShowingPattern || cell.classList.contains('correct')) return;

    if (matrixPattern.includes(index)) {
        cell.classList.add('correct');
        userPattern.push(index);

        if (userPattern.length === matrixPattern.length) {
            round1Winner = currentPlayer;
            scores[currentPlayer]++;
            updateScoreDisplay();
            setTimeout(startRound2, 700);
        }
    } else {
        cell.classList.add('wrong');
        setTimeout(() => {
            currentPlayer = currentPlayer === 'p1' ? 'p2' : 'p1';
            updateUI();
            initMatrix();
        }, 900);
    }
}

// ──────────────────────────────────────────────
//                ROUND 2 - MEMORY
// ──────────────────────────────────────────────

function startRound2() {
    document.getElementById('round1').classList.add('hidden');
    document.getElementById('round2').classList.remove('hidden');

    document.getElementById('memory-status').innerText = 
        `Round 2 • ${round1Winner.toUpperCase()}'s turn • Flip 2 cards`;
    document.getElementById('pairs-count').innerText = `Pairs: ${pairsFound} / 8`;

    createMemoryCards();
    startMemorizationPhase();
}

function createMemoryCards() {
    const grid = document.getElementById('memory-grid');
    grid.innerHTML = '';

    // Shuffle once when starting new memory round
    const shuffledSymbols = [...symbols].sort(() => Math.random() - 0.5);

    shuffledSymbols.forEach((symbol, i) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = i;
        card.dataset.symbol = symbol;

        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">${symbol}</div>
                <div class="card-back"></div>
            </div>
        `;

        if (matchedIndices.includes(i)) {
            card.classList.add('flipped', 'matched');
        } else {
            card.addEventListener('click', () => flipCard(card, symbol, i));
        }

        grid.appendChild(card);
    });
}

function startMemorizationPhase() {
    const cards = document.querySelectorAll('.memory-card:not(.matched)');
    cards.forEach(card => card.classList.add('flipped'));

    setTimeout(() => {
        cards.forEach(card => card.classList.remove('flipped'));
        document.getElementById('memory-status').innerText = 
            `${round1Winner.toUpperCase()}'s turn — find a matching pair`;
    }, 2200);
}

function flipCard(card, symbol, index) {
    // Prevent invalid moves
    if (flippedCards.length >= 2 || 
        card.classList.contains('flipped') || 
        card.classList.contains('matched')) {
        return;
    }

    card.classList.add('flipped');
    flippedCards.push({ card, symbol, index });

    if (flippedCards.length === 2) {
        setTimeout(checkMatch, 900);
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;

    if (card1.symbol === card2.symbol) {
        // Match!
        card1.card.classList.add('matched');
        card2.card.classList.add('matched');
        matchedIndices.push(card1.index, card2.index);
        pairsFound++;

        document.getElementById('pairs-count').innerText = `Pairs: ${pairsFound} / 8`;
        scores[round1Winner]++;
        updateScoreDisplay();

        document.getElementById('memory-status').innerText = 
            `Match! ${round1Winner.toUpperCase()} +1 • keep going!`;

        flippedCards = [];

        // Check for game win
        if (scores.p1 >= 5 || scores.p2 >= 5) {
            setTimeout(() => {
                alert(`Game Over!\n\nPlayer ${scores.p1 >= 5 ? '1' : '2'} wins the match!`);
                location.reload();
            }, 1200);
            return;
        }

        // Check if memory board is complete
        if (pairsFound === 8) {
            setTimeout(endMemoryRound, 1400);
        }

    } else {
        // No match → flip back
        document.getElementById('memory-status').innerText = 
            `No match • back to Round 1`;

        setTimeout(() => {
            card1.card.classList.remove('flipped');
            card2.card.classList.remove('flipped');
            flippedCards = [];

            // End memory round after mismatch
            setTimeout(endMemoryRound, 800);
        }, 1000);
    }
}

function endMemoryRound() {
    matchedIndices = [];
    pairsFound = 0;
    flippedCards = [];

    document.getElementById('round2').classList.add('hidden');
    document.getElementById('round1').classList.remove('hidden');

    // Next player starts the next pattern round
    currentPlayer = currentPlayer === 'p1' ? 'p2' : 'p1';
    updateUI();

    initMatrix();

    // Optional: end whole game if someone reached target
    if (scores.p1 >= 5 || scores.p2 >= 5) {
        setTimeout(() => {
            alert(`Match complete!\nPlayer ${scores.p1 >= 5 ? '1' : '2'} wins!`);
            location.reload();
        }, 400);
    }
}

function updateScoreDisplay() {
    document.getElementById('p1-match-score').textContent = scores.p1;
    document.getElementById('p2-match-score').textContent = scores.p2;
}

function updateUI() {
    document.getElementById('score-p1').classList.toggle('active', currentPlayer === 'p1');
    document.getElementById('score-p2').classList.toggle('active', currentPlayer === 'p2');
}

// ─── Start Game ────────────────────────────────────────

updateScoreDisplay();
initMatrix();
