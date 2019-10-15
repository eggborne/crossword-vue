<template>
  <div class="home">
    <Header 
      :handleClickToBrowse='handleClickToBrowse'
      :handleClickToSave='handleClickToSave'
    />
    <div class='board-area'>
      <Board 
        :cellGrid='cellGrid'
        :handleCellClick='handleCellClick'
      />
    </div>
    <ControlPanel
      :options='options'
      :boardSize='boardSize'
      :symmetry='symmetry'
      :addCellLabels='addCellLabels'
      :adjustOption='adjustOption'
      :adjustRangedOption='adjustRangedOption'
      :clearBoard='clearBoard'
      :shadeBoard='shadeBoard'
      :handleClickToSave='handleClickToSave'
      :handleClickToBrowse='handleClickToBrowse'
      :handleClickChooseDiagram='handleClickChooseDiagram'      
    />    
    <div v-if='showingModal' id='dark-mask'></div>
    <SaveModal
      v-if='showingModal === `save`'      
      :handleSaveDiagram='handleSaveDiagram'
      :handleClickCancelSave='handleClickCancelSave'
    />
    <BrowseModal
      v-if='showingModal === `browse`'
      :diagrams='diagrams'
      :handleClickChooseDiagram='handleClickChooseDiagram'
      :handleClickCancelBrowse='handleClickCancelBrowse'
    />
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import Board from '../components/Board.vue';
import ControlPanel from '../components/ControlPanel.vue';
import BrowseModal from '../components/BrowseModal.vue';
import SaveModal from '../components/SaveModal.vue';
import axios from 'axios';

