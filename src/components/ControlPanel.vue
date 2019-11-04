<template>
	<div class="control-panel" :class='[busy && `busy`, $store.state.editMode === `clues` && `minimal`]'>
		<div v-if='$store.state.editMode !== `clues`' class='info-bar'>
			<div v-if='busy' class='spinner-area'>
				<Spinner :direction='-1'/>
				<div class='loading-message'>GENERATING {{ Math.round((percentBlack / rules.blackRate) * 100) }}%</div>
				<Button :label='`STOP`' :handleClick='cancelGeneration' />
			</div>
			<div>Words: {{ `${wordsNeeded.across.length}/${wordsNeeded.down.length} (${wordsNeeded.across.length + wordsNeeded.down.length})` }}</div>
			<div>Longest word: <span>{{ longestWordLengths[0] }}</span></div>
			<div :class='percentOffensiveClass'>{{ offensiveQuotient }}% offensive</div>
			<div :class='[(!isContiguous && rules.contiguous) && `violating untrue`]'>Contiguous</div>
			<div :class='shortestWordLength < rules.wordLengths.min ? `violating` : ``'>Shortest word: {{ shortestWordLength }}</div>
			<div>{{ percentBlack }}% black</div>
			<div :class='allCheckedClass'>All checked</div>
			<div>
				Theme words:
				<span v-if='themeWords[0][0]'>
					{{ themeWords[0].length }} x {{ themeWords[0][0].word.length }}
				</span>
				<span v-else>
					None
				</span>
				<span v-if='themeWords[1][0]'>
				, {{ themeWords[1].length }} x {{ themeWords[1][0].word.length }}
				</span>
			</div>
			<div></div>
		</div>
		<div v-if='$store.state.editMode===`diagram`' class='control-area'>
			<Button :label="`Clear all`" :handleClick="clearBoard" />
			<Button :label="`Shade all`" :handleClick="shadeBoard" />
			<!-- <Button :label="`Checked`" :handleClick="() => $store.state.puzzleOptions.rules.allChecked = !$store.state.puzzleOptions.rules.allChecked" :highlighted='rules.allChecked' /> -->
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
				<Button :class='[(busy || !$store.state.gotMLData) && `disabled`]' :label="`Auto-Generate`" :handleClick="handleClickGenerate" />				
				<Button 
					:label='`Rules`'
					:handleClick='handleClickRules'
				/>
				<!-- <Button :label="`Rules...`" :handleClick="handleClickRules" /> -->
			</div>
		</div>
		<div v-else-if='$store.state.editMode===`puzzle`' class='control-area'>
			<Button :label="`Clear all`" :handleClick="clearLetters" />
			<Button 
				:class='[(!selectedCell || !selectedCell.number || $store.state.enteringLetters) && `disabled`]' 
				:label="`Find Word`" 
				:handleClick="findWord" 
			/>
			<Button 
				:class='[!selectedCell && `disabled`, $store.state.enteringLetters && `highlighted`]' 
				:label="`Edit Letter`"
				:handleClick="() => $store.commit('changeEnteringLetters', !$store.state.enteringLetters)" 
			/>
			<div></div>
			<div class='generate-area'>
				<Button :class='[busy && `disabled`]' :label="`Auto-Fill`" :handleClick="fillBoard" />				
				<Button 
					:label='`Rules`'
					:handleClick='handleClickRules'
				/>
			</div>
			<div></div>
			<Button :label="`Save new word`" :handleClick="handleClickToSaveWord" />
		</div>
		<div v-else-if='$store.state.editMode===`clues`' class='control-area'>

		</div>
		<div class='lower-area'>
			<ModeBar
				:changeEditMode='changeEditMode'
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
		selectedCell: Object,
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
    clearLetters: Function,
    shadeBoard: Function,
    handleClickToSaveWord: Function,
    handleClickToBrowse: Function,
    handleGetDiagrams: Function,
    handleClickGenerate: Function,
    handleClickRules: Function,
		cancelGeneration: Function,
		changeEditMode: Function,
		findWord: Function,
		fillBoard: Function,
		themeWords: Array
  },
  components: {
    Button,
    ButtonMenu,
    ButtonSlider,
		SelectBar,
    ModeBar,
    Spinner
	},
  computed: {
		rules() {
			return this.$store.state.puzzleOptions.rules;
		},
    longestWordLengths() {
			let wordArray = Object.values(this.wordsNeeded).flat(2);
      if (wordArray.length) {
				let sortedWords = wordArray.sort((a, b) => b.word.length - a.word.length);
				const longest = sortedWords[0].word.length;
				if (this.percentBlack && this.percentBlack > 0) {
					const secondLongest = sortedWords.filter(wordObject => wordObject.word.length !== longest)
					return [longest, secondLongest];
				} else {
					return [15, 15]
				}
      } else {
				return [15, 15];
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
	height: 100%;
	flex-basis: var(--control-panel-min-height);
	background: var(--theme-color);
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}
.control-panel.minimal {
	height: min-content;
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
	padding: 1% var(--main-padding);
	/* height: calc(var(--header-height) * 2.75); */
	max-height: calc(var(--header-height) * 2.75);
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	grid-auto-rows: 1fr;
	grid-column-gap: calc(var(--main-padding) / 3);
	flex-grow: 1;
	justify-self: flex-start;
	align-items: center;
}
.control-panel.minimal > .control-area {
	padding: 0;
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
	/* grid-column-start: 2; */
	grid-column-end: span 2;
	display: grid;
	grid-template-columns: 1fr 1fr;
	padding: 0 calc(var(--main-padding) / 4);
	box-sizing: content-box;
	align-self: center;
	background: #00000055;
	border-radius: calc(var(--main-padding) / 4);
}
.generate-area > div:first-of-type {
	/* font-size: 0.6rem;
	padding: 0.1rem;
	font-weight: 700;
	writing-mode: vertical-lr;
	transform: rotate(180deg);
	align-self: center;
	padding: calc(var(--main-padding) / 4); */
}
.generate-area > button {	
	align-self: center;
	width: 50%;
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
	justify-self: flex-end;
}
.mode-bar {
	font-size: 0.8rem;
	/* margin-top: var(--main-padding); */
	/* align-self: flex-end; */
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
