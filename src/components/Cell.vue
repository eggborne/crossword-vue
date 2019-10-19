<template>
	<div 
    :class='[`cell`, selected && `selected`, shaded && `shaded`]'
    v-on:pointerdown='handleClick'
  >
    <div class='number'>{{ number }}</div>
    <div class='letter'>{{ letter }}</div>
  </div>
</template>

<script>
export default {
  name: 'Cell',
  components: {},
  props: {
    shaded: Boolean,
    selected: Boolean,
    letter: '', 
    number: '',
    row: Number,
    column: Number,
    handleClick: Function
  }
};


</script>

<style scoped>
.cell {
	position: relative;
  outline: calc(var(--cell-width) / 24) solid var(--blank-color);  
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  width: var(--cell-width);
  height: var(--cell-height);
  max-height: var(--cell-height);
  padding: 0;
  /* transition: background 210ms ease; */
  z-index: 1;
}
.cell.selected {
  /* background: #00ff0099 !important; */
  outline: calc(var(--cell-width) / 6) solid green;
}
.cell.shaded {
  background: var(--blank-color) !important;
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
