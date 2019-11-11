<template>
	<div class="control-panel" :class='[busy && `busy`, $store.state.editMode === `clues` && `minimal`]'>
		<div v-if='$store.state.editMode === `diagram`' class='info-bar'>
			<div v-if='busy' class='spinner-area'>
				<Spinner :direction='-1'/>
				<div class='loading-message'>
					<div class='loading-bar'
						:style='{ transform: `scaleX(${generationPercent / 100})` }'
					></div>
					GENERATING {{ Math.round(generationPercent) }}%
				</div>
				<Button :label='`STOP`' :handleClick='cancelGeneration' />
			</div>
			<div>Words: <span :style='{fontWeight: `bold`}'>{{ `${wordsNeeded.across.length}/${wordsNeeded.down.length} (${wordsNeeded.across.length + wordsNeeded.down.length})` }}</span></div>
			<div>Long/Short: <span :style='{fontWeight: `bold`}'>{{ longestWordLengths[0] }} / {{ shortestWordLength }}</span></div>
			<div :class='percentOffensiveClass'>{{ offensiveQuotient }}% offensive</div>
			<div :class='[(!isContiguous && rules.contiguous) && `violating untrue`]'>Contiguous</div>
			<div>Shaded: <span :style='{fontWeight: `bold`}'>{{ percentBlack }}%</span></div>
			<div :class='allCheckedClass'>All checked</div>
			<!-- <div>
				Theme words:
				<span v-if='themeWords.across[0]'>
					A: {{ themeWords.across.length }} x {{ themeWords.across[0].word.length }}
				</span>
				<span v-else-if='themeWords.down[0]'>
					D: {{ themeWords.down.length }} x {{ themeWords.down[0] && themeWords.down[0].word.length }}
				</span>
				<span v-else>
					None
				</span>			
			</div> -->
			<div></div>
		</div>
		<div v-else-if='$store.state.editMode === `puzzle` && !$store.state.enteringLetters' class='puzzle info-bar'>
			<div v-if='busy' class='spinner-area'>
				<Spinner :direction='-1'/>
					<div class='loading-message'>
						<div class='loading-bar'
							:style='{ transform: `scaleX(${triedPercent / 100})` }'
						></div>
						<span v-if='loadingMessage'>
							{{ loadingMessage }}
						</span>
						<span v-else-if='totalFillOptionAmount'>
							TRYING {{ (totalFillOptionAmount - currentFillOptions.length + 1) }} 
							OF {{ totalFillOptionAmount + 1 }}<br />for {{ selectedCell && selectedCell.number }} {{ $store.state.editDirection }}
						</span>
						<span v-else>
							PREPARING WORD FILL...
						</span>
					</div>
				<Button :label='`STOP`' :handleClick='cancelGeneration' />
			</div>

			<div>Words: <span :style='{fontWeight: `bold`}'>{{ `${wordsNeeded.across.length}/${wordsNeeded.down.length} (${wordsNeeded.across.length + wordsNeeded.down.length})` }}</span></div>
			<div>Long/Short: <span :style='{fontWeight: `bold`}'>{{ longestWordLengths[0] }} / {{ shortestWordLength }}</span></div>
			<div>Filled: <span :style='{fontWeight: `bold`}'>{{ filledPercent }}%</span></div>
			<!-- <div>
				Theme words:
				<span v-if='themeWords.across[0]'>
					A: {{ themeWords.across.length }} x {{ themeWords.across[0].word.length }}
				</span>
				<span v-else-if='themeWords.down[0]'>
					D: {{ themeWords.down.length }} x {{ themeWords.down[0] && themeWords.down[0].word.length }}
				</span>
				<span v-else>
					None
				</span>			
			</div> -->
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
		<div v-else-if='$store.state.editMode===`puzzle`  && !$store.state.enteringLetters' class='control-area'>
			<Button :label="`Clear all`" :handleClick="clearLetters" />
			<Button 
				:class='[(!selectedCell || !selectedCell.number || $store.state.enteringLetters) && `disabled`]' 
				:label="`Find Word`" 
				:handleClick="findWord" 
			/>
			<Button 
				:class='[!selectedCell && `disabled`, $store.state.enteringLetters && `highlighted`]' 
				:label="`Edit Letter`"
				:handleClick="() => { $store.commit('changeEnteringLetters', !$store.state.enteringLetters); $store.commit('toggleKeyboard') }" 
			/>
			<Button 
				:class='[(!logItems.length && !$store.state.logOpen) && `disabled`, $store.state.logOpen && `highlighted`]' 
				:label="`${$store.state.logOpen ? 'Close' : 'View'} Log ${(!$store.state.logOpen && logItems.length > 0) ? `(${logItems.length})` : ``}`"
				:handleClick="() => $store.commit('toggleLog')" 
			/>
			<div class='generate-area'>
				<Button :class='[busy && `disabled`]' :label="`Auto-Fill`" :handleClick="fillBoard" />				
				<!-- <Button 
					:label='`Validate`'
					:handleClick='handleClickValidate'
				/> -->
			</div>
			<Button :class='[!selectedCell && `disabled`]' :label="`Word choices`" :handleClick="handleClickToViewChoices" />
		</div>
		<div v-else-if='$store.state.editMode===`clues`' class='control-area'>
			<Button :label="`Save new word`" :handleClick="handleClickToSaveWord" />
		</div>
		<div v-if='!$store.state.keyboardOpen' class='lower-area'>
			<ModeBar
				:changeEditMode='changeEditMode'
			/>
		</div>
		<Keyboard 
			:class='[$store.state.keyboardOpen ? `` : `closed`]'
			:handleClickKey='handleClickKey'
		/>
	</div>
