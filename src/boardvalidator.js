/* eslint-disable linebreak-style */
/* eslint-disable prefer-destructuring */
/* eslint-disable max-len */
/* eslint-disable class-methods-use-this */
/* eslint-disable indent */
/* eslint-disable no-undef */

// function randomInt(min, max) {
//   return Math.floor(Math.random() * (max - min + 1) + min);
// }

export default class BoardValidator {
	constructor() {
    this.directions = ['north', 'east', 'south', 'west'];
    this.position = { row: undefined, column: undefined };
    this.currentIndex = undefined;
    this.facing = 'east';
    this.visited = [];
    this.checkInterval = undefined;
  }

  turn(startingDirection, turnDirection, directions) {
    const facingIndex = directions.indexOf(startingDirection);
    let newDirection;
    if (turnDirection === 'left') {
      newDirection = directions[facingIndex - 1];
      if (!newDirection) {
        newDirection = directions[directions.length - 1];
      }
    }
    if (turnDirection === 'right') {
      newDirection = directions[facingIndex + 1];
      if (!newDirection) {
        newDirection = directions[0];
      }
    }
    return newDirection;
  }

  // getNextCellIndex(facingDirection, grid, currentIndex) {
  //   // const currentIndex = this.currentIndex;
  //   console.log('facing?', facingDirection, grid)
  //   console.log('currin', currentIndex)
  //   let nextIndex;
  //   if (facingDirection === 'north') {
  //     nextIndex = currentIndex - grid[0].length;
  //   }
  //   if (facingDirection === 'east') {
  //     nextIndex = currentIndex + 1;
  //   }
  //   if (facingDirection === 'south') {
  //     nextIndex = currentIndex + grid[0].length;
  //   }
  //   if (facingDirection === 'west') {
  //     nextIndex = currentIndex - 1;
  //   }
  //   return nextIndex;
  // }

  floodFill(grid) {
    const allCells = [...grid].flat();
    const startingCell = allCells.filter(cell => cell.number == 1)[0];
    this.currentIndex = (startingCell.row * grid.length) + (startingCell.column);
    this.visited.push(this.currentIndex);
    const startingIndex = this.currentIndex;
    // document.getElementById(`cell-${this.currentIndex}`).classList.add('highlighted');
    const adjacents = {
      north: this.getNextCellIndex('north', [...grid]),
      east: this.getNextCellIndex('east', [...grid]),
      south: this.getNextCellIndex('south', [...grid]),
      west: this.getNextCellIndex('west', [...grid])
    };
    Object.values(adjacents).forEach((cellIndex) => {
      const offGrid = cellIndex < 0 || cellIndex >= allCells.length;
      const beyondLeftEdge = this.currentIndex % grid[0].length === 0 && cellIndex === this.currentIndex - 1;
      const beyondRightEdge = this.currentIndex % grid[0].length === grid[0].length - 1 && cellIndex === this.currentIndex + 1;
      if (!allCells[cellIndex].shaded && !offGrid && !beyondLeftEdge && !beyondRightEdge) {
        this.visited.push(cellIndex);
        // document.getElementById(`cell-${cellIndex}`).classList.add('highlighted');
      }
    });
  }

  // getIntersectingWords(grid, startingCell) {
  //   for (let i = startingCell.column + 1; i < grid[0].length; i += 1) {
  //     const cellIndex = grid[startingCell.row][i].index;
  //     if (grid[startingCell.row][i].shaded) { break; }
  //     if (!this.visited.includes(cellIndex)) {
  //       this.visited.push(cellIndex);
  //       // document.getElementById(`cell-${cellIndex}`).classList.add('highlighted');
  //     }
  //   }
  //   for (let i = startingCell.column - 1; i >= 0; i -= 1) {
  //     const cellIndex = grid[startingCell.row][i].index;
  //     if (grid[startingCell.row][i].shaded) { break; }
  //     if (!this.visited.includes(cellIndex)) {
  //       this.visited.push(cellIndex);
  //       // document.getElementById(`cell-${cellIndex}`).classList.add('highlighted');
  //     }
  //   }
  //   for (let i = startingCell.row + 1; i < grid.length; i += 1) {
  //     const cellIndex = grid[i][startingCell.column].index;
  //     if (grid[i][startingCell.column].shaded) { break; }
  //     if (!this.visited.includes(cellIndex)) {
  //       this.visited.push(cellIndex);
  //       // document.getElementById(`cell-${cellIndex}`).classList.add('highlighted');
  //     }
  //   }
  //   for (let i = startingCell.row - 1; i >= 0; i -= 1) {
  //     const cellIndex = grid[i][startingCell.column].index;
  //     if (grid[i][startingCell.column].shaded) { break; }
  //     if (!this.visited.includes(cellIndex)) {
  //       this.visited.push(cellIndex);
  //       // document.getElementById(`cell-${cellIndex}`).classList.add('highlighted');
  //     }
  //   }
  // }

