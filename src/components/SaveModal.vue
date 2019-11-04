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
    <div id='save-button-area'>
      <Button
        id='cancel-button'
        :label="`Cancel`" :handleClick="handleClickCancelSave"
      />
      <Button
        id='save-button'
        :label="`Save`" :handleClick="() => handleSaveDiagram(inputValue)"
      />
    </div>
	</div>
  <div v-else-if='type === `word`' class="save-modal">
    <header>New word:</header>
    <input
    id='word-input'
    type='text'
    placeholder=''
    v-model='inputValue'
    />
    <div class='status-area'>
      <slot></slot>
    </div>
    <div id='save-button-area'>
      <Button
        id='cancel-button'
        :label="`Cancel`" :handleClick="handleClickCancelSave"
      />
      <Button
        id='save-button'
        :label="`Save`" :handleClick="() => handleSaveWord(inputValue)"
      />
    </div>
  </div>
  <div v-else-if='type === `clues`' class="save-modal">
    <header>Clues for "{{ wordObj.word.toUpperCase() }}"</header>
    <div class='clue-list'>
      <div class='clue' v-for='(clue, i) in wordObj.clues' :key='i'>
        {{ clue }}
        <Button :handleClick='handleDeleteClue' :label='`DELETE`' class='clue-delete-button'></Button>
      </div>
    </div>
    <input
      id='word-input'
      type='text'
      placeholder=''
      v-model='inputValue'
    />
    <div class='status-area'>
      <slot></slot>
    </div>
    <div id='save-button-area'>
      <Button
        id='cancel-button'
        :label="`Cancel`" :handleClick="handleClickCancelSave"
      />
      <Button
        id='save-button'
        :label="`Save`" :handleClick="() => handleSaveClue(wordObj, inputValue)"
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
  }),
  props: {
    type: String,
    handleSaveDiagram: Function,
    handleSaveWord: Function,
    handleSaveClue: Function,
    handleDeleteClue: Function,
    handleClickCancelSave: Function,
    busy: Boolean,
    wordObj: Object
  },
  components: {
    Button,
    Spinner
  },
  methods: {
    handleNameChange(e, newValue) {
      // this.inputValue = newValue;
    }
  }
};
</script>

<style scoped>
.save-modal {
  position: fixed;
  top: var(--main-padding);
  left: 50%;;
	background: var(--body-bg-color);
	color: var(--blank-color);
	width: 95%;
  padding: calc(var(--main-padding) * 1.5);
  transform: translate(-50%, 0);
  display: flex;
  flex-direction: column;
  align-items: stretch;
	box-shadow: 1px 1px calc(var(--main-padding) / 2) #00000066,
		-1px -1px calc(var(--main-padding) / 2) #00000066;
  z-index: 1;
  text-align: center;
  font-weight: bold;
  color: var(--main-text-color);
}
header {
  font-size: 1.5rem;
  margin-bottom: var(--main-padding);
}
.clue-list > div {
  font-weight: normal;
  text-align: left;
  border-radius: calc(var(--main-padding) / 4);
  background: #00000066;
  padding: var(--main-padding);
}
.clue {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  grid-row-gap: calc(var(--main-padding) / 2);
}
.clue > div:first-child {
  grid-row-end: span 2;
}
.clue > button {
  grid-column-start: 2;
  padding: calc(var(--main-padding) / 2);
}
.clue-delete-button {
  background: var(--danger-color);
  grid-row-start: 2;
}
.status-area {
  height: var(--header-height);
  font-size: 1rem;
  font-weight: 700;
}
.status-area.error {
  color: red;
}
#save-button-area {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: calc(var(--header-height) * 1.25);
  justify-self: flex-end;
  flex-grow: 1;
}
button {
  height: 100%;
}
#save-button {
  font-size: 1.5rem;
  padding: 0 var(--header-height);
  margin-left: var(--main-padding);
}
#cancel-button {
  font-size: 0.8rem;
  padding: 0 calc(var(--header-height) / 2);
  background: rgb(123, 124, 95)
}
input {
  padding: 0.5rem;
  margin: var(--main-padding);
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
#word-input {
  text-transform: uppercase;
}
</style>
