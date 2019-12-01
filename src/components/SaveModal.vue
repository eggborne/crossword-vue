<template>
	<div v-if='type === `diagram`' class="save-modal">
    <header>Creator:</header>
    <input
    id='name-input'
    type='text'
    placeholder='Leroy'
    v-model='inputValue'
    v-on:input='handleNameChange'
    />
    <div class='status-area'>
      <slot></slot>
    </div>
    <div>
      miniboard here
    </div>
    <div class='save-button-area'>
      <Button
        id='cancel-button'
        :label="`Cancel`" :handleClick="handleClickCancelSave"
      />
      <Button
        class='save-button'
        :label="`Save`" :handleClick="() => handleSaveDiagram(inputValue)"
      />
    </div>
	</div>
	<div v-else-if='type === `puzzle`' class="save-modal">
    <header>Creator:</header>
    <input
    id='name-input'
    type='text'
    placeholder='Leroy'
    v-model='inputValue'
    v-on:input='handleNameChange'
    />
    <div class='status-area'>
      <slot></slot>
    </div>
    <div>
      miniboard here
    </div>
    <div class='save-button-area'>
      <Button
        id='cancel-button'
        :label="`Cancel`" :handleClick="handleClickCancelSave"
      />
      <Button
        class='save-button'
        :label="`Save`" :handleClick="() => handleSaveDiagram(inputValue)"
      />
    </div>
	</div>

  <div v-else-if='type === `word` || type === `clues`' :class='`${type} save-modal`'>    
    <header v-if='type === `word`'>Enter word:</header>
    <input v-if='type === `word`'
      :class='[`word-input`, userWordInDB && `word-exists`]'
      type='text'
      placeholder=''
      v-model='inputValue'
      @input='handleTypedNewWord'
    />
    <div v-if='type === `word`' :class='[`status-area`, userWordInDB && `showing`]'>
      {{ statusMessage }}
    </div>
    <header v-if='type === `clues`'>{{ wordObj.word.toUpperCase() }}</header>
    <div :class='[`clue-list`, `user-word-info`]'>
      <CluePanel 
        :class='[true && `showing`, (userWordInDB && userWord.selectedClue === i) && `selected`]' 
        v-for='(clue, i) in clueList' 
        :key='clue'
        :doomed='doomedClue === clue'
        :selectClue='() => handleSelectClue(i)'
      >
        {{ clue !== `|none|` && clue }}
        <Button 
          :clickType='`click`'
          :handleClick='() => handleClickDeleteClue(userWord, i)' 
          :label='saving === `deletingClue` ? `Deleting...` : `DELETE`'
          class='delete-clue-button'
        />
      </CluePanel>
      <CluePanel 
        :class='[`clue editable`, clueEdited && `edited`, userWord && `showing`]'
        :editable='true'
        :selectClue='() => null'
      >
        <div contenteditable @input='handleClueInputChange' id='clue-edit-space'>
        </div>
          <div v-if='inputValue && userWord' :class='[`clue-edit-placeholder`]' >Enter clue for "{{ inputValue.toUpperCase() }}"</div>
          <div v-else :class='[`clue-edit-placeholder`]' >Enter clue here</div>
        <Button 
          :clickType='`click`'
          contenteditable='false'
          :class='[`save-clue-button`, (inputValue.length >= 3 && inputValue.length <= 20) ? `` : `disabled`]'
          :label='`Add`' :handleClick="handleClickSaveClue"
        />
      </CluePanel>

    </div>
    <div class='save-button-area'>
      <Button
      v-if='type === `word`'
        id='cancel-button'
        :label="`Cancel`" :handleClick="handleClickCancelSave"
      />
      <Button
        :clickType='`click`'
        :class='[`save-button`, (inputValue.length < 3 || inputValue.length > 20) && `disabled`]'
        :label="userWordInDB ? `Done` : `Save Word`" 
        :handleClick="userWordInDB ? handleClickCancelSave : () => handleSaveWord(inputValue)"
      />
    </div>
    <div class='pattern-label' v-if='type === `word` && problemPatterns.length'>
      Recent unmatched patterns:
    </div>
    <div class='patterns-area' v-if='type === `word` && problemPatterns.length'>
      <div 
        v-for='(pat, i) in problemPatterns.filter(pat => pat).sort((a, b) => b.quantity - a.quantity).sort((a, b) => a.pattern.length - b.pattern.length)' 
        :key='i'
        :class='pat.pattern.length > 8 ? `small` : ``'
      >
      {{ pat.pattern.replace(/\*/g, "_") }} ({{ pat.quantity }}) 
      </div>
    </div>
  </div>
  <!-- <Spinner :direction='-1' />
  <div class='load-message'>loading...</div> -->
</template>

