# Maze Generator and Solver

This project fulfills the "Building and Running Mazes" Computer Graphics assignment with an extensive suite of visualization and UI enhancements. It demonstrates dynamic maze generation and solving visually directly in your web browser.

## Logic Overview

### Data Structures
The maze walls are explicitly maintained using the requested approach:
- `northWall[r][c]`: Stores the integrity of the top wall for each cell.
- `eastWall[r][c]`: Stores the integrity of the right/left walls.
- Note: To easily handle the "phantom" bottom edge and the left-most edge gaps, arrays are extended to `[R+1][C]` and `[R][C+1]` respectively. `1` means intact, `0` means missing.

### Generation Algorithms
You can toggle between two generation styles:
1. **DFS (Stack) - Tortuous Paths**: The default assignment logic. An invisible mouse uses a Randomized Depth-First Search with a Stack to "eat" walls. It creates long, winding, and tortuous paths.
2. **BFS (Queue) - Spreading**: An easter-egg mode using a Queue instead of a Stack, resulting in a maze that visually expands evenly outwards from the center like water spreading.

### Solving Algorithms
You can toggle between two solvers:
1. **Backtracking (Stack)**: The standard solver. Moves randomly and leaves a red trail. When hitting a dead end, it turns blue and backtracks by popping the stack.
2. **Shoulder-to-the-Wall**: The Addendum solver. This mouse uses the right-hand rule, attempting to turn right, go straight, turn left, or turn around at every junction.

### The Challenge: Cycles
You can toggle the **"Challenge Mode (Cycles)"** checkbox. When enabled, the mouse will randomly eat an extra wall (about 1 in 20 times) during generation.
This creates "cycles" in the maze. A cycle that encircles the ending point will successfully defeat the "Shoulder-to-the-wall" solver, trapping it in an infinite loop!

## UI Features

- **Interactive Emojis**: The start and end points are represented by 🐁 and 🧀! You can **click anywhere on the canvas** after the maze generates to set custom starting and ending points.
- **Variable Speed**: Use the slider to slow down or speed up the animations.
- **Step-by-Step Mode**: Check the step-by-step box to pause the algorithm completely. Click "Next Step" to manually trace through the code's logic.
- **Stats Dashboard**: Tracks the length of the current path, total cells visited, and the number of backtracks/turn-arounds made.
- **Real-time Stack Visualizer**: Watch the literal algorithm data structure (Stack or Queue) push and pop cells in real-time as the generation and solving occur.

## How to Run
Simply open `index.html` in any modern web browser. No complex compilation required.
1. Enter your desired Row and Column sizes.
2. Select your algorithms and speed.
3. Click **Generate Maze**.
4. (Optional) Click on the canvas to move the 🐁 and 🧀.
5. Click **Solve Maze** to watch it go!
