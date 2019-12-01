<template>	
  <div class="choices-modal">
    <header>Choices for {{ selectedWord.number }} {{ selectedWord.direction }}</header>
    <div class='choices-list'>
      <div class='choice-listing' v-for='(word, i) in selectedWord.choices' :key='i'>
        {{ word.word.toUpperCase() }}
        <!-- {{ word.clues.length ? word.clues[word.selectedClue] : word.clue ? word.clue : 'no clue' }} -->
      </div>
      <div v-if='!selectedWord.choices.length'>(no choices)</div>
      <!-- <h3>Across:</h3>
      <div class='choice-listing' v-for='(wordSpaceObj, i) in wordsNeeded.across.sort((a, b) => a.number - b.number )' :key='i'>
        {{ wordSpaceObj.number }} - {{ wordSpaceObj.word }} ({{ wordSpaceObj.choices.length }}) 
      </div>
      <h3>Down:</h3>
      <div class='choice-listing' v-for='(wordSpaceObj, k) in wordsNeeded.down.sort((a, b) => a.number - b.number )' :key='(k+1) * 1000'>
        {{ wordSpaceObj.number }} - {{ wordSpaceObj.word }} ({{ wordSpaceObj.choices.length }}) 
      </div> -->
    </div>
    <div id='choices-button-area'>
      <Button
        id='cancel-button'
        :label="`OK`" :handleClick="handleClickDone"
      />     
    </div>
  </div>
</template>

<script>
import Button from './Button';

export default {
  name: 'ChoicesModal',
  props: {
    selectedWord: Object,
    wordsNeeded: Object,
    triedWordOptions: Object,
    handleClickDone: Function
  },
  components: {
    Button
  }
};
</script>

<style scoped>
.choices-modal {
  position: fixed;
  top: var(--main-padding);
  left: 50%;
  background: #333333;
	color: var(--blank-color);
	width: 95%;
  height: var(-board-height);
  padding: calc(var(--main-padding) * 1.5);
  transform: translate(-50%, 0);
  display: grid;
  align-items: center;
  justify-content: stretch;

  grid-template-rows:
    var(--header-height)
    1fr
    calc(var(--header-height) * 1.5)
  ;
  grid-row-gap: var(--main-padding);
	box-shadow: 1px 1px calc(var(--main-padding) / 2) #00000099,
		-1px -1px calc(var(--main-padding) / 2) #00000099;
  z-index: 4;
  font-weight: bold;
  color: var(--main-text-color);
  border-radius: calc(var(--main-padding) / 4);
}
header {
  font-size: 1.25rem;
  text-align: center;
}
.choices-list {
  overflow-y: auto;
  max-height: 100vmin;
}
.choice-listing {
  margin: var(--main-padding);
}
#choices-button-area {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: space-evenly;
  align-items: flex-end;
}
#cancel-button {
  font-size: 1rem;
  padding: 0 calc(var(--header-height) / 2);
  height: 80%;
  background: rgb(123, 124, 95)
}
</style>
