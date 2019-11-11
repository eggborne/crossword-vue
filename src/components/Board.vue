<template>
	<div id='puzzle-board' :class='[`board`, this.$store.state.editMode, this.$store.state.enteringLetters && `entering-letters`]'>
		<Cell
			v-for='(cellData, i) in gridArray'
			v-bind:key='i'
			:id='`cell-${i}`'
			:letter='cellData.letter'
			:number='cellData.number'
			:shaded='cellData.shaded'
			:selected='$store.state.editMode === `puzzle` && selectedCell && cellData === selectedCell'
			:violating='violatingCells.includes(cellData.index)'
			:highlighted='
				highlightedLetters.across.includes(cellData.index) ||
				highlightedLetters.down.includes(cellData.index)
			'
			:viable='viableLetters.includes(cellData.index)'
			:themeWordAcross='themeWordAcross(cellData)'
			:themeWordDown='themeWordDown(cellData)'
			:themeEnd='themeEnd(cellData)'
			:row='cellData.row'
			:column='cellData.column'
			:handleClick='handleCellClick'
		/>
		<Cell v-if='selectedCell !== undefined'
			:class='[`arrow-cell`, $store.state.editDirection]'		
			:style='{
				transform: `translate(calc(var(--cell-height) * ${selectedCell.column}), calc(var(--cell-height) * ${selectedCell.row})`,
			}'
			:handleClick='() => null'
		>
			<img :class='[`arrow`, $store.state.enteringLetters ? `entering-letters` : ``]' 
				src='https://crosswords.cc/arrow.png'
				:style='{ 
					transform: ($store.state.editDirection === `down`) ? `rotate(90deg)` : ``,
					opacity: selectedCell && (selectedCell.number || $store.state.enteringLetters) ? `0.5` : `0`
				}'
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
		viableWords: Array,
		highlightedWords: Object,
		handleCellClick: Function,
		themeWords: Object
  },
  components: {
    Cell
	},
	computed: {
		gridArray() {
			return this.cellGrid.flat()	
		},
		highlightedLetters() {
			let indexLists = { across: [], down: [] };
			if (this.$store.state.enteringLetters) {
				return indexLists;
			}
			if (this.selectedCell) {
				for (let direction in this.highlightedWords) {
					let indexList =  this.highlightedWords[direction];
					indexList.forEach(wordObj => {
						if (wordObj) {
							indexLists[direction].push(...wordObj.letterIndexes);
						} else {
							console.error('Board.computed.highlightedLetters found bad wordObj')
						}
					});					
				}
			}
			return indexLists;
		},		
		
		viableLetters() {
			let indexList = [];
			if (this.selectedCell) {
				this.viableWords.forEach(wordObj => {
					indexList.push(...wordObj.letterIndexes);
				});
			}
			return indexList;
		}
	},
	methods: {
		themeWordAcross(cellData) {
			let acrossWords = this.themeWords.across;
			for (let i = 0; i < acrossWords.length; i += 1) {
				let wordObj = acrossWords[i]
				if (cellData && wordObj.letterIndexes.includes(cellData.index)) {
					return true;
				}
			}
			return false;
		},
		themeWordDown(cellData) {
			let downWords = this.themeWords.down;
			for (let i = 0; i < downWords.length; i += 1) {
				let wordObj = downWords[i];
				if (cellData && wordObj.letterIndexes.includes(cellData.index)) {
					return true;
				}
			}
			return false;
		},
		themeEnd(cellData) {
			let cellClass = [];
			this.themeWords.across.forEach(wordSpaceObj => {
				if (cellData.index === wordSpaceObj.letterIndexes[0]) {
					cellClass.push('left')
				}
				if (cellData.index === wordSpaceObj.letterIndexes[wordSpaceObj.letterIndexes.length - 1]) {
					cellClass.push('right')
				}
			});
			this.themeWords.down.forEach(wordSpaceObj => {
				if (cellData.index === wordSpaceObj.letterIndexes[0]) {
					cellClass.push('top')
				}
				if (cellData.index === wordSpaceObj.letterIndexes[wordSpaceObj.letterIndexes.length - 1]) {
					cellClass.push('bottom')
				}
			});
			return cellClass.join(' ');;
			// return this.themeWordAcross(cellData) && this.themeWords.across.letterIndexes[0] === cellData.index ?
			// 'top'
			// : this.themeWordAcross(cellData) && this.themeWords.across.letterIndexes[this.themeWords.across.letterIndexes.length - 1] === cellData.index ?
			// 	'bottom'				
			// :
			// ''
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
	box-shadow: 1px 2px calc(var(--main-padding) / 2) #00000066,
		-1px -1px calc(var(--main-padding) / 2) #00000066;
	outline: calc(var(--board-size) / var(--cells-wide) / 12) solid
		var(--blank-color);
}
.arrow-cell {
	position: absolute;
	pointer-events: none;
	opacity: 1;
}
.arrow {
	position: absolute;
	width: 80%;
	height: 80%;
	opacity: 0.25;
}
.entering-letters .arrow-cell::after {
	/* position: absolute; */
	content: '';
	width: var(--cell-width);
	height: var(--cell-width);
	top: 0;
	left: 0;
	color: var(--main-text-color);
	font-size: calc(var(--cell-letter-size) * 1.5);
	z-index: 15;
	display: flex;
	align-items: center;
	justify-content: center;
	animation: cell-pulse-orange;
	animation-play-state: running;
  animation-iteration-count: infinite;
  animation-timing-function: ease;
  animation-fill-mode: forwards;
  animation-direction: alternate;
  animation-duration: 250ms;
}
.arrow.entering-letters {
	filter: invert(25%) sepia(98%) saturate(1235%) hue-rotate(92deg) brightness(97%) contrast(103%);
	opacity: 0.5;
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
