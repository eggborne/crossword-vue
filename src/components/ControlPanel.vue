<template>
	<div class="control-panel">
		<Button :label="`Clear all`" :handleClick="clearBoard" />
		<Slider
			:boardSize='boardSize'
			:option="options.diagramSize"
			:adjustRangedOption="adjustRangedOption"
			:rangeValue="boardSize.width"
		/>
		<Button :label="`Shade all`" :handleClick="shadeBoard" />
		<SelectBar
			:option="options.symmetry"
			:targetValue="symmetry"
			:rangeValue="boardSize.width"
			:adjustOption="adjustOption"
			:adjustRangedOption="adjustRangedOption"
		/>
	</div>
</template>

<script>
import Slider from './Slider';
import Button from './Button';
import SelectBar from './SelectBar';
export default {
	name: 'ControlPanel',
	props: {
		boardSize: Object,
		options: Object,
		symmetry: Number,
		addCellLabels: Function,
		adjustOption: Function,
		adjustRangedOption: Function,
		clearBoard: Function,
		shadeBoard: Function,
		handleClickToSave: Function,
		handleClickToBrowse: Function,
		handleGetDiagrams: Function
	},
	components: {
		Button,
		Slider,
		SelectBar
	}
};
</script>

<style scoped>
.control-panel {
	--panel-space: calc(var(--view-height) - var(--header-height) - 100vw);
	font-size: calc(var(--header-height) / 3.5);
	/* position: relative; */
	max-width: 100%;	
	background: var(--header-color);
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	grid-auto-rows: min-content;
	grid-column-gap: calc(var(--main-padding) * 1.25);
	grid-row-gap: var(--main-padding);
	padding: calc(var(--main-padding) * 1.25);
	align-items: center;
	/* overflow-y: auto; */
}
button {
	height: calc(var(--header-height) * 1.25);
}
#lower-area {
	grid-column-end: span 3;
	display: flex;
	justify-content: space-evenly;
	align-items: flex-end;
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
