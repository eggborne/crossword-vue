<template>
  <div id='dictionary-screen' :class='[`dictionary-screen`]'>
    <header>DICTIONARY&nbsp;<small>({{ totalWords }} total)</small></header>
    <div v-if='$store.state.dictionaryOptions.filterBy === 0' class='letter-select'>
      <Button 
        v-for='letter in alphabet'
        :key='letter'
        :label='letter'
        :handleClick='() => changeDictionaryViewLetter(letter)'
        :highlighted='$store.state.dictionaryOptions.viewLetter === letter'
      />
    </div>
    <div v-else-if='$store.state.dictionaryOptions.filterBy === 1' class='length-select'>
      <Button 
        v-for='length in wordLengths'
        :key='length'
        :label='`${length}`'
        :handleClick='() => changeDictionaryViewLength(length)'
        :highlighted='$store.state.dictionaryOptions.viewLength === length'
      />
    </div>
    <span v-if='gotList'>
    <div v-if='$store.state.dictionaryOptions.filterBy === 0' class='dictionary-list letter'>
      <div class='length-list' v-for='(lengthList, i) in lengthLists' :key='`len-${i}`'>
        <h3>{{ `${lengthList[0].word.length}-LETTER "${$store.state.dictionaryOptions.viewLetter}" WORDS` }}</h3>
        <div :id='`letter-list-${f}`' class='letter-section' 
          v-for='(firstLetterList, f) in sortedSubLists(lengthList)'
          :key='`first-${f}`'
        >
          <span :class='[`word`, (wordObj.clue || wordObj.clues.length) && `clued`]' v-for='wordObj in firstLetterList' :key='wordObj.id'>        
            {{ wordObj.word }}
          </span>
        </div>
      </div>
    </div>
    <div v-else-if='$store.state.dictionaryOptions.filterBy === 1' class='dictionary-list length'>
      <div class='length-list' v-for='(lengthList, i) in lengthLists' :key='`long-len-${i}`'>
        <h3>{{ `${lengthList[0].word.length}-LETTER WORDS` }}</h3>
        <div :id='`letter-list-${f}`' class='letter-section' 
          v-for='(firstLetterList, f) in sortedSubLists(lengthList)'
          :key='`first-${f}`'
        >
          <span :class='[`word`, (wordObj.clue || wordObj.clues.length) && `clued`]' v-for='wordObj in firstLetterList' :key='wordObj.id'>        
            {{ wordObj.word }}           
          </span>
        </div>
      </div>
    </div>
    </span>
    <span v-else>
      <h2 class='dictionary-loading'>Loading...</h2>
    </span>
  </div>
</template>

