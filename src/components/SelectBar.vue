<template>
	<div class="select-bar">
		<div class="select-label">{{ option.title }}</div>
		<div class='button-row'>
			<Button 
				v-for='(button, i) in buttons'
				v-bind:key='i'
				:class='targetValue === i && `selected`'
				:label='button.labelText'
				:handleClick='() => adjustOption(option.name, button.valueAmount)'
			/>
		</div>
	</div>
</template>

<script>
import Button from './Button';
export default {
	name: 'SelectBar',
	data: () => ({
		currentValue: ''
	}),
	props: {
		buttons: Array,
		rangeValue: Number,
    option: Object,
    targetValue: Number,
    adjustOption: Function,
  },
  components: {
    Button
  },
	created() {
		this.currentValue = this.targetValue || this.option.defaultValue;
	}
};
</script>

<style scoped>
.select-bar {
	grid-column-end: span 2;
	width: 100%;
	display: flex;
	flex-direction: column;
	height: 100%;
}
.button-row {
	display: flex;
	width: 100%;
	flex-grow: 1;
}
.button-row > button {
	width: 100%;
	border-width: 1px;
	border-radius: 0;
}
.select-bar button.selected {
  background: blue;
}
.select-bar button:last-of-type {
  border-top-right-radius: calc(var(--main-padding) / 3);
  border-bottom-right-radius: calc(var(--main-padding) / 3);
}
.select-bar button:first-of-type {
	border-top-left-radius: calc(var(--main-padding) / 3);
  border-bottom-left-radius: calc(var(--main-padding) / 3);
}
.select-label {
  width: calc(var(--header-height) * 1.5);
	font-weight: 700;
	padding-bottom: calc(var(--main-padding) / 4);
	text-shadow: -1px -1px 0 #00000088, 1px -1px 0 #00000088, -1px 1px 0 #00000088,
		2px 1px 0 #00000088;
}
input[type='range'] {
	position: relative;
	-webkit-appearance: none; /* Override default CSS styles */
	appearance: none;
	width: 100%;
	height: calc(var(--main-padding) / 1.5);
	border: 1px solid var(--cell-color);
	border-radius: var(--main-padding);
	/* background: #ffffff22; */
	background: transparent;
	outline: none;
	opacity: 0.75;
}
input::-webkit-slider-thumb {
	border-radius: 50%;
	-webkit-appearance: none;
	appearance: none;
	width: calc(var(--header-height) / 2);
	height: calc(var(--header-height) / 2);
	transform-origin: center;
	transform: scale(1.25);
	background: var(--cell-color);
	cursor: pointer;
}
input::-moz-range-thumb {
	border-radius: 50%;
	width: calc(var(--header-height) / 2);
	height: calc(var(--header-height) / 2);
	transform-origin: center;
	transform: scale(1.25);
	background: var(--cell-color);
	cursor: pointer;
}
#option-list .range {
	background: var(--sheer-white);
	border: 0;
	border-radius: calc(var(--inner-padding) / 2);
	display: grid;
	grid-template-columns: 1fr;
	grid-template-rows: min-content 1fr;
	justify-items: end;
	align-items: center;
	align-content: center;
	padding-top: calc(var(--main-padding) / 2);
	padding-bottom: calc(var(--main-padding) / 2);
	background: transparent;
}
#option-list .range:first-of-type {
	margin-top: calc(var(--main-padding));
}
div:first-child {
	justify-self: start;
}
input {
	grid-column-end: span 2;
}
</style>
