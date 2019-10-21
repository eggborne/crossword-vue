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
    this.perimeterScanner = new PerimeterScanner();
  }  
}

class PerimeterScanner {
  constructor() {
    this.directions = ['north', 'east', 'south', 'west'];
    this.position = { row: undefined, column: undefined };
    this.currentIndex = undefined;
    this.facing = 'east';
    this.visited = [];
    this.checkInterval = undefined;
  }

  turn(startingDirection, turnDirection) {
    const facingIndex = this.directions.indexOf(startingDirection);
    let newDirection;
    if (turnDirection === 'left') {
      newDirection = this.directions[facingIndex - 1];
      if (!newDirection) {
        newDirection = this.directions[this.directions.length - 1];
      }
    }
    if (turnDirection === 'right') {
      newDirection = this.directions[facingIndex + 1];
      if (!newDirection) {
        newDirection = this.directions[0];
      }
    }
    return newDirection;
  }

  getNextCellIndex(facingDirection, grid) {
    const currentIndex = this.currentIndex;
    let nextIndex;
    if (facingDirection === 'north') {
      nextIndex = currentIndex - grid[0].length;
    }
    if (facingDirection === 'east') {
      nextIndex = currentIndex + 1;
    }
    if (facingDirection === 'south') {
      nextIndex = currentIndex + grid[0].length;
    }
    if (facingDirection === 'west') {
      nextIndex = currentIndex - 1;
    }
    return nextIndex;
  }

  floodFill(grid) {
    const allCells = [...grid].flat();
    const startingCell = allCells.filter(cell => cell.number == 1)[0];
    this.currentIndex = (startingCell.row * grid.length) + (startingCell.column);
    this.visited.push(this.currentIndex);
    const startingIndex = this.currentIndex;
    document.getElementById(`cell-${this.currentIndex}`).classList.add('highlighted');
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
        document.getElementById(`cell-${cellIndex}`).classList.add('highlighted');
      }
    });
  }

  checkIfContiguous(grid) {
    let counter = 0;
    let sameIndexCount = 0;
    const allCells = [...grid].flat();
    const nonWhites = [...allCells].filter(cell => !cell.shaded).length;
    const startingCell = allCells.filter(cell => cell.number == 1)[0];
    this.currentIndex = (startingCell.row * grid.length) + (startingCell.column);
    this.visited.push(this.currentIndex);
    const startingIndex = this.currentIndex;
    let lastIndex = startingIndex;
    document.getElementById(`cell-${this.currentIndex}`).classList.add('highlighted');
    this.checkInterval = setInterval(() => {
      counter += 1;
      if (sameIndexCount === 5 || this.currentIndex === startingIndex + grid[0].length) {
        window.clearInterval(this.checkInterval);
        console.error('SUCCEESS!! !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');

        return true;
      }
      let reverseIndex = this.directions.indexOf(this.facing) - 2;
      if (reverseIndex < 0) {
        reverseIndex = this.directions.indexOf(this.facing) + 2;
      }
      const move = '';
      const visitedAdjacentCells = [];
      const adjacents = {
        north: this.getNextCellIndex('north', [...grid]),
        east: this.getNextCellIndex('east', [...grid]),
        south: this.getNextCellIndex('south', [...grid]),
        west: this.getNextCellIndex('west', [...grid]),
      };

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
      console.log('this.currentIndex', this.currentIndex, 'moves', moves);

      for (let i = 0; i < 3; i += 1) {
        if (!nextIndex) {
          const cellIndex = moves[i];
          if (cellIndex >= 0 && cellIndex < allCells.length) {
            const cell = allCells[cellIndex];
            const beyondLeftEdge = this.currentIndex % grid[0].length === 0 && cellIndex === this.currentIndex - 1;
            const beyondRightEdge = this.currentIndex % grid[0].length === grid[0].length - 1 && cellIndex === this.currentIndex + 1;
            const visited = this.visited.includes(cellIndex);
            if (!cell.shaded && !beyondLeftEdge && !beyondRightEdge) {
              nextIndex = cellIndex;
              if (!visited) {
                this.visited.push(cellIndex);
              } else {
                visitedAdjacentCells.push(cellIndex);
              }
              nextFacingDirection = turnDirections[i];
              console.warn('we is nextIndex', nextIndex, 'nextfac', nextFacingDirection);
            }
          }
        }
      }

      if (nextIndex) {
        lastIndex = this.currentIndex;
        this.currentIndex = nextIndex;
        this.facing = nextFacingDirection;
        if (lastIndex !== nextIndex) {
          // document.getElementById(`cell-${lastIndex}`).classList.remove('highlighted')
          document.getElementById(`cell-${nextIndex}`).classList.add('highlighted');
          sameIndexCount = 0;
        } else {
          sameIndexCount += 1;
        }
      } else if (visitedAdjacentCells.length === 1) {
        lastIndex = this.currentIndex;
        nextIndex = visitedAdjacentCells[0];
        this.currentIndex = nextIndex;
        this.facing = nextFacingDirection;
        if (lastIndex !== nextIndex) {
          // document.getElementById(`cell-${lastIndex}`).classList.remove('highlighted')
          document.getElementById(`cell-${nextIndex}`).classList.add('highlighted');
          sameIndexCount = 0;
        } else {
          sameIndexCount += 1;
        }
      } else {
        sameIndexCount += 1;
      }
      console.warn('------------------------------');
    }, 100);
  }
}