<script>
import Button from './Button.vue';
export default {
  name: 'DictionaryScreen',
  data: () => ({
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    wordLengths: ['3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20'],
    observer: undefined,
    gotList: false
  }),
  props: {
    fullWordList: Array,
    scrabbleScores: Object,
    totalWords: Number,
    getFullWordList: Function
  },
  components: {
    Button
  },
  computed: {
    lengthLists() {
      let filterType = this.$store.state.dictionaryOptions.filterBy;
      let sortType = this.$store.state.dictionaryOptions.sortBy;
      let lists = this.fullWordList.filter(
        (list, i) => list && list.length
      );
      if (filterType === 0) {
        let showLetter = this.$store.state.dictionaryOptions.viewLetter;
        lists.forEach(list => {
          list = list.filter(word => word[0] === showLetter)
        })
      } else if (filterType === 1) {
        let showLength = this.$store.state.dictionaryOptions.viewLength;
        lists = [ this.fullWordList[showLength] ]
      }
      console.warn('lengthLists returning list length of', lists.length)
      return lists
    }
  },
  async mounted() {
     if (this.fullWordList.length === 0) {
        console.error('no word list!');
        await this.getFullWordList();
        this.gotList = true;
        this.changeDictionaryViewLetter('A');
      }
    
    // requestIdleCallback(() => {
    //   if (!this.observer && document.getElementById('dictionary-screen')) {
        
    //     let options = {
    //       root: document.querySelector('#dictionary-list'),
    //       rootMargin: '0px',
    //       threshold: 0
    //     }
    //     let callback = (e) => {
    //       e.forEach(el => {
    //         if (el.isIntersecting) {
    //           // el.target.style.opacity = 1;
    //           el.target.classList.add('visible');
    //         } else {
    //           // el.target.style.opacity = 0;
    //           el.target.classList.remove('visible');
    //         }
    //       })
    //     }
    //     console.log('mounted made osv on',document.getElementById('dictionary-screen') )
    //     this.observer = new IntersectionObserver(callback, options);
    //   }
    //   if (this.observer) {
    //     Array.from(document.querySelectorAll('.letter-section')).forEach(sec => {
    //       this.observer.observe(sec);
    //     })
    //   } 
     
    // })
  },
  async updated() {    
    // if (!this.observer && document.getElementById('dictionary-screen')) {
    //   let options = {
    //     root: document.getElementById('dictionary-list'),
    //     rootMargin: '0px',
    //     threshold: 1
    //   }
    //   let callback = (e) => {
    //     e.forEach(el => {
    //       if (el.isIntersecting) {
    //         // el.target.style.opacity = 1;
    //         el.target.classList.add('visible');
    //       } else {
    //         // el.target.style.opacity = 0;
    //         el.target.classList.remove('visible');
    //       }
    //     })
    //   }
    //   console.log('updated made osv on',document.getElementById('dictionary-screen') )
    //   this.observer = new IntersectionObserver(callback, options);
    // }
    // if (this.observer) {
    //   console.log('observer!', this.observer)
    //   Array.from(document.querySelectorAll('.letter-section')).forEach(sec => {
    //     this.observer.observe(sec);
    //   })
    // }
  },
  methods: {
    changeDictionaryViewLetter(newValue) {
			console.log('changeDictionaryViewLetter got', newValue)
			this.$store.commit('setDictionaryViewLetter', newValue)
		},
    changeDictionaryViewLength(newValue) {
      console.log('changeDictionaryViewLength got', newValue)
      // if (!this.fullWordList[newValue]) {
      //   await this.getWordList(newValue)
      // }
			this.$store.commit('setDictionaryViewLength', newValue)
		},
    // lengthLists() {
    //   let filterType = this.$store.state.dictionaryOptions.filterBy;
    //   let showLetter = this.$store.state.dictionaryOptions.viewLetter;
    //   console.log('filterType is', filterType)
    //   let lists = this.fullWordList.filter(
    //     (list, i) => list && list.length
    //   );
    //   console.log('lists', lists)
    //   console.log('showletter', showLetter)
    //   // lists = lists.filter(
    //   //   (list, i) => (filterType === 0 && list[0].word[0].toUpperCase() === showLetter.toUpperCase()) || (filterType === 1 && list[0].word.length == this.$store.state.dictionaryOptions.viewLength)
    //   // );
    //   console.warn('made lists length', lists.length)
    //   console.warn(lists)
    //   return lists
    // },
    scrabbleScore(word) {
      let score = 0
      for (var c=0; c<word.length ;c++) {
        var char = word[c];
        score += this.scrabbleScores[char]
      }
      return score
    },
    fullScrabbleLengthList(length) {
      let list = [];
      let listArr = this.lengthLists().flat();
      listArr.forEach(wordObj => {
        if (!wordObj.word) {
          console.error('ano got one', wordObj)
        } else {
          list.push(wordObj);
        }
      });
      list.sort((a, b) => this.scrabbleScore(a.word) - this.scrabbleScore(b.word));
      console.log('list is?', list)
      return list;
    },
    sortedSubLists(list) {
      let currentSort = this.$store.state.dictionaryOptions.sortBy;
      let filterType = this.$store.state.dictionaryOptions.filterBy;
      if (filterType === 1) {
        if (currentSort === 0) {
          // list.sort((a, b) => this.alphabet.indexOf(a.word[0]) - this.alphabet.indexOf(b.word[0]));
          return this.sortedListsByLetter(list);
        } else if (currentSort === 1) {
          return this.sortedListsByScrabbleScore(list);
          // list.sort((a, b) => this.scrabbleScore(a.word) - this.scrabbleScore(b.word));
        } else if (currentSort === 2) {
          list.sort((a, b) => (a.clues.length) - (b.clues.length));
        }
      } else if (filterType === 0) {
        if (currentSort === 0) {
          return this.sortedListsByLetter(list);
        } else if (currentSort === 1) {
          return this.sortedListsByScrabbleScore(list)
        }
      }
    },
    sortedListsByLetter(list) {
      console.warn('CALLING sortedListsByLetter on', list)
      let sortedLists = [];
      let filterType = this.$store.state.dictionaryOptions.filterBy;
      let viewLetter = this.$store.state.dictionaryOptions.viewLetter;
      let sortBy = this.$store.state.dictionaryOptions.sortTypes[this.$store.state.dictionaryOptions.sortBy].labelText;
      let letterSelection = this.alphabet.split('').filter(letter => (filterType === 1 || viewLetter === letter));
      letterSelection.forEach(letter => {
        let wordObjList = list;
        // if (filterType === 0) {
          wordObjList = wordObjList.filter(w => w.word[0] === letter)
        // }
        let wordStringArray = [];
        if (wordObjList.length) {
          wordObjList.forEach(wordObj => {           
            wordStringArray.push(wordObj.word);
          });
          wordStringArray.sort();             
          wordObjList.sort((a, b) => wordStringArray.indexOf(a.word) - wordStringArray.indexOf(b.word))
          sortedLists.push(wordObjList);
        }
      });
      return sortedLists;
    },
    sortedListsByScrabbleScore(list) {
      let sortedLists = [];
      let filterType = this.$store.state.dictionaryOptions.filterBy;
      let viewLetter = this.$store.state.dictionaryOptions.viewLetter;
      let letterSelection = this.alphabet.split('').filter(letter => (filterType === 1 || viewLetter === letter));
      letterSelection.forEach(letter => {
        let wordObjList = list;
        // if (filterType === 0) {
          wordObjList = wordObjList.filter(w => w.word[0] === letter)
        // }
        let wordStringArray = [];
        if (wordObjList.length) {
          wordObjList.forEach(wordObj => {           
            wordStringArray.push(wordObj);
          });
          wordStringArray.sort((a, b) => this.scrabbleScore(a.word) - this.scrabbleScore(b.word));
          wordObjList.sort((a, b) => wordStringArray.indexOf(a) - wordStringArray.indexOf(b))          
          sortedLists.push(wordObjList);
        }
      });
      return sortedLists;
    }
  } 
};
</script>