<script>
import Button from './Button';
import Spinner from './Spinner';
import CluePanel from './CluePanel';

export default {
  name: 'SaveModal',
  data: () => ({
    inputValue: '',
    clueEdited: false,
    statusMessage: '',
    userWordInDB: false,
    userWord: undefined,
    doomedClue: undefined,
    saving: undefined
  }),
  props: {
    type: String,
    handleSaveDiagram: Function,
    handleSaveWord: Function,
    handleSaveClue: Function,
    handleDeleteClue: Function,
    fullWordList: Array,
    getWordList: Function,
    handleClickCancelSave: Function,
    lookUpWord: Function,
    busy: Boolean,
    wordObj: Object,
    problemPatterns: Array,
    wordsNeeded: Object
  },
  components: {
    Button,
    Spinner,
    CluePanel
  },
  mounted() {
    if (this.type === 'word') {
      
    }
    if (this.type === 'clues') {
      this.userWord = this.wordObj;
      this.inputValue = this.wordObj.word;
      this.userWordInDB = true;
    }
  },
  computed: {
    clueList() {
      if (this.type === 'word' && this.userWord) {
        return this.userWord.clues;
      }
      if (this.type === 'clues') {
        return this.wordObj.clues
      }
    }
  },
  methods: {
    async wait(ms) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, ms || 300)
      })
    },
    handleNameChange(e, newValue) {
      this.inputValue = newValue.replace(/[^a-z]/, '');  
    },
    handleSelectClue(newIndex) {
      console.log('selcgin', newIndex)
      this.userWord.selectedClue = newIndex;
    },
    async handleTypedNewWord(e) {
      console.log('e?', e)
      let newValue;
      if (!e) {
        newValue = this.userWord.word;
      } else {
         newValue = e.target.value;
      }
      if (newValue.length < 3 || newValue.length > 20) {
        console.log('out of ragne')
        if (this.userWord) {
          this.userWord = undefined;
          this.userWordInDB = false;
          // this.statusMessage = ``;
        }
        return;
      }
      let wordData;
      if (!this.fullWordList[newValue.length]) {
        console.error('CALLING DB FOR WORDS OF LENGTH', newValue.length);
        await this.getWordList(newValue.length);
      }
      wordData = await this.lookUpWord(newValue);
      if (wordData && wordData.data) {
        console.log('got raw', wordData.data)
        if (wordData.data.clues[0] === '[') {
          wordData.data.clues = JSON.parse(wordData.data.clues);
          wordData.data.clues.forEach((clue, i) => {
            if (clue) {
                console.log('checking', clue)
                wordData.data.clues[i] = clue.replace(/\|q\|/g, "'").replace(/\|qq\|/g, "\"");                 
              } else {
                console.error('SM EMPTY CLUE for', newValue)
              }
                            
          });
        } else {
          console.warn('wordData.data.clues was not an array, so wordData is now', wordData.data)
          if (wordData.data.clue) {
            wordData.data.clues = [wordData.data.clue]
          } else {
            wordData.data.clues = []
          }
        }

        let newWordObject = {
          id: parseInt(wordData.data.id),
          word: wordData.data.word,
          clues: wordData.data.clues,
          updated: wordData.data.updated,
          selectedClue: wordData.data.selectedClue
        }
        this.userWord = newWordObject;
        console.warn('made word object', newWordObject)
        this.userWordInDB = true;
        this.statusMessage = `IN DATABASE`
      } else {
        // word not in DB already
        this.userWord = newValue;
        if (this.userWordInDB) {
          this.userWordInDB = false;
          this.statusMessage = ``;
        }
      }     
    },
    handleClueInputChange(e) {
      const clueString = e.target.innerText;
      console.log('GOT', typeof clueString);
      this.clueEdited = clueString !== '';
      console.log('set edited to', (clueString.length))
    },
    async handleClickSaveClue() {
      this.saving = 'clue';
      const clue = document.getElementById('clue-edit-space').innerText;
      document.getElementById('clue-edit-space').innerText = '';
      // document.getElementById('clue-edit-space').innerText = 'Saving clue...';
      const fixedClue = clue[0].toUpperCase() + clue.substr(1);
      await this.handleSaveClue(this.userWord, fixedClue);
      this.saving = undefined;
      // await this.lookUpWord(this.userWord.word);
      // this.handleTypedNewWord();
      this.clueEdited = false;
    },
    async handleClickDeleteClue(wordObj, clueIndex) {
        this.doomedClue = wordObj.clues[clueIndex];
        await this.wait(1);
        await this.handleDeleteClue(wordObj, clueIndex);
        // await this.lookUpWord(this.userWord.word);
        // this.handleTypedNewWord();
        requestAnimationFrame(() => {
          wordObj.clues.splice(clueIndex, 1)
          this.doomedClue = undefined;
        });
    }
  }
};
</script>

