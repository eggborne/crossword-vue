<template>
	<div id='puzzle-board' class="board">
		<Cell
			v-for='(cellData, i) in gridArray'
			v-bind:key='i'
			:id='`cell-${i}`'
			:letter='cellData.letter'
			:number='cellData.number'
			:shaded='cellData.shaded'
			:selected='$store.state.editMode === `puzzle` && i === selectedCellIndex'
			:violating='violatingCells.includes(i)'
			:highlighted='false'
			:row='cellData.row'
			:column='cellData.column'
			:handleClick='handleCellClick'
		/>
	</div>
</template>

<script>
import Cell from "./Cell.vue";

export default {
  name: 'Board',
  props: {
		cellGrid: Array,
		violatingCells: Array,
    selectedCellIndex: Number,
    handleCellClick: Function
  },
  components: {
    Cell
	},
	computed: {
		gridArray() {
			return this.cellGrid.flat()	
		} 
	}
};
</script>

<style scoped>
.board {
	background: var(--cell-color);
	color: var(--cell-text-color);
	width: var(--board-size);
  min-height: var(--board-size);
	max-height: var(--board-size);
	display: grid;
	grid-template-rows: repeat(var(--cells-wide), 1fr);
	grid-template-columns: repeat(var(--cells-high), 1fr);
	/* box-shadow: 1px 1px calc(var(--main-padding) / 2) #00000066,
		-1px -1px calc(var(--main-padding) / 2) #00000066; */
	outline: calc(var(--board-size) / var(--cells-wide) / 12) solid
		var(--blank-color);
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
