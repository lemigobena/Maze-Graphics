// DOM Elements
const canvas = document.getElementById('maze-canvas');
const ctx = canvas.getContext('2d');
const rowsInput = document.getElementById('rows');
const colsInput = document.getElementById('cols');
const challengeModeInput = document.getElementById('challenge-mode');
const genTypeInput = document.getElementById('gen-type');
const solverTypeInput = document.getElementById('solver-type');
const speedInput = document.getElementById('speed');
const speedValText = document.getElementById('speed-val');
const stepModeInput = document.getElementById('step-mode');
const btnNextStep = document.getElementById('btn-next-step');
const btnGenerate = document.getElementById('btn-generate');
const btnSolve = document.getElementById('btn-solve');
const statusText = document.getElementById('status-text');
const stackContainer = document.getElementById('stack-container');

// Stats Elements
const statPath = document.getElementById('stat-path');
const statVisited = document.getElementById('stat-visited');
const statBacktracks = document.getElementById('stat-backtracks');

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
let animationDelay = parseInt(speedInput.value);
let manualStepResolve = null;
let isGeneratedAndReady = false;

// Stats Data
let stats = {
    pathLength: 0,
    visitedCount: 0,
    backtracks: 0
};

// UI Listeners
speedInput.addEventListener('input', (e) => {
    animationDelay = parseInt(e.target.value);
    speedValText.textContent = animationDelay;
});

stepModeInput.addEventListener('change', (e) => {
    btnNextStep.disabled = !e.target.checked || !isAnimating;
});

btnNextStep.addEventListener('click', () => {
    if (manualStepResolve) {
        manualStepResolve();
        manualStepResolve = null;
    }
});

canvas.addEventListener('click', (e) => {
    if (!isGeneratedAndReady || isAnimating) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x < xOffset || x > xOffset + C * cellSize || y < yOffset || y > yOffset + R * cellSize) return;

    const c = Math.floor((x - xOffset) / cellSize);
    const r = Math.floor((y - yOffset) / cellSize);

    if (startCell && endCell) {
        // Reset and place new start
        startCell = {r, c};
        endCell = null;
    } else if (startCell && !endCell) {
        // Ensure not same as start
        if (startCell.r !== r || startCell.c !== c) {
            endCell = {r, c};
        }
    } else {
        startCell = {r, c};
    }

    drawMaze();
    if (startCell) drawEmoji(startCell.r, startCell.c, '🐁');
    if (endCell) drawEmoji(endCell.r, endCell.c, '🧀');
    
    btnSolve.disabled = !(startCell && endCell);
});

// Helper Functions
async function waitForNextStep() {
    if (stepModeInput.checked) {
        btnNextStep.disabled = false;
        await new Promise(resolve => manualStepResolve = resolve);
        btnNextStep.disabled = true;
    } else {
        await new Promise(resolve => setTimeout(resolve, animationDelay));
    }
}

function updateStatsUI() {
    statPath.textContent = stats.pathLength;
    statVisited.textContent = stats.visitedCount;
    statBacktracks.textContent = stats.backtracks;
}

function resetStats() {
    stats = { pathLength: 0, visitedCount: 0, backtracks: 0 };
    updateStatsUI();
}

function clearStackUI() {
    stackContainer.innerHTML = '';
}

function addStackItemUI(r, c, action = 'Push') {
    const el = document.createElement('div');
    el.className = 'stack-item';
    el.innerHTML = `<span>[${r}, ${c}]</span> <span>${action}</span>`;
    stackContainer.prepend(el);
    // Keep max 100 items so UI doesn't lag
    if (stackContainer.children.length > 100) {
        stackContainer.lastChild.remove();
    }
}

function popStackItemUI() {
    if (stackContainer.firstChild) {
        stackContainer.firstChild.classList.add('popped');
        setTimeout(() => {
            if (stackContainer.firstChild && stackContainer.firstChild.classList.contains('popped')) {
                stackContainer.firstChild.remove();
            }
        }, 200);
    }
}

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

