<template>
	<div class="control-panel">
		<div class='info-bar'>
			<div>Words: {{ wordsNeeded.across.length + wordsNeeded.down.length }}</div>
			<div :class='longestWordLength > 15 ? `violating` : ``'>Longest word: {{ longestWordLength }} letters</div>
			<div :class='percentSwastikaClass'>{{ swastikaQuotient }}% swastika</div>
			<div :class='!contiguous ? `violating` : ``'>{{ !contiguous ? 'NOT ' : ''}}Contiguous</div>
			<div :class='shortestWordLength < 3 ? `violating` : ``'>Shortest word: {{ shortestWordLength }} letters</div>
			<div :class='percentBlackClass'>{{ percentBlack }}% black</div>
		</div>
		<div class='control-area'>
			<Button :label="`Clear all`" :handleClick="clearBoard" />
			<Button :label="`Shade all`" :handleClick="shadeBoard" />
			<ButtonMenu 
				:selections='diagramSizeButtons'
				:option='options.diagramSize'
				:label='`Size`'
				:currentValue='boardSize.width'
				:handler='adjustOption'
			/>
			<ButtonMenu 
				:selections='symmetryButtons'
				:option='options.symmetry'
				:label='`Symmetry`'
				:currentValue='symmetry'
				:handler='adjustOption'
			/>
			<!-- <SelectBar
				:buttons='diagramSizeButtons'
				:option="options.diagramSize"
				:targetValue="this.boardSizes.indexOf(boardSize.width)"
				:adjustOption="adjustOption"
				:adjustRangedOption="adjustRangedOption"
			/> -->
			<!-- <div></div> -->
			<!-- <SelectBar 
				:buttons='symmetryButtons'
				:option="options.symmetry"
				:targetValue="symmetry"
				:adjustOption="adjustOption"
			/> -->
		</div>
		<div class='lower-area'>
			<ModeBar
				:editMode='editMode'
				:changeEditMode='changeEditMode'
			/>
		</div>
	</div>
</template>

<script>
import Slider from './Slider';
import Button from './Button';
import ButtonMenu from './ButtonMenu';
import SelectBar from './SelectBar';
import ModeBar from './ModeBar';

export default {
  name: 'ControlPanel',
  data: () => ({
    boardSizes: [13, 15, 17, 19, 21, 23],
    diagramSizeButtons: [
      {
        labelText: '13',
        valueAmount: 13
      },
      {
        labelText: '15',
        valueAmount: 15
      },
      {
        labelText: '17',
        valueAmount: 17
      },
      {
        labelText: '19',
        valueAmount: 19
      },
      {
        labelText: '21',
        valueAmount: 21
      },
      {
        labelText: '23',
        valueAmount: 23
      }
    ],
    symmetryButtons: [
      {
        labelText: 'Off',
        valueAmount: 0
      },
      {
        labelText: '2x',
        valueAmount: 1
      },
      {
        labelText: '4x',
        valueAmount: 2
      },
		],
		sizeOptions: [
			{
				labelText: '13x13',
				valueAmount: 13,				
			},
			{
				labelText: '15x15',
				valueAmount: 15,
			},
			{
				labelText: '17x17',
				valueAmount: 17,
			},
			{
				labelText: '19x19',
				valueAmount: 19,
			},
			{
				labelText: '21x21',
				valueAmount: 21,
			},
			{
				labelText: '23x23',
				valueAmount: 23,
			}
		]
  }),
  props: {
    editMode: String,
    boardSize: Object,
    options: Object,
    symmetry: Number,
    percentBlack: Number,
    wordsNeeded: Object,
    contiguous: Boolean,
    changeEditMode: Function,
    addCellLabels: Function,
    adjustOption: Function,
    adjustRangedOption: Function,
    clearBoard: Function,
    shadeBoard: Function,
    handleClickToSave: Function,
    handleClickToBrowse: Function,
    handleGetDiagrams: Function,
    swastikaQuotient: Number
  },
  components: {
    Button,
    ButtonMenu,
		SelectBar,
    ModeBar
  },
  computed: {
    longestWordLength() {
      if (this.wordsNeeded.across.length) {
        const longestAcross = [...this.wordsNeeded.across].sort((a, b) => b.word.length - a.word.length)[0].word.length;
        const longestDown = [...this.wordsNeeded.down].sort((a, b) => b.word.length - a.word.length)[0].word.length;
        return longestAcross > longestDown ? longestAcross : longestDown;
      }
    },
    shortestWordLength() {
      if (this.wordsNeeded.across.length) {
        const shortestAcross = [...this.wordsNeeded.across].sort((a, b) => a.word.length - b.word.length)[0].word.length;
        const shortestDown = [...this.wordsNeeded.down].sort((a, b) => a.word.length - b.word.length)[0].word.length;
        return shortestAcross > shortestDown ? shortestAcross : shortestDown;
      }
    },
    percentBlackClass() {
      let percentClass = '';
      if (this.percentBlack < 12 || this.percentBlack > 22) {
        percentClass = 'violating';
      } else if (this.percentBlack < 14 || this.percentBlack > 19) {
        percentClass = 'warning';
      }
      return percentClass;
    },
    percentSwastikaClass() {
      let swastikaClass = '';
      if (this.swastikaQuotient >= 50) {
        swastikaClass = 'violating';
      } else if (this.swastikaQuotient > 30) {
        swastikaClass = 'warning';
      }
      return swastikaClass;
    }
  }
};
</script>

<style scoped>
.control-panel {
	font-size: calc(var(--header-height) / 3.5);
	max-width: 100%;
	flex-basis: var(--control-panel-min-height);
	background: var(--header-color);
	display: flex;
	flex-direction: column;
	/* align-items: stretch; */
	/* justify-content: space-evenly; */
}
.violating {
	color: rgb(255, 177, 177);
}
.warning {
	color: rgb(221, 221, 101);
}
.control-area {
	padding: calc(var(--main-padding) * 1.25);
	height: min-content;
	max-height: calc(var(--header-height) * 3.25);
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr;
	grid-template-rows: 1fr 1fr;
	grid-column-gap: calc(var(--main-padding) /2);
	grid-row-gap: 10%;
	flex-grow: 1;
	align-items: stretch;
}
.control-area > div:first-child {
	display: flex;
}
.select-bar, .button-menu {
	/* grid-column-start: 2; */
}
.control-area > button {
	position: relative;
	margin: 0 !important;
	height: 100%;
	align-self: stretch;
	justify-self: stretch;
	padding: 4px var(--main-padding);
}
.lower-area {
	display: flex;
	justify-content: space-between;
	flex-grow: 1;
	max-height: 100%;
}
.mode-bar {
	margin-top: var(--main-padding);
}
.info-bar {
	grid-column-start: 1;
	grid-column-end: span 2;
	padding: calc(var(--main-padding) / 4) 0;
	font-size: 0.7rem;
	display: grid;
	grid-template-columns: 1fr auto 1fr;
	justify-items: center;
}
#lower-area button {
	font-size: 1rem;
	padding: var(--main-padding);
	height: calc(var(--header-height) * 1.5);
}
@media (orientation: landscape) {
	.control-panel {
		width: 100%;
		height: 100%;
		grid-template-columns: 0.5fr 0.5fr;
		grid-column-start: 2;
		justify-self: end;
	}
}
</style>
