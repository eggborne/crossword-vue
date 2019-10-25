<template>
<div class='button-menu'>
  <Button :label='`${label} ${displayValue}`' :handleClick='toggleOpen' :highlighted='isOpen' />
  <div class='button-menu-options' :class='[isOpen && `open`, option.name && `two-column`]'>
	  <Button 
      v-for='(selection, i) in selections'
      v-bind:key='i'      
      :label="selection.labelText" 
      :handleClick="() => { toggleOpen(); handler(option.name, selection.valueAmount);}"
      :class='[currentValue === selection.valueAmount && `selected`, selection.labelText.toUpperCase() === `OFF` && `wide`]'
    />


  </div>
</div>
</template>

<script>
import Button from './Button';
export default {
  name: 'ButtonMenu',
  data: () => ({
    isOpen: false,
    displayValues: {
      13: '13',
      15: '15',
      17: '17',
      19: '19',
      21: '21',
      23: '23',
      0: 'OFF',
      1: '2X',
      2: '4X'
    }
  }),
  props: {
    option: Object,
    label: String,
    selections: Array,
    currentValue: Number,
    handler: Function
  },
  components: {
    Button
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
.button-menu {
  position: relative;
  height: 100%;
  max-height: calc(var(--header-height));
}
.button-menu > button {
  height: 100%;
  min-width: 100%;
  padding: 0 var(--main-padding);
}
.button-menu button.selected {
  background: var(--button-selected-color);
}
.button-menu-options {
  position: absolute;
  width: 100%;
  bottom: 100%;
  z-index: 1;
  transform-origin: bottom;
  transition: transform 210ms ease, opacity 210ms ease;
}
.button-menu-options.two-column {
  display: grid;
  /* grid-template-columns: 1fr 1fr; */
  grid-template-columns: 1fr 1fr;
  grid-auto-flow: row;
}
.button-menu-options:not(.open) {
  opacity: 0;
  transform: scaleY(0);
  pointer-events: none;
}
.button-menu-options > button {
  padding: calc(var(--main-padding) / 1.5);
}
.button-menu-options > button.wide {
  grid-column-end: span 2;
}
</style>
