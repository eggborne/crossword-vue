<template>
	<div class='mode-bar'>
    <div><div id='diagram-pane'
      class='mode-pane'
      :class='$store.state.editMode === `diagram` ? `selected` : ``'
      @pointerdown='changeEditMode'
    >DIAGRAM</div></div>
    <div><div id='puzzle-pane'
      class='mode-pane'
      :class='$store.state.editMode === `puzzle` ? `selected` : ``'
      @pointerdown='changeEditMode'
    >PUZZLE</div></div>
    <div><div id='clues-pane'
      class='mode-pane'
      :class='$store.state.editMode === `clues` ? `selected` : ``'
      @pointerdown='changeEditMode'
    >CLUES</div></div>
    <div><div id='dictionary-pane'
      class='mode-pane dictionary'
      :class='$store.state.editMode === `dictionary` ? `selected` : ``'
      @pointerdown='changeEditMode'
    >DICTIONARY</div></div>
  </div>
</template>

<script>
export default {
  name: 'Spinner',
  props: {
    changeEditMode: Function
  }
};
</script>

<style scoped>
.mode-bar {
  width: 100%;
  height: var(--header-height);
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
}
.mode-bar > div {
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: calc(var(--main-padding) / 8) solid #eeeeeeaa;
  border-right: calc(var(--main-padding) / 8) solid #eeeeeeaa;
}
.mode-bar > div:first-child {
  border-left: 0;
}
.mode-bar > div:last-child {
  border-right: 0;
}
.mode-pane {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 700;
  text-shadow: -2px -1px 0 #00000066, 2px -1px 0 #00000066, -2px 1px 0 #00000066,
    2px 1px 0 #00000066;
  opacity: 0.65;
}
.dictionary {
  padding: 0 var(--main-padding);
}
.mode-pane.selected {
  opacity: 1;
  color: rgb(202, 255, 202);
}
.mode-pane:not(.selected) {
  background: var(--pane-highlight-color);
  border-top: 1px solid #00000033;
}
</style>
