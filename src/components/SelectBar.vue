<template>
	<div id="select-bar">
		<div class="select-label">{{ option.title }}</div>
    <Button 
      :class='targetValue === 0 && `selected`'
			:label='`Off`'
			:handleClick='() => adjustOption(option.name, 0)'
    />
    <Button 
      :class='targetValue === 1 && `selected`'
			:label='`2X`'
			:handleClick='() => adjustOption(option.name, 1)'
    />
    <Button 
      :class='targetValue === 2 && `selected`'
			:label='`4X`'
			:handleClick='() => adjustOption(option.name, 2)'
    />		
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
		rangeValue: Number,
    option: Object,
    targetValue: Number,
    targetValue: Number,
    adjustOption: Function,
		adjustRangedOption: Function
  },
  components: {
    Button
  },
	created() {
		this.currentValue = this.rangeValue || this.option.defaultValue;
	}
};
</script>

<style scoped>
#select-bar {
	grid-column-end: span 2;
	width: 100%;
	display: flex;
	align-items: center;
}
#select-bar > button {
  height: 100%;
  width: 100%;
	border-width: 1px;
	height: calc(var(--header-height) * 1.25);
}
#select-bar > button.selected {
  background: blue;
}
#select-bar > button:nth-of-type(1) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
#select-bar > button:nth-of-type(2) {
  border-radius: 0;
}
#select-bar > button:nth-of-type(3) {
 border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.select-label {
  width: calc(var(--header-height) * 1.5);
	font-weight: 700;
	padding-right: calc(var(--main-padding) / 2);
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