</template>

<script>
import Button from './Button';
import ButtonMenu from './ButtonMenu';
import ButtonSlider from './ButtonSlider';
import SelectBar from './SelectBar';
import ModeBar from './ModeBar';
import Spinner from './Spinner';
import Keyboard from './Keyboard';


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
		handleClickValidate: Function,
		handleClickToViewChoices: Function,
		cancelGeneration: Function,
		changeEditMode: Function,
		handleClickKey: Function,
		findWord: Function,
		fillBoard: Function,
		themeWords: Object,
		completeWords: Number,
		doubleRootCells: Array,
		currentFillOptions: Array,
		totalFillOptionAmount: Number,
		loadingMessage: String,
		decisionQueue: Array,
		logItems: Array,
		iterations: Number,
		viableCellAmount: Number
  },
  components: {
    Button,
    ButtonMenu,
    ButtonSlider,
		SelectBar,
    ModeBar,
    Spinner,
    Keyboard
	},
  computed: {
		rules() {
			return this.$store.state.puzzleOptions.rules;
		},
		triedPercent() {
			let percent;
			return (((this.totalFillOptionAmount - this.currentFillOptions.length + 1) / this.totalFillOptionAmount) * 100);
		},
		generationPercent() {
			let percent;
			let totalCells = this.boardSize.width * this.boardSize.height;

			percent = 100 - ((this.viableCellAmount / totalCells) * 100);						
			return percent;
		},
		filledPercent() {
			return Math.round((this.completeWords / (this.wordsNeeded.across.length + this.wordsNeeded.down.length)) * 100);
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
.control-panel.minimal > .control-area {
	padding: var(--main-padding);
}
.control-panel.minimal > .control-area button {
	grid-column-start: 4;
	padding: var(--main-padding);
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
	max-width: 100%;
	max-height: calc(var(--header-height) * 2.75);
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	grid-auto-rows: 1fr;
	grid-column-gap: calc(var(--main-padding) / 3);
	flex-grow: 1;
	justify-self: flex-start;
	align-items: center;
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
	grid-template-columns:  calc(var(--header-height) * 2.5) 1fr calc(var(--header-height) * 2.5);
	align-items: center;
	align-content: center;
	justify-items: center;
	z-index: 1;	
}
.spinner-area > .loading-message {
	position: relative;
	font-weight: 700;
	font-size: 0.8rem;
	text-shadow: -2px -1px 0 #00000088, 2px -1px 0 #00000088, -2px 1px 0 #00000088,
		2px 1px 0 #00000088;
	/* width: max-content; */
	text-align: center;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
}
.loading-bar {
	transform-origin: left;
	background: green;
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: -1;
	transform: scaleX(0);
	/* transition: transform 200ms linear; */
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
	grid-column-gap: calc(var(--main-padding) / 2);
	box-sizing: content-box;
	align-self: center;
	align-items: center;
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
	/* align-self: center; */
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
	height: calc(var(--header-height) * 1.25);
	max-height: calc(var(--header-height) * 1.25);
	display: grid;
	grid-template-columns: 1fr auto 1fr;
	/* grid-row-gap: calc(var(--main-padding) / 4); */
	justify-items: center;
}
.control-area button {
	position: relative;
	width: 100%;
	height: 100%;
	max-height: calc(var(--header-height));
	/* padding: 0 calc(var(--main-padding) / 2); */
}
.lower-area {
	display: flex;
	justify-content: space-between;
	z-index: 1;
}
.mode-bar {
	font-size: 0.8rem;
	/* margin-top: var(--main-padding); */
	justify-self: flex-end;
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
