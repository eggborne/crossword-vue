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
        editMode === `diagram` ? handleCellFlip : 
        editMode === `puzzle` ? handleCellSelect : null
        '
        :selectedCellIndex='selectedCellIndex'
      />
    </div>
    <ControlPanel
      :editMode='editMode'
      :options='options'
      :boardSize='boardSize'
      :symmetry='symmetry'
      :percentBlack='getPercentBlack(cellGrid)'
      :wordsNeeded='wordsNeeded'
      :contiguous='contiguous'
      :changeEditMode='changeEditMode'
      :addCellLabels='addCellLabels'
      :adjustOption='adjustOption'
      :adjustRangedOption='adjustRangedOption'
      :clearBoard='clearBoard'
      :shadeBoard='shadeBoard'
      :handleClickToSave='handleClickToSave'
      :handleClickToBrowse='handleClickToBrowse'
      :handleClickChooseDiagram='changeDiagram'
      :swastikaQuotient='swastikaQuotient'
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
      :diagrams='this.auditMode ? auditList : diagrams'
      :savedTrainingData='savedTrainingData'
      :handleClickChooseDiagram='changeDiagram'
      :handleClickCancelBrowse='handleClickCancelModal'
      :handleClickDeleteDiagram='handleClickDeleteDiagram'
      :handleClickToLabel='handleClickToLabel'
    />
    <div id='model-display'></div>
    <div id='model-display'></div>
    <!-- <canvas id='board-canvas'/>
    <img id='board-image' src='img/graychicken.png'/> -->
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import Board from '../components/Board.vue';
import ControlPanel from '../components/ControlPanel.vue';
import BrowseModal from '../components/BrowseModal.vue';
import SaveModal from '../components/SaveModal.vue';
import axios from 'axios';
import GridScanner from '../gridscanner';
import DiagramCreator from '../diagramcreator';
require('../gridscanner.js');

console.log('got', GridScanner)

