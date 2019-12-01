<template>
  <div @pointerdown='selectClue' :class='[`clue`, (!visible) && `invisible`]'>
    <slot></slot>
  </div>
</template>

<script>
import Button from './Button.vue';
export default {
  name: 'CluePanel',
  data: () => ({
    visible: false,    
  }),
  props: {
    doomed: Boolean,
    selectClue: Function
  },
  mounted() {
    console.log('clue mountd!');
    requestAnimationFrame(() => {
      this.visible = true;
    })
  },
  updated() {
    if (this.doomed && this.visible) {
      this.visible = false;
    }
  }
};
</script>

<style scoped>
.clue {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  margin: calc(var(--main-padding) / 2);  
  /* height: calc(var(--header-height) * 1.5); */
  min-height: calc(var(--header-height) * 1.65);
  box-shadow: 0px 1px calc(var(--main-padding) / 8) #000000cc,
		0px 0px calc(var(--main-padding) / 8) #000000cc;
  /* opacity: 0; */
  transition: transform 300ms ease, opacity 300ms ease, border-color 210ms ease;
  pointer-events: all;
  border: calc(var(--main-padding) / 4) solid transparent;
}
.clue.invisible {
  transform: translateX(50%);
  opacity: 0.25;
}
.clue.editable {
  display: flex;
  justify-content: space-between;
  background-color: #12222166;
  height: calc(var(--header-height) * 1.65);
}
.clue.editable.invisible {
  transform: none;
}
#clue-edit-space {
  flex-grow: 1;
  outline: none;
  word-wrap: break-word;
  width: 65%;
}
.clue.edited .clue-edit-placeholder, #clue-edit-space:focus > .clue-edit-placeholder {
  display: none;
}
.clue.selected {
  border-color: var(--success-color);
}
.clue > div.last-child {
  margin-bottom: 0;
}
.clue > div:first-child {
  grid-row-end: span 2;
}
.clue > button {
  padding: calc(var(--main-padding) / 2);
  min-width: calc(var(--header-height) * 1.5);
  max-width: calc(var(--header-height) * 1.5);
}
.save-clue-button, .delete-clue-button  {
  width: 14vmin;
  height: min-content;
  align-self: flex-end;
  margin-left: calc(var(--main-padding));
}
.save-clue-button {
  background: var(--success-color);
}
.delete-clue-button {
  background: var(--danger-color);
}
</style>
