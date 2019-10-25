<template>
<div class='settings-menu' :class='[$store.state.menuOpen || `closed`]'>
	<button @pointerdown='toggleOpen'>
		<img id='settings-icon' :src='`img/icons/settings${$store.state.uiOptions.theme}.png`' />
	</button>
  <div class='menu'>
    <Toggle 
      :on='$store.state.uiOptions.theme === `dark`'
      :option='{
        title:  `Night Theme`,
        inputType: `toggle`
      }'
      :toggleOption='() => $store.dispatch(`toggleDarkTheme`, { save: true })'
    />
    <div 
      v-for='(buttonObj, h) in options.colorButtons'
      :key='`${buttonObj.name}-${h}`'
      class='option-row'
    >
    <div>{{ buttonObj.labelText }}</div>
      <div :style='{backgroundColor: $store.state.uiOptions[buttonObj.name]}' class='color-input-preview'>
        {{$store.state.uiOptions[buttonObj.name]}}
        <input
          type='color'
          v-model='$store.state.uiOptions[buttonObj.name]'
          @change='(e) => $store.dispatch(`changeUIColor`, {attrName: buttonObj.name, newValue: e.target.value, save: true})'
        />
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import Toggle from './Toggle';
export default {
  name: 'SettingsMenu',
  data: () => ({
    isOpen: false,
    options: {
      colorButtons: [
        { labelText: 'Main Color', name: 'themeColor' },
        { labelText: 'BG Color', name: 'bodyBgColor' },
        { labelText: 'Cell Color', name: 'cellColor' },
        { labelText: 'Blank Color', name: 'blankColor' },
      ]
    }
  }),
  props: {
    highlighted: Boolean,   
  },
  methods: {
    toggleOpen() {
      this.$store.commit(`toggleMenu`)
    }
  },
  components: {
    Toggle
  }
};
</script>

<style scoped>
.settings-menu {
  font-size: 0.75rem;
  font-weight: 700;
}
.menu {
  position: fixed;
  right: 0;
  /* height: var(--board-size); */
  background: var(--theme-color);
  padding: calc(var(--main-padding) * 1.5);
  padding-top: calc(var(--main-padding) / 1.5);
  z-index: 2;
  transition: transform 400ms ease;
  border-bottom-left-radius: calc(var(--main-padding) / 4);
  text-shadow: -2px -1px 0 #00000088, 2px -1px 0 #00000088, -2px 1px 0 #00000088,
		2px 1px 0 #00000088;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-auto-rows: var(--header-height);
  align-items: center;
  align-content: stretch;
  grid-column-gap: var(--main-padding);
  grid-row-gap: calc(var(--main-padding) / 2);
}
.toggle, .option-row {
  grid-column-end: span 2;
}
.settings-menu.closed .menu {
  transform: translateX(100%);
}
.settings-menu button {
  
  width: var(--header-height);
  height: var(--header-height);
  padding: 0;
  display: flex;
  margin-left: calc(var(--main-padding) / 2);
  align-items: center;
  justify-content: center;
  border-radius: calc(var(--main-padding) / 4);
  background: var(--button-selected-color);
}
.settings-menu.closed > button {
  background: var(--button-color);
}
.settings-menu button img {
  width: 80%;
  height: 80%;
  transition: transform 400ms ease;
}
.settings-menu.closed img {
  transform: rotate(-90deg);
}
.color-input-preview {
  position: relative;
  border: calc(var(--main-padding) / 8) outset var(--text-color);
  height: 80%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(var(--main-padding) / 4);
  border-radius: calc(var(--main-padding) / 4);
  box-shadow: 0px 0px 2px 1px #00000088;
}
input[type='color'] {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
}
/* .settings-menu.open button img {
} */
.option-row {
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 0.9fr;
  grid-column-gap: var(--main-padding);
  align-items: center;
  justify-content: space-between;
}
.option-row > * {
  
}
</style>
