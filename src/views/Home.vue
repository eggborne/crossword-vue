<template>
  <div :class='[`home`, $store.state.loaded && `ready`, $store.state.editMode === `clues` && `clues-mode`]'>
    <Header
      :handleClickToBrowse='handleClickToBrowse'
      :handleClickToSave='$store.state.editMode === `diagram` ? handleClickToSaveDiagram : handleClickToSavePuzzle'
      :handleClickPrevious='handleClickPrevious'
      :handleClickNext='handleClickNext'
      :handleClickTrain='handleClickTrain'
    />
    <div v-cloak v-if='$store.state.editMode !== `clues`' class='board-area'>
      <Board
        :cellGrid='cellGrid'
        :highlightedWords='highlightedWords'
        :viableWords='viableWords'
        :handleCellClick='
        $store.state.editMode === `diagram` ? handleCellFlip :
        $store.state.editMode === `puzzle` ? handleCellSelect : null
        '
        :selectedCell='selectedCell'
        :violatingCells='violatingCells'
        :cheaterCells='cheaterCells'
        :themeWords='themeWords'
      />
    </div>
    <div v-else class='board-area'>
      <div class='clue-display'>
        <!-- <header>Words and clues</header> -->
        <div class='list-area'>
          <h1 class='direction-label'>Across</h1>
          <div class='clue-list across'>
            <div class='word-clue-entry' v-for='wordObj in this.wordsNeeded.across.filter(wordObj => wordObj.word || !wordObj.word.includes(`*`)).sort((a, b) => a.number - b.number )' :key='wordObj.id'>
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
          <div class='clue-list down'>
            <div class='word-clue-entry' v-for='wordObj in this.wordsNeeded.down.filter(wordObj => wordObj.word || !wordObj.word.includes(`*`)).sort((a, b) => a.number - b.number )' :key='wordObj.id'>
              <div>{{ wordObj.number }}.</div>
              <div>{{ wordObj.word.toUpperCase() }}</div>
              <div>{{ wordObj.clues[wordObj.selectedClue] }}</div>
              <button @pointerdown='() => handleClickToSaveClue(wordObj)' class='expand-button'>
                {{ wordObj.clues.length ? `CHANGE` : `ADD` }} CLUE
                <!-- <div class='down-caret'></div> -->
              </button>
            </div>
          </div>
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
      :handleClickToViewChoices='handleClickToViewChoices'
      :cancelGeneration='cancelGeneration'
      :handleClickRules='() => showingModal = `rules`'
      :handleClickValidate='validateWordSpaces'
      :handleClickKey='handleClickKey'

      :findWord='findViableWord'
      :fillBoard='fill'
      :themeWords='themeWords'
      :completeWords='usedWords.length'
      :doubleRootCells='doubleRootCells'
      :currentFillOptions='currentFillOptions'
      :totalFillOptionAmount='totalFillOptionAmount'
      :loadingMessage='loadingMessage'
      :decisionQueue='decisionQueue'
      :logItems='logItems'
      :iterations='iterations'
      :viableCellAmount='viableCellAmount'
    />
    <SaveToast />
    <div v-if='showingModal' id='dark-mask'></div>
    <SaveModal
      v-if='showingModal === `save` || showingModal === `clues`'
      :type='$store.state.savingType'
      :handleSaveDiagram='handleSaveDiagram'
      :handleSaveWord='saveNewWord'
      :handleClickCancelSave='handleClickCancelModal'
      :handleSaveClue='handleSaveClue'
      :handleDeleteClue='handleDeleteClue'
      :fullWordList='fullWordList'
      :getWordList='getWordList'
      :lookUpWord='lookUpWord'
      :wordObj='$store.state.selectedWord'
      :problemPatterns='problemPatterns'
      :wordsNeeded='wordsNeeded'
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
    <ChoicesModal
      v-if='showingModal === `choices`'
      :wordsNeeded='wordsNeeded'
      :triedWordOptions='triedWordOptions'
      :handleClickDone='handleClickCancelModal'
      :selectedWord='selectedWord'
    />
    <div id='model-display'></div>
    <ActivityLog 
      :logItems='logItems' 
    />
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
import ChoicesModal from '../components/ChoicesModal.vue';
import BoardValidator from '../boardvalidator';
import DiagramCreator from '../diagramcreator';
import MicroBoard from '../components/MicroBoard.vue';
import ActivityLog from '../components/ActivityLog.vue';
import SaveToast from '../components/SaveToast.vue';

import GridScanner from '../gridscanner';

const diagramCreator = new DiagramCreator();
const boardValidator = new BoardValidator();
let gridScanner = new GridScanner();

// require('../vkthread.min.js');