  checkIfContiguous(grid, allCells) {
    function turn(startingDirection, turnDirection, directions) {
      directions = directions || this.directions;
      const facingIndex = directions.indexOf(startingDirection);
      let newDirection;
      if (turnDirection === 'left') {
        newDirection = directions[facingIndex - 1];
        if (!newDirection) {
          newDirection = directions[directions.length - 1];
        }
      }
      if (turnDirection === 'right') {
        newDirection = directions[facingIndex + 1];
        if (!newDirection) {
          newDirection = directions[0];
        }
      }
      return newDirection;
    }
    function getNextCellIndex(facingDirection, currentIndex) {
      // const currentIndex = this.currentIndex;
      let nextIndex;
      if (facingDirection === 'north') {
        nextIndex = currentIndex - 15;
      }
      if (facingDirection === 'east') {
        nextIndex = currentIndex + 1;
      }
      if (facingDirection === 'south') {
        nextIndex = currentIndex + 15;
      }
      if (facingDirection === 'west') {
        nextIndex = currentIndex - 1;
      }
      return nextIndex;
    }
    function getIntersectingWords(grid, startingCell, visited) {
      for (let i = startingCell.column + 1; i < grid[0].length; i += 1) {
        const cellIndex = grid[startingCell.row][i].index;
        if (grid[startingCell.row][i].shaded) { break; }
        if (!visited.includes(cellIndex)) {
          visited.push(cellIndex);
          // document.getElementById(`cell-${cellIndex}`).classList.add('highlighted');
        }
      }
      for (let i = startingCell.column - 1; i >= 0; i -= 1) {
        const cellIndex = grid[startingCell.row][i].index;
        if (grid[startingCell.row][i].shaded) { break; }
        if (!visited.includes(cellIndex)) {
          visited.push(cellIndex);
          // document.getElementById(`cell-${cellIndex}`).classList.add('highlighted');
        }
      }
      for (let i = startingCell.row + 1; i < grid.length; i += 1) {
        const cellIndex = grid[i][startingCell.column].index;
        if (grid[i][startingCell.column].shaded) { break; }
        if (!visited.includes(cellIndex)) {
          visited.push(cellIndex);
          // document.getElementById(`cell-${cellIndex}`).classList.add('highlighted');
        }
      }
      for (let i = startingCell.row - 1; i >= 0; i -= 1) {
        const cellIndex = grid[i][startingCell.column].index;
        if (grid[i][startingCell.column].shaded) { break; }
        if (!visited.includes(cellIndex)) {
          visited.push(cellIndex);
          // document.getElementById(`cell-${cellIndex}`).classList.add('highlighted');
        }
      }
    }
    let sameIndexCount = 0;
    // const allCells = [...grid].flat();
     
    // const startingCell = allCells.filter(cell => cell.number == 1)[0];
    const startingCell = allCells.find(cell => !cell.shaded)
    this.currentIndex = (startingCell.row * grid.length) + (startingCell.column);
    this.visited.push(this.currentIndex);
    const startingIndex = this.currentIndex;
    let lastIndex = startingIndex;
    const lockedCells = [];
    // document.getElementById(`cell-${this.currentIndex}`).classList.add('highlighted');
    const visitedAdjacentCells = [];
    while (sameIndexCount < 5 && this.currentIndex < startingIndex + 15) {
      let reverseIndex = this.directions.indexOf(this.facing) - 2;
      if (reverseIndex < 0) {
        reverseIndex = this.directions.indexOf(this.facing) + 2;
      }

      let nextIndex;
      let nextFacingDirection;

      const turnDirections = [
        turn(this.facing, 'left', this.directions),
        this.facing,
        turn(this.facing, 'right', this.directions)
      ];

      const moves = [
        getNextCellIndex(turn(this.facing, 'left', this.directions), this.currentIndex),
        getNextCellIndex(this.facing, this.currentIndex),
        getNextCellIndex(turn(this.facing, 'right', this.directions), this.currentIndex)
      ];
      for (let i = 0; i < 3; i += 1) {
        if (!nextIndex) {
          const cellIndex = moves[i];
          if (cellIndex >= 0 && cellIndex < allCells.length) {
            const cell = allCells[cellIndex];
            const beyondLeftEdge = this.currentIndex % grid[0].length === 0 && cellIndex === this.currentIndex - 1;
            const beyondRightEdge = this.currentIndex % grid[0].length === grid[0].length - 1 && cellIndex === this.currentIndex + 1;
            const visited = this.visited.includes(cellIndex);
            const locked = lockedCells.includes(cellIndex);
            if (!locked && !cell.shaded && !beyondLeftEdge && !beyondRightEdge) {
              nextIndex = cellIndex;
              if (!visited) {
                this.visited.push(cellIndex);
              } else {
                // visitedAdjacentCells.push(cellIndex);
              }
              nextFacingDirection = turnDirections[i];
            }
          }
        }
      }

      if (nextIndex) {
        lastIndex = this.currentIndex;
        this.currentIndex = nextIndex;
        getIntersectingWords(grid, allCells[nextIndex], this.visited);
        this.facing = nextFacingDirection;
        if (lastIndex !== nextIndex) {
          // document.getElementById(`cell-${nextIndex}`).classList.add('highlighted');
          sameIndexCount = 0;
        } else {
          sameIndexCount += 1;
        }
      } else {
        lockedCells.push(this.currentIndex);
        lastIndex = this.currentIndex;
        nextIndex = getNextCellIndex(this.directions[reverseIndex], grid, this.currentIndex);
        this.currentIndex = nextIndex;
        this.facing = turn(this.facing, 'right', this.directions);
      }
    }
    const nonWhites = allCells.filter(cell => !cell.shaded).length;
    let coveredAll = this.visited.length === nonWhites;
    for (let i = 0; i < 15; i += 1) {
      if (!coveredAll) {
        this.visited.forEach(cellIndex => getIntersectingWords(grid, allCells[cellIndex], this.visited));
        coveredAll = this.visited.length === nonWhites;
      }
    }
    this.visited.length = 0;
    return coveredAll;
  }

