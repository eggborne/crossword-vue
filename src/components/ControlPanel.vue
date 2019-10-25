<template>
	<div class="control-panel" :class='[busy && `busy`]'>
		<div class='info-bar'>
			<div v-if='busy' class='spinner-area'>
				<Spinner :direction='-1'/>
				<div class='loading-message'>GENERATING {{ Math.round((percentBlack / rules.blackRate) * 100) }}%</div>
				<!-- <Spinner :direction='1'/> -->
				<Button :label='`STOP`' :handleClick='cancelGeneration' />
			</div>
			<div>Words: {{ `${wordsNeeded.across.length}/${wordsNeeded.down.length} (${wordsNeeded.across.length + wordsNeeded.down.length})` }}</div>
			<div :class='longestWordLength > rules.wordLengths.max ? `violating` : ``'>Longest word: {{ longestWordLength }}</div>
			<div :class='percentOffensiveClass'>{{ offensiveQuotient }}% offensive</div>
			<div :class='[(!isContiguous && rules.contiguous) && `violating untrue`]'>Contiguous</div>
			<div :class='shortestWordLength < rules.wordLengths.min ? `violating` : ``'>Shortest word: {{ shortestWordLength }}</div>
			<div>{{ percentBlack }}% black</div>
			<div :class='allCheckedClass'>All checked</div>
			<div>Theme words: 2 x 15</div>
			<div></div>
		</div>
		<div class='control-area'>
			<Button :label="`Clear all`" :handleClick="clearBoard" />
			<!-- <Button :label="`Shade all`" :handleClick="shadeBoard" /> -->
			<Button :label="`Checked`" :handleClick="() => $store.state.puzzleOptions.rules.allChecked = !$store.state.puzzleOptions.rules.allChecked" :highlighted='rules.allChecked' />
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
			<div class='generate-area'>
				<div>AUTO</div>
				<Button :class='[busy && `disabled`]' :label="`Generate`" :handleClick="handleClickGenerate" />
				<Button :label="`Rules...`" :handleClick="handleClickRules" />
			</div>
			<ButtonSlider
				:option='{
					name:`blackRate`,
					min: 5,
					max: 90,
					step: 1,
					defaultValue: 16
				}'
				:label='`Black`'
				:currentValue='rules.blackRate'
				:adjustRangedOption='adjustRangedOption'
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
				
			/>
		</div>
	</div>
</template>

<script>
import Button from './Button';
import ButtonMenu from './ButtonMenu';
import ButtonSlider from './ButtonSlider';
import SelectBar from './SelectBar';
import ModeBar from './ModeBar';
import Spinner from './Spinner';

export default {
  name: 'ControlPanel',
  data: () => ({
    boardSizes: [13, 15, 17, 19, 21, 23],
    diagramSizeButtons: [
      { labelText: '13', valueAmount: 13 },
      { labelText: '15', valueAmount: 15 },
      { labelText: '17', valueAmount: 17 },
      { labelText: '19', valueAmount: 19 },
      { labelText: '21', valueAmount: 21 },
      { labelText: '23', valueAmount: 23 }
    ],
    symmetryButtons: [
      { labelText: 'Off', valueAmount: 0 },
      { labelText: '2x', valueAmount: 1 },
      { labelText: '4x', valueAmount: 2 },
		],		
  }),
  props: {
		busy: Boolean,
    boardSize: Object,
		options: Object,
    symmetry: Number,
    percentBlack: Number,
    offensiveQuotient: Number,
    wordsNeeded: Object,
    isContiguous: Boolean,
    addCellLabels: Function,
    adjustOption: Function,
    adjustRangedOption: Function,
    clearBoard: Function,
    shadeBoard: Function,
    handleClickToSave: Function,
    handleClickToBrowse: Function,
    handleGetDiagrams: Function,
    handleClickGenerate: Function,
    handleClickRules: Function,
    cancelGeneration: Function
  },
  components: {
    Button,
    ButtonMenu,
    ButtonSlider,
		SelectBar,
    ModeBar,
    Spinner
	},
	mounted() {
		// this.rules = this.$store.state.puzzleOptions.rules;
		// console.log('set to', this.$store.state.puzzleOptions.rules.wordLengths.max)
	},
  computed: {
		rules() {
			return this.$store.state.puzzleOptions.rules;
		},
    longestWordLength() {
      if (this.wordsNeeded.across.length) {
        const longestAcross = this.wordsNeeded.across.sort((a, b) => b.word.length - a.word.length)[0].word.length;
        const longestDown = this.wordsNeeded.down.sort((a, b) => b.word.length - a.word.length)[0].word.length;
        return longestAcross > longestDown ? longestAcross : longestDown;
      }
    },
    shortestWordLength() {
      if (this.wordsNeeded.across.length) {
				let acrossList = [...this.wordsNeeded.across];
				let downList = [...this.wordsNeeded.down];
				if (!this.rules.allChecked) {
					acrossList = acrossList.filter(wordObj => wordObj.word.length > 1)
					downList = acrossList.filter(wordObj => wordObj.word.length > 1)
				}
        const shortestAcross = acrossList.sort((a, b) => a.word.length - b.word.length)[0].word.length;
				const shortestDown = downList.sort((a, b) => a.word.length - b.word.length)[0].word.length;

        return shortestAcross > shortestDown ? shortestAcross : shortestDown;
      }
    },
    percentOffensiveClass() {
			let gotMLData = this.$store.state.gotMLData;
      let offensiveClass = '';
      if (this.offensiveQuotient >= 50) {
        offensiveClass = 'violating';
      } else if (this.offensiveQuotient > 30) {
        offensiveClass = 'warning';
			}
			if (!this.$store.state.gotMLData) {
				offensiveClass += ' dimmed';
			}
      return offensiveClass;
		},
		allCheckedClass() {
			let checkedClass = '';
			let wordArray =[...Object.values(this.wordsNeeded)[0], ...Object.values(this.wordsNeeded)[1]]
			let allChecked = !wordArray.filter(wordObj => wordObj.word.length <= 1).length;
			checkedClass = allChecked ? '' : 'violating untrue';
			return checkedClass;
		}
	},
};
</script>

