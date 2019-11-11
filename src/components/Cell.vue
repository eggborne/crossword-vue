<template>
	<div 
    :class='[
      `cell`, 
      selected && `selected`, 
      highlighted && `highlighted`, 
      themeWordAcross && `theme-word across`,
      themeWordDown && `theme-word down`,
      themeEnd,
      viable && `viable`, 
      violating && `violating`, 
      shaded && `shaded`      
    ]'
    v-on:pointerdown='handleClick'
  >
    <div class='number'>{{ number }}</div>
    <div :style='{ opacity: !(selected && $store.state.enteringLetters) ? 1 : 0.5 }' class='letter'>{{ letter }}</div>
    <!-- <div class='letter'>{{ !(selected && $store.state.enteringLetters) ? letter : '' }}</div> -->
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'Cell',
  components: {},
  props: {
    shaded: Boolean,
    selected: Boolean,
    highlighted: Boolean,
    viable: Boolean,
    violating: Boolean,
    letter: '', 
    number: '',
    row: Number,
    column: Number,
    themeWordAcross: Boolean,
    themeWordDown: Boolean,
    themeEnd: String,
    handleClick: Function
  },
  created() {

  }
};


</script>

<style scoped>
.cell {  
	position: relative;
  /* outline: calc(var(--cell-width) / 24) solid var(--blank-color);   */
  outline: 1px solid var(--blank-color);  
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  width: var(--cell-width);
  height: var(--cell-height);
  max-height: var(--cell-height);
  padding: 0;
  z-index: 1;
  text-transform: uppercase;  
}
.cell:not(.arrow-cell):after {
  content: '';
  position: absolute;
  width: inherit;
  height: inherit;
  display: none;
  pointer-events: none;
  border: calc(var(--cell-width) / 10) solid var(--highlight-outline-color);
}
.cell:before {
  content: '';
  position: absolute;
  width: inherit;
  height: inherit;
  opacity: 0;
  pointer-events: none;
}
/* .cell.shaded:before {
  opacity: 0.99
} */
.cell.shaded {
  background-color: var(--blank-color);
}
.cell.theme-word {
  z-index: 2;
}
.cell.theme-word:after {
  display: block;
}
.cell.theme-word.across:after {
  border-left-color: transparent;
  border-right-color: transparent;
}
.cell.theme-word.down:after {
  border-top-color: transparent;
  border-bottom-color: transparent;
}
.cell.theme-word.top:after {
  border-top-color: var(--highlight-outline-color);
}
.cell.theme-word.bottom:after {
  border-bottom-color: var(--highlight-outline-color);
}
.cell.theme-word.left:after {
  border-left-color: var(--highlight-outline-color);
}
.cell.theme-word.right:after {
  border-right-color: var(--highlight-outline-color);
}
.cell.violating {
  background: rgba(255, 0, 0, 0.2) !important;
  animation: none !important;
}
.cell.highlighted {
  background:rgba(0, 0, 128, 0.27);    
  animation: cell-pulse;
}

.cell.highlighted {
  animation-play-state: running;
  animation-iteration-count: infinite;
  animation-timing-function: ease;
  animation-fill-mode: forwards;
  animation-direction: alternate;
  animation-duration: 500ms;
}
.cell.viable {
  background: rgba(0, 128, 0, 0.27);
}
.cell.selected {
  /* background: #00ff0099 !important; */
  outline: calc(var(--cell-width) / 8) solid green;
  z-index: 4;
}
.cell.selected::after {  
  border-width: 0;
}
.cell > .number {
  position: absolute;
  top: 0; 
  left: calc(var(--cell-width) / 32);
  font-size: var(--cell-number-size);
  pointer-events: none;
}
.cell > .letter {
  padding: 0;
  font-size: calc(var(--cell-letter-size));  
  text-align: center;
  pointer-events: none;
}
@media (orientation: landscape) {
	@media (orientation: landscape) {
		.board {
			max-width: 60vw;
			max-height: 60vw;
		}
	}
}
</style>
