<template>
<div class='button-slider'>
  <Button :label='`${label} ${currentValue}%`' :handleClick='toggleOpen' :highlighted='isOpen' />
  <div class='button-menu-slider' :class='isOpen ? `open` : ``'>
      <!-- <Button :label='`${label} ${currentValue}%`' :handleClick='toggleOpen' :highlighted='isOpen' /> -->

	  <Slider 
      :rangeValue='currentValue'
      :option='option'
      :adjustRangedOption='adjustRangedOption'
    />


  </div>
</div>
</template>

<script>
import Button from './Button';
import Slider from './Slider';
export default {
  name: 'ButtonSlider',
  data: () => ({
    isOpen: false,    
  }),
  props: {
    option: Object,
    label: String,
    currentValue: Number,
    adjustRangedOption: Function
  },
  components: {
    Button,
    Slider
  },
  computed: {
    displayValue() {
      return this.displayValues[this.currentValue]
    }
  },
  methods: {
    toggleOpen() {
      this.isOpen = !this.isOpen;
    }
  }
};
</script>

<style scoped>
.button-slider {
  position: relative;
  height: 100%;
  max-height: calc(var(--header-height));
}
.button-slider button {
  height: 100%;
  padding: 0 var(--main-padding);
}
.button-menu-slider {
  position: absolute;
  width: 100%;
  height: calc(var(--header-height) * 3.5);
  bottom: 100%;
  background: var(--button-color);
  transform-origin: bottom;
  transition: transform 210ms ease, opacity 210ms ease;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--main-padding);
  border-radius: calc(var(--main-padding) / 4);
  border: 2px solid var(--cell-color);
  border-bottom: none;
}
.button-menu-slider > input {
  transform: rotate(-90deg);
  transform-origin: center;
  /* position: relative; */
  /* position: absolute; */
  width: calc(var(--header-height) * 3);
  background: grey;
  /* transform: rotate(-90deg); */
}
.button-menu-slider:not(.open) {
  /* opacity: 0; */
  transform: scaleY(0);
  pointer-events: none;
}
</style>
