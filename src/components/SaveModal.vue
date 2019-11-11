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
  <div v-else-if='type === `word`' class="save-modal">    
    <header>New word:</header>
    <input
    class='word-input'
    type='text'
    placeholder=''
    v-model='inputValue'
    />
    <div class='status-area'>
      <slot></slot>
    </div>
    <div class='save-button-area'>
      <Button
        id='cancel-button'
        :label="`Cancel`" :handleClick="handleClickCancelSave"
      />
      <Button
        class='save-button'
        :label="`Save`" :handleClick="() => handleSaveWord(inputValue)"
      />
    </div>
    <div class='pattern-label' v-if='problemPatterns.length'>
      Recent unmatched patterns:
    </div>
    <div class='patterns-area' v-if='problemPatterns.length'>
      <div 
        v-for='(pat, i) in problemPatterns.filter(pat => pat).sort((a, b) => b.quantity - a.quantity).sort((a, b) => a.pattern.length - b.pattern.length)' 
        :key='i'
        :class='pat.pattern.length > 8 ? `small` : ``'
      >
      {{ pat.pattern.replace(/\*/g, "_") }} ({{ pat.quantity }}) 
      </div>
    </div>
  </div>
  <div v-else-if='type === `clues`' class="clues save-modal">
    <header>Clues for "{{ wordObj.word.toUpperCase() }}"</header>
    <div class='clue-list'>
      <div class='clue' v-for='(clue, i) in wordObj.clues' :key='i'>
        {{ clue }}
        <Button :handleClick='handleDeleteClue' :label='`DELETE`' class='delete-clue-button'></Button>
      </div>
      <div :class='[`clue editable`, clueEdited && `edited`]'>
        <div contenteditable @input='handleClueInputChange' id='clue-edit-space'></div>
        <Button contenteditable='false'
          class='save-clue-button'
          :label='`Save`' :handleClick="() => handleSaveClue(wordObj, inputValue)"
        />
      </div>     
    </div>
    <div class='status-area'>
      <slot></slot>
    </div>
    <div class='save-button-area'>
      <Button
        class='save-button'
        :label="`Done`" :handleClick="handleClickCancelSave"
      />      
    </div>
  </div>
  <!-- <Spinner :direction='-1' />
  <div class='load-message'>loading...</div> -->
</template>

<script>
import Button from './Button';
import Spinner from './Spinner';

export default {
  name: 'SaveModal',
  data: () => ({
    inputValue: '',
    clueEdited: false
  }),
  props: {
    type: String,
    handleSaveDiagram: Function,
    handleSaveWord: Function,
    handleSaveClue: Function,
    handleDeleteClue: Function,
    handleClickCancelSave: Function,
    busy: Boolean,
    wordObj: Object,
    problemPatterns: Array
  },
  components: {
    Button,
    Spinner
  },
  methods: {
    handleNameChange(e, newValue) {
      this.inputValue = newValue;
    },
    handleClueInputChange(e) {
      const clueString = e.target.innerText;
      console.log('GOT', typeof clueString);
      this.clueEdited = clueString !== '';
      console.log('set edited to', (clueString.length))
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
  padding: calc(var(--main-padding) * 1.5) calc(var(--main-padding) * 3);
  transform: translate(-50%, 0);
  display: grid;
  justify-items: center;
  align-items: center;

  grid-template-rows:
    var(--header-height)
    calc(var(--header-height) * 1.25)
    calc(var(--header-height) / 2)
    calc(var(--header-height) * 1.5)
    auto
  ;
  grid-row-gap: var(--main-padding);
	box-shadow: 1px 1px calc(var(--main-padding) / 2) #00000099,
		-1px -1px calc(var(--main-padding) / 2) #00000099;
  z-index: 2;
  font-weight: bold;
  color: var(--main-text-color);
  border-radius: calc(var(--main-padding) / 4);
}
.clues.save-modal {
  grid-template-rows:
    var(--header-height)
    1fr
    calc(var(--header-height) / 2)
    var(--header-height)
    auto
  ;
}
header {
  font-size: 1.25rem;
  text-align: center;
}
.clue-list {
  width: 100%;
  max-height: 80vmin;
  display: flex;
  flex-direction: column;
  padding: var(--main-padding) 0;  
  overflow-y: auto;
}
.clue-list > div {
  font-weight: normal;
  text-align: left;
  border-radius: calc(var(--main-padding) / 4);
  background: #00000066;
  padding: var(--main-padding);  
}
.clue {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  margin: calc(var(--main-padding) / 2);  
  min-height: 100%;
  box-shadow: 0px 1px calc(var(--main-padding) / 4) #000000aa,
		-1px -1px calc(var(--main-padding) / 4) #000000aa;
}
.clue.editable {
  display: flex;
  justify-content: space-between;
  min-height: calc(var(--header-height) * 2);
  outline-color: green;
}
#clue-edit-space {
  flex-grow: 1;
  outline: none;
  word-wrap: break-word;
  text-transform: capitalize;
}
.clue.editable::after {
  content: 'Enter your new clue here';
  position: absolute;
  opacity: 0.5;
  display: flex;
  pointer-events: none; 
  transition: opacity 210ms ease;
  z-index: 0;
}
.clue.editable.edited::after, .clue.editable #clue-edit-space:focus::after {
  opacity: 0;
}
.clue > div.last-child {
  margin-bottom: 0;
}
.clue > div:first-child {
  grid-row-end: span 2;
}
.clue > button {
  grid-column-start: 2;
  padding: calc(var(--main-padding) / 2);
}
.delete-clue-button {
  background: var(--danger-color);
  grid-row-start: 2;
}
.save-clue-button {
  background: var(--success-color);
  z-index: 1;
  grid-row-start: 2;
  width: 14vmin;
  height: min-content;
  align-self: flex-end;
  font-size: 3.5vmin;
}
.status-area {
  font-size: 1rem;
  font-weight: 700;
}
.status-area.error {
  color: var(--danger-color);
}
.patterns-area {
  width: 100%;
  max-height: 100vmin;
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
}
.save-button {
  font-size: 1.5rem;
  padding: 0 var(--header-height);
  height: 100%;
}
#cancel-button {
  font-size: 1rem;
  padding: 0 calc(var(--header-height) / 2);
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
}
.word-input {  
  text-transform: uppercase;
}
</style>
