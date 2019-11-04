<template>
	<div 
    :class='[`cell`, selected && `selected`, highlighted && `highlighted`, violating && `violating`, shaded && `shaded`]'
    v-on:pointerdown='handleClick'
  >
    <div class='number'>{{ number }}</div>
    <div class='letter'>{{ letter }}</div>
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
    violating: Boolean,
    letter: '', 
    number: '',
    row: Number,
    column: Number,
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
.cell:before {
  content: '';
  position: absolute;
  width: inherit;
  height: inherit;
  background: var(--theme-word-color);
  /* border: calc(var(--cell-width) / 8) solid var(--theme-word-color); */
  /* display: none; */
  opacity: 0;
  pointer-events: none;
}
.cell:after {
  content: '';
  position: absolute;
  width: inherit;
  height: inherit;
  background: var(--theme-word-color-2);
  /* border: calc(var(--cell-width) / 8) solid var(--theme-word-color-2); */
  /* display: none; */
  opacity: 0;
  pointer-events: none;
}
/* .cell.shaded:before {
  opacity: 0.99
} */
.cell.shaded {
  background-color: var(--blank-color);
}
.cell.theme-word:before, .cell.theme-word-2:after {
  opacity: 0.25;
}
.cell.violating {
  background: rgba(255, 0, 0, 0.128);
}
.cell.highlighted {
  background:rgba(0, 128, 0, 0.27);
}
.cell.selected {
  /* background: #00ff0099 !important; */
  outline: calc(var(--cell-width) / 6) solid green;
}
.cell.shaded {
  /* background: var(--blank-color) !important; */
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