export default {
  name: 'home',
  data: () => ({
    showingModal: undefined,
    wordList: [],
    diagrams: ['cock', 'balls'],
    boardSize: { width: 13, height: 13 },
    symmetry: 2,
    cellGrid: [],
    options: {
      diagramSize: {
        name: 'diagramSize',
        title: 'Size',
        minValue: 11,
        maxValue: 23,
        step: 2,
        cssVar: '--cells-wide',
        cssUnit: ''
      },
      symmetry: {
        name: 'symmetry',
        title: 'Symmetry',
        minValue: 0,
        maxValue: 2,
        step: 1,
        cssVar: '',
        cssUnit: ''
      }
    }
  }),
  mounted() {
    this.createGrid(this.boardSize);
    this.addCellLabels();
  },
  components: {
    Header,
    Board,
    ControlPanel,
    BrowseModal,
    SaveModal
  },
  methods: {
    handleClickToSave() {
      this.showingModal = 'save';
    },
    async handleClickToBrowse() {
      await this.refreshUserDiagrams();
      this.showingModal = 'browse';
    },
    async refreshUserDiagrams() {
      let resp = await this.getDiagrams();      
      let diagramArray = resp.data;
      diagramArray.forEach(diagramObj => {
        diagramObj.cells = this.buildArrayFromGridString(diagramObj.cells, diagramObj.width, diagramObj.height);
        diagramObj.width = parseInt(diagramObj.width);
        diagramObj.height = parseInt(diagramObj.height);
      });
      let newDiagrams = diagramArray;
      this.diagrams = newDiagrams;
    },
    handleSaveDiagram(creator) {
      if (!creator) {
        creator = 'Leroy';
      }
      let cellString = this.getStringifiedGridArray([...this.cellGrid]);
      let width = this.boardSize.width;
      let height = this.boardSize.height;
      this.saveDiagram(cellString, width, height, creator).then(response => {
        console.error('saveDiagram responded', response)
        if (response.data === 'DIAGRAM SAVED :)') {
          this.showingModal = undefined;
        }
      })
    },
    buildArrayFromGridString(gridString, width, height) {
      let grid = [];
      let cellsDone = 0;
      for (let r = 0; r < height; r++) {
        grid[r] = [];
        for (let c = 0; c < width; c++) {
          let stringChar = gridString[cellsDone];
          let shaded;
          let letter;
          if (stringChar === '*') {
            shaded = true;
            letter = '';
          } else if (stringChar === '0') {
            shaded = false;
            letter = '';
          } else {
            shaded = false;
            letter = stringChar;
          }
          grid[r][c] = {
            row: r, column: c, letter: letter, number: '', shaded: shaded,	selected: false
          };
          cellsDone++;
        }
      }
      return grid;
    },
    getStringifiedGridArray(gridArray) {
      let cellString = '';
      for (let r = 0; r < gridArray.length; r++) {
        let row = gridArray[r];
        for (let c = 0; c < row.length; c++) {
          let cell = row[c];
          if (cell.shaded) {
            cellString += '*';
          } else if (cell.letter) {
            cellString += letter
          } else {
            cellString += '0';
          }
        }
      }
      return cellString;
    },
    getFullWordListOfLength(length) {
      return axios({
        method: 'post',
        url: 'https://api.eggborne.com/crossword/getwordlist.php',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          length: length
        },
      });
    },
    saveDiagram(cellString, width, height, creator) {      
      return axios({
        method: 'post',
        url: 'https://api.eggborne.com/crossword/savediagram.php',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          cells: cellString,
          width: width,
          height: height,
          creator: creator,
        }
      });
    },
    getDiagrams() {      
      return axios({
        method: 'post',
        url: 'https://api.eggborne.com/crossword/getdiagrams.php',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded'
        }        
      });
    },
    getWordList(length) {
      console.error('CALLING DB FOR', length, '-LETTER WORDS |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||')
      return new Promise((resolve) => {
        this.getFullWordListOfLength(length).then(response => {
          if (response.data) {
            let wordObjectList = response.data.split(' || ').filter(obj => obj).map(wordObj => wordObj = JSON.parse(wordObj));           
            console.warn('GOT LIST', wordObjectList)
            resolve(wordObjectList);
          } else {
            console.error('COULD NOT GET WORD LIST OF LENGTH', length);
          }        
        });
      });
    },
    handleClickChooseDiagram(newDiagram) {
      this.showingModal = undefined;
      if (newDiagram.width !== this.boardSize.width || newDiagram.height !== this.boardSize.height) {
        this.adjustRangedOption('diagramSize', newDiagram.width);
        document.getElementById('diagram-slider').value = newDiagram.width;
      }
      this.cellGrid = newDiagram.cells;
      this.addCellLabels();
    },
    handleClickCancelSave() {
      this.showingModal = undefined;
    },
    handleClickCancelBrowse() {
      this.showingModal = undefined;
    },
    // const wordArrayOfLength = (length) => {
    //   return new Promise(async resolve => {
    //     let listOfWords = wordList[length] || await getWordList(length);      
    //     resolve(listOfWords);
    //   })
    // },
    // const getRandomWordOfLength = async (length) => {
    //   return new Promise(async resolve => {
    //     let listOfWords = await wordArrayOfLength(length);
    //     let randomIndex = randomInt(0, listOfWords.length - 1);
    //     let randomWordObject = listOfWords[randomIndex];
    //     resolve(randomWordObject);
    //   })
    // },
    createGrid(size, destroyFirst) {
      let width = size.width;
      let height = size.height;
      let grid = [];
      if (!destroyFirst) {
        grid = [...this.cellGrid];
      }
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
      this.getMirrorCoords(this.symmetry, cellCoords).forEach(coords => {
        let mirrorCell = newCellGrid[coords.row][coords.column];
        mirrorCell.shaded = newShadedStatus;
      });
      this.addCellLabels()
      // this.cellGrid = newCellGrid;
    },    
    addCellLabels() {
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
          return cell = newCell;
        });
      });
      this.cellGrid = updatedCells;
    },
    adjustOption(optionName, newValue) {
      let optionData = this.options[optionName];
      if (optionName === 'symmetry') {
        this.symmetry = newValue;
      }
    },
    adjustRangedOption(optionName, newValue) {
      let optionData = this.options[optionName];      
      if (optionName === 'diagramSize') {
        this.boardSize = {
          width: parseInt(newValue), height: parseInt(newValue)
        };
        this.cellGrid = [];
        this.createGrid(this.boardSize, true)
        document.documentElement.style.setProperty(optionData.cssVar, `${newValue}${optionData.cssUnit}   `);
        document.documentElement.style.setProperty('--cells-high', `${newValue}${optionData.cssUnit}`);
      }
    },
    clearBoard(e, shade) {
      let updatedCells = [...this.cellGrid];
      [...updatedCells].forEach((row, r, rowsArray) => {
        updatedCells[r] = row.map((cell, c, cellArray) => {                  
          let newCell = { ...cell };
          newCell.letter = '';          
          newCell.number = '';          
          newCell.shaded = shade;          
          newCell.selected = false;          
          return cell = newCell;
        });
      });
      this.cellGrid = updatedCells;
    },
    shadeBoard(e) {
      this.clearBoard(e, true);
    }
  }
};
</script>

<style scoped>
.home {
  min-height: var(--view-height);
  display: grid;
  grid-template-rows:
    var(--header-height)
    100vmin
    1fr
    /* var(--footer-height) */
  ;
}
#dark-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: var(--view-height);
  background: #000000dd;
  z-index: 1;
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
