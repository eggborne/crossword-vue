<template>
<div class='button-menu'>
  <Button :label='`${label} ${displayValue}`' :handleClick='toggleOpen' :highlighted='isOpen' />
  <div class='button-menu-options' :class='[
    isOpen && `open`, option.name === `dictionarySort` ? `full-width` : `two-column`
  ]'>
	  <Button 
      v-for='(selection, i) in selections'
      v-bind:key='i'
      :label="selection.labelText" 
      :handleClick="() => { toggleOpen(); handler(option.name, selection.valueAmount); }"
      :class='[currentValue === selection.valueAmount && `selected`, (selection.labelText.toUpperCase() === `OFF` || selection.labelText.toUpperCase() === `ALL`) && `wide`]'
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
    currentValue: [String, Number],
    handler: Function
  },
  components: {
    Button
  },
  computed: {
    displayValue() {
      if (this.option.name === 'dictionarySort') {
        let label = this.$store.state.dictionaryOptions.sortTypes[this.currentValue].labelText;
        return label;
      } else if (this.option.name === 'dictionaryFilter') {
        let label = this.$store.state.dictionaryOptions.filterTypes[this.currentValue].labelText;
        return label;
      } else if (this.option.name === 'dictionaryView') {
        return this.$store.state.dictionaryOptions.viewLetter;
      }
      return this.displayValues[this.currentValue];
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
/* .button-menu button.small-text {
  font-size: calc(var(--header-height) / 4);
} */
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
.button-menu-options.width-100 {
  position: fixed;
  left: 0;
  bottom: calc(var(--header-height) * 2 + var(--main-padding) * 2);
  width: 100vmin;
  display: flex;
  flex-wrap: wrap;
}
.button-menu-options.full-width button {
  width: 100%;
}
.button-menu-options:not(.open) {
  opacity: 0;
  transform: scaleY(0);
  pointer-events: none;
}
.button-menu-options > button {
  padding: calc(var(--main-padding) / 1.5);
}
.button-menu-options.width-100 > button {
  width: calc(var(--header-height) / 1.25);
}
.button-menu-options.width-100 > button.wide {
  /* grid-column-end: span 6; */
  flex-grow: 1;
}
.button-menu-options > button.wide {
  grid-column-end: span 2;
}
</style>
