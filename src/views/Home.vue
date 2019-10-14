<template>
  <div class="home">
    <div class='board-area'>
      <Board 
        :size='boardSize'
        :cellGrid='cellGrid'
        :handleCellClick='handleCellClick'
      />
    </div>
    <ControlPanel
      :addCellLabels='addCellLabels'
    />
  </div>
</template>

<script>
import Board from '../components/Board.vue';
import ControlPanel from '../components/ControlPanel.vue';

export default {
  name: 'home',
  data: () => ({
    boardSize: { width: 13, height: 13 },
    cellGrid: []
  }),
  mounted() {
    const width = this.boardSize.width;
    const height = this.boardSize.height;
    const grid = [];
    for (let r = 0; r < height; r++) {
      grid[r] = [];
      for (let c = 0; c < width; c++) {
        grid[r][c] = {
          row: r, column: c, letter: '', number: '', shaded: false,	selected: false
        };
      }
    }
    this.cellGrid = grid;
  },
  components: {
    Board,
    ControlPanel
  },
  methods: {
    getMirrorCoords(symmetry, startingCoords) {
      let coordArray = [];
      if (symmetry >= 1) {
        let mirrorCoords = {
          column: (this.boardSize.width-1)-startingCoords.column, 
          row: (this.boardSize.height-1)-startingCoords.row
        };
        coordArray.push(mirrorCoords);      
      }
      if (symmetry === 2) {
        let mirrorCoords1 = {
          column: startingCoords.row, 
          row: (this.boardSize.width-1)-startingCoords.column
        };
        let mirrorCoords2 = {
          column: (this.boardSize.width-1)-mirrorCoords1.column, 
          row: (this.boardSize.height-1)-mirrorCoords1.row
        };
        coordArray.push(mirrorCoords1);      
        coordArray.push(mirrorCoords2);      
      }
      return coordArray;
    },
    handleCellClick(e) {
      const clickedIndex = e.target.id.split('-')[1];
      const cellCoords = { row: this.cellGrid.flat()[clickedIndex].row, column: this.cellGrid.flat()[clickedIndex].column, };
      const newCellGrid = [...this.cellGrid];
      const cellObject = newCellGrid[cellCoords.row][cellCoords.column];
      let newShadedStatus = !cellObject.shaded;
      cellObject.shaded = newShadedStatus;
      this.getMirrorCoords(1, cellCoords).forEach(coords => {
        let mirrorCell = newCellGrid[coords.row][coords.column];
        mirrorCell.shaded = newShadedStatus;
      });
      this.addCellLabels()
      // this.cellGrid = newCellGrid;
    },    
    addCellLabels() {
      console.warn('LABELLING THEM')
      let start = window.performance.now();
      let updatedCells = [...this.cellGrid];
      let totalCells = updatedCells.flat().length;
      let onNumberedCell = 0;
      let numberedIndexes = [];
      [...updatedCells].forEach((row, r, rowsArray) => {
        updatedCells[r] = row.map((cell, c, cellArray) => {        
          let cellTotalIndex = (r * this.boardSize.height) + c + 1;            
          let numbered;
          if (cell.shaded) {
            // make the cells below and to the right numbered
            numberedIndexes.push(cellTotalIndex + this.boardSize.width);
            numberedIndexes.push(cellTotalIndex + 1);
          } else {          
            if (r === 0 || c === 0 || numberedIndexes.includes(cellTotalIndex)) {      
              numbered = true
              onNumberedCell++;
            }
          }
          let newCell = { ...cell };
          newCell.number = numbered ? onNumberedCell : null;
          if (numbered) {
            console.log('gave number', newCell.number, 'to', cellTotalIndex)  
          }
          return cell = newCell;
        });
      });
      console.warn('labeled cells in', window.performance.now() - start);
      this.cellGrid = updatedCells;
    }
  }
};
</script>

<style scoped>
.home {
  min-height: 100%;
  display: grid;
  grid-template-rows:
    100vmin
    1fr
    /* var(--footer-height) */
  ;
}
.board-area {
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}
@media (orientation: landscape) {
	.board-area {
		grid-column-start: 1;
	}
}
</style>