let gridScanner = new GridScanner;
let diagramCreator = new DiagramCreator;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export default {
  name: 'home',
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
    swastikaQuotient: 0,
    savedTrainingData: {
      input: [],
      output: [],
      diagramIds: []
    },
    ioArray: [],
    saveMessage: '',
    auditList: [],
    auditMode: false
  }),
  mounted() {
    this.createGrid(this.boardSize);
    this.addCellLabels();    
    this.getMLData().then(() => {
      this.doneLoading = true;
      // let testGrid = diagramCreator.analyzeImage('board-image').join('');
      // console.warn('made grid', testGrid)
      // testGrid = this.buildArrayFromGridString(testGrid, 15, 15);
      // console.warn('made grid', testGrid);
      // this.cellGrid = testGrid;
    });
  },
  components: {
    Header,
    Board,
    ControlPanel,
    BrowseModal,
    SaveModal
  },
  methods: {
    getMLData() {      
      return new Promise(async (resolve) => {        
        const modelJSONResponse = await this.getAIModel('swastika')
        if (modelJSONResponse.data) {
          console.log('getAIModel got', modelJSONResponse)
          gridScanner.refreshModel(JSON.parse(modelJSONResponse.data))
          resolve();          
        }
        const startTime = window.performance.now();
        const trainingDataResponse = await this.getAITrainingData('swastika');
        if (trainingDataResponse.data) {
          console.log('getAITrainingData got', trainingDataResponse)
          this.savedTrainingData = JSON.parse(trainingDataResponse.data);
          console.error("got training data in", window.performance.now() - startTime);
        }

      });
    },
    getFlippedCellGrid(grid) {
		  const newGrid = [];
      grid.forEach((row, r) => { 
        newGrid[r] = [...row].reverse();
      });
      return newGrid;
    },
    getPercentBlack: function(cellGrid) {
      let flatCells = cellGrid.flat();
      let percent = Math.round((flatCells.filter(cell => cell.shaded).length / flatCells.length) * 100);
      return percent;
    },
    getBinaryPattern(grid) {
      grid = this.getStringifiedGridArray(grid).split('').map(val => {
        if (val === '*' || val == 1) {
          return val = 1;
        } else {
          return val = 0;
        }
      });
      return grid;
    },
    handleClickToSave() {
      // const newData = this.savedTrainingData.input.filter(inp => inp.length === 225);
      // console.log(newData);
      // this.savedTrainingData = newData;
      // this.saveAITrainingData('swastika', newData).then(resp => {
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
      console.warn(this.savedTrainingData)
      this.savedTrainingData.input.forEach((cellArray, i) => {
        ioArray[i] = {
          input: cellArray,
          output: this.savedTrainingData.output[i]
        };
      });
      ioArray = ioArray.filter(item => item.input.length === 225);
      gridScanner = new GridScanner;
      gridScanner.refreshModel();
      gridScanner.trainScanner(ioArray);
      this.saveAIModelToDB();
    },
    async handleClickToLabel(diagramId, violation, violating) {
      console.warn('handleClickToLabel received', diagramId, violation, violating);
      let alreadyThere = [...this.savedTrainingData.diagramIds].indexOf(diagramId) > -1;
      if (!alreadyThere) {
        let grid = Object.values(this.diagrams).filter(diagram => diagram.id === diagramId)[0].cells;
        // let flippedGrid = this.getFlippedCellGrid(grid);

        let newTrainingData = {
          input: [...this.savedTrainingData.input, this.getBinaryPattern(grid)],
          output: [...this.savedTrainingData.output, { [violation]: violating }],
          diagramIds: [...this.savedTrainingData.diagramIds, diagramId],
        };
        // let newTrainingData = {
        //   input: [...this.savedTrainingData.input, this.getBinaryPattern(grid), this.getBinaryPattern(flippedGrid)],
        //   output: [...this.savedTrainingData.output, { [violation]: violating }, { [violation]: violating }],
        //   diagramIds: [...this.savedTrainingData.diagramIds, diagramId],
        // };
        this.savedTrainingData = newTrainingData;
        let trainingResponse = await this.saveAITrainingData('swastika', newTrainingData);
        console.warn('handleClickToLabel > saveAITrainingData --->', trainingResponse);
      } else {
        console.error(diagramId, 'is ALREADY IN savedTrainingData')
      }
    },
    async refreshUserDiagrams() {
      let resp = await this.getDiagrams(); 
      console.warn('resp', resp)     
      let diagramArray = resp.data;        
      diagramArray.map(diagramObj => {
        diagramObj.cells = this.buildArrayFromGridString(diagramObj.cells, diagramObj.width, diagramObj.height);
        diagramObj.width = parseInt(diagramObj.width);
        diagramObj.height = parseInt(diagramObj.height);
        diagramObj.percentBlack = 0;
        let percent = gridScanner.getGridAttribute(diagramObj.cells, 'swastika');
        diagramObj.swastikaPercent = percent;
      });
      console.log('made', diagramArray)
      this.diagrams = diagramArray;
      return diagramArray;
    },
    async saveAIModelToDB() {
      let modelString = JSON.stringify(gridScanner.net.toJSON());
      document.getElementById('model-display').innerText = 'SAVING...';
      document.getElementById('model-display').style.display = 'block';
      this.busySaving = true;
      let saveAIResponse = await this.saveAIModel('swastika', modelString);
      console.warn('save AI responded', saveAIResponse.data);
      this.busySaving = false;
      document.getElementById('model-display').innerText = 'SAVED!';
      document.getElementById('model-display').style.background = 'green';
      setTimeout(() => {
        document.getElementById('model-display').style.display = 'none';
      }, 1000)
    },
    async handleSaveDiagram(creator) {
      if (!creator) {
        creator = 'Leroy';
      }
      let cellString = this.getStringifiedGridArray([...this.cellGrid]);
      let uniqueResponse = await this.checkIfDiagramExists(cellString);
      if (!uniqueResponse.data) {
        console.error('DIAGRAM IS UNIQUE!', uniqueResponse.data)
        let width = this.boardSize.width;
        let height = this.boardSize.height;
        let saveResponse = await this.saveDiagram(cellString, width, height, creator)
        if (saveResponse.data) {
          console.error('saveDiagram ---->', saveResponse);
          this.showingModal = undefined;
        }
      } else {
        this.saveMessage = `DIAGRAM EXISTS! as ID#${uniqueResponse.data}`;
        setTimeout(() => {
          this.saveMessage = ``;
        }, 3000);
      }
    },
    async handleClickDeleteDiagram(id) {
      let response = await this.removeDiagram(id);
      if (response.data) {
        await this.refreshUserDiagrams();
      } else {
        console.error('handleClickDeleteDiagram ERROR')
      }
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
    getWordsNeeded() {
      let violations = [];
      let newWordsNeeded = {
        across: [],
        down: []
      };
      this.cellGrid.forEach((row, r) => {
        row.forEach((cell, c) => {
          if (cell.number) {
            cell.letter = '';
            console.warn(cell.number, '----------------------------')
            console.log('cell', r, c);
            let blankToLeft = c === 0 || row[c - 1].shaded;
            let blankAbove = r === 0 || this.cellGrid[r - 1][c].shaded;
            let wordLengthToRight;
            let wordLengthBelow;
            if (blankToLeft) {
              for (let k=c+1; k < row.length; k++) {
                let rowCell = row[k];
                if (rowCell.shaded) {
                  wordLengthToRight = k - c;
                  cell.letter = wordLengthToRight.toString();
                  break;           
                }
                if (k === row.length - 1) {
                  wordLengthToRight = k - c + 1;
                  cell.letter = wordLengthToRight.toString();
                  break;
                }
              }
            }
            if (blankAbove) {
              for (let h=r+1; h < this.cellGrid.length; h++) {
                let gridRow = this.cellGrid[h];
                if (gridRow[c].shaded) {
                  wordLengthBelow = h - r;
                  cell.letter += '/' + wordLengthBelow.toString();
                  break;        
                }
                if (h === this.cellGrid.length - 1) {
                  wordLengthBelow = h - r + 1;
                  cell.letter += '/' + wordLengthBelow.toString();
                  break;  
                }
              }             
            }
            console.log('cell', r, c, 'right:', wordLengthToRight, ' below', wordLengthBelow);
            if (wordLengthToRight) {
              newWordsNeeded.across.push({
                number: cell.number,
                word: '*'.repeat(wordLengthToRight),
              });
            }
            if (wordLengthBelow) {
              newWordsNeeded.down.push({
                number: cell.number,
                word: '*'.repeat(wordLengthBelow)
              });
            }                   
          }
        });
      });
      this.wordsNeeded = newWordsNeeded;
      return newWordsNeeded;
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
    checkIfDiagramExists(cellString) {      
      return axios({
        method: 'post',
        url: 'https://api.eggborne.com/crossword/checkifdiagramexists.php',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          cells: cellString
        }
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
    getAIModel(attribute) {
      return axios({
        method: 'post',
        url: 'https://api.eggborne.com/crossword/getaimodel.php',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          attribute: attribute
        }
      });
    },
    saveAIModel(attribute, model) {
      console.log('sending', attribute, model.length)  
      return axios({
        method: 'post',
        url: 'https://api.eggborne.com/crossword/saveaimodel.php',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          attribute: attribute,
          model: model
        }
      });
    },
    saveAITrainingData(attribute, trainingData) {
      trainingData = JSON.stringify(trainingData);
      console.log('sending', attribute, trainingData.length)  
      return axios({
        method: 'post',
        url: 'https://api.eggborne.com/crossword/saveaitrainingdata.php',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          trainingData: trainingData
        }
      });
    },
    getAITrainingData(attribute) {      
      return axios({
        method: 'post',
        url: 'https://api.eggborne.com/crossword/getaitrainingdata.php',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          attribute: attribute,
        }     
      });
    },
    removeDiagram(id) {   
      return axios({
        method: 'post',
        url: 'https://api.eggborne.com/crossword/removediagram.php',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          id: parseInt(id),
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
    changeEditMode(e) {
      let newMode = e.target.id.split('-')[0];
      this.selectedCellIndex = undefined;
      this.editMode = newMode;
    },
    changeDiagram(newDiagram) {
      this.showingModal = undefined;
      if (newDiagram.width !== this.boardSize.width || newDiagram.height !== this.boardSize.height) {
        this.adjustOption('diagramSize', newDiagram.width);
        // document.getElementById('diagram-slider').value = newDiagram.width;
      }
      this.currentDiagram = newDiagram;
      this.cellGrid = newDiagram.cells;
      this.swastikaQuotient = gridScanner.getGridAttribute(newDiagram.cells, 'swastika');
      this.addCellLabels();
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
      let startTime = window.performance.now();
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
      this.addCellLabels();
      console.error('grid created and labeled in', window.performance.now() - startTime)
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
    handleCellFlip(e) {
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
      // this.getWordsNeeded();
      requestAnimationFrame(() => {
        this.addCellLabels();
        this.getWordsNeeded();
        this.swastikaQuotient = gridScanner.getGridAttribute(newCellGrid, 'swastika');  
      });
    },    
    handleCellSelect(e) {
      const clickedIndex = parseInt(e.target.id.split('-')[1]);
      this.selectedCellIndex = clickedIndex;    
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
      if (optionName === 'diagramSize') {
        let startTime = window.performance.now();
          this.boardSize = {
            width: parseInt(newValue), height: parseInt(newValue)
          };
          this.cellGrid = [];
          this.createGrid(this.boardSize, true);
          document.documentElement.style.setProperty(optionData.cssVar, `${newValue}${optionData.cssUnit}   `);
          document.documentElement.style.setProperty('--cells-high', `${newValue}${optionData.cssUnit}`);
          console.error('board resized in', window.performance.now() - startTime);
          this.swastikaQuotient = 0;       
      }
    },
    adjustRangedOption(optionName, newValue) {
      let optionData = this.options[optionName];
    },
    clearBoard(e, shade) {
      this.auditMode = !this.auditMode;
      e.target.classList.toggle('highlighted')
      // console.log('claering')
      // let updatedCells = [...this.cellGrid];
      // [...updatedCells].forEach((row, r, rowsArray) => {
      //   updatedCells[r] = row.map((cell, c, cellArray) => {                  
      //     let newCell = { ...cell };
      //     newCell.letter = '';          
      //     newCell.number = '';          
      //     newCell.shaded = shade;          
      //     newCell.selected = false;          
      //     return cell = newCell;
      //   });
      // });
      // this.cellGrid = updatedCells;
      // this.addCellLabels();
      // this.swastikaQuotient = 0;
    },
    getViolatingBoard(iterations) {
      let scores = [];
      let newAuditList = [];
      for (var i=0; i<iterations; i++) {
        // let randomPattern = this.getRandomBinaryPattern(randomInt(10,30));
        let randomPattern = this.getRandomBinaryPattern(17);
        let newGrid = this.buildArrayFromGridString(randomPattern, this.boardSize.width, this.boardSize.height);
        
        let gridScore = gridScanner.getGridAttribute(newGrid, 'swastika');
        // console.log('newgrd score', gridScore)
        scores.push({grid: newGrid, score: gridScore})
      }
      let sortedScores = scores.sort((a, b) => b.score - a.score);
      for (let i = 0; i < 15; i++) {
        let diagramObj = {};
        diagramObj.cells = sortedScores[i].grid;
        diagramObj.width = this.boardSize.width;
        diagramObj.height = this.boardSize.height;
        diagramObj.percentBlack = 0;
        diagramObj.swastikaPercent = sortedScores[i].score;
        // console.log('puishing diagramObj', diagramObj)
        newAuditList.push(diagramObj);
      }
      let reversedScores = [...sortedScores].reverse();
      for (let i = 0; i < 15; i++) {
        let diagramObj = {};
        diagramObj.cells = reversedScores[i].grid;
        diagramObj.width = this.boardSize.width;
        diagramObj.height = this.boardSize.height;
        diagramObj.percentBlack = 0;
        diagramObj.swastikaPercent = reversedScores[i].score;
        // console.log('puishing diagramObj', diagramObj)
        newAuditList.push(diagramObj);
      }
      console.log('scores', scores);
      const topScorer = sortedScores[0];
      console.log('topScorer', topScorer);
      this.cellGrid = topScorer.grid;
      this.swastikaQuotient = topScorer.score;
      console.log('list is', newAuditList.length, newAuditList)
      this.auditList = newAuditList;
    },
    getRandomBoard(blackPercent) {

    },
    shadeBoard(e) {
      diagramCreator.imageTo2Bit('board-image');
      // this.getViolatingBoard(1000)

      // let cellString = this.getBinaryPattern([...this.cellGrid]);
      // let newGrid = this.buildArrayFromGridString()

      // this.getViolatingBoard(20);          
      // this.clearBoard(e, true);
    },
    getRandomBinaryPattern(percentBlack) {
      let binaryArray = new Array(225);
      let toBeShaded = [];
      let symmDivider = this.symmetry * 2;
      if (symmDivider === 0) {
        symmDivider = 1;
      }
      let actualChance = (percentBlack / symmDivider);
      for (let i=0; i < 225; i++) {
        if (binaryArray[i] !== 1) {
          let isShaded = 0;
          isShaded = randomInt(0, 100) < actualChance ? 1 : 0;
          binaryArray[i] = isShaded;
          if (isShaded) {
            let coords = {
              row: (i - (i % this.boardSize.height)) / this.boardSize.height,
              column: ((i) % this.boardSize.width)
            }
            let mirrorCoords = this.getMirrorCoords(this.symmetry, coords);
            mirrorCoords.forEach(coordSet => {
              let totalIndex = (coordSet.row * this.boardSize.height) + coordSet.column;
              // binaryArray[totalIndex] = 1;
              toBeShaded.push(totalIndex)
            })
            // console.log('mirror is', mirrorCoords);
          }
        }
      }
      toBeShaded.forEach(ind => {
        binaryArray[ind] = 1;
      })
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
  }
};
</script>

<style scoped>
#board-image {
  /* display: none; */
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
  width: 150px;
  height: 150px;
  bottom: 20vmin;
  left: 50%;
  transform: translate(-50%, 0);
  box-shadow: 0 0 4px 1px black;
  /* background: var(--cell-color); */
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