<style scoped>
.dictionary-screen {
  color: white;
  font-weight: bold;
  width: 100%;
  flex-grow: 1;
  justify-self: flex-start;
  position: relative;
  background-color: #222;
}
small {
  font-size: 0.8rem;
}
header {
  position: fixed;
  font-size: 1.5rem;
  text-align: center;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #222;
  /* padding: var(--main-padding) 0; */
  height: calc(var(--header-height) * 1.5);
  z-index: 2;
}
.letter-select, .length-select {
  position: fixed;
  width: calc(var(--header-height) * 2);
  height: calc(100% - (var(--header-height) * 4.5) - var(--main-padding) * 2);
  right: 0;
  top: calc(var(--header-height) * 2.5);
  display: grid;
  grid-template-rows: repeat(13, 1fr);
  grid-template-columns: 1fr 1fr;
  background: inherit;
  z-index: 2;
  /* padding: var(--main-padding); */
}
.letter-select > button {
  width: auto;
  border-width: 1px;
}
.length-select {
  grid-template-rows: repeat(18, 1fr);
  grid-template-columns: 1fr;
}
#all-letters-button {
  grid-row-end: span 2;
}
.dictionary-list, .dictionary-loading {
  margin-top: calc(var(--header-height));
  padding: calc(var(--main-padding) * 2);
  padding-right: var(--main-padding);
  width: calc(100% - var(--header-height) * 2)
}
.dictionary-loading {
  text-align: center;
}
h3 {
  font-size: 1rem;
  width: 100%;
  text-align: left;
  color: rgb(241, 245, 185);
  margin: var(--main-padding);
  margin-top: 0;
}
.length-list {
  display: flex;
  flex-direction: column;
  /* flex-wrap: wrap; */
  margin-bottom: 4vh;
}
.letter-section {
  display: flex;
  flex-wrap: wrap;
  padding: 0.5rem;
  font-size: 0.75rem;
  transition: opacity 300ms ease;
}

.letter-section:not(.visible) {
  /* visibility: hidden; */
  /* opacity: 0; */
}
.dictionary-list .word {
  padding-right: 0.3rem;
}
.dictionary-list .word:not(.clued) {
  color: rgb(255, 210, 210);
}

@media screen and (orientation: landscape) {
	.letter-select, .length-select {
    width: auto;
    height: calc(var(--header-height) * 1.375);
    grid-template-columns: repeat(13, 1fr);
    grid-template-rows: 1fr 1fr;
    top: calc(var(--header-height) * 2.5);
  }
  .length-select {    
    grid-template-columns: repeat(9, 1fr);
    grid-template-rows: 1fr 1fr;
    height: calc(var(--header-height) * 1.5);
  }
  .length-select > button {
    width: calc((100vw - 100vh) / 9);
    padding: 0.1rem;
  }
  .letter-select > button {
    width: calc((100vw - 100vh) / 13);
  }
}
</style>