  checkIfContiguous2(grid) {
    // const startTime = window.performance.now();
    let sameIndexCount = 0;
    const allCells = [...[...grid]];
    console.log('all', allCells)
    // const allCells = [...grid].flat();    
    const startingCell = allCells.filter(cell => cell.number == 1)[0];
    this.currentIndex = (startingCell.row * grid.length) + (startingCell.column);
    this.visited.push(this.currentIndex);
    const startingIndex = this.currentIndex;
    let lastIndex = startingIndex;
    const lockedCells = [];
    // document.getElementById(`cell-${this.currentIndex}`).classList.add('highlighted');
      while (sameIndexCount < 5 && this.currentIndex < startingIndex + grid[0].length) {
       
      let reverseIndex = this.directions.indexOf(this.facing) - 2;
      if (reverseIndex < 0) {
        reverseIndex = this.directions.indexOf(this.facing) + 2;
      }
      const visitedAdjacentCells = [];

      let nextIndex;
      let nextFacingDirection;

      const turnDirections = [
        this.turn(this.facing, 'left'),
        this.facing,
        this.turn(this.facing, 'right')
      ];

      const moves = [
        this.getNextCellIndex(this.turn(this.facing, 'left'), [...grid]),
        this.getNextCellIndex(this.facing, [...grid]),
        this.getNextCellIndex(this.turn(this.facing, 'right'), [...grid])
      ];
      for (let i = 0; i < 3; i += 1) {
        if (!nextIndex) {
          const cellIndex = moves[i];
          if (cellIndex >= 0 && cellIndex < allCells.length) {
            const cell = allCells[cellIndex];
            const beyondLeftEdge = this.currentIndex % grid[0].length === 0 && cellIndex === this.currentIndex - 1;
            const beyondRightEdge = this.currentIndex % grid[0].length === grid[0].length - 1 && cellIndex === this.currentIndex + 1;
            const visited = this.visited.includes(cellIndex);
            const locked = lockedCells.includes(cellIndex);
            if (!locked && !cell.shaded && !beyondLeftEdge && !beyondRightEdge) {
              nextIndex = cellIndex;
              if (!visited) {
                this.visited.push(cellIndex);
              } else {
                visitedAdjacentCells.push(cellIndex);
              }
              nextFacingDirection = turnDirections[i];
            }
          }
        }
      }

      if (nextIndex) {
        lastIndex = this.currentIndex;
        this.currentIndex = nextIndex;
        this.getIntersectingWords(grid, allCells[nextIndex]);
        this.facing = nextFacingDirection;
        if (lastIndex !== nextIndex) {
          // document.getElementById(`cell-${nextIndex}`).classList.add('highlighted');
          sameIndexCount = 0;
        } else {
          sameIndexCount += 1;
        }
      } else {
        lockedCells.push(this.currentIndex);
        lastIndex = this.currentIndex;
        nextIndex = this.getNextCellIndex(this.directions[reverseIndex], [...grid]);
        this.currentIndex = nextIndex;
        this.facing = this.turn(this.facing, 'right');
      }
    }
    const nonWhites = [...allCells].filter(cell => !cell.shaded).length;
    let coveredAll = this.visited.length === nonWhites;
    for (let i = 0; i < 15; i += 1) {
      if (!coveredAll) {
        this.visited.forEach(cellIndex => this.getIntersectingWords(grid, allCells[cellIndex]));
        coveredAll = this.visited.length === nonWhites;
      }
    }
    this.visited.length = 0;
    return coveredAll;
  }
}
