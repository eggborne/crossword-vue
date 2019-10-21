<template>
<div class='button-menu'>
  <Button :label='`${label} ${displayValue}`' :handleClick='toggleOpen' />
  <div class='button-menu-options' :class='isOpen ? `open` : ``'>
	  <Button 
      v-for='(selection, i) in selections'
      v-bind:key='i'
      :label="selection.labelText" 
      :handleClick="() => { toggleOpen(); handler(option.name, selection.valueAmount);}"
      :class='currentValue === selection.valueAmount && `selected`'
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
      13: '13x13',
      15: '15x15',
      17: '17x17',
      19: '19x19',
      21: '21x21',
      23: '23x23',
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
  /* width: min-content; */
}
.button-menu > button {
  height: 100%;
  padding: 0 var(--main-padding);
}
.button-menu button.selected {
  background: blue !important;
}
.button-menu-options {
  position: absolute;
  width: 100%;
  bottom: 100%;
  z-index: 1;
  transform-origin: bottom;
  transition: transform 210ms ease, opacity 210ms ease;
}
.button-menu-options:not(.open) {
  opacity: 0;
  transform: scaleY(0);
  pointer-events: none;
}
.button-menu-options > button {
  padding: calc(var(--main-padding) / 2);
  width: 100%;
}
</style>
