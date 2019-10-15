<template>
	<div :class="[selected ? `mini-board selected` : `mini-board`]"
    :style='{
      gridTemplateRows: `repeat(${height}, 1fr)`,
      gridTemplateColumns: `repeat(${width}, 1fr)`
    }'
  >
		<div
			v-for='(cellData, i) in cellGrid.flat()'
			v-bind:key='i'
			:class='cellData.shaded ? `shaded` : ``'
		></div>
	</div>
</template>

<script>

export default {
  name: 'MiniBoard',
  props: {
    width: Number,
    height: Number,
    cellGrid: Array,
    selected: Boolean,
    onClickDiagram: Function
  }
};
</script>

<style scoped>
.mini-board {
	background: var(--cell-color);
	color: var(--blank-color);	
  width: calc((var(--board-size) - (var(--main-padding) * 3)) / 3);
  height: calc((var(--board-size) - (var(--main-padding) * 3)) / 3);
  display: grid;
  /* outline: calc(var(--board-size) / var(--cells-wide) / 12) solid var(--blank-color); */
}
.mini-board.selected {
  outline: calc(var(--main-padding) / 2) solid green;
}
.mini-board > div {
  outline: 1px solid var(--blank-color);
}
.mini-board > div.shaded {
  background: var(--blank-color);
}
@media (orientation: landscape) {
	@media (orientation: landscape) {
		.mini-board {
			
		}
	}
}
</style>
