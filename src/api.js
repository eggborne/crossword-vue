/* eslint-disable linebreak-style */
import axios from 'axios';

export default class DB {
  // static saveToLocalStorage(payload) {
  //   window.localStorage.setItem('cc-options', JSON.stringify({ [payload.name]: payload.value }));
  // }

  // static async discoverWords(length, quantity) {
  //   console.log("getting words of length " + length);
  //   let discovered = [];
  //   const words = await fetch(`https://api.wordnik.com/v4/words.json/randomWords?minCorpusCount=0&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=${length}&maxLength=${length}&sortBy=count&limit=500&api_key=e8f4853623a879a93e24c7a25dd0d2c0c43f5ca0720271190`);
  //   const list = await words.json();
  //   console.log('list ----->', list);
  //   if (list.message) {
  //     discovered = undefined;
  //   } else {
  //     list.forEach(wordObj => {
  //       discovered.push(wordObj.word);
  //     });
  //   }
  //   return discovered;

    // $.getJSON(
    //   "http://api.wordnik.com:80/v4/words.json/randomWords?hasDictionaryDef=true&minCorpusCount=120&maxCorpusCount=-1&minDictionaryCount=9&maxDictionaryCount=-1&minLength=" + length + "&maxLength=" + length + "&limit=1000&api_key=e8f4853623a879a93e24c7a25dd0d2c0c43f5ca0720271190",
    //   function (data) {
    //     // console.log(data)
    //     // for (var w=0;w<data.length;w++) {
    //     //     var word = data[w].word

    //     //     if (compiledWordList.indexOf(word) === -1) {
    //     //         compiledWordList.push(word)
    //     //         getWordData(word)
    //     //     } else {
    //     //         console.log("duplicate word " + word + " not added!")
    //     //         duplicates++
    //     //     }

    //     // }
    //     if (data) {
    //       var word = data[randomInt(0, data.length - 1)].word
    //       word = word.toLowerCase()
    //       if (sortedWords[word.length].indexOf(word) === -1) {
    //         // getWordData(word)

    //         console.log("got " + word)
    //         compiledWordList.push(word)
    //         sortedWords[word.length].push(word)
    //         addedWords.push(word)
    //       } else {
    //         // console.log("rejecting duplicate " + word)
    //         duplicates++
    //       }
    //       return data
    //     }

    //   }

    // );

  // }

  static saveWord(word) {
    return axios({
      method: 'post',
      url: 'https://api.eggborne.com/crossword/saveword.php',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        word,
        length: word.length.toString()
      }
    });
  }

  static saveClue(word, clues) {
    console.warn('saving clues for', word);
    console.warn(clues);
    let preparedClues = [];
    clues.forEach((clue, i) => {
      preparedClues[i] = clue.replace(/'/g, "|q|").replace(/"/g, "|qq|");
    });
    preparedClues = JSON.stringify(preparedClues);
    const length = word.length.toString();
    const author = 'Leroy';
    const date = `${author}-${Date.now().toString()}`;

    console.log('SENDING', word, length, clues, author, date);

    return axios({
      method: 'post',
      url: 'https://api.eggborne.com/crossword/saveclue.php',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        word,
        length,
        clues: preparedClues,
        author,
        date
      }
    });
  }

  static removeClue(wordObj, clueIndex) {
    console.warn('removing clue', clueIndex, 'of', wordObj.word);
    const { word } = wordObj;
    let preparedClues = [];
    wordObj.clues.forEach((clue, i) => {
      if (i !== clueIndex) {
        preparedClues.push(clue.replace(/'/g, "|q|").replace(/"/g, "|qq|"));
      }
    });
    preparedClues = JSON.stringify(preparedClues);
    const length = word.length.toString();
    const clues = preparedClues;
    const author = 'Leroy';
    const date = `${author}-${Date.now().toString()}`;
    

    console.log('SENDING REDUCED CLUE ARRAY', word, length, clues, author, date);

    return axios({
      method: 'post',
      url: 'https://api.eggborne.com/crossword/saveclue.php',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        word,
        length,
        clues,
        author,
        date
      }
    });
  }

  static getSingleWord(word) {
    console.warn('getSingleWording', word)
    return axios({
      method: 'post',
      url: 'https://api.eggborne.com/crossword/getsingleword.php',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        word,
        length: word.length.toString()
      },
    });
  }

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
