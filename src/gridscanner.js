/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable class-methods-use-this */
/* eslint-disable indent */
/* eslint-disable no-undef */

import DB from './api';
// require('./vkthread.min.js');

export default class GridScanner {
	constructor() {
		// this.net = new brain.NeuralNetwork();
	}

	async updateModel(attribute) {
		const startTime = window.performance.now();
		const modelJSONResponse = await DB.getAIModel(attribute);
		if (modelJSONResponse.data) {
			console.log('getAIModel got', modelJSONResponse.data.length);
			const parsedData = JSON.parse(modelJSONResponse.data);
			this.refreshModel(parsedData);
			console.error("got AI model in", window.performance.now() - startTime);
		} else {
			console.error('DIDN\'T GET AI MODEL :(');
		}
	}

	async getTrainingData(attribute) {
		let response;
		const startTime = window.performance.now();
		const trainingDataResponse = await DB.getAITrainingData(attribute);
		if (trainingDataResponse.data) {
			console.log('getAITrainingData got', trainingDataResponse.data.length);
			const parsedTrainingData = JSON.parse(trainingDataResponse.data);
			response = parsedTrainingData;
			console.error("got training data in", window.performance.now() - startTime);
		} else {
			console.error('DIDN\'T GET AI TRAINING DATA :(');
		}
		return response;
	}

	refreshModel(newModelJSON) {
		const startTime = window.performance.now();
		if (!this.net) {
			this.net = new brain.NeuralNetwork();
		}
		if (newModelJSON) {
			this.net.fromJSON(newModelJSON);
			console.error('Brain.js model refreshed in', window.performance.now() - startTime);
		} else {
			console.error('Brain.js model cleared in', window.performance.now() - startTime);
		}
	}

	trainScanner(ioArray) {
		const startTime = window.performance.now();
		// this.net.train(ioArray, {
		// 	iterations: 20000, // the maximum times to iterate the training data --> number greater than 0
		// 	errorThresh: 0.0075, // the acceptable error percentage from training data --> number between 0 and 1
		// 	log: true, // true to use console.log, when a function is supplied it is used --> Either true or a function
		// 	logPeriod: 5, // iterations between logging out --> number greater than 0
		// 	learningRate: 0.2, // scales with delta to effect training rate --> number between 0 and 1
		// 	momentum: 0.1, // scales with next layer's change value --> number between 0 and 1
		// 	callback: null, // a periodic call back that can be triggered while training --> null or function
		// 	callbackPeriod: 10, // the number of iterations through the training data between callback calls --> number greater than 0
		// 	timeout: Infinity, // the max number of milliseconds to train for --> number greater than 0
		// });
		this.net.train(ioArray, {
			iterations: 20000, // the maximum times to iterate the training data --> number greater than 0
			errorThresh: 0.01, // the acceptable error percentage from training data --> number between 0 and 1
			log: true, // true to use console.log, when a function is supplied it is used --> Either true or a function
			logPeriod: 1, // iterations between logging out --> number greater than 0
			learningRate: 0.1, // scales with delta to effect training rate --> number between 0 and 1
			momentum: 0.1, // scales with next layer's change value --> number between 0 and 1
			callback: null, // a periodic call back that can be triggered while training --> null or function
			callbackPeriod: 10, // the number of iterations through the training data between callback calls --> number greater than 0
			timeout: Infinity, // the max number of milliseconds to train for --> number greater than 0
		});
		console.warn("ran training in", window.performance.now() - startTime);
  }

	getGridAttribute(grid, attribute) {
		if (this.net) {
			
		}
		let actualAttr = attribute;
		if (attribute === 'offensive') {
			actualAttr = 'swastika';
		}
		const preparedGrid = this.getBinaryArray([...grid]);
		const flippedGrid = this.getBinaryArray(this.getFlippedCellGrid([...grid]));
		const result = this.net.run(preparedGrid)[actualAttr];
		const flippedResult = this.net.run(flippedGrid)[actualAttr];
		const higherResult = flippedResult > result ? flippedResult : result;		
		return parseFloat((higherResult * 100).toFixed(1));
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

	getFlippedCellGrid(grid) {
		const newGrid = [];
		grid.forEach((row, r) => {
			newGrid[r] = [...row].reverse();
		});
		return newGrid;
	}
}