// let validatorUrl = require('../boardvalidator.js')

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const scrabbleScores = {
    a:1,
    b:3,
    c:3,
    d:2,
    e:1,
    f:4,
    g:2,
    h:4,
    i:1,
    j:8,
    k:5,
    l:1,
    m:3,
    n:1,
    o:1,
    p:3,
    q:10,
    r:1,
    s:1,
    t:1,
    u:1,
    v:4,
    w:4,
    x:8,
    y:4,
    z:10
};
export default {
  name: 'Home',
  data: () => ({
    editMode: 'diagram',
    selectedCellIndex: undefined,
    selectedCell: undefined,
    showingModal: undefined,
    fullWordList: [
      
    ],
    viableCellAmount: 0,
    diagrams: undefined,
    boardSize: { width: 15, height: 15 },
    symmetry: 1,
    contiguous: true,
    currentDiagram: undefined,
    currentPuzzle: undefined,
    cellGrid: [],
    wordsNeeded: {
      across: [],
      down: []
    },
    doubleRootCells: [],
    highlightedWords: {
      across: [],
      down: []
    },
    viableWords: [],
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
    cheaterCells: [],
    themeWords: {
      across: [],
      down: []
    },
    onLayer: 0,
    generating: false,
    buildQueue: [],
    problemPatterns: [],
    testResults: [
      
    ],
    completeWords: [],
    originalBoard: undefined,
    usedWords: [],
    decisionQueue: [],
    triedWordOptions: {
      across: {},
      down: {}
    },
    currentFillOptions: [],
    totalFillOptionAmount: 0,
    loadingMessage: '',
    logItems: [
      
    ],
    iterations: 0
  }),
  computed: {
    percentBlack() {
      return (this.cellGrid.length) ? this.getPercentBlack(this.cellGrid) : 0;
    },
    fullWordsFound() {
      return this.wordsNeeded.across.filter(wordObj => !wordObj.word.includes(`*`)).length ||
      this.wordsNeeded.down.filter(wordObj => !wordObj.word.includes(`*`)).length
    },
    selectedWord() {
      return this.wordsNeeded[this.$store.state.editDirection].filter(wordSpaceObj => wordSpaceObj.number === this.selectedCell.number)[0];
    }
  },
  mounted() {
    window.addEventListener('load', () => {
      console.error('LOADED.');  
      this.$store.commit('setLoaded');     
    });
    this.createGrid(this.boardSize);
    requestAnimationFrame(async () => {
      this.addCellLabels();
      this.getWordsNeeded();      
      // setTimeout(() => {
        await this.getMLData();
        console.error('Home.vue getMLData finished');
        await this.generateNewBoard(); 
        this.$store.commit('changeEditMode', 'puzzle')
      // }, 200);
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
    ChoicesModal,
    MicroBoard,
    ActivityLog,
    SaveToast
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
    handleClickToViewChoices() {
      this.showingModal = 'choices';
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
      let deleteResult = await DB.removeClue(wordObj, clueIndex)
      if (deleteResult.data === 'Your clue was saved.') {
        this.showToast(`Clue for "${wordObj.word}" deleted.`)
      }
      await this.getWordList(wordObj.word.length);
      return;
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
          // this.saveMessage = `SAVED!`;
          // setTimeout(() => {
          //   this.saveMessage = ``;
            this.showingModal = undefined;
            this.showToast(`Diagram saved.`);            
          // }, 500);
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
      // console.warn('called getWordsNeeded with', cellGrid)
      const grid = cellGrid ? cellGrid : this.cellGrid;
      const doubleRootCells = [];
      const violations = [];
      const newWordsNeeded = {
        across: [],
        down: []
      };
      let triedWordOptions = { across: [], down: [] };
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
                selectedClue: 0,
                tried: [],
                choices: [],
                assigned: undefined,
                direction: 'across'
              });
              triedWordOptions.across[cell.number] = [];
            }
            if (wordLengthBelow) {
              newWordsNeeded.down.push({
                number: cell.number,
                word: '*'.repeat(wordLengthBelow),
                letterIndexes: downLetters,
                clues: [],
                selectedClue: 0,
                tried: [],
                choices: [],
                assigned: undefined,
                direction: 'down'
              });
              triedWordOptions.down[cell.number] = [];
            }
            if (!doubleRootCells.includes(cell.number) && wordLengthToRight && wordLengthBelow) {
              doubleRootCells.push(cell.index)
            }
          }
        });
      });
      if (!cellGrid) {
        this.wordsNeeded = newWordsNeeded;
        this.doubleRootCells = doubleRootCells;
      }
      // for (let direction in triedWordOptions) {
      //   let directionList = triedWordOptions[direction];
      //   directionList = directionList.filter(entry => entry);
      // }
      this.triedWordOptions = triedWordOptions;
      // console.log('newWordsNeeded', newWordsNeeded)
      return newWordsNeeded;
    },
    getViolatingCells(list, noDisplay, skipMax) {
      let longestWord = [...list.across, ...list.down].sort((a, b) => b.word.length - a.word.length)[0];
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
      // console.warn('got', violating.length, 'violating cells in', window.performance.now() - st);
      // console.info(violating)
      return violating;
    },
    changeLetter(e, index, newLetter) {
      console.log('changeLetter args', e, index, newLetter);
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
    printWord(wordSpace, wordObj) {
      console.log('calling printWord on ---->', wordSpace.number, wordObj.word)
      let cells = this.cellGrid.flat();
      let indexes = wordSpace.letterIndexes;
      let newLetters = wordObj.word.split('');
      indexes.forEach((index, i) => {
        if (!cells[index].letter) {
          cells[index].letter = newLetters[i];
        }
      });
      wordSpace.word =  wordObj.word;
      // this.usedWords.push(wordObj.word)
      
      // this.getWordsNeeded();
    },
    removeWord(wordSpace, wordObj) {
      console.log('calling removeWord on ---->', wordSpace.number, wordObj.word)
      let cells = this.cellGrid.flat();
      let indexes = wordSpace.letterIndexes;
      let newLetters = wordObj.word.split('');
      indexes.forEach((index, i) => {
        if (!cells[index].letter) {
          cells[index].letter = newLetters[i];
        }
      });
      wordSpace.word =  wordObj.word;
      this.usedWords.push(wordObj.word)
      
      this.getWordsNeeded();
    },
    getWordSpace(number, direction) {
      return this.wordsNeeded[direction].filter(wordObj => wordObj.number === number)[0];
    },
    fillWithWord(word, number, direction) {
      // console.log('calling fillWithWord on ---->', word)
      let cells = this.cellGrid.flat();
      let targetWord = this.getWordSpace(number, direction)
      let indexes = targetWord.letterIndexes;
      let newLetters = word.split('');
      if (word) {
        indexes.forEach((index, i) => { 
          cells[index].letter = newLetters[i]
        });
        // targetWord.word = word;
      } else {
        // this.violatingCells.push(...indexes);
        // this.highlightedWords.splice(this.highlightedWords.indexOf(targetWord), 1);
        // setTimeout(() => {          
        //   this.highlightedWords.push(targetWord);
        // }, 500)
      }
      // this.getWordsNeeded();
    },
    async findWord(direction, replace) {
      const editDirection = direction || this.$store.state.editDirection;
      const rootObj = this.getRootWords(this.selectedCell.index)[editDirection];
      let pattern = '';
      if (this.cellGrid.flat()[rootObj.letterIndexes[0]]) {
        if (!replace) {
          rootObj.letterIndexes.forEach(ind => {
            pattern += this.cellGrid.flat()[ind].letter || '*';
          });
        } else {
          pattern = '*'.repeat(rootObj.word.length)
        }
        let matchingWords = [];
        const length = pattern.length;
        let wordList = this.fullWordList[length];
        if (!wordList) {
          wordList = await this.getWordList(length);
        } 
        wordList = wordList.sort(() => Math.random() - 0.5);
        for (let i = 0; i < wordList.length; i += 1) {
          let word = wordList[i].word.toUpperCase();
          let match = true;
          pattern.split('').forEach((char, c) => {
            if (char !== '*' && char.toUpperCase() !== word[c]) {
              match = false;
            }
          });
          if (match) {
            matchingWords.push(wordList[i])
          }
        }
        return matchingWords.length ? matchingWords : pattern;
      } else {
        console.error('letterIndex not in cells.flat', this.cellGrid.flat()[rootObj.letterIndexes[0]]);
        // return 'BALLS';
      }
    },
    async fillWithRandomWord() {
      let choices = await this.getWordChoices();
      console.log('choices', choices)
      let randomWord = choices[0];
      this.fillWithWord(randomWord.word, this.selectedCell.number, this.$store.state.editDirection);
    },
    async fillWithValidatedWord(e, rootCell, direction) {
      const originalBoard = JSON.parse(JSON.stringify(this.cellGrid));
      const startingCell = rootCell || this.selectedCell;
      const editDirection = direction || this.$store.state.editDirection;
      let randomWord;
      let crossWordsOkay = true;
      let findResult = await this.getWordChoices(e, startingCell, editDirection);
      if (typeof findResult === 'object') {
        // console.log('found', findResult.length, 'options for', startingCell.number, editDirection)       
        this.totalFillOptionAmount = findResult.length; 
        let triedArray = this.triedWordOptions[editDirection][startingCell.number];
        findResult = findResult.filter(wordObj => !this.usedWords.includes(wordObj.word) && !triedArray.includes(wordObj.word));
        // console.log('findResult length now', findResult.length) 
        this.currentFillOptions = findResult;
        if (findResult.length === 0) {

          // console.error('NO CHOICES LEFT!', startingCell.number, editDirection);
          crossWordsOkay = false;
        } else {          
          randomWord = findResult[0];
          let oldBoard = JSON.parse(JSON.stringify(this.cellGrid));
          this.fillWithWord(randomWord.word, startingCell.number, editDirection);
          let oppositeDirection = editDirection === 'across' ? 'down' : 'across';
          // this.decisionQueue.push(
          //   {
          //     board: oldBoard,
          //     rootCell: startingCell,
          //     direction: editDirection,
          //     word: randomWord
          //   }
          // );
          let changedNumbers = [];
          let changedCells = this.getChangedCells(oldBoard);
          changedCells.forEach(cell => {
            let rootWords = this.getRootWords(cell.index);
            if (!changedNumbers.includes(rootWords.across.number)) {
              changedNumbers.push(rootWords.across.number);
            }
            if (!changedNumbers.includes(rootWords.down.number)) {
              changedNumbers.push(rootWords.down.number);
            }
          });
          crossWordsOkay = await this.validateWordSpaces(changedNumbers, oppositeDirection);
        }
      } else {
        console.error('no options found for original word', startingCell.number, editDirection, findResult)
        crossWordsOkay = false;
        // return;
      }
      if (crossWordsOkay) {
        // console.error(randomWord.word, 'WORD VALID!!')
      } else {
        // console.error('INVALID :(');        
        this.cellGrid = originalBoard;
        // this.getWordsNeeded;
      }
      return {
        valid: crossWordsOkay,
        triedWord: randomWord
      }
    },
    async fill() {
      this.problemPatterns = [];
      this.logItems = [];
      this.iterations = 0;
      this.generating = true;
      let filled = false;
      let wordToRevise;
      let direction;
      while (!filled && this.generating) {
        this.iterations += 1;
        let fillResult = await this.fillAllWords(wordToRevise, direction);
        filled = fillResult.success;
        if (fillResult.wordToRevise) {
          wordToRevise = fillResult.wordToRevise;
          direction = fillResult.direction;
        }
        if (this.logItems.length > this.$store.state.editorOptions.logLength) {
          this.logItems = this.logItems.reverse();
          this.logItems.length = this.$store.state.editorOptions.logLength;
          this.logItems = this.logItems.reverse();
        }
        // await this.wait(1);
      }
      this.generating = false;
    },
    getPartialWordWithLeastOptions(rootWordSpaceObj, direction) { 
      let winner;
      let winningDirection;
      let sortedAcrossWords = this.wordsNeeded.across.filter(wordSpaceObj => wordSpaceObj.word.includes('*') && wordSpaceObj.choices.length).sort((a, b) => a.choices.length - b.choices.length);
      let sortedDownWords = this.wordsNeeded.down.filter(wordSpaceObj => wordSpaceObj.word.includes('*') && wordSpaceObj.choices.length).sort((a, b) => a.choices.length - b.choices.length);
      let rarestAcross = sortedAcrossWords[0];
      let rarestDown = sortedDownWords[0];
      if (!rarestAcross || !rarestDown || !rarestAcross.choices.length && !rarestDown.choices.length) {
        let longestAcross = this.wordsNeeded.across.filter(wordSpaceObj => !this.usedWords.includes(wordSpaceObj.word)).sort((a, b) => b.word.length - a.word.length)[0];
        let longestDown = this.wordsNeeded.down.filter(wordSpaceObj => !this.usedWords.includes(wordSpaceObj.word)).sort((a, b) => b.word.length - a.word.length)[0];
        winner = longestAcross.word.length >= longestDown.word.length ? longestAcross : longestDown;
        winningDirection = longestAcross.word.length >= longestDown.word.length ? 'across' : 'down';
      } else {
        if (rarestAcross.choices.length > rarestDown.choices.length) {
          winner = rarestAcross;
          winningDirection = 'across'
        } else {
          winner = rarestDown;
          winningDirection = 'down'
        }
      }
      console.warn('chose', winner.choices.length, winner.number, winningDirection)
      return {
        wordSpaceObj: winner
      };
    },
    async fillAllWords(wordToRevise, direction) {
      // this.generating = true;
      let okSoFar = true;
      const acrossBySize = this.wordsNeeded.across.sort((a, b) => b.word.length - a.word.length);
      const downBySize = this.wordsNeeded.down.sort((a, b) => b.word.length - a.word.length);

      let mainIndex = 0;
      let altIndex = 0;
      const allWordsBySize = [...acrossBySize, ...downBySize].sort((a, b) => b.word.length - a.word.length);
      let longest;
      let longestDirection;
      if (acrossBySize[0].word.length > downBySize[0].word.length) {
        longest = acrossBySize[0];
        longestDirection = 'across';
      } else if (downBySize[0].word.length > acrossBySize[0].word.length) {
        longest = downBySize[0]
        longestDirection = 'down';      
      } else {
        let acrossSum = acrossBySize[0].word.length + acrossBySize[1].word.length + acrossBySize[2].word.length;
        let downSum = downBySize[0].word.length + downBySize[1].word.length + downBySize[2].word.length;
        if (acrossSum >= downSum) {
          longest = acrossBySize[0];
          longestDirection = 'across';
        } else {
          longest = downBySize[0]
          longestDirection = 'down';      
        }
      }
      console.log('longest is', longest.number, 'at', longest.length)
      console.log('longestDirection is', longestDirection)

      let mainDirection;
      let altDirection;
      let mainList;
      let altList;
      if (acrossBySize[0].word.length > downBySize[0].word.length) {
        mainDirection = 'across';
        altDirection = 'down';
        mainList = acrossBySize;
        altList = downBySize;
      } else {
        mainDirection = 'down';
        altDirection = 'across'
        mainList = downBySize;
        altList = acrossBySize;
      }

      const totalBlankWords = allWordsBySize.length;
      let i = 0;

      // for (let i = 0; i < allWordsBySize.length; i += 1) {
      let currentRootCell;
      let wordSpaceObj;
      let currentEditDirection;
      while (this.generating && this.decisionQueue.length < totalBlankWords) {
        let allCells = this.cellGrid.flat();                                                                        
        if (!wordToRevise) {          
          let leastOption = this.getPartialWordWithLeastOptions();
          wordSpaceObj = leastOption.wordSpaceObj;
          currentEditDirection = leastOption.wordSpaceObj.direction;
        } else {
          wordSpaceObj = wordToRevise;          
          currentEditDirection = direction;
        }
        this.$store.commit('changeEditDirection', currentEditDirection);
        if (!wordSpaceObj) {
          console.error('bad direction of bad wordObj...', currentEditDirection);
          this.generating = false;
          await this.wait(1000);
          return this.fill();
          // currentDirection = currentEditDirection === 'across' ? 'down' : 'across';
          // this.$store.commit('changeEditDirection', currentEditDirection);
        }
        this.highlightedWords[currentEditDirection] = [ wordSpaceObj ];      
        this.highlightedWords[currentEditDirection === 'across' ? 'down' : 'across'] = [];
        let currentNumber = wordSpaceObj.number;
        currentRootCell = allCells[wordSpaceObj.letterIndexes[0]];        
        this.selectedCell = currentRootCell;

        this.logItems.push({
          iterations: i,
          message: `Finding word for ${currentRootCell.number} ${currentEditDirection.toUpperCase()} (choices: ${wordSpaceObj.choices.length})`,
          type: 'normal'
        });

        wordToRevise = undefined;

        let oldBoard = JSON.parse(JSON.stringify(this.cellGrid));
        let oldWordsNeeded = JSON.parse(JSON.stringify(this.wordsNeeded));
        // let oldTriedWordOptions = JSON.parse(JSON.stringify(this.triedWordOptions));
        if (!wordSpaceObj.word.includes('*')) {
          okSoFar = true;
          console.warn('skipping', wordSpaceObj.word)
        } else {          
          okSoFar = await this.findViableWord();
        }
        if (!okSoFar) {
          // console.error('------- STOPPED AUTO FILL. -------');          
          break;
        } else {
          this.decisionQueue.push({
            number: currentNumber,
            direction: currentEditDirection,
            word: okSoFar,
            board: oldBoard,
            wordsNeeded: oldWordsNeeded,
            // triedWordOptions: oldTriedWordOptions
          })
        }
        i += 1;
      }
      if (okSoFar) {
        console.error('filled all of them :)')
        return {success: true };
      } else {
        this.logItems.push({
          iterations: '',
          message: `No word found for ${currentRootCell.number} ${currentEditDirection.toUpperCase()}`,
          type: 'error'
        });
        // wordToRevise = wordSpaceObj;
        this.highlightedWords = { across: [], down: [] }
        // this.triedWordOptions = this.decisionQueue[this.decisionQueue.length - 1].triedWordOptions;
        const lastChoice = this.decisionQueue[this.decisionQueue.length - 1];
        if (!lastChoice) {
          console.error('decisionQueue is')
          console.error(this.decisionQueue)
          console.error('TRIED EVERY PERMUTATION OF', this.decisionQueue[0].number, this.decisionQueue[0].word.direction, '-', this.decisionQueue[0].word.word)
          this.logItems.push({
            iterations: '',
            message: `Tried every permutation starting with ${this.decisionQueue[0].number} ${this.decisionQueue[0].word.direction}!`,
            type: 'error'
          });
          return false;
        }
        this.cellGrid = lastChoice.board;
        this.wordsNeeded = lastChoice.wordsNeeded;
        currentEditDirection = lastChoice.direction;
        this.$store.commit('changeEditDirection', currentEditDirection);
        this.selectedCell = this.cellGrid.flat().filter(cell => cell.number === lastChoice.number)[0];
        // let previousWord = lastChoice.word;
        this.logItems.push({
          iterations: '',
          message: `reverting to ${lastChoice.number} ${currentEditDirection}!`,
          type: 'error'
        });
        // this.usedWords = this.usedWords.splice(this.usedWords.indexOf(previousWord), 1);
        this.decisionQueue.length = this.decisionQueue.length - 1;
        // i -= 1;
        
        return { success: false, wordToRevise, direction: currentEditDirection };
      }
      // this.generating = false;
      // this.$store.commit('changeEditDirection', 'down');
      // for (let i = 0; i < downBySize.length; i += 1) {
      //   let allCells = this.cellGrid.flat();
      //   let wordSpaceObj = downBySize[i];        
      //   let currentNumber = wordSpaceObj.number;
      //   let currentRootCell = allCells[wordSpaceObj.letterIndexes[0]];
      //   this.selectedCell = currentRootCell;

      // }

    },
    async findViableWord(e) {
      // this.getWordsNeeded();
      if (e && e.target) {
        // was a button click
        this.generating = true;
      }
      let iterations = 0;
      let limit = 10000;
      let findResult;
      let foundViableWord;
      const originalBoard = JSON.parse(JSON.stringify(this.cellGrid));
      let currentRootNumber = this.selectedCell.number;
      const originalDirection = this.$store.state.editDirection;
      while (!foundViableWord && this.generating && iterations < limit) {
        findResult = await this.fillWithValidatedWord();                
        foundViableWord = findResult.valid;
        const currentEditDirection = this.$store.state.editDirection;
        if (!foundViableWord) {
          if (findResult.triedWord) {
            // console.error(findResult.triedWord.word, '>>> was not viable!')
            this.triedWordOptions[originalDirection][currentRootNumber].push(findResult.triedWord.word);
            iterations += 1;
            // this.iterations += 1;
          } else {
            // console.error('RAN OUT OF OPTIONS TO TRY!!');            
            this.cellGrid = originalBoard;
            break;
          }
        } else {
          // console.error(findResult.triedWord.word, 'was viable!')
          this.usedWords.push(findResult.triedWord.word);
          let wordSpace = this.wordsNeeded[currentEditDirection].filter(wordSpaceObj => wordSpaceObj.number === currentRootNumber)[0];
          let fullList = this.fullWordList[wordSpace.word.length];
          let listObj = fullList[fullList.indexOf(findResult.triedWord)];
          wordSpace.word = findResult.triedWord.word;
          requestAnimationFrame(() => {
            this.logItems.push({
              iterations: '',
              message: `${wordSpace.number} ${originalDirection.toUpperCase()} - printed ${findResult.triedWord.word.toUpperCase()} in ${iterations + 1} ${iterations ? 'tries' : 'try'}`,
              type: 'success'
            });
          });
        }
        await this.wait(0);        
      }
      // let finalMessage = '';
      if (foundViableWord) {
        // finalMessage = `Found ${findResult.triedWord.word.toUpperCase()} in ${iterations + 1} tries`;
        // console.error('FOUND', findResult.triedWord.word, 'in', iterations + 1, 'tries');
      } else {
        // finalMessage = `No word can fit in ${currentRootNumber} ${originalDirection}`;
        let invalidWord = this.getRootWords(this.selectedCell.index)[originalDirection];
        this.violatingCells = [...invalidWord.letterIndexes]
      }
      if (e && e.target) {
        let finalMessage = foundViableWord ? 
        `Found ${findResult.triedWord.word.toUpperCase()} in ${iterations + 1} tries` : 
        `No word can fit in ${currentRootNumber} ${originalDirection}`;
        this.loadingMessage = finalMessage;
        await this.wait(800);
        this.loadingMessage = '';
        this.generating = false;
        this.highlightedWords = { across: [], down: [] }
      }
      return foundViableWord ? findResult.triedWord : false;
    },
    async getWordChoices(e, rootCell, direction) {
      const startingCell = rootCell || this.selectedCell;
      const editDirection = direction || this.$store.state.editDirection;
      const rootObj = this.getRootWords(startingCell.index)[editDirection];
      let pattern = '';
      let completeWord;
      rootObj.letterIndexes.forEach(ind => {
        pattern += this.cellGrid.flat()[ind].letter || '*';
      });
      // if (!pattern.includes('*')) {
      //   console.error('GOING OVER COMPLETED WORD', pattern);
      //   completeWord = true;
      // }
      let matchingWords = [];
      const length = pattern.length;
      let wordList = this.fullWordList[length];
      if (!wordList) {
        wordList = await this.getWordList(length);
        console.warn('GOT WORDLIST', length);
        console.info(wordList)
      }
      // console.error('updating fill option total amoutn', length)
      
      // console.log('original choices number', wordList.length, '- pruning', this.usedWords.length, 'used words.')
      wordList = wordList.filter(wordObj => wordObj.word === pattern || !this.usedWords.includes(wordObj.word)).sort(() => Math.random() - 0.5);
      // console.log('choices after pruning:', wordList.length);
      for (let i = 0; i < wordList.length; i += 1) {
        let word = wordList[i].word.toUpperCase();
        // console.log('comparing', word, 'to', pattern)
        let match = true;
        pattern.split('').forEach((char, c) => {
          if (char !== '*' && char.toUpperCase() !== word[c]) {
            match = false;
          }
        });
        if (match) {
          matchingWords.push(wordList[i])
        }
      }
      // console.warn('getWordChoices for', startingCell.number, editDirection, matchingWords)
      return matchingWords.length ? matchingWords : pattern;     
    },

    async getClues(word) {
      let clueArray = [];
      if (!this.fullWordList[word.length]) {
        console.log('need to get list of', word.length)
        await this.getWordList(word.length);
      }
      let matchingEntries = this.fullWordList[word.length].filter(listObj => word.toUpperCase() === listObj.word.toUpperCase());
      matchingEntries.forEach(entry => {
        if (entry.clue[0]) {
          entry.clue = entry.clue[0].toUpperCase() + entry.clue.substr(1, entry.clue.length);
          clueArray.push(entry.clue);
        }
      })
      console.log('clues for', word, ':', clueArray);
      
      return clueArray
    },

    async getWordList(length) {
      console.warn('CALLING DB FOR', length + '-LETTER WORDS');
      const response = await DB.getFullWordListOfLength(length);
      if (response.data) {
        const wordObjectList = response.data.split(' || ').filter(obj => obj).map(wordObj => wordObj = JSON.parse(wordObj));
        wordObjectList.forEach(wordObj => {
          if (wordObj.clues) {
            wordObj.clues = JSON.parse(wordObj.clues);
            wordObj.clues.forEach(clue => {
              if (clue) {
                clue = clue.replace(/\|q\|/g, "'").replace(/\|qq\|/g, "\"");                  
              } else {
                console.error('EMPTY CLUE for', wordObj.word)
              }
            });
          }
        })
        this.fullWordList[length] = wordObjectList;
        console.warn('GOT', wordObjectList.length, length + '-letter words');
        return wordObjectList;
      } else {
        return ('COULD NOT GET WORD LIST OF LENGTH', length);
      }
    },
    async changeEditMode(e) {
      const newMode = e.target.id.split('-')[0];
      this.selectedCell = undefined;
      this.highlightedWords = { across: [], down: [] };
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
      if (this.$store.state.logOpen) {
        this.$store.commit('toggleLog');
      }
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
      if (this.$store.state.logOpen) {
        this.$store.commit('toggleLog');
      }
      console.log('currently selected is', this.selectedCell)
      const allCells = this.cellGrid.flat();
      const clickedIndex = parseInt(e.target.id.split('-')[1]);
      const numbered = allCells[clickedIndex].number;
      let rootWords = this.getRootWords(clickedIndex);
      console.warn('GOT ROOTS', rootWords);
      if (!allCells[clickedIndex].shaded) {
        if (!this.selectedCell || clickedIndex !== this.selectedCell.index) {
          this.highlightedWords = { across: [], down: [] };
          // this.selectedCell.index = clickedIndex;
          let newSelected = allCells[clickedIndex]
          console.warn('chaning to index', clickedIndex, newSelected);
          this.selectedCell = newSelected;
          if (numbered) {
            if (rootWords.across && rootWords.down) {
              let currentEditDirection = this.$store.state.editDirection || 'across';
              this.$store.commit(`changeEditDirection`, currentEditDirection);
              this.highlightedWords = { across: [], down: [] };
              this.highlightedWords[currentEditDirection].push(rootWords[currentEditDirection]);
            } else {
              if (rootWords.down) {   
                if (rootWords.down.letterIndexes[0] === clickedIndex) {           
                  this.$store.commit(`changeEditDirection`, `down`);

                  this.highlightedWords.across = [];
                  this.highlightedWords.down.push(rootWords.down)
                }
              }
              if (rootWords.across) {
                if (rootWords.across.letterIndexes[0] === clickedIndex) {
                  this.$store.commit(`changeEditDirection`, `across`);
                  this.highlightedWords.down = [];
                  this.highlightedWords.across.push(rootWords.across)
                }              
              }
            }
          } else {
            for (let direction in rootWords) {
              this.highlightedWords[direction].push(rootWords[direction]);
            }
          }
          console.warn('SELECTED cell', this.selectedCell)
        } else {
          console.error('clicked when already selected. numbered', numbered, 'this.$store.state.enteringLetters', this.$store.state.enteringLetters);
          if (numbered || this.$store.state.enteringLetters) {
            const currentEditDirection = this.$store.state.editDirection;
            if (
              (currentEditDirection === 'across' && this.$store.state.enteringLetters) || 
              (currentEditDirection === 'across' && rootWords.down && rootWords.down.letterIndexes[0] === clickedIndex)
            ) {
              console.log('flipping dir')
              this.$store.commit(`changeEditDirection`, `down`);
              this.highlightedWords.across = [];
              this.highlightedWords.down.push(rootWords.down)
            } else if (
              (currentEditDirection === 'down' && this.$store.state.enteringLetters) || 
              (currentEditDirection === 'down' && rootWords.across && rootWords.across.letterIndexes[0] === clickedIndex)
            ) {
              console.log('flipping dir')
              this.$store.commit(`changeEditDirection`, `across`);
              this.highlightedWords.down = [];
              this.highlightedWords.across.push(rootWords.across)
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
      let themeWords = {
        across: [],
        down: []
      };
      let wordArray = Object.values(wordsNeeded).flat().sort((a, b) => b.word.length - a.word.length);
      let longest = wordArray[0].word.length;
      let longestQuantity = wordArray.filter(wordObject => wordObject.word.length === longest).length
      
      let acrossWordArray = wordsNeeded.across.sort((a, b) => b.word.length - a.word.length);
      let downWordArray = wordsNeeded.down.sort((a, b) => b.word.length - a.word.length);
      let longestAcross = acrossWordArray[0];
      let longestDown = downWordArray[0];
      let acrossQuantity = acrossWordArray.filter(wordObject => wordObject.word.length === longestAcross.word.length)
      let downQuantity = downWordArray.filter(wordObject => wordObject.word.length === longestDown.word.length)

      // console.warn('acrossWordArray', acrossWordArray)
      // console.warn('longestAcross', longestAcross.word.length)
      // console.warn('acrossQuantity', acrossQuantity)

      let longerDirection;

      if (longestAcross.word.length > longestDown.word.length) {
        longerDirection = 'across';
        wordArray = acrossQuantity;
      } else {
        longerDirection = 'down';
        wordArray = downQuantity;
      }

      console.log('longerdirectons is', longerDirection)

      // let shortest = wordArray[wordArray.length - 1].word.length;
      // let secondLongest = wordArray.filter(wordObject => wordObject.word.length !== longest)[0].word.length;
      // let longestMargin = longest - secondLongest;
      // let secondLongestMargin = secondLongest - shortest;
      // let secondLongestQuantity = wordArray.filter(wordObject => wordObject.word.length === secondLongest).length
      // if (this.boardSize.width / longest > 1.75) {
      //   longestMargin = undefined;
      //   console.error('longest too short to be a theme word', longest)
      // }
      // if (!longestMargin || this.boardSize.width / secondLongest > 2) {
      //   console.error('secondLongest too short to be a theme word', secondLongest)
      //   secondLongestMargin = undefined;
      // }

      // wordArray.forEach(wordObject => {
      //   let wordLength = wordObject.word.length;
      //   if (!themeWords[longerDirection].includes(wordObject)) {
      //     if (wordLength > 8) {
      //       themeWords[longerDirection].push(wordObject);
      //     }
      //     // if (longestQuantity <= 4 && secondLongestQuantity <= 4 && longestQuantity <= 2 && secondLongestQuantity <= 4 && secondLongestMargin && wordLength === secondLongest) {
      //     //   themeWords[1].push(wordObject);
      //     // }
      //   }
      // });
      let themeMinimum = 10;
      console.warn('theme min', themeMinimum)
      if (wordArray[0].word.length >= themeMinimum && wordArray.length <= this.$store.state.puzzleOptions.rules.themeWords) {
        themeWords[longerDirection] = wordArray;
      }
      console.warn('got theme words', themeWords)
      return themeWords;
    },
    getWordsForCell(cellIndex, wordsNeeded) {
      let words = {
        across: wordsNeeded.across.filter(wordObj => wordObj.letterIndexes.includes(cellIndex))[0],
        down: wordsNeeded.down.filter(wordObj => wordObj.letterIndexes.includes(cellIndex))[0],
      }
    },
    async generateNewBoard(instant) {
      return new Promise(resolve => {

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
          this.viableCellAmount = viableCells.length;
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
              // requestIdleCallback(() => {
                this.growBoard(this.cellGrid, true);             
              // });
            }
          } else {
            if (!this.generating) {
              canceled = true;
              console.error('CANCELED ----------------')
            }
            console.warn('board generated in', (window.performance.now() - genStart).toFixed(2));
            console.warn('count was', this.count);
            console.warn('redundant was', this.redundant);
            // requestAnimationFrame(() => {            
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
              // console.error('stopped at timedOut', timedOut);
              // console.error('stopped at tooRedundant', tooRedundant);
              // console.error('stopped at enoughBlack', enoughBlack);
              // console.error('stopped at canceled', canceled);
              // console.error('stopped at failed', failed);
              resolve();
            // });
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
      })
      
    },
    generateLayer(baseLayer, viableCells) {
      let foundGoodCell = false;
      let newGrid = JSON.parse(JSON.stringify(baseLayer));
      let newQueueItem = [];
      let violating = [];
      let newViableCells = viableCells.filter(cell => !cell.shaded).sort(() => Math.random() - 0.5);
      let wordCount = 0;
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
          let newWordCount = (needed.across.length + needed.down.length);
          let cheater = false;
          console.log(newWordCount, 'new vs old', wordCount)
          if (newWordCount === wordCount) {
            console.error('CELLDID NOT CHANGE WORD COUNT!', selectedCell);
            cheater = true;
            // this.cellGrid[selectedCell.row][selectedCell.column].cheater = true;
            // unshade the test cells
            // newGrid[selectedCell.row][selectedCell.column].shaded = previousShaded;
            // newViableCells.splice(i, 1);
            // if (!centerCell) {
            //     mirrorCoords.forEach((coordSet) => {
            //       const mirrorCell = newGrid[coordSet.row][coordSet.column];
            //       mirrorCell.shaded = previousShaded;
                  
            //     });
            // }
            // newQueueItem.length = 0;
            // continue;
          } else {
            }
            wordCount = newWordCount;
            let enforceMax = true;
            violating = this.getViolatingCells(needed, true, enforceMax);
            newGrid.forEach(row => row.map(cell => cell.number = ''))
        
            if (!violating.length) {
              let offensiveQuotient = gridScanner.getGridAttribute(newGrid, 'offensive');
              if (offensiveQuotient < 25) {
                let contiguous = boardValidator.checkIfContiguous(newGrid, newGrid.flat());
                if (this.rules.contiguous && contiguous || !this.rules.contiguous) {
                  foundGoodCell = true;
                  if (cheater) {
                    // this.cheaterCells.push(selectedCell.index)
                  }
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
            console.log('now need', needed.across.length + needed.down.length)
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

      //  requestAnimationFrame(() => {
      //   // this.cellGrid.forEach(row => row.map(cell => cell.letter = ''))
      //   // viableCells.forEach(cell => this.cellGrid[cell.row][cell.column].letter = 'V') 
      // })
      
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

    async analyzeWordOptions(startingCell, direction) {

    },

    async clearLetters(e, shade) {
      if (this.$store.state.logOpen) {
        this.$store.commit('toggleLog');
      }
      this.cellGrid.forEach((row, r) => {
        row.map((cell, c) => {
          return cell.letter = '';
        });
      });
      this.viableWords.length = 0;
      this.violatingCells.length = 0;
      this.selectedCell = undefined;
      this.usedWords = [];
      this.decisionQueue = [];
      this.logItems = [];
      this.iterations = 0;
      this.triedWordOptions = { across: [], down: [] };
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
    showToast(message, duration) {
      if (!duration) { duration = 1500 }
      this.$store.commit('setToastMessage', message);   
      this.$store.commit('setToastVisible', true);
      setTimeout(() => {
        this.$store.commit('setToastVisible', false);
      }, duration);
    },
    async saveNewWord(newWord, keepModal) {      
      const saveResp = await DB.saveWord(newWord);
      console.log('saveRep', saveResp)
      const updatedList = await this.getWordList(newWord.length);
      console.log('updateResp', updatedList)
      if (saveResp.data === 'Your word was saved.' && updatedList.length) {
        if (!keepModal) { 
          this.showToast(`Word "${newWord.toUpperCase()}" saved.`)  
          this.showingModal = undefined 
        }
      }
    },
    clearBoard(e, shade) {
      if (this.$store.state.logOpen) {
        this.$store.commit('toggleLog');
      }
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
        this.themeWords = { across: [], down: [] };
        this.highlightedWords = { across: [], down: [] };
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
      const oldCells = oldBoard.flat();
      const changedCells = this.cellGrid.flat().filter((cell, i) => {
        return cell.letter !== oldCells[i].letter
      });
      return changedCells;
    },
    eraseWord(rootCell, direction, cells) {
      let cell = rootCell || this.selectedCell;
      let wordDirection = direction || this.$store.state.editDirection;
      console.warn('wordsneeded', this.wordsNeeded[wordDirection])
      console.warn('wordDirection', wordDirection)
      // let word = this.wordsNeeded[wordDirection].filter(wordObj => wordObj.letterIndexes[0] === cell.index)[0].word;
      let word = this.getRootWords(rootCell.index)[wordDirection];
      word.letterIndexes.forEach(ind => {
        let cellObj = this.cellGrid.flat()[ind];
        if (cells.includes(cellObj)) {
          this.cellGrid[cellObj.row][cellObj.column].letter = '';
        }
      });
      // this.fillWithWord(' '.repeat(word.length), rootCell.number, wordDirection);
    },
    async getProblemPatterns() {
      let problemPatterns = [];
      while (problemPatterns.length < 1) {
        let pat = await this.fillBoard();
        if (!problemPatterns.includes(pat.problemPattern)) {
          problemPatterns.push(pat.problemPattern && pat.problemPattern.toUpperCase());
        }
        this.clearLetters();
        this.testResults.push();
      }
      this.problemPatterns = problemPatterns;
      this.$store.commit('changeSavingType', 'word')
      this.showingModal = 'save';
    },
    getWordCluster(startingCell) {
      let rootCells = [];
      let rootWords = this.getRootWords(startingCell.index)
      console.log('rootWords', rootWords)
      for (let direction in rootWords) {        
        rootWords[direction].letterIndexes.forEach(ind => {
          if (!rootCells.includes(ind)) {
            rootCells.push(ind);
          }
        })
      }
      console.warn('rootCells are', rootCells)
      return rootCells;
    },
    async fillWordCluster(e, startingWordSpace) {
      this.decisionQueue = [];
      this.generating = true;
      let allCells = this.cellGrid.flat();
      let currentEditDirection = this.$store.state.editDirection || 'across';
      let startingWord = startingWordSpace || 
        this.getRootWords(this.selectedCell ? this.selectedCell.index : this.doubleRootCells[0])[currentEditDirection];
      let initialWordChoice;
      // console.log('startingWord', startingWord, currentEditDirection)
      const initialResult = await this.getWordChoices(null, allCells[startingWord.letterIndexes[0]], currentEditDirection);
      const originalBoard = JSON.parse(JSON.stringify(this.cellGrid));
      // this.selectedCell = undefined;
      let previousBoard;
      if (initialResult) {
        let oppositeEditDirection = currentEditDirection === 'across' ? 'down' : 'across';
        // console.error('GOT INITIAL CHOICES!', initialResult);
        initialWordChoice = initialResult[0];
        // console.warn('chose initial word', initialWordChoice.word, initialWordChoice.id);
        
        this.printWord(startingWord, initialWordChoice);
        // this.usedWords.push(startingWord.word)

        startingWord.assigned = startingWord;
        
        for (let i = 0; i < startingWord.letterIndexes.length; i += 1) {
          let triedWords = [];
          let foundValidWord = false;
          // console.warn('>>>>>>>>>>>>>>>')
          // console.warn('doing letter', i, 'of startingWord', initialWordChoice.word);
          // console.warn('>>>>>>>>>>>>>>>')
          previousBoard = JSON.parse(JSON.stringify(this.cellGrid));
          while (!foundValidWord && this.generating) {
            allCells = this.cellGrid.flat();
            startingWord = this.getRootWords(this.selectedCell.index)[currentEditDirection];
            console.log('startingWord', startingWord)
            console.log('on i', i)
            const crossWord = this.getRootWords(startingWord.letterIndexes[i])[oppositeEditDirection];
            console.warn('on CROSS WORD', crossWord.number, oppositeEditDirection)
            requestAnimationFrame(() => {
              this.highlightedWords[oppositeEditDirection] = [
                crossWord
              ]
            })
            await this.wait(5);
            this.violatingCells = [];
            const crossRootIndex = crossWord.letterIndexes[0];
            let crossResult = await this.getWordChoices(null, allCells[crossRootIndex], oppositeEditDirection);
            let crossWordChoice;
            if (crossResult && typeof crossResult !== 'string') {
              // console.log('crossResult', crossResult)
              if (typeof crossResult[0] === 'string') {
                foundValidWord = false;
                crossWordChoice = crossResult[0];
              } else {
                // console.log(crossResult.length, 'total choices for cross word', crossWord.number, oppositeEditDirection)
                crossResult = crossResult.filter(wordObj => !triedWords.includes(wordObj));
                console.log(crossResult.length, 'untried choices for cross word', crossWord.number, oppositeEditDirection)
                if (crossResult.length === 0) {
                  // console.error('OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO')
                  console.error('OUT OF CHOICES')
                  // console.error('OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO')
                  foundValidWord = false;
                } else {
                  crossWordChoice = crossResult[0];
                  this.decisionQueue.push({
                    rootCellIndex: crossRootIndex,
                    number: crossWord.number,
                    direction: oppositeEditDirection,
                    previousBoard: JSON.parse(JSON.stringify(this.cellGrid))
                  })
                  await this.wait(10);
                  this.printWord(crossWord, crossWordChoice);
                  foundValidWord = await this.validateWordSpaces();
                  // if (foundValidWord) { this.usedWords.push(crossWordChoice.word) }
                }
              }
              if (foundValidWord) {
                
                console.error(initialWordChoice.word.toUpperCase(), startingWord.number, currentEditDirection, '--- BOARD VALID!');
                crossWord.assigned = crossWordChoice;
              } else {
                if (!crossWordChoice) {
                  // console.error('crosswordChoice !== anything')
                  crossWordChoice = ''
                }
                console.error('BOARD INVALID WITH CROSSWORD', crossWordChoice)
                // console.error('BOARD INVALID WITH CROSSWORD', crossWordChoice.word, 'AT', crossWord.number, oppositeEditDirection);
                triedWords.push(crossWordChoice);
                let queuePoint;
                if (this.decisionQueue.length > 1) {
                  // this.decisionQueue.length = this.decisionQueue.length - 1;         
                  queuePoint = this.decisionQueue[this.decisionQueue.length - 1];
                  // console.warn('REVERTING TO', queuePoint.number, queuePoint.direction);
                  this.cellGrid = queuePoint.previousBoard;
                  this.selectedCell = allCells[queuePoint.rootCellIndex];
                  currentEditDirection = queuePoint.direction;
                  // triedWords = [];
                  this.usedWords = [];
                  if (i > 0) {
                    i -= 1;
                  }
                } else {
                  console.error('AT ZERO!')
                  break;
                  this.decisionQueue.length = 0;
                  this.cellGrid = originalBoard;
                  this.selectedCell = allCells[startingWord.letterIndexes[0]];
                  currentEditDirection = 'across';
                  this.usedWords = [];
                  triedWords = [];
                }
                // if (i > 0) {
                //   i -= 1;
                // } else {
                //   console.log('couldn\'t lower i no more');
                //   this.generating = false;
                //   break;
                // }
                // // if (this.decisionQueue.length > 1) {
                //   //   this.cellGrid = this.decisionQueue[this.decisionQueue.length - 2].previousBoard;
                // // } else {
                //   //   this.cellGrid = originalBoard;
                // // }
               
                // triedWords = [];
                // i -= 1;
                // if (i < 0) {
                //   this.cellGrid = originalBoard;
                //   this.selectedCell = allCells[this.decisionQueue[0].rootCellIndex];
                //   currentEditDirection = this.decisionQueue[0].direction;
                //   console.error('i was less than zero!!!');
                //   i = 0;
                //   this.generating = false;
                //   break;
                // }
                // this.getWordsNeeded();
              }
            } else {    
              console.error('>> NO CROSS CHOICES FOR i', i, initialWordChoice.word[i], 'in', initialWordChoice.word, crossResult);              
              this.cellGrid = this.decisionQueue[0].previousBoard;
              // previousBoard = JSON.parse(JSON.stringify(this.cellGrid));
              // this.getWordsNeeded();
              // console.error('reached original word?');
              console.error(initialWordChoice.word, '---- cannot exist here. >>>>>>>>>>>>>>>>>>')
              this.generating = false;
              break;
              
            }       
            // await this.wait(1);
          }
        }
        this.generating = false;
        this.highlightedWords = { across: [], down: [] };
        this.usedWords = [];

      } else {
        console.error('>> NO RESULT!')
      }
    },
    async fillSingleRoots() {
      let allCells = this.cellGrid.flat();
      this.getWordsNeeded();
      this.violatingCells = [];
      let filled = false;
      let repetitions = 0;
      let limit = 200;
      let rootIndex = 0;
      let rootCellLists = {
        across: this.wordsNeeded.across.filter(wordObj => wordObj.word && !this.doubleRootCells.includes(wordObj.letterIndexes[0])),
        down: this.wordsNeeded.down.filter(wordObj => wordObj.word && !this.doubleRootCells.includes(wordObj.letterIndexes[0]))
      };
      // for (let i = 0; i < Object.values(rootCellLists).length; i += 1) {
      //   let wordList = Object.values(rootCellLists)[i];
      //   let direction = Object.keys(rootCellLists)[i];
      //   wordList.forEach((wordObj, w) => {
      //     rootCellLists[direction][w] = allCells[wordList[i].letterIndexes[0]];
      //   })
      // }
      console.log('got root lists', rootCellLists)

      // let startingCell = rootList[rootIndex];

      let currentEditDirection = this.$store.state.editDirection;
      // this.selectedCell = startingCell;      
      this.generating = true;

      // this.decisionQueue = [];

      while (this.generating && !filled && repetitions < limit) {
        await this.wait(5);
        for (let i = 0; i < Object.values(rootCellLists).flat().length; i += 1) {
          let wordList = Object.values(rootCellLists)[i];
          let direction = Object.keys(rootCellLists)[i];
          for (let w = 0; w < wordList.length; w += 1) {     

            let currentCell = allCells[wordList[w].letterIndexes[0]];
            console.log('doing cell', currentCell, direction)
            this.selectedCell = currentCell;
            let validateResult = await this.fillWithValidatedWord(null, currentCell, direction);
            if (validateResult) {
  
            } else {
              break;
            }
          }
        }
        this.generating = false;
        return;
      }
      //   let checkDirection;
      //   if (repetitions % 2  === 0) {
      //     checkDirection = 'across';
      //   } else {
      //     checkDirection = 'down';
      //   }
      //   if (!validateResult) {
      //     requestAnimationFrame(() => {
      //       let newQueueIndex;
      //       if (this.decisionQueue.length > 1) {
      //         this.decisionQueue.length = this.decisionQueue.length - 1;
      //         newQueueIndex = this.decisionQueue.length - 1;
      //       } else if (this.decisionQueue.length === 1) {
      //         newQueueIndex = 0;
      //       }
      //       let newDecision = this.decisionQueue[newQueueIndex];
      //       this.selectedCell = newDecision.rootCell;
      //       this.$store.commit('changeEditDirection', newDecision.direction);
      //       this.cellGrid = newDecision.board;
      //       this.getWordsNeeded();
      //       // doubleIndex -= 1;
      //       repetitions -= 1;
      //     })
      //   } else { 
      //     if (!this.completeWords.includes(doubleIndex)) {
      //       this.completeWords.push(doubleIndex);
      //     }
          
      //     if (repetitions > 0 && repetitions % 2 === 1) {
      //       doubleIndex += 1;
      //       if (doubleIndex >= this.doubleRootCells.length) {
      //         doubleIndex -= this.doubleRootCells.length;
      //         console.error('ACCOMPLISHED');
      //         this.generating = false;
      //         return;
      //       }
      //       this.selectedCell = this.cellGrid.flat()[this.doubleRootCells[doubleIndex]];
      //     }
      //     repetitions += 1;
      //   }
      // }
      // this.generating = false;
      // console.error('AUTO STOPPED _______________________')

    },
    async fillDoubleRoots() {
      console.error('attempting to fill', this.doubleRootCells.length, 'double roots')
      this.getWordsNeeded();
      this.violatingCells = [];
      let filled = false;
      this.generating = true;
      let repetitions = 0;
      let limit = 500;
      let doubleIndex = 0;
      let startingCell = this.selectedCell || this.cellGrid.flat()[this.doubleRootCells[0]];
      let currentEditDirection = this.$store.state.editDirection;
      this.selectedCell = startingCell;      
      this.generating = true;
      this.decisionQueue = [];
      while (this.generating && !filled && repetitions < limit) {
        await this.wait(5);
        let checkDirection;
        if (repetitions % 2  === 0) {
          checkDirection = 'across';
        } else {
          checkDirection = 'down';
        }
        let validateResult = await this.fillWithValidatedWord(null, this.selectedCell, checkDirection);
        if (!validateResult) {
          requestAnimationFrame(() => {
            if (this.decisionQueue.length > 1) {
              let newQueueIndex;
              if (this.decisionQueue.length > 1) {
                this.decisionQueue.length = this.decisionQueue.length - 1;
                newQueueIndex = this.decisionQueue.length - 1;
              } else if (this.decisionQueue.length === 1) {
                newQueueIndex = 0;
              }
              let newDecision = this.decisionQueue[newQueueIndex];
              this.selectedCell = newDecision.rootCell;
              this.$store.commit('changeEditDirection', newDecision.direction);
              this.cellGrid = newDecision.board;
              this.getWordsNeeded();
              // doubleIndex -= 1;
              repetitions -= 1;
            } else {
              console.error('all out of luck here');
              this.generating = false;
              return;
            }
          })
        } else { 
          if (!this.completeWords.includes(doubleIndex)) {
            this.completeWords.push(doubleIndex);
          }
          
          if (repetitions > 0 && repetitions % 2 === 1) {
            doubleIndex += 1;
            if (doubleIndex >= this.doubleRootCells.length) {
              doubleIndex -= this.doubleRootCells.length;
              console.error('ACCOMPLISHED');
              this.generating = false;
              return;
            }
            this.selectedCell = this.cellGrid.flat()[this.doubleRootCells[doubleIndex]];
          }
          repetitions += 1;
        }
      }
      this.generating = false;
      console.error('AUTO STOPPED _______________________')

    },
    async autoFillBoard() {
      this.usedWords = [];
      this.completeWords = [];
      this.getWordsNeeded();
      await this.fillDoubleRoots();
      this.generating = false;
      requestIdleCallback(async () => {
        // this.selectedCell = this.decisionQueue[0].rootCell;
        // this.decisionQueue = [];
        // console.warn('beginning next phase');
        // await this.fillSingleRoots();
      })
    },
    async autoFill(repeat) {
      // this.clearLetters();
      if (repeat !== true) {
        console.log('recording!')
        console.log('recording board! -------------------')
        console.log('recording!')
        this.originalBoard = JSON.parse(JSON.stringify(this.cellGrid));
        this.usedWords.length = 0;
      }
        this.decisionQueue.length = 0;
      this.violatingCells = [];
      this.highlightedWords = { across: [], down: [] };
      // this.problemPatterns = [];
      let problemPatterns = [];
      const allCells = this.cellGrid.flat();
      let currentRootCell;
      if (this.selectedCell) {
        currentRootCell = this.selectedCell;
      } else {
        currentRootCell = allCells.filter(cell => cell.number === 1)[0];
        this.selectedCell = currentRootCell;
      }
      let currentEditDirection = this.$store.state.editDirection;      
      this.getWordsNeeded();
      // let currentRootCell = allCells[this.doubleRootCells[0]];
      // this.$store.commit('changeEditDirection', 'across');
      const choiceSequence = [];
      let filledWords = { across: [], down: [] }; // contain cell numbers
      let iterations = 0;
      let repetitions = 0;
      let onWordIndex = { across: 0, down: 0 };
      let changedCells = [];
      const limit = 1;
      // console.error('<<<<< STARTING AUTOFILL')
      // console.warn('<<<<<<', this.$store.state.editDirection,  '>>>>>>')
      // console.error('<<<<< STARTING AUTOFILL')
      this.generating = true;
      // iterations && await this.wait(500);
      
      // find and fill an initial word
      let choices = await this.findWord();
      if (typeof choices !== 'object') {
        console.error('NOTHING FOUND FOR initial word!', currentRootCell.number, currentEditDirection);
        this.cellGrid = this.decisionQueue[0].board;
        this.getWordsNeeded();
        this.selectedCell = undefined;
        this.generating = false;
        this.violatingCells.length = 0;
        return;
      }
      choices = choices.filter(wordObj => !this.usedWords.includes(wordObj.word))
      if (!choices.length) {
        console.error('NO CHOICES FOR initial word!', currentRootCell.number, currentEditDirection);
        this.cellGrid = this.decisionQueue[0].board;
        this.getWordsNeeded();
        this.selectedCell = undefined;
        this.generating = false;
        this.violatingCells.length = 0;
        return
      }
      let chosenWord = choices[0];
      let consequencesOkay = true;
      // console.error('INITIAL WORD IS', chosenWord.word)
      this.fillWithWord(chosenWord.word, currentRootCell.number, this.$store.state.editDirection);
      let oldBoard = JSON.parse(JSON.stringify(this.cellGrid));
      console.log('justtfilled initial with', chosenWord.word, this.$store.state.editDirection);
      currentEditDirection = this.$store.state.editDirection;
      this.decisionQueue.push({
        board: oldBoard,
        rootCell: currentRootCell,
        direction: currentEditDirection,
        word: chosenWord
      });      
      // this.usedWords.push(chosenWord.word);
      // console.warn('recorded decision currentRootCell', currentRootCell.number, this.$store.state.editDirection, chosenWord.word)

      let changedNumbers = [];

      // fill root words of opposite direction
      let originalWordObj = this.wordsNeeded[this.$store.state.editDirection].filter(obj => obj.letterIndexes[0] === currentRootCell.index)[0];
      if (!this.completeWords.includes(originalWordObj)) {
        this.completeWords.push(originalWordObj)
      }
      this.$store.dispatch('toggleDirection')

      let chosenCrossWord;
      
      for (let i = 0; i < originalWordObj.letterIndexes.length; i += 1) {        
        let ind = originalWordObj.letterIndexes[i];
        let oppositeRootWords = this.getRootWords(ind)[this.$store.state.editDirection];
        currentRootCell = allCells[oppositeRootWords.letterIndexes[0]];
        this.selectedCell = currentRootCell;
        let foundWords = await this.findWord();
        if (typeof foundWords === 'object') {
          foundWords = foundWords.filter(wordObj => !this.usedWords.includes(wordObj.word))
          if (!foundWords.length) {
            break;
          }
          chosenCrossWord = foundWords[0];       
          oldBoard = JSON.parse(JSON.stringify(this.cellGrid));   
          this.fillWithWord(chosenCrossWord.word, currentRootCell.number, this.$store.state.editDirection);
          // this.usedWords.push(chosenCrossWord.word);
          let changedCells = this.getChangedCells(oldBoard);
          // console.log(chosenCrossWord.word, 'changed', changedCells.length)
          changedCells.forEach(cell => {
            let rootWords = this.getRootWords(cell.index);
            if (!changedNumbers.includes(rootWords.across.number)) {
              changedNumbers.push(rootWords.across.number);
            }
            if (!changedNumbers.includes(rootWords.down.number)) {
              changedNumbers.push(rootWords.down.number);
            }
          });
          // console.log('changedNumbers', changedNumbers)
          if (changedNumbers.length) {
            consequencesOkay = await this.validateWordSpaces(changedNumbers);
            if (consequencesOkay) {
              // console.warn('recorded decision', currentRootCell.number, this.$store.state.editDirection, chosenCrossWord.word.toUpperCase())
              // oldBoard = JSON.parse(JSON.stringify(this.cellGrid));
              currentEditDirection = this.$store.state.editDirection;
              this.decisionQueue.push({
                board: oldBoard,
                rootCell: currentRootCell,
                direction: currentEditDirection,
                word: chosenCrossWord
              });
              let wordObj = this.wordsNeeded[this.$store.state.editDirection].filter(obj => obj.letterIndexes[0] === currentRootCell.index)[0];

              if (!this.completeWords.includes(wordObj)) {
                this.completeWords.push(wordObj)
              }
              this.usedWords.push(chosenCrossWord.word);
            } else {
              console.error('CROSS WORD', chosenCrossWord.word, 'WAS NOT OKAY');
              this.cellGrid = oldBoard;
              break;
            }
          } else {
            break;
          }
        }

      }

      iterations += 1;

      // consequencesOkay = await this.validateWordSpaces();

      if (consequencesOkay) {
        // end 
        this.decisionQueue.length = 1;
        console.error('ALL CROSSWORDS FOR', this.decisionQueue[0].rootCell.number, this.decisionQueue[0].direction, this.decisionQueue[0].word.word.toUpperCase(), 'VIABLE!');
        // console.error('---->', chosenCrossWord.word)
        // this.cellGrid = this.decisionQueue[0].board;
        // this.getWordsNeeded();
        this.selectedCell = undefined;
        this.generating = false;
        this.violatingCells.length = 0;        
      } else {
        console.error('CROSSWORDS OF', this.decisionQueue[0].rootCell.number, this.decisionQueue[0].direction, this.decisionQueue[0].word.word.toUpperCase(), 'TRIED AN UNFINDABLE PATTERN!');
        // console.error('---->', chosenCrossWord.word)
        this.completeWords.splice(this.completeWords.indexOf(originalWordObj), originalWordObj.letterIndexes.length - 1);
        await this.wait(5)
        requestIdleCallback(() => {
          if (this.decisionQueue.length > 1) {
            this.decisionQueue.length = this.decisionQueue.length - 1;
          }
          // this.decisionQueue.length = 1;
          let newQueueIndex = this.decisionQueue.length - 1;
          const newDecisionPoint = this.decisionQueue[newQueueIndex];
          console.warn('reverting to decision point', newDecisionPoint.rootCell.number, newDecisionPoint.direction)
          currentRootCell = newDecisionPoint.rootCell;
          this.selectedCell = currentRootCell;
          this.$store.commit('changeEditDirection', newDecisionPoint.direction);
          let restoredBoard = newQueueIndex > 0 ? newDecisionPoint.board : this.originalBoard;
          this.cellGrid = restoredBoard;       
          this.getWordsNeeded();
          requestIdleCallback(() => {
            if (this.generating) {
              this.autoFill(true);
            }
          })
          // this.generating = false;
        })
      }
      
    },
    async validateWordSpaces(onlyCheckNumbers, onlyDirection) {
      this.violatingCells = [];
      this.viableWords = [];
      let problemPatterns = [];
      let allValid = true;
      let allCells = this.cellGrid.flat();
      let wordsNeededAcross = this.wordsNeeded.across;
      let wordsNeededDown = this.wordsNeeded.down;
      if (onlyCheckNumbers && onlyCheckNumbers.length) {
        wordsNeededAcross = this.wordsNeeded.across.filter(wordObj => onlyCheckNumbers.includes(wordObj.number))
        wordsNeededDown = this.wordsNeeded.down.filter(wordObj => onlyCheckNumbers.includes(wordObj.number))
      }
      if (onlyDirection === 'across') {
        wordsNeededDown = [];
      }
      if (onlyDirection === 'down') {
        wordsNeededAcross = [];
      }
      // console.warn('VALIDATING ----', wordsNeededAcross.length, ' across words')
      // console.warn('VALIDATING ----', wordsNeededDown.length, ' down words')
      for (let i = 0; i < wordsNeededAcross.length; i += 1) {
        let wordObj = wordsNeededAcross[i]
        let startingIndex = allCells[wordObj.letterIndexes[0]];
        let acrossChoices = await this.getWordChoices(null, startingIndex, 'across');
        if (typeof acrossChoices === 'object') {
          wordObj.choices = acrossChoices
        } else {
          // console.error(acrossChoices, wordObj.word, wordObj.number, 'across has no word choices!');
          problemPatterns.push(acrossChoices)
          allValid = false;
          break;
        }
      }
      for (let i = 0; i < wordsNeededDown.length; i += 1) {
        let wordObj = wordsNeededDown[i]
        let startingIndex = allCells[wordObj.letterIndexes[0]];
        let downChoices = await this.getWordChoices(null, startingIndex, 'down');
        if (typeof downChoices === 'object') {
          wordObj.choices = downChoices
        } else {
          problemPatterns.push(downChoices)
          allValid = false;
          break;
        }
      }
      problemPatterns.forEach(pat => {
        let matchingEntries = this.problemPatterns.filter(entry => entry.pattern === pat);
        if (matchingEntries.length) {
          // console.warn('found', matchingEntries.length, 'entries for', pat);
          let index = this.problemPatterns.indexOf(matchingEntries[0])
          this.problemPatterns[index].quantity += 1;
        } else {
          this.problemPatterns.push({
            pattern: pat,
            quantity: 1
          })
        }
      })
      // if (this.problemPatterns.length > 100) {
      //   let overage = this.problemPatterns.length - 100;
      //   this.problemPatterns = this.problemPatterns.sort((a , b) => b.length - a.length).splice(overage, this.problemPatterns.length);
      // }        
      return allValid;
    },
    async fillBoard() {
      let problemPattern;
      const allCells = this.cellGrid.flat();
      let currentRootCell = this.selectedCell ? this.selectedCell : allCells.filter(cell => cell.number === 1)[0];
      this.selectedCell = currentRootCell;
      this.$store.commit('changeEditDirection', 'across');
      const choiceSequence = [];
      const decisionQueue = [];
      let usedWords = []; // contains wordObj.ids
      let filledWords = { across: [], down: [] }; // contain cell numbers
      let iterations = 0;
      let repetitions = 0;
      let onWordIndex = { across: 0, down: 0 };
      let changedCells = [];
      const limit = 225;
      this.generating = true;
      while(this.generating && iterations < limit) {
        iterations && await this.wait(0);
        const oldBoard = JSON.parse(JSON.stringify(this.cellGrid));
        let wordOptions = await this.findWord();
        while (typeof wordOptions !== 'object') {
          console.error('NO WORDS FOUND FOR', currentRootCell.number, this.$store.state.editDirection);
          // let cellArr = this.wordsNeeded[this.$store.state.editDirection].filter(wordObj => wordObj.letterIndexes.includes(this.selectedCell.index))[0].letterIndexes;
          // this.violatingCells.push(...cellArr)
          problemPattern = wordOptions;
          let previousDirection = decisionQueue[iterations - 1].direction;
          this.$store.commit('changeEditDirection', previousDirection);
          let previousCellIndex = decisionQueue[iterations - 1].cellIndex;
          currentRootCell = allCells[previousCellIndex];
          this.selectedCell = currentRootCell;
          // this.eraseWord(this.selectedCell, this.$store.state.editDirection, changedCells)
          let previousWord = decisionQueue[iterations - 1].word;
          console.warn('we getting a replacement word for', this.selectedCell.number, previousDirection, newBlank)
          let newBlank = '*'.repeat(previousWord.length);
          this.fillWithWord(newBlank, currentRootCell.number, previousDirection);
          wordOptions = await this.findWord(previousDirection);

          // console.error('MOVED BACKQ to number', previousCellIndex, this.$store.state.editDirection)
          // console.error('now options is', wordOptions)
          // break;
        }
        iterations += 1;
                
        // wordOptions = wordOptions.sort((a, b) => this.scrabbleScore(a.word) - this.scrabbleScore(b.word));
        const foundWord = wordOptions.filter(wordObj => !usedWords.includes(wordObj.id))[0];
        if (!foundWord) {
          console.error('DIDNAE FIND A foundWord!!');
          break;
        }
        this.fillWithWord(foundWord.word, currentRootCell.number, this.$store.state.editDirection);       

        changedCells = this.getChangedCells(oldBoard);
        let rootCellsToTest = [];
        changedCells.forEach(cell => {
          rootCellsToTest.push(this.getRootWords(cell.index).across.letterIndexes[0]);
          rootCellsToTest.push(this.getRootWords(cell.index).down.letterIndexes[0]);
        });

        let changedOk = true;
        let tested = 0;

        while (tested < rootCellsToTest.length) {
          let testCell = allCells[rootCellsToTest[tested]];
          this.selectedCell = testCell;
          let wordOptions = await this.findWord();
          if (typeof wordOptions !== 'object') {
            changedOk = false;
            console.error('#$#$#$#$$$$$$$$$$#$#$#$')
            console.error(rootCellsToTest[tested], 'no good!')
            console.error('#$#$#$#$$$$$$$$$$#$#$#$')
            // break;
          }
          tested += 1
        }

        if (!changedOk) {
          console.error('POTENTIAL CHANGED HAVE NO WORDS')
          break;
        }

        usedWords.push(foundWord.id);
        decisionQueue.push({
          direction: this.$store.state.editDirection,
          cellIndex: this.selectedCell.index,
          wordId: foundWord.id,
          word: foundWord.word
        });
        filledWords[this.$store.state.editDirection].push(currentRootCell.number)

        this.$store.dispatch('toggleDirection');

        // const needed = this.getWordsNeeded();
        // changedCells.forEach(cell => {
        //   let rootWords = this.getRootWords(cell.index, needed);
        //   checkQueue.push({ direction: currentEditDirection, cellIndex: rootWords[currentEditDirection].letterIndexes[0]});        
        // });

        

        // const nextRootCellIndex = this.getRootWords(changedCells[onWordIndex].index)[this.$store.state.editDirection].letterIndexes[0];
        let currentWordList = this.wordsNeeded[this.$store.state.editDirection];
        let currentWord = currentWordList.filter(wordObj => wordObj.letterIndexes.includes(this.selectedCell.index))[0];
        // const nextRootCellIndex = currentWordList[onWordIndex[this.$store.state.editDirection]].letterIndexes[0];
        let nextRootCellIndex;
        if (this.$store.state.editDirection === 'across') {
          let targetRow;
          if (currentRootCell.row <= this.boardSize.height - 1) {
            targetRow = currentRootCell.row + 1
          } else {
            targetRow = currentRootCell.row
          }
          nextRootCellIndex = allCells.filter(cell => {
            let qualifies = false;
            let hasAcrossWord = cell.number && this.getRootWords(cell.index).across.number === cell.number;
            if (hasAcrossWord && !filledWords.across.includes(cell.number) && cell.row >= targetRow) {
              qualifies = true;
            }
            return qualifies;
          })[0].index;
        } else {
          let targetColumn;
          if (currentRootCell.column <= this.boardSize.width - 1) {
            targetColumn = currentRootCell.column + 1
          } else {
            targetColumn = currentRootCell.column
          }
          nextRootCellIndex = allCells.filter(cell => {
            let qualifies = false;
            let hasDownWord = cell.number && this.getRootWords(cell.index).down.number === cell.number;
            if (hasDownWord && !filledWords.down.includes(cell.number) && cell.column >= targetColumn) {
              qualifies = true;
            }
            return qualifies;
          })[0].index;
        }
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
      this.highlightedWords = { across: [], down: [] };
      console.error('///////////////////////////////////////////')
      return {problemPattern, decisionQueue, iterations};
    },

    scrabbleScore(word) {
      let score = 0
      for (var c=0;c<word.length;c++) {
          var char = word[c]
          score += scrabbleScores[char]
      }
      return score
    },

    getAdjacentNonBlankCell(startingCell, direction) {
      let allCells = this.cellGrid.flat();
      let result;
      if (direction === 'east') {
        if (!startingCell.shaded && 
        startingCell.column !== this.boardSize.width - 1 &&
        allCells[this.selectedCell.index + 1] && !allCells[this.selectedCell.index + 1].shaded ) {
          result = allCells[this.selectedCell.index + 1];
        }        
      } else if (direction === 'south') {
        if (!startingCell.shaded && 
        allCells[startingCell.index + this.boardSize.width] && !allCells[startingCell.index + this.boardSize.width].shaded ) {
          result = allCells[this.selectedCell.index + this.boardSize.width]
        }        
      } else if (direction === 'west') {
        if (!startingCell.shaded && 
        startingCell.column !== 0 &&
        allCells[this.selectedCell.index - 1] && !allCells[this.selectedCell.index - 1].shaded ) {
          result = allCells[this.selectedCell.index - 1];
        }        
      } else if (direction === 'north') {
        if (!startingCell.shaded &&
        allCells[startingCell.index - this.boardSize.width] && !allCells[startingCell.index - this.boardSize.width].shaded ) {
          result = allCells[this.selectedCell.index - this.boardSize.width]
        }        
      }
      return result;
    },

    handleClickKey(e) {
      let allCells = this.cellGrid.flat();
      let targetCell = this.selectedCell;
      let moveDirection;
      let char = e.target.innerText;
      if (this.$store.state.editDirection === 'across') {
        if (char === 'DEL') {
          char = '';
          moveDirection = 'west';
        } else {
          moveDirection = 'east';
        }
      } else {
        if (char === 'DEL') {
          char = '';
          moveDirection = 'north';
        } else {
          moveDirection = 'south';
        }
      }
      this.selectedCell.letter = char;
      let newSelectedCell = this.getAdjacentNonBlankCell(targetCell, moveDirection);
      if (newSelectedCell) {
        this.selectedCell = newSelectedCell;       
      } else {
        this.$store.commit('changeEnteringLetters', false);
        this.$store.commit('toggleKeyboard');
      }
    },
    async lookUpWord(word) {
      console.log('received', word);
      if (word.length >= 3) {
        let result = await DB.getSingleWord(word);
        if (result.data.word) {
          console.log('got', result.data)
          result.data.selectedClue = 0;
        }
        return result;
      }
    },
    async handleSaveClue(wordObj, newClue) {
      let word;
      let clues = [];
      let toastMessage;
      if (wordObj.clues.includes(newClue)) {
        this.showToast('CLUE ALREADY EXISTS!');
        return;
      }
      if (typeof wordObj === 'object') {
        console.warn('handleSaveClue received existing word', wordObj, newClue)
        word = wordObj.word
        clues = wordObj.clues
        toastMessage = `Clue for "${word.toUpperCase()}" saved.`;
      } else {
        console.error('handleSaveClue received word NOT YET IN DB...', wordObj);
        word = wordObj;
        await this.saveNewWord(wordObj, true);
        toastMessage = `Word "${word.toUpperCase()}" added and clue saved."`      
      }
      clues.push(newClue);
      console.warn('sending clues', clues, 'for word', word);
      let saveResp = await DB.saveClue(word, clues, true);
      await this.getWordList(word.length);
      if (saveResp.data === 'Your clue was saved.') {
        this.showToast(toastMessage)  
      }
      return;
    }

    // async scanBoardForImage() {
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
  // },
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
  z-index: 2;
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
  /* color: var(--secondary-text-color); */
  color: white;
  font-weight: bold;
  width: 100%;
  flex-grow: 1;
  justify-self: flex-start;
  position: relative;
  background-color: #222;
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
  border: 1px solid #666;
  border-radius: calc(var(--main-padding) / 2);
  padding: 0 calc(var(--main-padding) / 2);
}
.clue-list > .word-clue-entry {
  padding: var(--main-padding) calc(var(--main-padding) / 2);
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto 1fr;
  /* align-items: center; */  
  border-bottom: 1px solid #666;
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
.word-clue-entry:last-child {
  border-bottom: 0;
}
.word-clue-entry > button:active {
  background-color: #333;
}
.word-clue-entry > button {
  grid-row-start: 1;
  grid-row-end: span 2;
  grid-column-start: 3;
  display: flex;
  justify-content: space-between
}
.clue-display h1.direction-label {
  font-size: 1.75rem;
  padding: calc(var(--main-padding) / 2) var(--main-padding);
}
@media (orientation: landscape) {
	.board-area {
		grid-column-start: 1;
	}
}
</style>