<style scoped>
.save-modal {
  position: fixed;
  top: var(--main-padding);
  left: 50%;
	/* background: var(--body-bg-color); */
  background: #333333;
	color: var(--blank-color);
	width: 95%;
  padding: calc(var(--main-padding) * 1.5) calc(var(--main-padding) * 2.5);
  transform: translate(-50%, 0);
  display: grid;
  justify-items: center;
  align-items: center;

  transition: all 600ms ease;

  grid-template-rows:
    var(--header-height)
    var(--header-height)
    1fr
    auto
  ;
  /* grid-row-gap: var(--main-padding); */
	box-shadow: 1px 1px calc(var(--main-padding) / 2) #00000099,
		-1px -1px calc(var(--main-padding) / 2) #00000099;
  z-index: 2;
  font-weight: bold;
  color: var(--main-text-color);
  border-radius: calc(var(--main-padding) / 4);
}
.clues.save-modal {
  grid-template-rows: unset;
  grid-template-rows:
    var(--header-height)
    1fr
    calc(var(--header-height) * 1.5)
  ;
  grid-row-gap: 0px !important;
}
.user-word-info {
  display: flex;
  align-items: center;
  align-items: stretch;
}
.clue-list.user-word-info .clue {
  display: flex;
  justify-content: space-between;
}
.clue-list.user-word-info .clue-edit-space {
  height: unset;
}

header {
  font-size: 1.5rem;
  text-align: center;
}
.clue-list {
  width: 100%;
  height: min-content;
  display: flex;
  flex-direction: column;
  padding: calc(var(--main-padding)) 0; 
  margin-top: calc(var(--main-padding) * 1.5);
  box-sizing: content-box;
  overflow-x: hidden;
  overflow-y: auto;
}
.clues .clue-list {
  margin: 0;
}
.clue-edit-placeholder {
  position: absolute;
  opacity: 0.5;
  display: flex;
  width: 65%;
  pointer-events: none; 
  transition: opacity 210ms ease;
  flex-wrap: wrap;
}
.clue-edit-placeholder.showing {
  opacity: 0.5;
}

.clue-list > div {
  font-weight: normal;
  text-align: left;
  border-radius: calc(var(--main-padding) / 6);
  background: #00000066;
  padding: var(--main-padding);
}

.status-area {
  position: absolute;
  top: 0; 
  left: 0;
  font-size: 1rem;
  font-weight: 700;
  transform: translate(-50%, 0);
  left: 50%;
  color: var(--success-color);
  top: calc(var(--main-padding) * 1.75 + var(--header-height) * 2);
  opacity: 0;
  transition: opacity 300ms ease;
}
.status-area.error {
  color: var(--danger-color);
}
.patterns-area {
  width: 100%;
  max-height: 50vmin;
  padding: var(--main-padding) 0;
  text-transform: uppercase;
  font-size: 0.8rem;
  display: grid;
  grid-template-columns: 0.33fr 0.34fr 0.33fr;
  grid-auto-rows: auto;
  grid-row-gap: 0.2rem;
  /* grid-column-gap: 1vw; */
  letter-spacing: 0.1rem;
  justify-items: center;
  justify-content: center;
  overflow-y: scroll;
  border: 1px solid #00000066;
  border-radius: inherit;
}
.patterns-area > div.small {
  font-size: 0.6rem;
}
.pattern-label {
  display: flex;
  align-items: flex-end;
  align-self: stretch;
  margin-top: 4vh;
}
.save-button-area {
  display: flex;
  width: 100%;
  height: calc(var(--header-height) * 1.25);
  justify-content: space-evenly;
  align-items: flex-end;
  padding: var(--main-padding);
  box-sizing: content-box;
}
.save-button {
  flex-grow: 0.8;
  margin-left: calc(var(--main-padding) * 2);
  font-size: 1.25rem;
  height: 100%;
}
.clues .save-button {
  margin: 0;
  flex-grow: 0.5;
}
#cancel-button {
  font-size: 1rem;
  padding: 0 var(--main-padding);
  height: 80%;
  background: rgb(123, 124, 95)
}
input {
  text-align: center;
  background: var(--cell-color);
  color: var(--blank-color);
  font-size: 1.5rem;
  font-family: inherit;
  font-weight: bold;
  height: 2.25rem;
  box-shadow: 1px 1px 2px #00000066,
		-1px -1px 2px #00000066;
  border-radius: calc(var(--main-padding) / 4);
}
.word-input {  
  text-transform: uppercase;
}
.word-input.word-exists {
  background: rgb(190, 243, 181);
}
.showing {
  opacity: 1;
}
</style>
