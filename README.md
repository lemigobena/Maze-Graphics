# Maze Generator and Solver

This project fulfills the "Building and Running Mazes" Computer Graphics assignment. It demonstrates dynamic maze generation and solving visually directly in your web browser.

## Logic Overview

### Data Structures
The maze walls are explicitly maintained using the requested approach:
- `northWall[r][c]`: Stores the integrity of the top wall for each cell.
- `eastWall[r][c]`: Stores the integrity of the right/left walls.
- Note: To easily handle the "phantom" bottom edge and the left-most edge gaps, arrays are extended to `[R+1][C]` and `[R][C+1]` respectively. `1` means intact, `0` means missing.

### Generating the Maze (The "Mouse")
The generation process starts with all walls intact (a grid). 
- An invisible "mouse" is placed randomly.
- It uses a **Randomized Depth-First Search (DFS)** with a Stack.
- At each step, it checks for unvisited neighbors, picks one randomly, "eats" the connecting wall, marks it as visited, and pushes the new cell to the stack.
- When it hits a dead-end, it pops the stack to backtrack.
- The entire process is animated so you can watch the maze dynamically form!

### Running the Maze (Backtracking)
To solve the maze, the program utilizes the **backtracking** algorithm:
- The pathfinding mouse starts at the beginning and places its current path on a stack.
- It moves randomly into available adjacent cells (no wall blocking it).
- As it moves, it marks its current path with a **red dot**.
- When it reaches a dead-end, it changes the cell color to **blue** to avoid visiting it again, and pops the stack to step backwards.
- This continues until the end is found.

### The Challenge: Cycles
You can toggle the **"Enable Challenge Mode (Cycles)"** checkbox. When enabled, the mouse will randomly eat an extra wall (about 1 in 20 times) during generation.
This creates "cycles" in the maze, meaning it is no longer a strict tree and there are multiple paths to some cells. 
*Why does this matter?* Because a cycle that encircles the ending point will successfully defeat the classic "shoulder-to-the-wall" rule!

## How to Run
Simply open `index.html` in any modern web browser. No complex compilation required.
1. Enter your desired Row and Column sizes.
2. Check the Challenge Mode box if desired.
3. Click **Generate Maze** and watch the mouse carve out the paths.
4. Click **Solve Maze** to watch it backtrack and find the end!
