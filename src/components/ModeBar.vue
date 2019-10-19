<template>
	<div class='mode-bar'>
    <div><div id='diagram-pane'
      class='mode-pane'
      :class='editMode === `diagram` ? `selected` : ``'
      @pointerdown='changeEditMode'
    >EDIT DIAGRAM</div></div>
    <div><div id='puzzle-pane'
      class='mode-pane'
      :class='editMode === `puzzle` ? `selected` : ``'
      @pointerdown='changeEditMode'
    >EDIT PUZZLE</div></div>
  </div>
</template>

<script>
export default {
  name: 'Spinner',
  props: {
    editMode: String,
    changeEditMode: Function
  }
};
</script>

<style scoped>
.mode-bar {
  width: 100%;
  height: calc((var(--header-height) * 1.25));
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-content: stretch;
  justify-items: stretch;
  align-self: flex-end;
}
.mode-bar > div {
  display: flex;
  align-items: center;
}
.mode-bar > div:nth-child(1) {
  border-right: calc(var(--main-padding) / 8) solid #eeeeeeaa;
}
.mode-bar > div:nth-child(2) {
  border-left: calc(var(--main-padding) / 8) solid #eeeeeeaa;
  justify-content: flex-end;
}
.mode-pane {
  height: 90%;
  width: calc(100% - (var(--main-padding) / 2));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
  text-shadow: -2px -1px 0 #00000088, 2px -1px 0 #00000088, -2px 1px 0 #00000088,
    2px 1px 0 #00000088;
  opacity: 0.8;
}
.mode-pane.selected {
  opacity: 1;
  background: rgba(255, 166, 0, 0.326);
}
</style>
