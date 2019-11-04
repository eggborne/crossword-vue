<template>
  <div :class='[`home`, $store.state.loaded && `ready`, $store.state.editMode === `clues` && `clues-mode`]'>
    <Header
      :handleClickToBrowse='handleClickToBrowse'
      :handleClickToSave='$store.state.editMode === `diagram` ? handleClickToSaveDiagram : handleClickToSavePuzzle'
      :handleClickPrevious='handleClickPrevious'
      :handleClickNext='handleClickNext'
      :handleClickTrain='discoverNewWords'
    />
    <div v-if='$store.state.editMode !== `clues`' class='board-area'>
      <Board
        :cellGrid='cellGrid'
        :highlightedWords='highlightedWords'
        :handleCellClick='
        $store.state.editMode === `diagram` ? handleCellFlip :
        $store.state.editMode === `puzzle` ? handleCellSelect : null
        '
        :selectedCell='selectedCell'
        :violatingCells='violatingCells'
        :themeWords='themeWords'
        :changeLetter='changeLetter'
      />
    </div>
    <div v-else class='board-area'>
      <div class='clue-display'>
        <header>Words and clues</header>
        <div v-if='this.fullWordsFound' class='list-area'>
          <h1 class='direction-label'>Across</h1>
          <div class='clue-list across'>
            <div class='word-clue-entry' v-for='wordObj in this.wordsNeeded.across.filter(wordObj => !wordObj.word.includes(`*`))' :key='wordObj.id'>
              <div>{{ wordObj.number }}.</div>
              <div>{{ wordObj.word.toUpperCase() }}</div>
              <div>{{ wordObj.clues[wordObj.selectedClue] }}</div>
              <button @pointerdown='() => handleClickToSaveClue(wordObj)' class='expand-button'>
                {{ wordObj.clues.length ? `CHANGE` : `ADD` }} CLUE
                <!-- <div class='down-caret'></div> -->
              </button>
            </div>
          </div>
          <h1 class='direction-label'>Down</h1>

        </div>        
      </div>
    </div>
    <ControlPanel
      :editMode='editMode'
      :selectedCell='selectedCell'
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
      :clearLetters='clearLetters'
      :clearBoard='clearBoard'
      :shadeBoard='shadeBoard'
      :handleClickToSaveWord='handleClickToSaveWord'
      :handleClickToBrowse='handleClickToBrowse'
      :handleClickChooseDiagram='changeDiagram'
      :handleClickGenerate='generateNewBoard'
      :cancelGeneration='cancelGeneration'
      :handleClickRules='() => showingModal = `rules`'
      :findWord='findWord'
      :fillBoard='fillBoard'
      :themeWords='themeWords'
    />
    <div v-if='showingModal' id='dark-mask'></div>
    <SaveModal
      :type='$store.state.savingType'
      v-if='showingModal === `save` || showingModal === `clues`'
      :handleSaveDiagram='handleSaveDiagram'
      :handleSaveWord='saveNewWord'
      :handleClickCancelSave='handleClickCancelModal'
      :handleDeleteClue='handleDeleteClue'
      :wordObj='$store.state.selectedWord'
    >
    {{ saveMessage }}
    </SaveModal>
    <RulesModal
      v-if='showingModal === `rules`'
      :handleClickCloseRules='() => showingModal = undefined'      
    />
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
import DB from '../api.js';
import axios from 'axios';
import Header from '@/components/Header.vue';
import Board from '../components/Board.vue';
import ControlPanel from '../components/ControlPanel.vue';
import RulesModal from '../components/RulesModal.vue';
import BrowseModal from '../components/BrowseModal.vue';
import SaveModal from '../components/SaveModal.vue';
import BoardValidator from '../boardvalidator';
import DiagramCreator from '../diagramcreator';
import MicroBoard from '../components/MicroBoard.vue';

import GridScanner from '../gridscanner';

const diagramCreator = new DiagramCreator();
const boardValidator = new BoardValidator();
let gridScanner = new GridScanner();

// require('../vkthread.min.js');

