<template>
	<div id="slider-container">
		<div class="slider-label">{{ boardSize.width }} x {{ boardSize.height }}</div>
		<input
			id='diagram-slider'
			v-on:input="handleChangeSliderValue"
			v-model="currentValue"
			:label="option.name"
			type="range"
			:step="option.step"
			:min="option.minValue"
			:max="option.maxValue"
		/>
	</div>
</template>

<script>
export default {
  name: 'Slider',
  data: () => ({
    currentValue: undefined,
    lastChanged: 0
  }),
  props: {
    boardSize: Object,
    rangeValue: Number,
    option: Object,
    adjustRangedOption: Function
  },
  created() {
    this.currentValue = this.rangeValue || this.option.defaultValue;
  },
  methods: {
    handleChangeSliderValue(e) {
      this.adjustRangedOption(this.option.name, this.currentValue);
    }
  }
};
</script>

<style scoped>
#slider-container {
	grid-column-end: span 2;
	width: 100%;
	display: flex;
	align-items: center;
}
.slider-label {
  /* height: 100%; */
  /* flex-grow: 1; */
  width: calc(var(--header-height) * 1.5);
  padding-right: calc(var(--main-padding) / 2);
  display: flex;
  justify-content: flex-end;
  align-items: center;
	font-weight: 700;
	text-shadow: -2px -1px 0 #00000088, 2px -1px 0 #00000088, -2px 1px 0 #00000088,
		2px 1px 0 #00000088;
}
input[type='range'] {
	position: relative;
	-webkit-appearance: none; /* Override default CSS styles */
	appearance: none;
	flex-grow: 1;
	height: calc(var(--main-padding) / 1.5);
	border: 1px solid var(--cell-color);
	border-radius: var(--main-padding);
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
