<template>
  <div class="home">
    <Header
      :handleClickToBrowse='handleClickToBrowse'
      :handleClickToSave='handleClickToSave'
      :handleClickPrevious='handleClickPrevious'
      :handleClickNext='handleClickNext'
      :handleClickTrain='handleClickTrain'
    />
    <div class='board-area'>
      <Board
        :cellGrid='cellGrid'
        :handleCellClick='
        $store.state.editMode === `diagram` ? handleCellFlip :
        $store.state.editMode === `puzzle` ? handleCellSelect : null
        '
        :selectedCellIndex='selectedCellIndex'
        :violatingCells='violatingCells'
      />
    </div>
    <ControlPanel
      :editMode='editMode'
      :options='options'
      :busy='generating'
      :boardSize='boardSize'
      :symmetry='symmetry'
      :percentBlack='percentBlack'
      :offensiveQuotient='offensiveQuotient'
      :wordsNeeded='wordsNeeded'
      :isContiguous='contiguous'
      :changeEditMode='changeEditMode'
      :addCellLabels='addCellLabels'
      :adjustOption='adjustOption'
      :adjustRangedOption='adjustRangedOption'
      :clearBoard='clearBoard'
      :shadeBoard='shadeBoard'
      :handleClickToSave='handleClickToSave'
      :handleClickToBrowse='handleClickToBrowse'
      :handleClickChooseDiagram='changeDiagram'
      :handleClickGenerate='generateNewBoard'
      :cancelGeneration='cancelGeneration'
      :handleClickRules='() => getViolatingBoard(50, `offensive`, 50, 100)'
    />
    <div v-if='showingModal' id='dark-mask'></div>
    <SaveModal
      v-if='showingModal === `save`'
      :handleSaveDiagram='handleSaveDiagram'
      :handleClickCancelSave='handleClickCancelModal'
    >
    {{ saveMessage }}
    </SaveModal>
    <BrowseModal
      v-if='showingModal === `browse`'
      :auditMode='auditMode'
      :diagrams='this.auditMode ? auditList : diagrams'
      :savedTrainingData='savedTrainingData'
      :handleClickChooseDiagram='changeDiagram'
      :handleClickCancelBrowse='handleClickCancelModal'
      :handleClickDeleteDiagram='handleClickDeleteDiagram'
      :handleClickToLabel='handleClickToLabel'
    />
    <div id='model-display'></div>
    <!-- <canvas id='board-canvas'/> -->
    <!-- <img id='micro-board-image'/> -->
    <!-- <img id='crossword-image'/> -->
    <!-- <MicroBoard v-if='this.currentDiagram'
      :actualWidth='30'
      :actualHeight='30'
      :width='this.currentDiagram.width'
      :height='this.currentDiagram.height'
      :cellGrid='this.currentDiagram.cells'
    /> -->
  </div>
</template>

<script>
// import Vue from 'vue';
import DB from '../api.js';
import axios from 'axios';
import Header from '@/components/Header.vue';
import Board from '../components/Board.vue';
import ControlPanel from '../components/ControlPanel.vue';
import BrowseModal from '../components/BrowseModal.vue';
import SaveModal from '../components/SaveModal.vue';
import BoardValidator from '../boardvalidator';
import DiagramCreator from '../diagramcreator';
import MicroBoard from '../components/MicroBoard.vue';

import GridScanner from '../gridscanner';

const diagramCreator = new DiagramCreator();
const boardValidator = new BoardValidator();
const gridScanner = new GridScanner();

require('../vkthread.min.js');