// let validatorUrl = require('../boardvalidator.js')

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export default {
  name: 'Home',
  data: () => ({
    editMode: 'diagram',
    selectedCellIndex: undefined,
    selectedCell: undefined,
    showingModal: undefined,
    fullWordList: [
      
    ],
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
    highlightedWords: [],
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
    themeWords: [[], []],
    onLayer: 0,
    generating: false,
    buildQueue: []
    // worker: window.WEB_WORKER
  }),
  computed: {
    percentBlack() {
      return (this.cellGrid.length) ? this.getPercentBlack(this.cellGrid) : 0;
    },
    fullWordsFound() {
      return this.wordsNeeded.across.filter(wordObj => !wordObj.word.includes(`*`)).length ||
      this.wordsNeeded.down.filter(wordObj => !wordObj.word.includes(`*`)).length
    }
  },
  mounted() {
    window.addEventListener('load', () => {
      console.error('LOADED.');  
      this.$store.commit('setLoaded');     
    });
    this.createGrid(this.boardSize);
    requestIdleCallback(() => {
      this.addCellLabels();
      this.getWordsNeeded();      
      setTimeout(() => {
        this.getMLData().then(() => {
          console.error('Home.vue getMLData finished')      
        });      
      }, 200);
    });
    this.rules = this.$store.state.puzzleOptions.rules;
  },
  components: {
    Header,
    Board,
    ControlPanel,
    RulesModal,
    BrowseModal,
    SaveModal,
    MicroBoard
  },
  methods: {
    // getContiguous(grid) {
    //   const validator = new BoardValidator();
    //   const param = {
    //     fn: validator.checkIfContiguous,
    //     context: validator,
    //     args: [grid, grid.flat()]
    //   };
    //   return vkthread.exec(param);
    // },
    
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
      this.$store.s    
      let modelData = await gridScanner.updateModel('offensive');
      this.$store.dispatch('setLoaded', 'gotMLData');      
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
    handleClickToSaveDiagram() {
      this.$store.commit('changeSavingType', 'diagram')
      this.showingModal = 'save';
    },
    handleClickToSavePuzzle() {
      this.$store.commit('changeSavingType', 'puzzle')
      this.showingModal = 'save';
    },
    handleClickToSaveWord() {
      this.$store.commit('changeSavingType', 'word')
      this.showingModal = 'save';
    },
    handleClickToSaveClue(wordObj) {
      this.$store.commit('changeSelectedWord', wordObj)
      this.$store.commit('changeSavingType', 'clues')
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
      gridScanner = new GridScanner();
      gridScanner.refreshModel();
      gridScanner.trainScanner(ioArray);
      this.saveAIModelToDB();
    },
    async handleClickToLabel(diagramId, violation, violating) {
      console.warn('handleClickToLabel received', diagramId, violation, violating);
      if (!this.savedTrainingData.input.length) {
        const trainingData = await gridScanner.getTrainingData('offensive');
        if (trainingData) {
          this.savedTrainingData = trainingData;
          this.$store.dispatch('setLoaded', 'gotMLTrainingData');
        }
      }
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
      const modelString = JSON.stringify(gridScanner.net.toJSON());
      document.getElementById('model-display').innerText = 'SAVING...';
      document.getElementById('model-display').style.display = 'block';
      this.busySaving = true;
      const saveAIResponse = await DB.saveAIModel('offensive', modelString);
      console.warn('save AI responded', saveAIResponse.data);
      this.busySaving = false;
      document.getElementById('model-display').innerText = 'SAVED!';
      document.getElementById('model-display').style.background = 'green';
      setTimeout(() => {
        document.getElementById('model-display').style.display = 'none';
      }, 1000);
    },
    async handleDeleteClue(wordObj, clueIndex) {
      console.warn('received', wordObj.word, clueIndex, wordObj.clues[clueIndex]);

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
      const grid = cellGrid ? cellGrid : this.cellGrid;
      const violations = [];
      const newWordsNeeded = {
        across: [],
        down: []
      };
      grid.forEach((row, r) => {
        // row.filter(cell => cell.number).forEach((cell, c) => {
        row.forEach((cell, c) => {
          // cell.letter = '';
          if (cell.number) {
            const cellIndex = (r * grid.length) + c;
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
                letterIndexes: acrossLetters,
                clues: [],
                selectedClue: 0
              });
            }
            if (wordLengthBelow) {
              newWordsNeeded.down.push({
                number: cell.number,
                word: '*'.repeat(wordLengthBelow),
                letterIndexes: downLetters,
                clues: [],
                selectedClue: 0
              });
            }
          }
        });
      });
      if (!cellGrid) {
        this.wordsNeeded = newWordsNeeded;
      }
      // console.log('newWordsNeeded', newWordsNeeded)
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
          if (tooLong) {
            console.error(wordObj.number, 'DOWN IS TOO LONG!')
          }
          wordObj.letterIndexes.forEach(index => {
            violating.push(index);
          })
        }
      });
      if (!noDisplay) {
        this.violatingCells = violating;
      }
      // console.warn('got', violating.length, 'violating cells in', window.performance.now() - st);
      // console.info(violating)
      return violating;
    },
    changeLetter(e, index, newLetter) {
      console.log('cocks', e, index, newLetter);
      let allCells = this.cellGrid.flat();
      let targetCell = allCells[index];
      this.cellGrid[targetCell.row][targetCell.column].letter = newLetter;
      console.log('targ', e.target.value)
      e.target.value = '';
      
      if (this.$store.state.editDirection === 'across') {
        if (!targetCell.shaded && 
        targetCell.column !== this.boardSize.width - 1 &&
        allCells[this.selectedCell.index + 1] && !allCells[this.selectedCell.index + 1].shaded ) {
          // this.selectedCell.index += 1;
          this.selectedCell = allCells[this.selectedCell.index + 1]
        } else {
          this.$store.commit('changeEnteringLetters', false);
        }
      } else {
         if (!targetCell.shaded && 
        allCells[this.selectedCell.index + this.boardSize.width] && !allCells[this.selectedCell.index + this.boardSize.width].shaded ) {
          this.selectedCell = allCells[this.selectedCell.index + this.boardSize.width]
        } else {
          this.$store.commit('changeEnteringLetters', false);
        }
      }
      this.getWordsNeeded();
    },
    fillWithWord(word, number, direction) {
      let cells = this.cellGrid.flat();
      console.warn('gonna fill', number, direction, 'with', word);
      let targetWord = this.wordsNeeded[direction].filter(wordObj => wordObj.number === number)[0];
      let indexes = targetWord.letterIndexes;
      if (word) {
        indexes.forEach((index, i) => { 
          cells[index].letter = word.split('')[i]
        });
        console.error('setting the word in wordsNeeded to', word)
        targetWord.word = word;
      } else {
        this.violatingCells.push(...indexes);
        this.highlightedWords.splice(this.highlightedWords.indexOf(targetWord), 1);
        setTimeout(() => {          
          this.highlightedWords.push(targetWord);
        }, 500)
      }

    },
    async findWord(e, direction, skipFill) {
      const editDirection = direction || this.$store.state.editDirection;
      const rootObj = this.getRootWords(this.selectedCell.index)[this.$store.state.editDirection];
      console.log('root is', rootObj)
      let pattern = '';
      rootObj.letterIndexes.forEach(ind => {
        pattern += this.cellGrid.flat()[ind].letter.toUpperCase() || '*';
      })
      const matchingWords = [];
      console.log('got pattern', pattern)
      const length = pattern.length;
      let wordList = this.fullWordList[length];
      if (!wordList) {
        console.error('no list yet! getting from db...')
        wordList = await this.getWordList(length);
      } 
      wordList = wordList.sort(() => Math.random() - 0.5);
      for (let i = 0; i < wordList.length; i += 1) {
        let word = wordList[i].word.toUpperCase();
        let match = true;
        pattern.split('').forEach((char, c) => {
          if (char !== '*' && char !== word[c]) {
            match = false;
          }
        });
        if (match) {
          matchingWords.push(wordList[i])
        }
      }
      console.log('found matching words', matchingWords.length);
      // let winner;
      // if (matchingWords.length) {
      //   winner = matchingWords[randomInt(0, matchingWords.length - 1)];
      //   console.log('winner', winner);
      // }
      // if (!skipFill && winner) {
      //   this.fillWithWord(winner.word, this.selectedCell.number, editDirection);
      // }
      return matchingWords.length ? matchingWords : undefined;
    },

    async getClues(word) {
      let clueArray = [];
      if (!this.fullWordList[word.length]) {
        console.log('need to get list of', word.length)
        await this.getWordList(word.length);
      }
      let matchingEntries = this.fullWordList[word.length].filter(listObj => word.toUpperCase() === listObj.word.toUpperCase());
      matchingEntries.forEach(entry => {
        entry.clue = entry.clue[0].toUpperCase() + entry.clue.substr(1, entry.clue.length);
        clueArray.push(entry.clue);
      })
      console.log('clues for', word, ':', clueArray);
      
      return clueArray
    },

    getWordList(length) {
      console.error('CALLING DB FOR', length, '-LETTER WORDS');
      return new Promise((resolve) => {
        DB.getFullWordListOfLength(length).then((response) => {
          if (response.data) {
            const wordObjectList = response.data.split(' || ').filter(obj => obj).map(wordObj => wordObj = JSON.parse(wordObj));
            console.warn('GOT LIST', wordObjectList);
            wordObjectList.forEach(wordObj => {
              if (wordObj.clues) {
                wordObj.clues = JSON.parse(wordObj.clues);
                wordObj.clues.forEach(clue => {
                  clue = clue.replace(/`/g, "'");                
                  clue = clue.replace(/|/g, "\"");                
                });
              }
            })
            this.fullWordList[length] = wordObjectList;
            resolve(wordObjectList);
          } else {
            console.error('COULD NOT GET WORD LIST OF LENGTH', length);
          }
        });
      });    
    },
    async changeEditMode(e) {
      const newMode = e.target.id.split('-')[0];
      this.selectedCell = undefined;
      this.highlightedWords = [];
      if (newMode === 'clues') {
        let fullAcrossWords = this.wordsNeeded.across.filter(wordObj => !wordObj.word.includes('*'));
        let fullDownWords = this.wordsNeeded.down.filter(wordObj => !wordObj.word.includes('*'));
        fullAcrossWords.forEach(async wordObj => {        
          console.log('we getting clue for across', wordObj.word)
          let clueArr = await this.getClues(wordObj.word);
          this.wordsNeeded.across[this.wordsNeeded.across.indexOf(wordObj)].clues = clueArr;
        })
        fullDownWords.forEach(async wordObj => {        
          console.log('we getting clue for down', wordObj.word)
          let clueArr = await this.getClues(wordObj.word);
          this.wordsNeeded.down[this.wordsNeeded.down.indexOf(wordObj)].clues = clueArr;          
        })
        
      }
      console.warn('changing to', newMode)
      requestIdleCallback(() => {
        this.$store.commit('changeEditMode', newMode);
        console.log('wordsNeeded now', this.wordsNeeded)
      })
      // this.$store.commit('changeEditDirection', 'across');
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
        this.getViolatingCells(this.getWordsNeeded());
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
      let startTime = window.performance.now();
      const clickedIndex = e.target.id.split('-')[1];
      const cellCoords = { row: this.cellGrid.flat()[clickedIndex].row, column: this.cellGrid.flat()[clickedIndex].column };
      const newCellGrid = this.cellGrid;
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
        this.themeWords = this.getThemeWords(needed);
        this.contiguous = boardValidator.checkIfContiguous(newCellGrid, newCellGrid.flat());
        this.offensiveQuotient = gridScanner.getGridAttribute(newCellGrid, 'offensive');
        // this.getContiguous(newCellGrid).then((contiguous) => {
        //   this.contiguous = contiguous;
        //   console.warn('worker for getContiguous took', window.performance.now() - startTime);
        // });
      });
    },
    handleCellSelect(e) {
      console.log('currently selected is', this.selectedCell)
      const allCells = this.cellGrid.flat();
      const clickedIndex = parseInt(e.target.id.split('-')[1]);
      const numbered = allCells[clickedIndex].number;
      let rootWords = this.getRootWords(clickedIndex);
      console.warn('GOT ROOTS', rootWords);
      if (!allCells[clickedIndex].shaded) {
        if (!this.selectedCell || clickedIndex !== this.selectedCell.index) {
          this.highlightedWords = [];
          // this.selectedCell.index = clickedIndex;
          let newSelected = allCells[clickedIndex]
          console.warn('chaning to index', clickedIndex, newSelected);
          this.selectedCell = newSelected;
          if (numbered) {
            if (rootWords.down) {   
              if (rootWords.down.letterIndexes[0] === clickedIndex) {           
                this.$store.commit(`changeEditDirection`, `down`);
              }
              this.highlightedWords.push(rootWords.down)
            }
            if (rootWords.across) {
              if (rootWords.across.letterIndexes[0] === clickedIndex) {
                this.$store.commit(`changeEditDirection`, `across`);
              }
              this.highlightedWords.push(rootWords.across)
            }            
          } else {
            for (let direction in rootWords) {
              this.highlightedWords.push(rootWords[direction]);
            }
          }
          console.warn('SELECTED cell', this.selectedCell)
        } else {
          console.error('clicked when already selected');
          if (numbered) {
            const currentEditDirection = this.$store.state.editDirection;
            if (currentEditDirection === 'across' && rootWords.down && rootWords.down.letterIndexes[0] === clickedIndex) {
              this.$store.commit(`changeEditDirection`, `down`);
            }
            if (currentEditDirection === 'down' && rootWords.across && rootWords.across.letterIndexes[0] === clickedIndex) {
              this.$store.commit(`changeEditDirection`, `across`);
            }
          }
          // this.$store.commit(`changeEditDirection`, this.$store.state.editDirection === `across` ? `down` : `across`)
        }
      }
    },
    addCellLabels(cellGrid) {
      // console.log('ADDCELLLABELS', Date.now())
      let allChecked = this.$store.state.puzzleOptions.rules.allChecked;
      let grid = cellGrid ? JSON.parse(JSON.stringify(cellGrid)) : JSON.parse(JSON.stringify(this.cellGrid));
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
            // do not count 1-word spaces if !allChecked
            if (!allChecked) {
              let twoAwayDown = grid[r + 2] && grid[r + 2][c];
              let twoAwayRight = grid[r][c + 2];
              if (twoAwayDown && !twoAwayDown.shaded) {
                numberedIndexes.push(cellTotalIndex + this.boardSize.width);
              }
              if (twoAwayRight && !twoAwayRight.shaded) {
                numberedIndexes.push(cellTotalIndex + 1);
              }
            } else {
              numberedIndexes.push(cellTotalIndex + this.boardSize.width);
              numberedIndexes.push(cellTotalIndex + 1);
            }

          } else if ((r === 0 || c === 0) || numberedIndexes.includes(cellTotalIndex)) {
            let isNumbered = true;
            if (!allChecked)  {
              if (r === 0 && grid[r + 1] && grid[r + 1][c].shaded) {
                isNumbered = false;
                numberedIndexes.splice(1, numberedIndexes.indexOf(cellTotalIndex));
              }
              if (c === 0 && grid[r][c + 1].shaded) {
                isNumbered = false;
                numberedIndexes.splice(1, numberedIndexes.indexOf(cellTotalIndex));
              }
            }
            if (isNumbered) {
              numbered = true;
              onNumberedCell++;
            }
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
    getRootWords(cellIndex, needed) {
      const wordsNeeded = needed || this.wordsNeeded;
      let roots = {};
      console.warn('this.wordsNeed is', wordsNeeded)
      for (let wordDirection in wordsNeeded) {
        let wordList = wordsNeeded[wordDirection];
        wordList.forEach(wordObj => {
          if (!roots[wordDirection] && wordObj.letterIndexes.includes(cellIndex)) {
            roots[wordDirection] = wordObj;
          };          
        })
      };
      return roots;
    },
    getThemeWords(wordsNeeded) {
      let themeWords = [
        [],
        []
      ];
      let wordArray = Object.values(wordsNeeded).flat().sort((a, b) => b.word.length - a.word.length);
      let longest = wordArray[0].word.length;
      let longestQuantity = wordArray.filter(wordObject => wordObject.word.length === longest).length
      let shortest = wordArray[wordArray.length - 1].word.length;
      let secondLongest = wordArray.filter(wordObject => wordObject.word.length !== longest)[0].word.length;
      let longestMargin = longest - secondLongest;
      let secondLongestMargin = secondLongest - shortest;
      let secondLongestQuantity = wordArray.filter(wordObject => wordObject.word.length === secondLongest).length
      if (this.boardSize.width / longest > 1.75) {
        longestMargin = undefined;
        console.error('longest too short to be a theme word', longest)
      }
      if (!longestMargin || this.boardSize.width / secondLongest > 2) {
        console.error('secondLongest too short to be a theme word', secondLongest)
        secondLongestMargin = undefined;
      }
      wordArray.forEach(wordObject => {
        let wordLength = wordObject.word.length;
        if (!themeWords.flat().includes(wordObject)) {
          if (longestQuantity <= 4 && longestMargin && wordLength === longest) {
            themeWords[0].push(wordObject);
          }
          // if (longestQuantity <= 4 && secondLongestQuantity <= 4 && longestQuantity <= 2 && secondLongestQuantity <= 4 && secondLongestMargin && wordLength === secondLongest) {
          //   themeWords[1].push(wordObject);
          // }
        }
      });
      return themeWords;
    },
    getWordsForCell(cellIndex, wordsNeeded) {
      let words = {
        across: wordsNeeded.across.filter(wordObj => wordObj.letterIndexes.includes(cellIndex))[0],
        down: wordsNeeded.down.filter(wordObj => wordObj.letterIndexes.includes(cellIndex))[0],
      }
    },
    generateNewBoard(instant) {
      let genStart = window.performance.now();
      let canceled = false;
      let viableCells = this.cellGrid.flat().filter(cell => !cell.shaded && !cell.letter);
      // this.clearBoard();
      this.generating = true;
      this.buildQueue.length = 0;
      let blackness = 0;
      let previousBlackness;
      let newGrid;
      // let timeout = this.rules.blackRate * 3 * (3 - this.symmetry)
      let timeout = 3000;
      this.count = 0;
      this.redundant = 0;
      this.growBoard = (baseGrid, skipRender) => {
        this.count++;
        let generated = this.generateLayer(baseGrid, viableCells);
        const grid = generated.grid;
        const changed = viableCells.length !== generated.viableCells.length;
        viableCells = generated.viableCells.filter(cell => !cell.shaded); 
        // this.previousBlackness = this.blackness;
        blackness = this.getPercentBlack(grid);  
        if (skipRender) {
          this.cellGrid = grid;
        }
        let tooRedundant = this.redundant >= timeout;
        let timedOut = this.count >= timeout;
        let enoughBlack = blackness >= this.rules.blackRate;
        let failed = viableCells.length === 0;
        if (this.generating && !tooRedundant && !timedOut && !enoughBlack) {   
          if (true) {            
            requestAnimationFrame(() => {              
              this.growBoard(grid, changed);             
            });
            // setTimeout(() => {              
            //   this.growBoard(grid);             
            // }, 650);
          } else {
            this.redundant++
            console.error(this.count, 'redundant!')
            requestIdleCallback(() => {
              this.growBoard(this.cellGrid, true);             
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
          requestAnimationFrame(() => {            
            newGrid = this.addCellLabels(grid);
            let needed = this.getWordsNeeded(newGrid);
            this.wordsNeeded = needed;
            this.violatingCells = this.getViolatingCells(needed);
            let themeWords = this.getThemeWords(needed);
            this.themeWords = themeWords;
            let contiguous = boardValidator.checkIfContiguous(newGrid, newGrid.flat());
            this.contiguous = contiguous;
            this.offensiveQuotient = gridScanner.getGridAttribute(newGrid, 'offensive');            
            this.generating = false;              
            this.cellGrid = newGrid;
            this.onLayer = 0;            
            console.error('stopped at timedOut', timedOut);
            console.error('stopped at tooRedundant', tooRedundant);
            console.error('stopped at enoughBlack', enoughBlack);
            console.error('stopped at canceled', canceled);
            console.error('stopped at failed', failed);
            // setTimeout(() =>{
            //   requestAnimationFrame(() => {
            //     this.cellGrid.forEach(row => row.map(cell => cell.letter = ''))
            //     viableCells.forEach(cell => this.cellGrid[cell.row][cell.column].letter = 'V') 
            //   })
            // }, 500)
          });
        }
        // return grid;
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
    generateLayer(baseLayer, viableCells) {
      let foundGoodCell = false;
      let newGrid = JSON.parse(JSON.stringify(baseLayer));
      let newQueueItem = [];
      let violating = [];
      let newViableCells = viableCells.filter(cell => !cell.shaded).sort(() => Math.random() - 0.5);
      for (let i = newViableCells.length - 1; i >= 0; i -= 1) {
        let stillValidIfShaded = false;
        let selectedCell = newViableCells[i];
        if (newViableCells.includes(selectedCell)) {
          let centerCell = selectedCell.row === Math.floor(this.boardSize.height / 2) && selectedCell.column === Math.floor(this.boardSize.width / 2);
          let previousShaded = newGrid[selectedCell.row][selectedCell.column].shaded;
          // shade the random cell
          newGrid[selectedCell.row][selectedCell.column].shaded = true;
          selectedCell.shaded = true;
          newQueueItem.push(selectedCell);
          // shade its mirrors, if any
          const mirrorCoords = this.getMirrorCoords(this.symmetry, {
            row: selectedCell.row,
            column: selectedCell.column
          });
          if (!centerCell) {
            mirrorCoords.forEach((coordSet) => {
              const mirrorCell = newGrid[coordSet.row][coordSet.column];
              mirrorCell.previousShaded = previousShaded;
              mirrorCell.shaded = selectedCell.shaded;
              newQueueItem.push(mirrorCell);
            });
          }

          newGrid = this.addCellLabels(newGrid);
          let needed = this.getWordsNeeded(newGrid);
          let enforceMax = false;
          violating = this.getViolatingCells(needed, true, enforceMax);
          newGrid.forEach(row => row.map(cell => cell.number = ''))
     
          if (!violating.length) {
            let offensiveQuotient = gridScanner.getGridAttribute(newGrid, 'offensive');
            if (offensiveQuotient < 50) {
              let contiguous = boardValidator.checkIfContiguous(newGrid, newGrid.flat());
              if (this.rules.contiguous && contiguous || !this.rules.contiguous) {
                foundGoodCell = true;         
                break;          
              } else {
                console.error(selectedCell.index, i, 'rejected for non-contiguous');
              }
            } else {
              console.error(selectedCell.index, i, 'rejected for offensive');
            }
          } else {
            
          }
          if (foundGoodCell) {
            
          } else {            
                    
            // unshade the test cells
            newGrid[selectedCell.row][selectedCell.column].shaded = previousShaded;
            newViableCells.splice(i, 1);
            if (!centerCell) {
                mirrorCoords.forEach((coordSet) => {
                  const mirrorCell = newGrid[coordSet.row][coordSet.column];
                  mirrorCell.shaded = previousShaded;
                  
                });
            }
            newQueueItem.length = 0;
          }
        }
      }
      // console.log('returning newViableCells:', newViableCells);

       requestAnimationFrame(() => {
        // this.cellGrid.forEach(row => row.map(cell => cell.letter = ''))
        // viableCells.forEach(cell => this.cellGrid[cell.row][cell.column].letter = 'V') 
      })
      
      if (foundGoodCell) {
        this.buildQueue = [...this.buildQueue, newQueueItem];
        return {grid: newGrid, viableCells: newViableCells};
      } else {
        // if (this.symmetry > 0) {
        //   console.error('TRYING SYMMETRY', this.symmetry - 1)
        //   this.symmetry = this.symmetry - 1;
        //   return {grid: newGrid, viableCells: newViableCells};
        // } else {
          this.generating = false;
          console.log('set generating false!, newViableCells length is', newViableCells.length)
          return {grid: newGrid, viableCells: newViableCells};
        // }
      }

     
      // let advanceAmount = randomInt(0,2);
      // if (!validOptions.length) {
      //   advanceAmount = 1;
      // } else {
      //   let randomIndex = randomInt(0, validOptions.length - 1);
      //   let cellToShade = validOptions[randomIndex];
      //   newGrid[this.onLayer][cellToShade].shaded = true;
      //   const mirrorCoords = this.getMirrorCoords(this.symmetry, {
      //       row: this.onLayer,
      //       column: cellToShade
      //     });
      //   mirrorCoords.forEach((coordSet) => {
      //     const cellIndex = (coordSet.row * this.boardSize.height) + coordSet.column;
      //     newGrid[coordSet.row][coordSet.column].shaded = true;
      //   });
      //   validOptions = [];        
      // }
      // // this.onLayer = this.onLayer - 1;
      // // if (this.onLayer < 0) {
      // //   this.onLayer = limits.max;
      // // }
      // this.onLayer = this.onLayer + advanceAmount;
      // if (this.onLayer > limits.max - 1) {
      //   this.onLayer = 0;
      // }
      // return newGrid;
    },
    getOffensive() {
      let rando = randomInt(0, 3);
      let min = 95;
      let max = 100;
      if (!rando) {
        min = 0;
        max = 5;
      }
      this.generating = true;
      requestAnimationFrame(() => {
        this.getViolatingBoard('offensive', min, max).then(passingGrid => {        
          this.generating = false;
          this.offensiveQuotient = passingGrid.score;
          this.cellGrid = passingGrid.grid;
        });
      })
    },
    getViolatingBoard(feature, minScore, maxScore) {
      return new Promise(resolve => {
        let st = window.performance.now();
        const offensiveScores = [];
        const newAuditList = [];
        let passingGrid;
        let tries = 0;
        requestAnimationFrame(() => {
        let startTime = window.performance.now();
        let elapsed = 0;
          while (this.generating && elapsed < 7000 && !passingGrid) {
            const randomBlack = this.rules.blackRate;
            const randomPattern = this.getRandomBinaryPattern(randomBlack);
            const newGrid = this.buildArrayFromGridString(randomPattern, this.boardSize.width, this.boardSize.height);
            const gridScore = gridScanner.getGridAttribute(newGrid, feature);
            // console.warn('we at randomPattern', tries)
            // console.warn('we at gridScore, min, max', gridScore, minScore, maxScore)
            if (gridScore >= minScore && gridScore <= maxScore) {
              passingGrid = { grid: newGrid, score: gridScore };
            } else {
              tries += 1;
              elapsed =  window.performance.now() - startTime;              
              requestAnimationFrame(() => {
              })
              // this.cellGrid = newGrid;                
            }
          }
          // passingGrids.forEach((scoreSet, i) => {
          //   const diagramObj = {};
          //   diagramObj.cells = scoreSet.grid;
          //   diagramObj.width = this.boardSize.width;
          //   diagramObj.height = this.boardSize.height;
          //   diagramObj.percentBlack = 0;
          //   diagramObj.offensivePercent = scoreSet.score;
          //   // console.log('puishing diagramObj', diagramObj)
          //   newAuditList.push(diagramObj);
          // });      
          // passingGrids = passingGrids.sort((a, b) => b.offensivePercent - a.offensivePercent);
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

          console.warn('screened', tries, 'grids in', window.performance.now() - st);        
          resolve(passingGrid);

        });

        // this.offensiveQuotient = passingGrid.score;
        // this.cellGrid = passingGrid.grid;

        // this.auditList = newAuditList;
      });
    },

    async clearLetters(e, shade) {
      this.cellGrid.forEach((row, r) => {
        row.map((cell, c) => {
          return cell.letter = '';
        });
      });
      this.violatingCells.length = 0;
      this.getWordsNeeded();
    },
    async discoverNewWords() {
      let list = await this.getWordList(11);
      let count = 0;
      list.forEach((wordObj, i) => {
        // console.log('clues?', wordObj.clues)
        if (!wordObj.clues) {
          count += 1;
          console.log(wordObj.word, 'got no clues')
          let clueArr = wordObj.clues || [];
          if (wordObj.clue) {
            let clue = wordObj.clue.replace(/'/g, "`");
            // clue = wordObj.clue.replace(/"/g, "|");
            console.log('prepared clue', clue)
            clueArr.push(clue)
          }
          setTimeout(() => {
            DB.saveClue(wordObj.word, clueArr).then(resp => {
              console.warn(wordObj.word, 'resp', resp.data)
            });
          }, count * 250)        
        }
      });
      // let newWords = [];
      // let tries = 0;
      // while(newWords.length < 20 && tries < 2) {
      //   let discovered = await DB.discoverWords(12);
      //   if (!discovered) {
      //     tries += 1;
      //   } else {
      //     console.warn('DISCOVERED', discovered);
      //     newWords.push(...discovered);
      //     console.warn('newWords', newWords);
      //   }
      // }
      // console.warn('----------- DONE ---------------')
      // newWords.forEach(word => {
      //   if (word.split('-').length > 1) {
      //     console.log('HYPHENATED WORD', word);
      //     let newWord = '';
      //     word.split('-').forEach(piece => {
      //       newWord += piece;
      //     });
      //     word = newWord;
      //     console.log('created new word', newWord)
      //   }
      //   console.log('SAVING', word);
      //   DB.saveWord(word).then((resp) => {
      //     console.warn(word, resp)
      //   });        
      // })
    },
    async saveNewWord(newWord) {      
      const saveResp = await DB.saveWord(newWord)
      console.warn(newWord, saveResp);
      const updateResp = await this.getWordList(newWord.length);
      console.warn('updated!', updateResp)
      this.showingModal = undefined;
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
            // newCell.letter = '';
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
        this.themeWords = [[], []];
        this.highlightedWords = [];
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
      
      this.clearBoard(e, true);
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
    async wait(time) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve('blarghe')
        }, time);
      });
    },
    getChangedCells(oldBoard) {
      const changedCells = this.cellGrid.flat().filter((cell, i) => {
        return cell.letter !== oldBoard.flat()[i].letter
      });
      return changedCells
    },
    async fillBoard() {
      const allCells = this.cellGrid.flat();
      let currentRootCell = this.selectedCell ? this.selectedCell : allCells.filter(cell => cell.number === 1)[0];
      this.selectedCell = currentRootCell;
      this.$store.commit('changeEditDirection', 'across');
      const choiceSequence = [];
      const checkQueue = [{ direction: this.$store.state.editDirection, cellIndex: currentRootCell.index }];
      let filledWords = { across: [], down: [] };
      let iterations = 0;
      let repetitions = 0;
      let onWordIndex = { across: 0, down: 0 };
      const limit = 225;
      this.generating = true;
      console.log('started');
      while(this.generating && iterations < limit) {
        iterations && await this.wait(3);
        const oldBoard = JSON.parse(JSON.stringify(this.cellGrid));
        const wordOptions = await this.findWord();
        if (!wordOptions) {
          console.error('NO WORDS FOUND FOR', currentRootCell.number, this.$store.state.editDirection);
          let cellArr = this.wordsNeeded[this.$store.state.editDirection].filter(wordObj => wordObj.letterIndexes.includes(this.selectedCell.index))[0].letterIndexes;
          console.log('cellArr', cellArr)
          this.violatingCells.push(...cellArr)
          break;
        }
        const foundWord = wordOptions[randomInt(0, wordOptions.length - 1)];
        this.fillWithWord(foundWord.word, currentRootCell.number, this.$store.state.editDirection);
            
        // const changedCells = this.getChangedCells(oldBoard);
        // console.log(foundWord.word, 'changed', changedCells);
        // console.log('going for foundWord', foundWord)

        this.$store.dispatch('toggleDirection');

        // const needed = this.getWordsNeeded();
        // changedCells.forEach(cell => {
        //   let rootWords = this.getRootWords(cell.index, needed);
        //   checkQueue.push({ direction: currentEditDirection, cellIndex: rootWords[currentEditDirection].letterIndexes[0]});        
        // });

        iterations += 1;

        // const nextRootCellIndex = this.getRootWords(changedCells[onWordIndex].index)[this.$store.state.editDirection].letterIndexes[0];
        let currentWordList = this.wordsNeeded[this.$store.state.editDirection];
        let currentWord = currentWordList.filter(wordObj => wordObj.letterIndexes.includes(this.selectedCell.index))[0];

        const nextRootCellIndex = currentWordList[onWordIndex[this.$store.state.editDirection]].letterIndexes[0];
        console.log('nextrootcelli', nextRootCellIndex);
        currentRootCell =  allCells[nextRootCellIndex];
        if (onWordIndex[this.$store.state.editDirection] <  currentWordList.length) {
          onWordIndex[this.$store.state.editDirection] += 1;
        } else {
          onWordIndex[this.$store.state.editDirection] = 0;
        }
        requestAnimationFrame(() => {
          this.selectedCell = currentRootCell;
        })
      }
      
      this.generating = false;
      if (iterations === limit) {
        console.error('TIMED OUT!! -----------')
      }
      this.$store.commit('changeEditDirection', 'across');
      this.selectedCell = undefined;
      this.highlightedWords = [];
      console.error('///////////////////////////////////////////')      
    },

    async fillBoard2() {
      const allCells = this.cellGrid.flat();
      const checkQueue = [];
      let currentRootCell = allCells.filter(cell => cell.number === 1)[0];
      this.selectedCell = currentRootCell;
      let currentEditDirection = 'across';
      this.$store.commit('changeEditDirection', currentEditDirection);
      let filledWords = []; // index in this.wordsNeeded
      let iterations = 0;
      let repetitions = 0;
      const limit = 600;
      this.generating = true;
      while(this.generating && iterations < limit) {
        // get a word for the current selectedCell and editDirection
        let foundWord = await this.findWord();
        if (!foundWord) {
          console.error('///////////////// NO WORD FOUND FOR', currentRootCell.number, currentEditDirection);
          break;
        }
        console.warn('---- iteration', iterations, 'found word', foundWord.toUpperCase(), 'for', this.selectedCell.number, currentEditDirection);
        // find the cell at the end of that word
        const newestWord = this.wordsNeeded[currentEditDirection].filter(wordObj => wordObj.number === currentRootCell.number)[0];
        const neededIndex = this.wordsNeeded[currentEditDirection].indexOf(newestWord);
        let rootFromIndex = newestWord.word.length - 1;
        if (filledWords.includes(neededIndex)) {
          console.error('///////// tried same word again for', repetitions, 'times');
          repetitions += 1;
          if (repetitions === 12) {
            console.error('TOO MANY SAME TIME :(');
            break;
          }
          rootFromIndex = 0;
        } else {
          repetitions = 0;
          filledWords.push(neededIndex)
        }
        const wordEndCell = allCells[newestWord.letterIndexes[rootFromIndex]];

        console.log('rootFromIndex cell is', wordEndCell.row, wordEndCell.column, wordEndCell.number, wordEndCell.letter)

        // turn
        currentEditDirection = currentEditDirection === 'across' ? 'down' : 'across';    
        console.error('TURNING', currentEditDirection);
        this.$store.commit('changeEditDirection', currentEditDirection);

        // get that cell's root word from new direction
        const endRootWord = this.getRootWords(wordEndCell.index)[currentEditDirection];
        if (!endRootWord) {
          console.error(currentEditDirection, 'had no endRootWord /////////////////////////');
          break;
        }
        console.error(currentEditDirection, 'root word of word end cell of', foundWord.toUpperCase(), 'is', endRootWord.number, currentEditDirection);
        // change selected cell to that word's starting letter
        const nextCellIndex = endRootWord.letterIndexes[0];

        // requestIdleCallback(() => {
          currentRootCell = allCells[nextCellIndex];
          this.selectedCell = currentRootCell;
        // });
        console.log('filled', filledWords.length, 'words')
        iterations += 1;
      }
      this.generating = false;
      if (iterations === limit) {
        console.error('TIMED OUT!! -----------')
      }
      this.selectedCell = undefined;
      this.highlightedWords = [];
      console.error('///////////////////////////')
      console.error('/////////////////////////////////')
      console.error('//////////////////////////////////////')
      console.error('///////////////////////////////////////////')      
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
  ;
  /* overflow-y: auto; */
  align-items: flex-end;
  transition: opacity 600ms ease;
}
.home.clues-mode {
  grid-template-rows:
    var(--header-height)
    1fr
    auto
  ;
}
.home:not(.ready) {
  opacity: 0;
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
  align-self: flex-start;
	display: flex;
	flex-direction: column;
  align-items: center;
	justify-content: center;
}
.home.clues-mode .board-area {
  overflow: auto;
  justify-content: flex-start;
}
.down-caret {
  width: 0; 
  height: 0; 
  border-left: calc(var(--header-height) / 4) solid transparent;
  border-right: calc(var(--header-height) / 4) solid transparent;  
  border-top: calc(var(--header-height) / 4) solid var(--secondary-text-color);
}
.clue-display {
  color: var(--secondary-text-color);
  font-weight: bold;
  width: 100%;
  flex-grow: 1;
  justify-self: flex-start;
  position: relative;
}
.expand-button {
  font-weight: bold;
  color: var(--main-text-color);
  height: var(--header-height);
  border: 1px solid var(--secondary-text-color);
  padding: calc(var(--main-padding) / 2);
  background-color: unset;
  border-radius: calc(var(--main-padding) / 4);
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  font-size: 0.75rem;
  background-color: var(--button-color)
}
.expand-button > .down-caret {
  margin-left: 5%;
}
.clue-display h1 {
  font-size: 1.5rem;
}
.clue-display h1:nth-of-type(2) {
  font-size: 1.5rem;
  margin-top: var(--header-height);
}
.clue-display > header {
  position: relative;
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;  
}
.list-area {
  padding: var(--main-padding);
}
.clue-display .clue-list {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.clue-list > .word-clue-entry {
  padding: calc(var(--main-padding) / 2);
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto 1fr;
  /* align-items: center; */
  /* border-bottom: 1px solid var(--secondary-text-color); */
}
.word-clue-entry > div:nth-child(1) {  
  width: 2rem;
  grid-row-start: 1;
  grid-column-start: 1;
  /* grid-column-end: span 3; */
  align-self: center;
}
.word-clue-entry > div:nth-child(2) {
  align-self: center;
  grid-row-start: 1;
  grid-column-start: 2;
  grid-column-end: span 2;
  font-size: 1.5rem;
}
.word-clue-entry > div:nth-child(3) {
  font-weight: normal;
  grid-row-start: 2;
  grid-column-start: 2;
  padding: calc(var(--main-padding) / 2);
  padding-left: 0;
}
.word-clue-entry > button:active {
  background-color: #333;
}
.word-clue-entry > button {
  grid-row-start: 2;
  grid-column-start: 3;
  display: flex;
  justify-content: space-between
}
.direction-label {
  border-bottom: 1px solid var(--secondary-text-color);
}
@media (orientation: landscape) {
	.board-area {
		grid-column-start: 1;
	}
}
</style>
