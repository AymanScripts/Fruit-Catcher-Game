const player = document.getElementById('player');
const scoreDisplay = document.getElementById('score');
const highscoreDisplay = document.getElementById('highscore');
const explosion = document.getElementById('explosion');
let score = 0;
let highscore = localStorage.getItem('highscore') || 0;
let playerPosition = 180;
let items = [];
let gameInterval;
let isPaused = false;
let isDragging = false;

let level = 1;
const levelUpScore = 100; // Score om naar het volgende level te gaan
const baseFallSpeed = 5; // Basis snelheid van vallende objecten
let fallSpeed = baseFallSpeed; // Huidige snelheid van vallende objecten

document.addEventListener('keydown', handleKeyPress);
player.addEventListener('mousedown', startDrag);
document.addEventListener('mouseup', stopDrag);
document.addEventListener('mousemove', drag);

function handleKeyPress(event) {
    if (isPaused) return; // Stop movement if the game is paused
    if (event.key === 'ArrowLeft' && playerPosition > 0) {
        playerPosition -= 50;
    } else if (event.key === 'ArrowRight' && playerPosition < 340) {
        playerPosition += 50;
    }
    player.style.left = playerPosition + 'px';
}


function startDrag(event) {
    isDragging = true;
}

function stopDrag(event) {
    isDragging = false;
}

function drag(event) {
    if (isDragging && !isPaused) { // Check if the game is not paused
        const rect = document.getElementById('game-container').getBoundingClientRect();
        playerPosition = event.clientX - rect.left - player.offsetWidth / 2;
        playerPosition = Math.max(0, Math.min(playerPosition, 340));
        player.style.left = playerPosition + 'px';
    }
}


function addItem() {
    if (items.length < 5) {
        const item = document.createElement('div');
        const itemType = Math.random();

        // Adjusted probabilities
        if (itemType < 0.9) { // 90% chance for regular fruits
            const fruitType = Math.random();
            if (fruitType < 0.6) {
                item.classList.add('fruit', 'apple'); // 60% chance for apple
            } else if (fruitType < 0.85) {
                item.classList.add('fruit', 'banana'); // 25% chance for banana
            } else {
                item.classList.add('fruit', 'orange'); // 5% chance for orange
            }
        } else if (itemType < 0.95) { // 5% chance for golden apple
            item.classList.add('fruit', 'golden-apple');
        } else if (itemType < 0.975) { // 3% chance for raccoon
            item.classList.add('obstacle', 'raccoon');
        } else { // 1% chance for bomb
            item.classList.add('obstacle', 'bomb');
        }

        item.style.top = '0px';
        item.style.left = Math.floor(Math.random() * 13) * 30 + 'px';
        document.getElementById('game-container').appendChild(item);
        items.push(item);
    }
}


function moveItems() {
    items.forEach((item, index) => {
        const itemTop = parseInt(item.style.top);
        if (itemTop > 600) {
            item.remove();
            items.splice(index, 1);
        } else {
            item.style.top = itemTop + fallSpeed + 'px'; // Gebruik de huidige snelheid
        }
        checkCollision(item);
    });
}

function checkCollision(item) {
    const itemRect = item.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();
    
    if (
        itemRect.left < playerRect.right &&
        itemRect.right > playerRect.left &&
        itemRect.top < playerRect.bottom &&
        itemRect.bottom > playerRect.top
    ) {
        if (item.classList.contains('fruit')) {
            item.classList.add('catchFruit');
            setTimeout(() => item.remove(), 500);
            if (item.classList.contains('golden-apple')) {
                score += 10;
            } else {
                updateScore(); // Gebruik nu de nieuwe functie om de score te updaten
            }
        } else if (item.classList.contains('bomb')) {
            showExplosion(item);
            resetGame();
        } else if (item.classList.contains('raccoon')) {
            item.classList.add('catchObstacle');
            setTimeout(() => item.remove(), 500);
            score = Math.max(0, Math.floor(score * 0.8));
            scoreDisplay.textContent = `Score: ${score}`;
        }
        items.splice(items.indexOf(item), 1);
        updateHighscore();
    }
}

function showExplosion(item) {
    explosion.style.left = item.style.left; 
    explosion.style.top = item.style.top; 
    explosion.style.display = 'block'; 

    setTimeout(() => {
        explosion.style.display = 'none'; 
        item.remove(); 
    }, 500);
}

function updateScore() {
    score++;
    scoreDisplay.textContent = `Score: ${score}`;
    
    // Check of het tijd is om een level omhoog te gaan
    if (score >= level * levelUpScore) {
        level++;
        fallSpeed += 1; // Verhoog de snelheid
        alert(`Level Up! Je bent nu op Level ${level}`);
    }
}

function updateHighscore() {
    if (score > highscore) {
        highscore = score;
        localStorage.setItem('highscore', highscore);
        highscoreDisplay.textContent = `Highscore: ${highscore}`;
    }
}

function togglePause() {
    if (isPaused) {
        gameInterval = setInterval(gameLoop, 50);
        document.getElementById('pause-button').textContent = '⏸️';
    } else {
        clearInterval(gameInterval);
        document.getElementById('pause-button').textContent = '▶️';
    }
    isPaused = !isPaused;
}

function resetGame() {
    score = 0;
    scoreDisplay.textContent = `Score: ${score}`;
    items.forEach(item => item.remove());
    items = [];
    clearInterval(gameInterval);
    startGame();
}

function gameLoop() {
    if (!isPaused) {
        moveItems();
        if (Math.random() < 0.1) addItem();
    }
}

function startGame() {
    highscoreDisplay.textContent = `Highscore: ${highscore}`;
    gameInterval = setInterval(gameLoop, 50);
}

startGame();