<style scoped>
.control-panel {
	position: relative;
	font-size: calc(var(--header-height) / 3.5);
	max-width: 100%;
	flex-basis: var(--control-panel-min-height);
	background: var(--theme-color);
	display: flex;
	flex-direction: column;
	/* align-items: stretch; */
}
.untrue {
	text-decoration: line-through;
}
.violating {
	color: rgb(255, 177, 177);
}
.warning {
	color: rgb(221, 221, 101);
}
.control-area {
	/* padding: var(--main-padding) calc(var(--main-padding) * 1.25); */
	padding: 1% var(--main-padding);
	max-height: calc(var(--header-height) * 2.75);
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	grid-template-rows: 0.5fr 0.5fr;
	grid-column-gap: calc(var(--main-padding) / 3);
	grid-row-gap: 7%;
	flex-grow: 1;
	align-items: center;
	/* align-content: center; */
}
.control-panel.busy .info-bar > div:not(:first-child) {
	opacity: 0.2;
}
.spinner-area {
	width: 100%;
	height: inherit;
	position: absolute;
	z-index: 2;
	transform: translate(-50%, 0);
	top: 0%;
	left: 50%;
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	align-items: center;
	align-content: center;
	justify-items: center;
	z-index: 1;
}
.spinner-area > .loading-message {
	font-weight: 700;
	font-size: 1rem;
	text-shadow: -2px -1px 0 #00000088, 2px -1px 0 #00000088, -2px 1px 0 #00000088,
		2px 1px 0 #00000088;
		/* flex-grow: 1; */
		width: max-content;
}
.spinner-area > .load-spinner {
	width: calc(var(--header-height) / 1.75);
	height: calc(var(--header-height) / 1.75);
}
.spinner-area button {
	height: calc(var(--header-height) / 1.25);
	width: 60%;
	background: rgb(47, 8, 8);
}
.generate-area {
	height: 100%;
	grid-column-end: span 2;
	display: grid;
	grid-template-columns: min-content 1fr 1fr;
	padding: 0 calc(var(--main-padding) / 4);
	align-self: center;
	background: #00000055;
}
.generate-area > div:first-of-type {
	font-size: 0.6rem;
	padding: 0.1rem;
	font-weight: 700;
	writing-mode: vertical-lr;
	transform: rotate(180deg);
	align-self: center;
	padding: calc(var(--main-padding) / 4);
}
.generate-area > button {	
	align-self: center;
}
.generate-area > button:first-of-type {
	border-right-color: #ffffff55;
	background-color: rgb(88, 123, 27);
}
.generate-area > button:last-of-type {
	border-left-color: #ffffff55;
	background-color: rgb(126, 103, 71);
}
.info-bar {
	grid-column-start: 1;
	grid-column-end: span 2;
	padding: calc(var(--main-padding) / 2) 0;
	font-size: 0.7rem;
	height: calc(var(--header-height) * 1.5);
	display: grid;
	grid-template-columns: 1fr auto 1fr;
	grid-row-gap: calc(var(--main-padding) / 4);
	justify-items: center;
}
.control-area button {
	position: relative;
	width: 100%;
	height: 100%;
	max-height: calc(var(--header-height));
}
.lower-area {
	display: flex;
	justify-content: space-between;
	flex-grow: 1;
	justify-self: flex-end;
}
.mode-bar {
	/* margin-top: var(--main-padding); */
	align-self: flex-end;
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
