<template>
	<div class='mode-bar'>
    <div><div id='diagram-pane'
      class='mode-pane'
      :class='$store.state.editMode === `diagram` ? `selected` : ``'
      @pointerdown='changeEditMode'
    >EDIT DIAGRAM</div></div>
    <div><div id='puzzle-pane'
      class='mode-pane'
      :class='$store.state.editMode === `puzzle` ? `selected` : ``'
      @pointerdown='changeEditMode'
    >EDIT PUZZLE</div></div>
    <div><div id='clues-pane'
      class='mode-pane'
      :class='$store.state.editMode === `clues` ? `selected` : ``'
      @pointerdown='changeEditMode'
    >EDIT CLUES</div></div>
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
  grid-template-columns: 1fr 1fr 1fr;
}
.mode-bar > div {
  display: flex;
  align-items: center;
  justify-content: center;
}
.mode-bar > div:first-child {
  border-right: calc(var(--main-padding) / 8) solid #eeeeeeaa;
}
.mode-bar > div:last-child {
  border-left: calc(var(--main-padding) / 8) solid #eeeeeeaa;
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
  opacity: 0.75;
}
.mode-pane.selected {
  opacity: 1;
  background: var(--pane-highlight-color);
}
</style>
