<template>
	<div class="rules-modal">
    <header>
      AUTO-GENERATION RULES
    </header>
    <div class='button-area'>
      <div class='mini-buttons'>
        <div class='label'>WORD LENGTHS</div>
        <div>Minimum: <input type='number' min='2' max='21' v-model='$store.state.puzzleOptions.rules.wordLengths.min' /></div>
        <div>Maximum: <input type='number' min='3' max='23' v-model='$store.state.puzzleOptions.rules.wordLengths.max' /></div>
      </div>
      <div class='slider-area'>
        <div>{{ $store.state.puzzleOptions.rules.blackRate }}% Black</div>
        <input
          id='diagram-slider'
          v-model="$store.state.puzzleOptions.rules.blackRate"
          :label="`blackRate`"
          type="range"
          min="5"
          max="90"
          step="1"
        />
      </div>

			<Button :label="`All Checked`" :handleClick="() => $store.state.puzzleOptions.rules.allChecked = !$store.state.puzzleOptions.rules.allChecked" :highlighted='$store.state.puzzleOptions.rules.allChecked' />
      <Button :label='`Contiguous`' :handleClick="() => $store.state.puzzleOptions.rules.contiguous = !$store.state.puzzleOptions.rules.contiguous" :highlighted='$store.state.puzzleOptions.rules.contiguous' />
    </div>
    <div id='rules-button-area'>
      <Button :label='`OK`' :handleClick='handleClickCloseRules' />
    </div>
  </div>
</template>

<script>
import Button from './Button';
import Slider from './Slider';

export default {
  name: 'RulesModal',    
  props: {    
    handleClickCloseRules: Function
  },
  components: {
    Button,
    Slider
  }
};
</script>

<style scoped>
.rules-modal {
  position: fixed;
  top: calc(var(--header-height) * 1.5);
  left: 50%;;
	background: var(--theme-color);
  color: var(--text-color);
	width: calc(100vw - var(--main-padding) * 4);
  /* height: calc(var(--view-height) - var(--main-padding) * 24); */
  padding: calc(var(--main-padding) * 2);
  transform: translate(-50%, 0);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  border-radius: calc(var(--main-padding) / 3);
	box-shadow: 1px 1px calc(var(--main-padding) / 2) #00000066,
		-1px -1px calc(var(--main-padding) / 2) #00000066;
  z-index: 1;
}
.rules-modal > * {
  /* outline: 1px solid red; */
}
header {
  padding-bottom: 4vh;
  font-size: 1.2rem;
}
input {
  text-align: center;
  font-family: inherit;
  font-weight: inherit;
  font-size: 1.5rem;
  font-weight: 700;
  margin: calc(var(--main-padding) / 2);
}
.slider-area {
  height: var(--header-height);
  /* background: red; */
  grid-row-start: 2;
  grid-column-end: span 2;
  width: 100%;
  display: flex;
  align-items: center;
}
.slider-area > div {
  text-align: right;
  font-weight: bold;
  width: 8rem;
  padding-right: var(--main-padding);
}
input[type='range'] {
  /* margin: var(--main-padding); */
  width: 100%;
  margin: 0;
}
button {
  border-width: calc(var(--main-padding) / 4);  
}
.button-area button.highlighted {
  background: rgb(103, 223, 105);
  color: var(--text-color);
  border-style: inset;
  opacity: 1;
}
.mini-buttons {
  width: 100%;
  grid-column-end: span 2;
  display: grid;
  grid-template-columns: min-content min-content;
  grid-template-rows: auto 1fr;
  grid-row-gap: var(--main-padding);
  font-size: 0.75rem;
  /* text-align: center; */
  justify-content: center;
  text-align: center;
  border: 2px solid #00000044;
  border-radius:  calc(var(--main-padding) / 3);
  padding: var(--main-padding);
}
.label {
  width: 100%;
  font-size: 1rem;
  grid-column-end: span 2;
  font-weight: 700;  
}
.button-area {
  display: grid;
  grid-template-columns: 1fr 1fr;
  flex-direction: column;
  justify-content: center;
  justify-items: center;
  align-items: center;
  align-content: center;
  grid-column-gap: var(--main-padding);
  grid-row-gap: var(--main-padding);
  width: 100%;
  flex-grow: 1;
}
.button-area button {
  width: 100%;
  height: calc(var(--header-height) * 1.25);
  font-size: 0.75rem;
  opacity: 0.75;
}
#rules-button-area {
  display: flex;
  align-self: stretch;
  padding: var(--header-height);
  padding-bottom: 0;
  justify-content: center;
  align-items: center;
  
}
#rules-button-area button, .button-area button {
  padding: 0 var(--main-padding);
}
#rules-button-area button {
  width: 60%;
  height: 100%;
  font-size: 1.5rem;
  padding: var(--main-padding);
}
</style>
