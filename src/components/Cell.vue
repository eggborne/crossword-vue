<template>
	<div 
    :class='[`cell`, selected && `selected`, highlighted && `highlighted`, shaded && `shaded`]'
    v-on:pointerdown='handleClick'
  >
    <div data-html2canvas-ignore class='number'>{{ number }}</div>
    <div data-html2canvas-ignore class='letter'>{{ letter }}</div>
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
  outline: calc(var(--cell-width) / 24) solid var(--blank-color);  
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  width: var(--cell-width);
  height: var(--cell-height);
  max-height: var(--cell-height);
  padding: 0;
  z-index: 1;
}
.cell:before {
  content: '';
  position: absolute;
  width: inherit;
  height: inherit;
  background: rgba(0, 0, 255, 0.5);
  display: none;
}
.cell.highlighted:before {
  display: block;
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
