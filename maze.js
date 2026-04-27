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

// Data Structures
let northWall = [];
let eastWall = [];
let visited = [];

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

initMaze();