function drawEmoji(r, c, emoji) {
    ctx.font = `${cellSize * 0.7}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
        emoji, 
        xOffset + c * cellSize + cellSize / 2, 
        yOffset + r * cellSize + cellSize / 2
    );
}

function drawDot(r, c, color) {
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
    isGeneratedAndReady = false;
    btnGenerate.disabled = true;
    btnSolve.disabled = true;
    statusText.textContent = "Generating maze...";
    clearStackUI();

    initMaze();
    const challengeMode = challengeModeInput.checked;
    const isBFS = genTypeInput.value === 'bfs';

    let currR = Math.floor(Math.random() * R);
    let currC = Math.floor(Math.random() * C);
    
    visited[currR][currC] = 1;
    const list = [{ r: currR, c: currC }];
    addStackItemUI(currR, currC, isBFS ? 'Enqueue' : 'Push');

    while (list.length > 0) {
        // BFS uses shift (queue), DFS uses pop (stack)
        let current = isBFS ? list[0] : list[list.length - 1];
        currR = current.r;
        currC = current.c;

        drawMaze();
        drawDot(currR, currC, '#eab308'); // yellow generation dot
        
        await waitForNextStep();

        const neighbors = getUnvisitedNeighbors(currR, currC);

        if (neighbors.length > 0) {
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            removeWall(currR, currC, next.dir);
            
            visited[next.r][next.c] = 1;
            list.push({ r: next.r, c: next.c });
            addStackItemUI(next.r, next.c, isBFS ? 'Enqueue' : 'Push');

            if (challengeMode && Math.random() < 0.05) {
                const allDirs = ['N', 'S', 'E', 'W'];
                const randDir = allDirs[Math.floor(Math.random() * allDirs.length)];
                if (randDir === 'N' && currR > 0) removeWall(currR, currC, 'N');
                if (randDir === 'S' && currR < R - 1) removeWall(currR, currC, 'S');
                if (randDir === 'W' && currC > 0) removeWall(currR, currC, 'W');
                if (randDir === 'E' && currC < C - 1) removeWall(currR, currC, 'E');
            }
        } else {
            if (isBFS) {
                list.shift();
            } else {
                list.pop();
            }
            popStackItemUI();
        }
    }

    // Default points
    startCell = { r: 0, c: 0 };
    endCell = { r: R - 1, c: C - 1 };

    drawMaze();
    drawEmoji(startCell.r, startCell.c, '🐁');
    drawEmoji(endCell.r, endCell.c, '🧀');

    isAnimating = false;
    isGeneratedAndReady = true;
    btnGenerate.disabled = false;
    btnSolve.disabled = false;
    statusText.textContent = "Maze generated. Click on cells to set custom Start/End points, or click Solve.";
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
    isGeneratedAndReady = false; // Prevent clicking during solve
    btnGenerate.disabled = true;
    btnSolve.disabled = true;
    clearStackUI();
    resetStats();

    const solverType = solverTypeInput.value;
    statusText.textContent = `Solving maze using ${solverType === 'backtrack' ? 'Backtracking' : 'Wall Follower'}...`;

    visited = Array.from({ length: R }, () => Array(C).fill(0));
    
    if (solverType === 'backtrack') {
        await runBacktrackingSolver();
    } else {
        await runWallFollowerSolver();
    }

    isAnimating = false;
    isGeneratedAndReady = true;
    btnGenerate.disabled = false;
    btnSolve.disabled = false;
}

async function runBacktrackingSolver() {
    const stack = [{ r: startCell.r, c: startCell.c }];
    visited[startCell.r][startCell.c] = 1;
    stats.visitedCount++;
    addStackItemUI(startCell.r, startCell.c, 'Push');
    updateStatsUI();
    
    let pathFound = false;

    while (stack.length > 0) {
        let current = stack[stack.length - 1];
        let currR = current.r;
        let currC = current.c;

        stats.pathLength = stack.length;
        updateStatsUI();

        if (currR === endCell.r && currC === endCell.c) {
            pathFound = true;
            break;
        }

        drawSolverState(stack);
        await waitForNextStep();

        const moves = getValidMoves(currR, currC);
        const unvisitedMoves = moves.filter(m => visited[m.r][m.c] === 0);

        if (unvisitedMoves.length > 0) {
            const next = unvisitedMoves[Math.floor(Math.random() * unvisitedMoves.length)];
            visited[next.r][next.c] = 1;
            stats.visitedCount++;
            stack.push({ r: next.r, c: next.c });
            addStackItemUI(next.r, next.c, 'Push');
        } else {
            visited[currR][currC] = 2; // Dead end (blue)
            stats.backtracks++;
            stack.pop();
            popStackItemUI();
        }
        updateStatsUI();
    }

    drawSolverState(stack);
    statusText.textContent = pathFound ? "Maze solved!" : "No path found (Trapped in loop or disconnected).";
}

// Direction enums: 0:N, 1:E, 2:S, 3:W
const DIRS = [
    {dr: -1, dc: 0, wDir: 'N'}, // 0: North
    {dr: 0, dc: 1, wDir: 'E'},  // 1: East
    {dr: 1, dc: 0, wDir: 'S'},  // 2: South
    {dr: 0, dc: -1, wDir: 'W'}  // 3: West
];

function canMove(r, c, dirIdx) {
    const d = DIRS[dirIdx];
    if (d.wDir === 'N' && r > 0 && northWall[r][c] === 0) return true;
    if (d.wDir === 'S' && r < R - 1 && northWall[r + 1][c] === 0) return true;
    if (d.wDir === 'W' && c > 0 && eastWall[r][c] === 0) return true;
    if (d.wDir === 'E' && c < C - 1 && eastWall[r][c + 1] === 0) return true;
    return false;
}

async function runWallFollowerSolver() {
    let currR = startCell.r;
    let currC = startCell.c;
    let currentDir = 1; // start facing East
    
    // Visited in wall follower counts how many times we stepped into a cell.
    // 1 = path, 2 = retraced.
    const path = [];
    
    visited[currR][currC] = 1;
    stats.visitedCount++;
    path.push({r: currR, c: currC});
    addStackItemUI(currR, currC, 'Visit');
    
    let pathFound = false;

    // Safety limit to prevent infinite loops visually hanging forever in cycles
    const maxSteps = R * C * 10; 
    let stepCount = 0;

    while (stepCount < maxSteps) {
        stats.pathLength = path.length;
        updateStatsUI();

        if (currR === endCell.r && currC === endCell.c) {
            pathFound = true;
            break;
        }

        drawSolverState(path);
        await waitForNextStep();

        // Right hand rule: 
        // 1. Try turning right
        // 2. Try going straight
        // 3. Try turning left
        // 4. Turn around (dead end)
        
        let rightDir = (currentDir + 1) % 4;
        let straightDir = currentDir;
        let leftDir = (currentDir + 3) % 4;
        let backDir = (currentDir + 2) % 4;

        let moved = false;
        const priorities = [rightDir, straightDir, leftDir, backDir];

        for (let i = 0; i < priorities.length; i++) {
            let tryDir = priorities[i];
            if (canMove(currR, currC, tryDir)) {
                // Determine if it's a backtrack/turnaround
                if (i === 3) stats.backtracks++;
                
                currR += DIRS[tryDir].dr;
                currC += DIRS[tryDir].dc;
                currentDir = tryDir;
                
                if (visited[currR][currC] === 0) {
                    visited[currR][currC] = 1;
                    stats.visitedCount++;
                } else if (visited[currR][currC] === 1) {
                    // We are retracing
                    visited[currR][currC] = 2; // marking retraced path
                }

                path.push({r: currR, c: currC});
                addStackItemUI(currR, currC, 'Visit');
                moved = true;
                break;
            }
        }

        if (!moved) break; // Completely trapped (shouldn't happen in grid)
        stepCount++;
    }

    drawSolverState(path);
    if (pathFound) {
        statusText.textContent = "Maze solved!";
    } else if (stepCount >= maxSteps) {
        statusText.textContent = "Trapped in an infinite cycle! (Shoulder-to-the-wall defeated)";
    } else {
        statusText.textContent = "No path found.";
    }
}

function drawSolverState(path) {
    drawMaze();
    
    // Draw visited (blue for dead ends / retraces)
    for (let r = 0; r < R; r++) {
        for (let c = 0; c < C; c++) {
            if (visited[r][c] === 2) {
                drawDot(r, c, 'rgba(59, 130, 246, 0.5)'); // blue
            } else if (visited[r][c] === 1) {
                // draw faintly to show exploration in wall follower
                drawDot(r, c, 'rgba(239, 68, 68, 0.3)');
            }
        }
    }

    // Draw active path (red)
    for (let i = 0; i < path.length; i++) {
        drawDot(path[i].r, path[i].c, 'var(--path-color)');
    }

    // Draw cheese at end
    drawEmoji(endCell.r, endCell.c, '🧀');
    
    // Draw mouse at current pos
    if (path.length > 0) {
        const last = path[path.length - 1];
        drawEmoji(last.r, last.c, '🐁');
    }
}

btnGenerate.addEventListener('click', generateMaze);
btnSolve.addEventListener('click', solveMaze);

initMaze();
