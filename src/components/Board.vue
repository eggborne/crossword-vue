<template>
	<div id='puzzle-board' class="board">
		<Cell
			v-for='(cellData, i) in gridArray'
			v-bind:key='i'
			:id='`cell-${i}`'
			:letter='cellData.letter'
			:number='cellData.number'
			:shaded='cellData.shaded'
			:selected='$store.state.editMode === `puzzle` && selectedCell && cellData === selectedCell'
			:violating='violatingCells.includes(i)'
			:highlighted='highlightedLetters.includes(cellData.index)'
			:class='[
				themeWords[0].map(a => a.letterIndexes).flat().includes(i) && `theme-word`,
				themeWords[1].map(a => a.letterIndexes).flat().includes(i) && `theme-word-2`
				]'
			:row='cellData.row'
			:column='cellData.column'
			:handleClick='handleCellClick'
		/>
		<Cell v-if='selectedCell !== undefined'
			:class='[`arrow-cell`, $store.state.editDirection]'		
			:style='{
				transform: `translate(calc(var(--cell-height) * ${selectedCell.column}), calc(var(--cell-height) * ${selectedCell.row})`,
				backgroundSize: selectedCell.number ? `80%` : `0%`
			}'
			:handleClick='() => null'
		>
		<input 
			v-if='$store.state.editMode === `puzzle` && this.$store.state.enteringLetters' 
			class='letter-input'
			type='text' 
			maxlength='1'
			autofocus='true'
			v-model='currentNewLetter'
			v-on:input='handleChangeLetter'
		/>
		</Cell>
	</div>
</template>

<script>
import Cell from "./Cell.vue";

export default {
	name: 'Board',
	data() {
		return {
			currentNewLetter: undefined
		}
	},
  props: {
		cellGrid: Array,
		selectedCell: Object,
		violatingCells: Array,
		highlightedWords: Array,
		handleCellClick: Function,
		changeLetter: Function,
		themeWords: Array
  },
  components: {
    Cell
	},
	computed: {
		gridArray() {
			return this.cellGrid.flat()	
		},
		highlightedLetters() {
			console.log('highl', this.highlightedWords)
			let indexList = [];
			if (this.selectedCell) {
				this.highlightedWords.forEach(wordObj => {
					indexList.push(...wordObj.letterIndexes);
				});
			}

			return indexList;
		}
	},
	methods: {
		handleChangeLetter(e) {
			this.changeLetter(e, this.selectedCell.index, this.currentNewLetter);
			this.currentNewLetter = '';
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
input.letter-input {
	position: absolute;
	width: 100%;
	height: 100%;
	pointer-events: all;
	text-transform: uppercase;
	text-align: center;
	font-family: inherit;
	font-weight: bold;
}
.arrow-cell {
	position: absolute;
	background-size: 80%;
	background-repeat: no-repeat;
	background-position: center;
	pointer-events: none;
	background-image: url('https://crosswords.cc/arrow.png');
	opacity: 0.5;
}
.arrow-cell.down {
	background-image: url('https://crosswords.cc/arrowdown.png');
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