// let validatorUrl = require('../boardvalidator.js')

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export default {
  name: 'Home',
  data: () => ({
    doneLoading: false,
    editMode: 'diagram',
    selectedCellIndex: undefined,
    showingModal: undefined,
    wordList: [],
    diagrams: undefined,
    boardSize: { width: 15, height: 15 },
    symmetry: 2,
    contiguous: true,
    currentDiagram: undefined,
    currentPuzzle: undefined,
    cellGrid: [],
    wordsNeeded: {
      across: [],
      down: []
    },
    options: {
      diagramSize: {
        name: 'diagramSize',
        title: 'Size',
        minValue: 13,
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
    },
    busySaving: false,
    savesPending: false,
    offensiveQuotient: 0,
    savedTrainingData: {
      input: [],
      output: [],
      diagramIds: []
    },
    ioArray: [],
    saveMessage: '',
    auditList: [],
    auditMode: false,
    rules: {},
    violatingCells: [],
    onLayer: 0,
    generating: false,
    // worker: window.WEB_WORKER
  }),
  computed: {
    percentBlack() {
      return this.cellGrid.length ? this.getPercentBlack(this.cellGrid) : 0;
    }
  },
  mounted() {
    this.createGrid(this.boardSize);
    this.addCellLabels();
    this.getWordsNeeded();
    this.doneLoading = true;
    setTimeout(() => {
      this.getMLData().then(() => {
      console.error('Home.vue getMLData finished')      

      });      
    }, 200);
    this.rules = this.$store.state.puzzleOptions.rules;
  },
  components: {
    Header,
    Board,
    ControlPanel,
    BrowseModal,
    SaveModal,
    MicroBoard
  },
  methods: {
    getContiguous(grid) {
      const validator = new BoardValidator();
      const param = {
        fn: validator.checkIfContiguous,
        context: validator,
        args: [grid, grid.flat()]
      };
      return vkthread.exec(param);
    },
    // sendWorkerForScore(grid) {      
    //   const workerParams = {
    //     fn: (grid, allCells, validator) => {
    //       console.warn('WORKER GOT', grid, allCells, validator)
    //       const getIntersectingWords = (grid, startingCell) => {
            
    //         for (let i = startingCell.column + 1; i < grid[0].length; i += 1) {
    //           const cellIndex = grid[startingCell.row][i].index;
    //           if (grid[startingCell.row][i].shaded) { break; }
    //           if (!validator.visited.includes(cellIndex)) {
    //             validator.visited.push(cellIndex);
    //             // document.getElementById(`cell-${cellIndex}`).classList.add('highlighted');
    //           }
    //         }
    //         for (let i = startingCell.column - 1; i >= 0; i -= 1) {
    //           const cellIndex = grid[startingCell.row][i].index;
    //           if (grid[startingCell.row][i].shaded) { break; }
    //           if (!validator.visited.includes(cellIndex)) {
    //             validator.visited.push(cellIndex);
    //             // document.getElementById(`cell-${cellIndex}`).classList.add('highlighted');
    //           }
    //         }
    //         for (let i = startingCell.row + 1; i < grid.length; i += 1) {
    //           const cellIndex = grid[i][startingCell.column].index;
    //           if (grid[i][startingCell.column].shaded) { break; }
    //           if (!validator.visited.includes(cellIndex)) {
    //             validator.visited.push(cellIndex);
    //             // document.getElementById(`cell-${cellIndex}`).classList.add('highlighted');
    //           }
    //         }
    //         for (let i = startingCell.row - 1; i >= 0; i -= 1) {
    //           const cellIndex = grid[i][startingCell.column].index;
    //           if (grid[i][startingCell.column].shaded) { break; }
    //           if (!validator.visited.includes(cellIndex)) {
    //             validator.visited.push(cellIndex);
    //             // document.getElementById(`cell-${cellIndex}`).classList.add('highlighted');
    //           }
    //         }
    //       };
    //       const getNextCellIndex = (facingDirection, grid) => {
    //         const currentIndex = validator.currentIndex;
    //         let nextIndex;
    //         if (facingDirection === 'north') {
    //           nextIndex = currentIndex - grid[0].length;
    //         }
    //         if (facingDirection === 'east') {
    //           nextIndex = currentIndex + 1;
    //         }
    //         if (facingDirection === 'south') {
    //           nextIndex = currentIndex + grid[0].length;
    //         }
    //         if (facingDirection === 'west') {
    //           nextIndex = currentIndex - 1;
    //         }
    //         return nextIndex;
    //       }
    //       const turn = (startingDirection, turnDirection) => {
    //         const facingIndex = validator.directions.indexOf(startingDirection);
    //         let newDirection;
    //         if (turnDirection === 'left') {
    //           newDirection = validator.directions[facingIndex - 1];
    //           if (!newDirection) {
    //             newDirection = validator.directions[validator.directions.length - 1];
    //           }
    //         }
    //         if (turnDirection === 'right') {
    //           newDirection = validator.directions[facingIndex + 1];
    //           if (!newDirection) {
    //             newDirection = validator.directions[0];
    //           }
    //         }
    //         return newDirection;
    //       }
    //       validator.visited = [];
    //       let sameIndexCount = 0;
    //       const startingCell = allCells.filter(cell => cell.number == 1)[0];
    //       console.log('startingCell', startingCell)
    //       validator.currentIndex = (startingCell.row * grid.length) + (startingCell.column);
    //       validator.visited.push(validator.currentIndex);
    //       console.log(validator)
    //       const startingIndex = validator.currentIndex;
    //       let lastIndex = startingIndex;
    //       const lockedCells = [];
    //       console.warn(sameIndexCount)
    //       console.warn(validator.currentIndex)
    //       console.warn(startingIndex)
    //         while (sameIndexCount < 5 && validator.currentIndex < startingIndex + grid[0].length) {
    //         let reverseIndex = validator.directions.indexOf(validator.facing) - 2;
    //         if (reverseIndex < 0) {
    //           reverseIndex = validator.directions.indexOf(validator.facing) + 2;
    //         }
    //         const visitedAdjacentCells = [];
    //         let nextIndex;
    //         let nextFacingDirection;
    //         const turnDirections = [
    //           turn(validator.facing, 'left'),
    //           validator.facing,
    //           turn(validator.facing, 'right')
    //         ];
    //         const moves = [
    //           getNextCellIndex(turn(validator.facing, 'left'),grid),
    //           getNextCellIndex(validator.facing, grid),
    //           getNextCellIndex(turn(validator.facing, 'right'), grid)
    //         ];
    //         for (let i = 0; i < 3; i += 1) {
    //           if (!nextIndex) {
    //             const cellIndex = moves[i];
    //             if (cellIndex >= 0 && cellIndex < allCells.length) {
    //               const cell = allCells[cellIndex];
    //               const beyondLeftEdge = validator.currentIndex % grid[0].length === 0 && cellIndex === validator.currentIndex - 1;
    //               const beyondRightEdge = validator.currentIndex % grid[0].length === grid[0].length - 1 && cellIndex === validator.currentIndex + 1;
    //               const visited = validator.visited.includes(cellIndex);
    //               const locked = lockedCells.includes(cellIndex);
    //               if (!locked && !cell.shaded && !beyondLeftEdge && !beyondRightEdge) {
    //                 nextIndex = cellIndex;
    //                 if (!visited) {
    //                   console.log('we nmoingf on')
    //                   validator.visited.push(cellIndex);
    //                 } else {
    //                   visitedAdjacentCells.push(cellIndex);
    //                 }
    //                 nextFacingDirection = turnDirections[i];
    //               }
    //             }
    //           }
    //         }

    //         if (nextIndex) {
    //           lastIndex = validator.currentIndex;
    //           validator.currentIndex = nextIndex;
    //           getIntersectingWords(grid, allCells[nextIndex]);
    //           validator.facing = nextFacingDirection;
    //           if (lastIndex !== nextIndex) {
    //             sameIndexCount = 0;
    //           } else {
    //             sameIndexCount += 1;
    //           }
    //         } else {
    //           lockedCells.push(validator.currentIndex);
    //           lastIndex = validator.currentIndex;
    //           nextIndex = getNextCellIndex(validator.directions[reverseIndex], [...grid]);
    //           validator.currentIndex = nextIndex;
    //           validator.facing = validator.turn(validator.facing, 'right');
    //         }
    //       }
    //       const nonWhites = allCells.filter(cell => !cell.shaded).length;
    //       // let coveredAll = validator.visited.length;
    //       let coveredAll = validator.visited.length === nonWhites;
    //       for (let i = 0; i < 15; i += 1) {
    //         if (!coveredAll) {
    //           validator.visited.forEach(cellIndex => getIntersectingWords(grid, allCells[cellIndex]));
    //           coveredAll = validator.visited.length === nonWhites;
    //         }
    //       }
    //       // validator.visited.length = 0;
    //       console.log('visited', validator.visited.length, 'nonWhites', nonWhites)
	  //       return coveredAll;
    //     },
    //     args: [grid, grid.flat(), boardValidator],
    //   };
    //   return vkthread.exec(workerParams);
    // },
    async getMLData() {      
      let modelData = await gridScanner.updateModel('offensive');
      this.$store.dispatch('setLoaded', 'gotMLData');
      const trainingData = await gridScanner.getTrainingData('offensive')
      if (trainingData) {
        this.savedTrainingData = trainingData;
        this.$store.dispatch('setLoaded', 'gotMLTrainingData');
      }
      return;
    },
    getFlippedCellGrid(grid) {
		  const newGrid = [];
      grid.forEach((row, r) => {
        newGrid[r] = [...row].reverse();
      });
      return newGrid;
    },
    getPercentBlack(cellGrid) {
      let flatCells = cellGrid;
      if (flatCells[0].length > 1) {
        flatCells = flatCells.flat();
      }
      const percent = Math.round((flatCells.filter(cell => cell.shaded).length / flatCells.length) * 100);
      return percent;
    },
    getBinaryPattern(grid) {
      grid = this.getStringifiedGridArray(grid).split('').map((val) => {
        if (val === '*' || val == 1) {
          return val = 1;
        }
        return val = 0;
      });
      return grid;
    },
    handleClickToSave() {
      // const newData = this.savedTrainingData.input.filter(inp => inp.length === 225);
      // console.log(newData);
      // this.savedTrainingData = newData;
      // DB.saveAITrainingData('offensive', newData).then(resp => {
      //   console.log('resp', resp)
      // })
      this.showingModal = 'save';
    },
    async handleClickPrevious() {
      if (!this.diagrams) {
        this.diagrams = await this.refreshUserDiagrams();
      }
      const currentIndex = this.diagrams.indexOf(this.currentDiagram);
      const prevIndex = currentIndex > 1 ? currentIndex - 1 : this.diagrams.length - 1;
      const newDiagram = this.diagrams[prevIndex];
      this.changeDiagram(newDiagram);
    },
    async handleClickNext() {
      if (!this.diagrams) {
        this.diagrams = await this.refreshUserDiagrams();
      }
      const currentIndex = this.diagrams.indexOf(this.currentDiagram);
      const nextIndex = currentIndex < this.diagrams.length - 1 ? currentIndex + 1 : 0;
      const newDiagram = this.diagrams[nextIndex];
      this.changeDiagram(newDiagram);
    },
    handleClickToBrowse() {
      this.diagrams = undefined;
      this.showingModal = 'browse';
      this.refreshUserDiagrams(true);
    },
    async handleClickTrain() {
      let ioArray = [];
      console.warn(this.savedTrainingData);
      this.savedTrainingData.input.forEach((cellArray, i) => {
        ioArray[i] = {
          input: cellArray,
          output: this.savedTrainingData.output[i]
        };
      });
      ioArray = ioArray.filter(item => item.input.length === 225);
      // gridScanner = new GridScanner();
      // gridScanner.refreshModel();
      // gridScanner.trainScanner(ioArray);
      this.saveAIModelToDB();
    },
    async handleClickToLabel(diagramId, violation, violating) {
      console.warn('handleClickToLabel received', diagramId, violation, violating);
      const alreadyThere = [...this.savedTrainingData.diagramIds].indexOf(diagramId) > -1;
      if (!alreadyThere) {
        let grid;
        grid = Object.values(this.diagrams).filter(diagram => diagram.id === diagramId)[0].cells;

        const newTrainingData = {
          input: [...this.savedTrainingData.input, this.getBinaryPattern(grid)],
          output: [...this.savedTrainingData.output, { [violation]: violating }],
          diagramIds: [...this.savedTrainingData.diagramIds, diagramId],
        };

        this.savedTrainingData = newTrainingData;
        const trainingResponse = await DB.saveAITrainingData('offensive', newTrainingData);
        console.warn('handleClickToLabel > saveAITrainingData --->', trainingResponse);
      } else {
        console.error(diagramId, 'is ALREADY IN savedTrainingData');
      }
    },
    async refreshUserDiagrams() {
      const resp = await DB.getDiagrams();
      console.warn('resp', resp);
      const diagramArray = resp.data;
      diagramArray.map((diagramObj) => {
        diagramObj.cells = this.buildArrayFromGridString(diagramObj.cells, diagramObj.width, diagramObj.height);
        diagramObj.width = parseInt(diagramObj.width);
        diagramObj.height = parseInt(diagramObj.height);
        diagramObj.percentBlack = 0;
        const percent = gridScanner.getGridAttribute(diagramObj.cells, 'offensive');
        diagramObj.offensivePercent = percent;
      });
      console.log('made', diagramArray);
      this.diagrams = diagramArray;
      return diagramArray;
    },
    async saveAIModelToDB() {
      // const modelString = JSON.stringify(gridScanner.net.toJSON());
      // document.getElementById('model-display').innerText = 'SAVING...';
      // document.getElementById('model-display').style.display = 'block';
      // this.busySaving = true;
      // const saveAIResponse = await DB.saveAIModel('offensive', modelString);
      // console.warn('save AI responded', saveAIResponse.data);
      // this.busySaving = false;
      // document.getElementById('model-display').innerText = 'SAVED!';
      // document.getElementById('model-display').style.background = 'green';
      // setTimeout(() => {
      //   document.getElementById('model-display').style.display = 'none';
      // }, 1000);
    },
    async handleSaveDiagram(creator) {
      if (!creator) {
        creator = 'Leroy';
      }
      const cellString = this.getStringifiedGridArray([...this.cellGrid]);
      const uniqueResponse = await DB.checkIfDiagramExists(cellString);
      if (!uniqueResponse.data) {
        console.error('DIAGRAM IS UNIQUE!', uniqueResponse.data);
        const { width } = this.boardSize;
        const { height } = this.boardSize;
        this.saveMessage = `SAVING...`;
        const saveResponse = await DB.saveDiagram(cellString, width, height, creator);
        if (saveResponse.data) {
          console.error('saveDiagram ---->', saveResponse);
          this.saveMessage = `SAVED!`;
          setTimeout(() => {
            this.saveMessage = ``;
            this.showingModal = undefined;
          }, 500);
        }
      } else {
        document.querySelector('.save-modal .status-area').classList.add('error');
        this.saveMessage = `DIAGRAM EXISTS! as ID#${uniqueResponse.data}`;
        setTimeout(() => {
          this.saveMessage = ``;
          document.querySelector('.save-modal .status-area').classList.remove('error');
        }, 3000);
      }
    },
    async handleClickDeleteDiagram(id) {
      const response = await DB.removeDiagram(id);
      if (response.data) {
        await this.refreshUserDiagrams();
      } else {
        console.error('handleClickDeleteDiagram ERROR');
      }
    },
    buildArrayFromGridString(gridString, width, height) {
      const grid = [];
      let cellsDone = 0;
      for (let r = 0; r < height; r++) {
        grid[r] = [];
        for (let c = 0; c < width; c++) {
          const stringChar = gridString[cellsDone];
          let shaded;
          let letter;
          if (stringChar === '*' || stringChar == '1') {
            shaded = true;
            letter = '';
          } else if (stringChar == '0') {
            shaded = false;
            letter = '';
          } else {
            shaded = false;
            letter = stringChar;
          }
          let cellIndex = ((r * height) + c);
          grid[r][c] = {
            row: r, column: c, letter, number: '', shaded,	selected: false, index: cellIndex
          };
          cellsDone++;
        }
      }
      return grid;
    },
    getStringifiedGridArray(gridArray) {
      let cellString = '';
      for (let r = 0; r < gridArray.length; r++) {
        const row = gridArray[r];
        for (let c = 0; c < row.length; c++) {
          const cell = row[c];
          if (cell.shaded) {
            cellString += '*';
          } else if (this.editMode === 'puzzle' && cell.letter && cell.letter.length === 1) {
            cellString += cell.letter;
          } else {
            cellString += '0';
          }
        }
      }
      return cellString;
    },
    getWordsNeeded(cellGrid) {
      const grid = cellGrid ? [...cellGrid] : this.cellGrid;
      const violations = [];
      const newWordsNeeded = {
        across: [],
        down: []
      };
      grid.forEach((row, r) => {
        row.forEach((cell, c) => {
          if (cell.number) {
            const cellIndex = (r * grid.length) + c;
            cell.letter = '';
            const blankToLeft = c === 0 || row[c - 1].shaded;
            const blankAbove = r === 0 || grid[r - 1][c].shaded;
            let wordLengthToRight;
            let wordLengthBelow;
            let acrossLetters = [cellIndex];
            let downLetters = [cellIndex];
            if (blankToLeft) {
              if (c === row.length - 1) {
                wordLengthToRight = 1
                // cell.letter += wordLengthToRight.toString();
              }
              for (let k = c + 1; k < row.length; k++) {
                const totalIndex = (r * grid.length) + k;
                
                if (row[k].shaded) {
                  wordLengthToRight = k - c;
                  // cell.letter = wordLengthToRight.toString();
                  break;
                } else {
                  acrossLetters.push(totalIndex);              
                  if (k === row.length - 1) {
                    wordLengthToRight = k - c + 1;
                    // cell.letter = wordLengthToRight.toString();
                    break;
                  }
                }
              }
            }
            if (blankAbove) {
              if (r === grid.length - 1) {
                wordLengthBelow = 1
                // cell.letter += `/${wordLengthBelow.toString()}`;
              }
              for (let h = r + 1; h < grid.length; h++) {
                const gridRow = grid[h];
                const totalIndex = (h * grid.length) + c;
                if (gridRow[c].shaded) {
                  wordLengthBelow = h - r;
                  // cell.letter += `/${wordLengthBelow.toString()}`;
                  break;
                } else {
                  downLetters.push(totalIndex);
                  if (h === grid.length - 1) {
                    wordLengthBelow = h - r + 1;
                    // cell.letter += `/${wordLengthBelow.toString()}`;
                    break;
                  }
                }
              }
            }
            if (wordLengthToRight) {
              newWordsNeeded.across.push({
                number: cell.number,
                word: '*'.repeat(wordLengthToRight),
                letterIndexes: acrossLetters
              });
            }
            if (wordLengthBelow) {
              newWordsNeeded.down.push({
                number: cell.number,
                word: '*'.repeat(wordLengthBelow),
                letterIndexes: downLetters
              });
            }
          } else if (cell.letter) {
            cell.letter = '';
          }
        });
      });
      if (!cellGrid) {
        this.wordsNeeded = newWordsNeeded;
      }
      return newWordsNeeded;
    },
    getViolatingCells(list, noDisplay, skipMax) {
      let st = window.performance.now();
      let violating = [];
      let allChecked = this.$store.state.puzzleOptions.rules.allChecked;
      list.across.forEach(wordObj => {
        let tooShort = wordObj.word.length < this.rules.wordLengths.min;
        let tooLong = !skipMax && wordObj.word.length > this.rules.wordLengths.max;
        if (tooShort && !allChecked && wordObj.word.length === 1) {
          // allow one-way 1-letter 'words' on unchecked boards
          tooShort = false;
        }
        if (tooShort || tooLong) {
          wordObj.letterIndexes.forEach(index => {
            violating.push(index);
          })
        }
      });
      list.down.forEach(wordObj => {
        let tooShort = wordObj.word.length < this.rules.wordLengths.min;
        let tooLong = !skipMax && wordObj.word.length > this.rules.wordLengths.max;
        if (tooShort && !allChecked && wordObj.word.length === 1) {
          tooShort = false;
        }
        if (tooShort || tooLong) {
          wordObj.letterIndexes.forEach(index => {
            violating.push(index);
          })
        }
      });
      if (!noDisplay) {
        this.violatingCells = violating;
      }
      // console.warn('got violating cells in', window.performance.now() - st)
      return violating;
    },
    
    getWordList(length) {
      console.error('CALLING DB FOR', length, '-LETTER WORDS |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||');
      return new Promise((resolve) => {
        this.getFullWordListOfLength(length).then((response) => {
          if (response.data) {
            const wordObjectList = response.data.split(' || ').filter(obj => obj).map(wordObj => wordObj = JSON.parse(wordObj));
            console.warn('GOT LIST', wordObjectList);
            resolve(wordObjectList);
          } else {
            console.error('COULD NOT GET WORD LIST OF LENGTH', length);
          }
        });
      });
    },
    changeEditMode(e) {
      const newMode = e.target.id.split('-')[0];
      this.selectedCellIndex = undefined;
      console.warn('changing to', newMode)
      this.$store.commit('changeEditMode', newMode)
      // this.editMode = newMode;
    },
    changeDiagram(newDiagram) {
      this.showingModal = undefined;
      if (newDiagram.width !== this.boardSize.width || newDiagram.height !== this.boardSize.height) {
        this.adjustOption('diagramSize', newDiagram.width);
      }
      this.cellGrid = newDiagram.cells;      
      requestIdleCallback(() => {
        // this.currentDiagram = newDiagram;
        this.addCellLabels();
        this.violatingCells = this.getViolatingCells(this.getWordsNeeded());
        this.offensiveQuotient = gridScanner.getGridAttribute(newDiagram.cells, 'offensive');
      });
    },
    handleClickCancelModal() {
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
      const startTime = window.performance.now();
      const { width } = size;
      const { height } = size;
      let grid = [];
      if (!destroyFirst) {
        grid = [...this.cellGrid];
      }
      for (let r = 0; r < height; r++) {
        grid[r] = [];
        for (let c = 0; c < width; c++) {
          let cellIndex = ((r * height) + c);
          grid[r][c] = {
            row: r, column: c, letter: '', number: '', shaded: false,	selected: false,
            index: cellIndex
          };
        }
      }
      this.cellGrid = grid;
      this.addCellLabels();
      console.error('grid created and labeled in', window.performance.now() - startTime);
    },
    getMirrorCoords(symmetry, startingCoords) {
      const coordArray = [];
      if (symmetry >= 1) {
        const mirrorCoords = {
          column: (this.boardSize.width - 1) - startingCoords.column,
          row: (this.boardSize.height - 1) - startingCoords.row
        };
        coordArray.push(mirrorCoords);
      }
      if (symmetry === 2) {
        const mirrorCoords1 = {
          column: startingCoords.row,
          row: (this.boardSize.width - 1) - startingCoords.column
        };
        const mirrorCoords2 = {
          column: (this.boardSize.width - 1) - mirrorCoords1.column,
          row: (this.boardSize.height - 1) - mirrorCoords1.row
        };
        coordArray.push(mirrorCoords1);
        coordArray.push(mirrorCoords2);
      }
      return coordArray;
    },
    handleCellFlip(e) {
      const clickedIndex = e.target.id.split('-')[1];
      const cellCoords = { row: this.cellGrid.flat()[clickedIndex].row, column: this.cellGrid.flat()[clickedIndex].column, };
      const newCellGrid = [...this.cellGrid];
      const cellObject = newCellGrid[cellCoords.row][cellCoords.column];
      const newShadedStatus = !cellObject.shaded;
      cellObject.shaded = newShadedStatus;
      this.getMirrorCoords(this.symmetry, cellCoords).forEach((coords) => {
        const mirrorCell = newCellGrid[coords.row][coords.column];
        mirrorCell.shaded = newShadedStatus;
      });
      requestIdleCallback(() => {
        this.addCellLabels();
        let needed = this.getWordsNeeded();
        this.violatingCells = this.getViolatingCells(needed);
        const startTime = window.performance.now();
        // this.contiguous = boardValidator.checkIfContiguous(newCellGrid, newCellGrid.flat());
        this.getContiguous(newCellGrid).then((contiguous) => {
          this.contiguous = contiguous;
          console.warn('worker for getContiguous took', window.performance.now() - startTime);
          this.offensiveQuotient = gridScanner.getGridAttribute(newCellGrid, 'offensive');
        });
      });
    },
    handleCellSelect(e) {
      const clickedIndex = parseInt(e.target.id.split('-')[1]);
      if (![...this.cellGrid].flat()[clickedIndex].shaded) {
        this.selectedCellIndex = clickedIndex;
      }
    },
    addCellLabels(cellGrid) {
      let grid = cellGrid ? JSON.parse(JSON.stringify(cellGrid)) : JSON.parse(JSON.stringify([...this.cellGrid]));
      const start = window.performance.now();
      const updatedCells = grid;
      const totalCells = updatedCells.flat().length;
      let onNumberedCell = 0;
      const numberedIndexes = [];
      [...updatedCells].forEach((row, r, rowsArray) => {
        updatedCells[r] = row.map((cell, c, cellArray) => {
          const cellTotalIndex = (r * this.boardSize.height) + c + 1;
          let numbered;
          if (cell.shaded) {
            // make the cells below and to the right numbered
            numberedIndexes.push(cellTotalIndex + this.boardSize.width);
            numberedIndexes.push(cellTotalIndex + 1);
          } else if (r === 0 || c === 0 || numberedIndexes.includes(cellTotalIndex)) {
            numbered = true;
            onNumberedCell++;
          }
          const newCell = { ...cell };
          newCell.number = numbered ? onNumberedCell : null;
          return cell = newCell;
        });
      });
      if (!cellGrid) {
        this.cellGrid = updatedCells;
      } else {
        return updatedCells;
      }
    },
    adjustOption(optionName, newValue) {
      const optionData = this.options[optionName];
      console.warn('got in', optionName, newValue)
      if (optionName === 'symmetry') {
        this.symmetry = newValue;
      }
      if (optionName === 'diagramSize') {
        const startTime = window.performance.now();
        this.boardSize = {
          width: parseInt(newValue), height: parseInt(newValue)
        };
        this.cellGrid = [];
        this.createGrid(this.boardSize, true);
        document.documentElement.style.setProperty(optionData.cssVar, `${newValue}${optionData.cssUnit}   `);
        document.documentElement.style.setProperty('--cells-high', `${newValue}${optionData.cssUnit}`);
        console.error('board resized in', window.performance.now() - startTime);
        this.offensiveQuotient = 0;
      }
    },
    adjustRangedOption(optionName, newValue) {
      console.warn('got', optionName, newValue);
      if (optionName === 'blackRate') {
        this.rules.blackRate = parseInt(newValue);
      }
      const optionData = this.options[optionName];
    },    
    getRandomDiagram(iterations) {
      const newDiagram = {};
      const offensiveScores = [];
      for (let i = 0; i < iterations; i++) {
        const randomPattern = this.getRandomBinaryPattern(this.rules.blackRate);
        const newGrid = this.buildArrayFromGridString(randomPattern, this.boardSize.width, this.boardSize.height);
        const offensiveScore = gridScanner.getGridAttribute(newGrid, 'offensive');
        offensiveScores.push({ grid: newGrid, score: offensiveScore });
      }
      let sortedScores = offensiveScores.filter(scoreSet => scoreSet.score < 20);
      sortedScores.forEach((scoreSet, i) => {
        scoreSet.grid = this.addCellLabels(scoreSet.grid);
        let needed = this.getWordsNeeded(scoreSet.grid);
        scoreSet.wordsNeeded = needed;
        let wordList = [...needed.across, ...needed.down];
        let sortedList = wordList.sort((a, b) => a.word.length - b.word.length);
        let shortest = sortedList[0];
        let longest = sortedList[sortedList.length - 1];
        let blackness = this.getPercentBlack(scoreSet.grid);
        if (
          shortest.word.length < this.rules.wordLengths.min 
          || longest.word.length > this.rules.wordLengths.max
          || (blackness < this.rules.blackRate - 3 || blackness > this.rules.blackRate + 3)
        ) {
          console.log('random diagram', i, 'rejected for', blackness, shortest.word.length, longest.word.length)
          scoreSet.rejected = true;
        }
      });
      let sample = sortedScores[0].grid;
      sortedScores = sortedScores.filter(scoreSet => !scoreSet.rejected);
      console.warn('filtered score list is', sortedScores.length, sortedScores);
      let newAuditList = [];
      sortedScores.forEach((scoreSet, i) => {
        const diagramObj = {};
        diagramObj.cells = scoreSet.grid;
        diagramObj.width = this.boardSize.width;
        diagramObj.height = this.boardSize.height;
        diagramObj.percentBlack = 0;
        diagramObj.offensivePercent = scoreSet.score;
        // console.log('puishing diagramObj', diagramObj)
        newAuditList.push(diagramObj);
      });
      if (sortedScores.length) {
        this.auditList = newAuditList;
        this.cellGrid = sortedScores[0].grid;
      } else {
        this.cellGrid = sample;
        requestAnimationFrame(() => {
          let needed = this.getWordsNeeded(sample);
          this.violatingCells = this.getViolatingCells(needed);
        })
        // this.getRandomDiagram(iterations / 2)
      }
    },
    getIntermediateDiagram() {
      let newGrid = this.generateLayer(this.cellGrid);
      // this.cellGrid = newGrid;
      return newGrid;
    },
    cancelGeneration() {
      if (this.generating) {
        this.generating = false;
        this.onLayer = 0;
        
      }
    },
    generateNewBoard(instant) {
      let genStart = window.performance.now();
      let canceled = false;
      // this.clearBoard();
      this.generating = true;
      this.blackness = 0;
      this.previousBlackness;
      let newGrid;
      // let timeout = this.rules.blackRate * 3 * (3 - this.symmetry)
      let timeout = 300;
      this.count = 0;
      this.redundant = 0;
      this.growBoard = (baseGrid) => {
        this.count++
        const grid = this.generateLayer(baseGrid);
        this.previousBlackness = this.blackness;
        this.blackness = this.getPercentBlack(grid);  
        this.cellGrid = grid;
        let tooRedundant = this.redundant >= timeout;
        let timedOut = this.count >= timeout;
        let needsBlack = this.blackness < this.rules.blackRate;
        if (this.generating && !tooRedundant && !timedOut && needsBlack) {
          if (this.blackness !== this.previousBlackness) {
            requestAnimationFrame(() => {
              this.growBoard(grid)
            });
          } else {
            this.redundant++
            requestIdleCallback(() => {
              this.growBoard(grid)
            });
          }
        } else {
          if (!this.generating) {
            canceled = true;
            console.error('CANCELED ----------------')
          }
          console.warn('board generated in', (window.performance.now() - genStart).toFixed(2));
          console.warn('count was', this.count);
          console.warn('redundant was', this.redundant);
          requestAnimationFrame(async () => {
            newGrid = this.addCellLabels(grid);
            console.log('we final', newGrid)
            let needed = this.getWordsNeeded(newGrid);
            this.wordsNeeded = needed;
            this.violatingCells = this.getViolatingCells(needed);
            let contiguous = await this.getContiguous(newGrid);
            console.log('got cont?', contiguous)
            this.contiguous = contiguous;
            this.offensiveQuotient = gridScanner.getGridAttribute(newGrid, 'offensive');            
            this.generating = false;              
            this.cellGrid = newGrid;
            this.onLayer = 0;
            console.error('stopped at timedOut', timedOut);
            console.error('stopped at tooRedundant', tooRedundant);
            console.error('stopped at needsBlack', needsBlack);
            console.error('stopped at canceled', canceled);
          });
          return grid;
        }
      }
      if (instant === true) {
        // while (count < timeout && blackness < this.rules.blackRate) {
        //   requestIdleCallback(() => {
        //     newGrid = this.generateLayer();       
        //     this.cellGrid = newGrid;
        //     count++
        //     blackness = this.getPercentBlack(newGrid);            
        //   })
        // }
        // newGrid = this.addCellLabels(newGrid);
        // this.cellGrid = newGrid;
        // requestAnimationFrame(() => {
        //   let needed = this.getWordsNeeded(newGrid);
        //   this.wordsNeeded = needed;
        //   this.violatingCells = this.getViolatingCells(needed);
        //   this.offensiveQuotient = gridScanner.getGridAttribute(newGrid, 'offensive');
        //   // this.contiguous = boardValidator.checkIfContiguous(newGrid)
        //   this.getContiguous(newGrid).then((contiguous) => {
        //     this.contiguous = contiguous;
        //     this.offensiveQuotient = gridScanner.getGridAttribute(newGrid, 'offensive');
        //   });
        //   this.onLayer = 0;
        //   console.error('stopped at blackness, count', blackness, count);
        //   this.generating = false;
        // });
      } else {  
        this.growBoard(this.cellGrid);
        // let newGrid = this.cellGrid;
      }
    },
    generateLayer(baseLayer) {
      let newGrid = JSON.parse(JSON.stringify(baseLayer));
      let limits = this.symmetry ? {
        min: 0,
        max: Math.floor(this.boardSize.width / this.symmetry)
        // max: Math.floor(this.boardSize.width / 2)
      } : {
        min: 0,
        max: this.boardSize.width
      }

      let choices = newGrid[this.onLayer].slice(limits.min, limits.max);
      let unshaded = choices.filter(cell => !cell.shaded);
      let violating = [];
      let validOptions = [];
      unshaded.forEach((cell, i) => {
        let selectedCell = unshaded[i];
        if (!newGrid[this.onLayer][i].shaded) {
          let previousShaded = newGrid[this.onLayer][i].shaded;
          newGrid[this.onLayer][i].shaded = true;
          const mirrorCoords = this.getMirrorCoords(this.symmetry, {
            row: selectedCell.row,
            column: selectedCell.column
          });
          mirrorCoords.forEach((coordSet) => {
            const cellIndex = (coordSet.row * this.boardSize.height) + coordSet.column;
            newGrid[coordSet.row][coordSet.column].previousShaded = newGrid[coordSet.row][coordSet.column].shaded;
            newGrid[coordSet.row][coordSet.column].shaded = true;
          });
          newGrid = this.addCellLabels(newGrid);
          let needed = this.getWordsNeeded(newGrid);
          newGrid.forEach(row => { row = row.map(cell => cell.number = '') })
          violating = this.getViolatingCells(needed, true, true);
          let offensiveQuotient = gridScanner.getGridAttribute(newGrid, 'offensive');
          // let contiguous = boardValidator.checkIfContiguous(newGrid, newGrid.flat());
          if (!violating.length) {
            if (offensiveQuotient < 50) {
              // if (this.rules.contiguous && contiguous || !this.rules.contiguous) {
                validOptions.push(selectedCell.column);
              // } else {
                // console.error('rejected for non-contiguous');
              // }
            } else {
              console.error('rejected for offensive');
            }
          }
          newGrid[this.onLayer][i].shaded = previousShaded;
          mirrorCoords.forEach((coordSet) => {
            // const cellIndex = (coordSet.row * this.boardSize.height) + coordSet.column;
            newGrid[coordSet.row][coordSet.column].shaded = newGrid[coordSet.row][coordSet.column].previousShaded;            
          });          
          violating = [];
        }
      });
      let advanceAmount = randomInt(0,2);
      if (!validOptions.length) {
        advanceAmount = 1;
      } else {
        let randomIndex = randomInt(0, validOptions.length - 1);
        let cellToShade = validOptions[randomIndex];
        newGrid[this.onLayer][cellToShade].shaded = true;
        const mirrorCoords = this.getMirrorCoords(this.symmetry, {
            row: this.onLayer,
            column: cellToShade
          });
        mirrorCoords.forEach((coordSet) => {
          const cellIndex = (coordSet.row * this.boardSize.height) + coordSet.column;
          newGrid[coordSet.row][coordSet.column].shaded = true;
        });
        validOptions = [];        
      }
      // this.onLayer = this.onLayer - 1;
      // if (this.onLayer < 0) {
      //   this.onLayer = limits.max;
      // }
      this.onLayer = this.onLayer + advanceAmount;
      if (this.onLayer > limits.max - 1) {
        this.onLayer = 0;
      }
      return newGrid;
    },
    getViolatingBoard(iterations, feature, minScore, maxScore) {
      let st = window.performance.now();
      const offensiveScores = [];
      const newAuditList = [];
      this.generating = true;
      let sortedScores = [];
      requestIdleCallback(() => {
        // for (let i = 0; i < iterations; i++) {
          while (this.generating && !sortedScores.length) {
            const randomPattern = this.getRandomBinaryPattern(this.rules.blackRate);
            const newGrid = this.buildArrayFromGridString(randomPattern, this.boardSize.width, this.boardSize.height);
            const gridScore = gridScanner.getGridAttribute(newGrid, feature);
            // console.warn('we at randomPattern', randomPattern)
            // console.warn('we at newGrid', newGrid)
            // console.warn('we at gridScore', gridScore)
            offensiveScores.push({ grid: newGrid, score: gridScore });
            sortedScores = offensiveScores.filter(scoreSet => scoreSet.score >= minScore && scoreSet.score <= maxScore);
            requestIdleCallback(() => {
              this.cellGrid = newGrid;
            });          
          }
        console.log('we got offensive?', sortedScores.length);

        // const sortedScores = offensiveScores.sort((a, b) => b.score - a.score);
        sortedScores.forEach((scoreSet, i) => {
          const diagramObj = {};
          diagramObj.cells = scoreSet.grid;
          diagramObj.width = this.boardSize.width;
          diagramObj.height = this.boardSize.height;
          diagramObj.percentBlack = 0;
          diagramObj.offensivePercent = scoreSet.score;
          // console.log('puishing diagramObj', diagramObj)
          newAuditList.push(diagramObj);
        });      
        // const reversedScores = [...sortedScores].reverse();
        // for (let i = 0; i < 10; i++) {
        //   const diagramObj = {};
        //   diagramObj.cells = reversedScores[i].grid;
        //   diagramObj.width = this.boardSize.width;
        //   diagramObj.height = this.boardSize.height;
        //   diagramObj.percentBlack = 0;
        //   diagramObj.offensivePercent = reversedScores[i].score;
        //   // console.log('puishing diagramObj', diagramObj)
        //   newAuditList.push(diagramObj);
        // }
        const topScorer = sortedScores[0];
        this.offensiveQuotient = topScorer.score;
        let newGrid = this.addCellLabels(topScorer.grid)
        let needed = this.getWordsNeeded(newGrid);
        this.violatingCells = this.getViolatingCells(needed);
        this.cellGrid = newGrid;
        this.auditList = newAuditList;
        console.warn('screened', iterations, 'grids in', window.performance.now() - st);
        console.warn('compiled', this.auditList.length, 'samples');
        this.generating = false;
      });
    },
    getRandomBoard(blackPercent) {

    },
    clearBoard(e, shade) {
      if (e && this.generating) {
        this.cancelGeneration();
        setTimeout(() => {
          this.clearBoard();
        }, 500)
      } else {
        // this.auditMode = !this.auditMode;
        // e.target.classList.toggle('highlighted');
        const updatedCells = [...this.cellGrid];
        updatedCells.forEach((row, r, rowsArray) => {
          updatedCells[r] = row.map((cell, c, cellArray) => {
            const newCell = { ...cell };
            newCell.letter = '';
            newCell.number = '';
            newCell.shaded = shade;
            newCell.selected = false;          
            newCell.highlighted = false;
            document.getElementById(`cell-${newCell.index}`).classList.remove('highlighted');       
            return cell = newCell;
          });
        });
        this.cellGrid = updatedCells;
        this.addCellLabels();
        this.getWordsNeeded();
        this.violatingCells = [];
        this.contiguous = true;
        this.offensiveQuotient = 0;
      }
    },
    shadeBoard(e) {
      // let cwIndex = randomInt(0, crosswordImages.length);
      // this.extractPuzzleFromImage(crosswordImages[cwIndex], 15, 15);

      // let rando = this.getRandomDiagram(500);
      // console.log('rando', rando);
      // if (rando) {
      //   this.cellGrid = rando.grid;
      // }
      // this.getViolatingBoard(1000, 'offensive', 80, 100);

      // let cellString = this.getBinaryPattern([...this.cellGrid]);
      // let newGrid = this.buildArrayFromGridString()
      
      // this.clearBoard(e, true);
    },
    extractPuzzleFromImage(url, width, height) {
      const crosswordImage = document.getElementById('crossword-image');
      crosswordImage.crossOrigin = "Anonymous";
      // crosswordImage.src = 'https://cors-anywhere.herokuapp.com/' + url;
      crosswordImage.src = 'img/cw.jpg';
      crosswordImage.style.width = `${width}px`;
      crosswordImage.style.height = `${height}px`;
      crosswordImage.addEventListener('load', () => {
        console.log('LOADED!');
        const extracted = diagramCreator.imageTo2Bit('crossword-image');
        const newGrid = this.buildArrayFromGridString(extracted, width, height);
        this.cellGrid = newGrid;
        this.addCellLabels();
        this.getWordsNeeded();
      }, { once: true });
    },
    getRandomBinaryPattern(percentBlack) {
      const binaryArray = new Array(225);
      const toBeShaded = [];
      let symmDivider = this.symmetry * 2;
      if (symmDivider === 0) {
        symmDivider = 1;
      }
      const actualChance = (percentBlack / symmDivider);
      for (let i = 0; i < 225; i++) {
        if (binaryArray[i] !== 1) {
          let isShaded = 0;
          isShaded = randomInt(0, 100) < actualChance ? 1 : 0;
          binaryArray[i] = isShaded;
          if (isShaded) {
            const coords = {
              row: (i - (i % this.boardSize.height)) / this.boardSize.height,
              column: ((i) % this.boardSize.width)
            };
            const mirrorCoords = this.getMirrorCoords(this.symmetry, coords);
            mirrorCoords.forEach((coordSet) => {
              const totalIndex = (coordSet.row * this.boardSize.height) + coordSet.column;
              // binaryArray[totalIndex] = 1;
              toBeShaded.push(totalIndex);
            });
            // console.log('mirror is', mirrorCoords);
          }
        }
      }
      toBeShaded.forEach((ind) => {
        binaryArray[ind] = 1;
      });
      return binaryArray;
    },
    async scanBoardForImage() {
      // let boardDiv = document.getElementById('puzzle-board');
      // let image = document.getElementById('board-image');
      // let dataUrl = await htmlToImage.toPng(boardDiv);
      // image.src = dataUrl;
      // boardScanner.classify(image, (err, results) => {
      //   console.log(results[0]);
      //   let result = {
      //     label: results[0].label,
      //     confidence: (results[0].confidence * 100).toFixed(2)
      //   }
      //   console.log(result);
      //   document.getElementById('model-display').style.display = 'block';
      //   document.getElementById('model-display').innerText = `${result.label} ${result.confidence}%`;
      //   setTimeout(() => {
      //     document.getElementById('model-display').style.display = 'none';
      //   }, 2000)
      // });
    }
  },
  // getIntersectingWords(startingCell) {
  //   for (let i=startingCell.column + 1; i < this.boardSize.width; i++) {
  //     this.violatingCells.push(this.gridCells[startingCell.row][i])
  //   }
  // }
};
</script>

<style scoped>
#micro-board-image {
  /* display: none; */
  position: fixed;
  top: 0;
  left: 0;
  transform: translateX(-100%);
  width: 30px;
  height: 30px;
}
#crossword-image {
  /* display: none; */
  position: fixed;
  top: 0;
  left: 0;
  /* transform: translateX(100%); */
  width: 15px;
  height: 15px;
  background: white;
  z-index: 2;
  image-rendering: pixelated;
}
#model-display {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translate(-50%, 0);
  /* width: 100px;
  height: 100px; */
  font-size: 1.5rem;
  font-weight: 700;
  padding: 2vh;
  width: 100%;
  background: #00000099;
  text-align: center;
  display: none;
  z-index: 4;
}
.home {
  min-height: var(--view-height);
  max-height: var(--view-height);
  min-width: 100vw;
  display: grid;
  grid-template-rows:
    var(--header-height)
    100vmin
    1fr
    /* var(--footer-height) */
  ;
  /* overflow-y: auto; */  
}
#board-canvas {
  position: absolute;
  /* width: 66px;
  height: 66px; */
  bottom: 30vmin;
  left: 50%;
  transform: translate(-50%, 0);
  background: var(--cell-color);
  outline: 1px solid red;
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
  /* width: 100%; */
  align-self: flex-start;
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
