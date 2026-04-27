// DOM Elements
const canvas = document.getElementById('maze-canvas');
const ctx = canvas.getContext('2d');
const rowsInput = document.getElementById('rows');
const colsInput = document.getElementById('cols');
const challengeModeInput = document.getElementById('challenge-mode');
const btnGenerate = document.getElementById('btn-generate');
const btnSolve = document.getElementById('btn-solve');
const statusText = document.getElementById('status-text');

// Maze Variables
let R = 20;
let C = 20;
let cellSize = 0;
let xOffset = 0;
let yOffset = 0;

let northWall = [];
let eastWall = [];
let visited = [];

let startCell = null;
let endCell = null;

let isAnimating = false;
let animationDelay = 10; // ms

function initMaze() {
    R = parseInt(rowsInput.value);
    C = parseInt(colsInput.value);

    const padding = 20;
    const availWidth = canvas.width - padding * 2;
    const availHeight = canvas.height - padding * 2;
    
    cellSize = Math.min(availWidth / C, availHeight / R);
    xOffset = (canvas.width - (cellSize * C)) / 2;
    yOffset = (canvas.height - (cellSize * R)) / 2;

    northWall = Array.from({ length: R + 1 }, () => Array(C).fill(1));
    eastWall = Array.from({ length: R }, () => Array(C + 1).fill(1));
    visited = Array.from({ length: R }, () => Array(C).fill(0));

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMaze();
}

function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    for (let r = 0; r <= R; r++) {
        for (let c = 0; c < C; c++) {
            if (northWall[r][c] === 1) {
                ctx.beginPath();
                ctx.moveTo(xOffset + c * cellSize, yOffset + r * cellSize);
                ctx.lineTo(xOffset + (c + 1) * cellSize, yOffset + r * cellSize);
                ctx.stroke();
            }
        }
    }

    for (let r = 0; r < R; r++) {
        for (let c = 0; c <= C; c++) {
            if (eastWall[r][c] === 1) {
                ctx.beginPath();
                ctx.moveTo(xOffset + c * cellSize, yOffset + r * cellSize);
                ctx.lineTo(xOffset + c * cellSize, yOffset + (r + 1) * cellSize);
                ctx.stroke();
            }
        }
    }
}

function getUnvisitedNeighbors(r, c) {
    const neighbors = [];
    if (r > 0 && visited[r - 1][c] === 0) neighbors.push({ r: r - 1, c: c, dir: 'N' });
    if (r < R - 1 && visited[r + 1][c] === 0) neighbors.push({ r: r + 1, c: c, dir: 'S' });
    if (c > 0 && visited[r][c - 1] === 0) neighbors.push({ r: r, c: c - 1, dir: 'W' });
    if (c < C - 1 && visited[r][c + 1] === 0) neighbors.push({ r: r, c: c + 1, dir: 'E' });
    return neighbors;
}

function removeWall(r, c, dir) {
    if (dir === 'N') northWall[r][c] = 0;
    if (dir === 'S') northWall[r + 1][c] = 0;
    if (dir === 'W') eastWall[r][c] = 0;
    if (dir === 'E') eastWall[r][c + 1] = 0;
}

function drawMouse(r, c, color = '#eab308') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(
        xOffset + c * cellSize + cellSize / 2, 
        yOffset + r * cellSize + cellSize / 2, 
        cellSize * 0.3, 
        0, 
        Math.PI * 2
    );
    ctx.fill();
}

