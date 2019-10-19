/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable class-methods-use-this */
/* eslint-disable indent */
/* eslint-disable no-undef */

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export default class GridScanner {
	constructor() {
    this.net = new brain.NeuralNetwork();
	}

	refreshModel(newModelJSON) {
		const startTime = window.performance.now();
		if (newModelJSON) {
			this.net.fromJSON(newModelJSON);
			console.error('Brain.js model refreshed in', window.performance.now() - startTime);
		} else {
			console.error('Brain.js model cleared in', window.performance.now() - startTime);
		}
	}

	trainScanner(ioArray) {
		const startTime = window.performance.now();
		this.net.train(ioArray, {
			iterations: 20000, // the maximum times to iterate the training data --> number greater than 0
			errorThresh: 0.01, // the acceptable error percentage from training data --> number between 0 and 1
			log: true, // true to use console.log, when a function is supplied it is used --> Either true or a function
			logPeriod: 10, // iterations between logging out --> number greater than 0
			learningRate: 0.2, // scales with delta to effect training rate --> number between 0 and 1
			momentum: 0.1, // scales with next layer's change value --> number between 0 and 1
			callback: null, // a periodic call back that can be triggered while training --> null or function
			callbackPeriod: 10, // the number of iterations through the training data between callback calls --> number greater than 0
			timeout: Infinity, // the max number of milliseconds to train for --> number greater than 0
		});
		console.warn("ran training in", window.performance.now() - startTime);
  }

	getGridAttribute(grid, attribute) {
		// console.warn('took in', grid);
		const preparedGrid = this.getBinaryArray([...grid]);
		const flippedGrid = this.getBinaryArray(this.getFlippedCellGrid([...grid]));	
		
		const result = this.net.run(preparedGrid)[attribute];
		const flippedResult = this.net.run(flippedGrid)[attribute];
		const higherResult = flippedResult > result ? flippedResult : result;
		// console.warn('orig', (result * 100).toFixed(1), 'flipped', (flippedResult * 100).toFixed(1));
		return parseFloat((higherResult * 100).toFixed(1));
		// return parseFloat((result * 100).toFixed(1));
	}

	getBinaryArray(grid) {
    const binaryArray = [];
    grid.forEach((row, r) => {
      binaryArray[r] = [];
      row.forEach((cell, c) => {
        binaryArray[r][c] = cell.shaded ? 1 : 0;
      });
    });
		return binaryArray.flat();
	}

	getRandomBinaryPattern() {
		let binaryString = '';
		for (let i = 0; i < 225; i++) {
			binaryString += randomInt(0,1);
		}
		return binaryString;
	}

	getFlippedCellGrid(grid) {
		const newGrid = [];
		grid.forEach((row, r) => { 
			newGrid[r] = [...row].reverse();
		});
		return newGrid;
	}
}
