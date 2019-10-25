/* eslint-disable linebreak-style */
import axios from 'axios';

export default class DB {
  // static saveToLocalStorage(payload) {
  //   window.localStorage.setItem('cc-options', JSON.stringify({ [payload.name]: payload.value }));
  // }

  static getFullWordListOfLength(length) {
    return axios({
      method: 'post',
      url: 'https://api.eggborne.com/crossword/getwordlist.php',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        length
      },
    });
  }

  static checkIfDiagramExists(cellString) {
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
  }

  static saveDiagram(cellString, width, height, creator) {
    return axios({
      method: 'post',
      url: 'https://api.eggborne.com/crossword/savediagram.php',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        cells: cellString,
        width,
        height,
        creator,
      }
    });
  }

  static getAIModel(attribute) {
    return axios({
      method: 'post',
      url: 'https://api.eggborne.com/crossword/getaimodel.php',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        attribute
      }
    });
  }

  static saveAIModel(attribute, model) {
    console.log('sending', attribute, model.length);
    return axios({
      method: 'post',
      url: 'https://api.eggborne.com/crossword/saveaimodel.php',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        attribute,
        model
      }
    });
  }

  static saveAITrainingData(attribute, trainingData) {
    trainingData = JSON.stringify(trainingData);
    console.log('sending to attribute', attribute, trainingData.length);
    return axios({
      method: 'post',
      url: 'https://api.eggborne.com/crossword/saveaitrainingdata.php',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        attribute,
        trainingData
      }
    });
  }

  static getAITrainingData(attribute) {
    return axios({
      method: 'post',
      url: 'https://api.eggborne.com/crossword/getaitrainingdata.php',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        attribute
      }
    });
  }

  static removeDiagram(id) {
    return axios({
      method: 'post',
      url: 'https://api.eggborne.com/crossword/removediagram.php',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        id: parseInt(id)
      }
    });
  }

  static getDiagrams() {
    return axios({
      method: 'post',
      url: 'https://api.eggborne.com/crossword/getdiagrams.php',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded'
      }
    });
  }
}