async function generateMaze() {
    if (isAnimating) return;
    isAnimating = true;
    btnGenerate.disabled = true;
    btnSolve.disabled = true;
    statusText.textContent = "Generating maze...";

    initMaze();
    const challengeMode = challengeModeInput.checked;

    let currR = Math.floor(Math.random() * R);
    let currC = Math.floor(Math.random() * C);
    
    visited[currR][currC] = 1;
    const stack = [{ r: currR, c: currC }];

    while (stack.length > 0) {
        let current = stack[stack.length - 1];
        currR = current.r;
        currC = current.c;

        drawMaze();
        drawMouse(currR, currC);
        
        await new Promise(resolve => setTimeout(resolve, animationDelay));

        const neighbors = getUnvisitedNeighbors(currR, currC);

        if (neighbors.length > 0) {
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            removeWall(currR, currC, next.dir);
            
            visited[next.r][next.c] = 1;
            stack.push({ r: next.r, c: next.c });

            if (challengeMode && Math.random() < 0.05) {
                const allDirs = ['N', 'S', 'E', 'W'];
                const randDir = allDirs[Math.floor(Math.random() * allDirs.length)];
                if (randDir === 'N' && currR > 0) removeWall(currR, currC, 'N');
                if (randDir === 'S' && currR < R - 1) removeWall(currR, currC, 'S');
                if (randDir === 'W' && currC > 0) removeWall(currR, currC, 'W');
                if (randDir === 'E' && currC < C - 1) removeWall(currR, currC, 'E');
            }
        } else {
            stack.pop();
        }
    }

    // Set start at top-left and end at bottom-right
    startCell = { r: 0, c: 0 };
    endCell = { r: R - 1, c: C - 1 };

    drawMaze();
    drawMouse(startCell.r, startCell.c, '#10b981'); 
    drawMouse(endCell.r, endCell.c, '#ef4444');

    isAnimating = false;
    btnGenerate.disabled = false;
    btnSolve.disabled = false;
    statusText.textContent = "Maze generated. Ready to solve!";
}

function getValidMoves(r, c) {
    const moves = [];
    if (r > 0 && northWall[r][c] === 0) moves.push({ r: r - 1, c: c, dir: 'N' });
    if (r < R - 1 && northWall[r + 1][c] === 0) moves.push({ r: r + 1, c: c, dir: 'S' });
    if (c > 0 && eastWall[r][c] === 0) moves.push({ r: r, c: c - 1, dir: 'W' });
    if (c < C - 1 && eastWall[r][c + 1] === 0) moves.push({ r: r, c: c + 1, dir: 'E' });
    return moves;
}

async function solveMaze() {
    if (isAnimating || !startCell || !endCell) return;
    isAnimating = true;
    btnGenerate.disabled = true;
    btnSolve.disabled = true;
    statusText.textContent = "Solving maze...";

    visited = Array.from({ length: R }, () => Array(C).fill(0));
    
    const stack = [{ r: startCell.r, c: startCell.c }];
    visited[startCell.r][startCell.c] = 1;
    
    let pathFound = false;

    drawMaze();
    drawMouse(endCell.r, endCell.c, '#10b981');

    while (stack.length > 0) {
        let current = stack[stack.length - 1];
        let currR = current.r;
        let currC = current.c;

        if (currR === endCell.r && currC === endCell.c) {
            pathFound = true;
            break;
        }

        drawMaze();
        for (let i = 0; i < R; i++) {
            for (let j = 0; j < C; j++) {
                if (visited[i][j] === 2) {
                    drawMouse(i, j, '#3b82f6');
                }
            }
        }
        for (let i = 0; i < stack.length; i++) {
            drawMouse(stack[i].r, stack[i].c, '#ef4444');
        }
        
        await new Promise(resolve => setTimeout(resolve, animationDelay * 2));

        const moves = getValidMoves(currR, currC);
        const unvisitedMoves = moves.filter(m => visited[m.r][m.c] === 0);

        if (unvisitedMoves.length > 0) {
            const next = unvisitedMoves[Math.floor(Math.random() * unvisitedMoves.length)];
            visited[next.r][next.c] = 1;
            stack.push({ r: next.r, c: next.c });
        } else {
            visited[currR][currC] = 2;
            stack.pop();
        }
    }

    drawMaze();
    for (let i = 0; i < R; i++) {
        for (let j = 0; j < C; j++) {
            if (visited[i][j] === 2) {
                drawMouse(i, j, '#3b82f6');
            }
        }
    }
    for (let i = 0; i < stack.length; i++) {
        drawMouse(stack[i].r, stack[i].c, '#ef4444');
    }

    statusText.textContent = pathFound ? "Maze solved!" : "No path found.";
    isAnimating = false;
    btnGenerate.disabled = false;
    btnSolve.disabled = false;
}

btnGenerate.addEventListener('click', generateMaze);
btnSolve.addEventListener('click', solveMaze);

initMaze();
