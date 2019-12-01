<template>
<div id='log' class='keyboard' :class='[$store.state.keyboardOpen || `closed`]'>
  <div class='key-rows'>
    <div      
      v-for='(keyRow, r) in keyRows'
      :key='r'
      :class='[`key-row`]'
    >
    <div 
        v-if='r === 2'
        :class='[`keyboard-key delete-key`]'
        @pointerdown='handleClickKey'
      >
        {{ 'DEL' }}
      </div>
      <div 
        v-for='(keyChar, k) in keyRow'
        :key='(r + 1) * k'
        :class='[`keyboard-key`]'
        @pointerdown='handleClickKey'
      >
        {{ keyChar.toUpperCase() }}
      </div>
      <div 
        v-if='r === 2'
        :class='[`keyboard-key delete-key`]'
        @pointerdown='handleClickKey'
      >
        {{ 'DEL' }}
      </div>
      
    </div>
  </div>
  <div class='button-area'>
    <Button :label='`Done`' :handleClick='handleDismissKeyboard' />
  </div>
</div>
</template>

<script>
import Button from './Button';
export default {
  name: 'Keyboard',
  data() { 
    return {
      keyRows: [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm']
      ]
    } 
  },
  props: {
    handleClickKey: Function
  },
  components: {
    Button,
  },
  methods: {
    handleDismissKeyboard() {
      this.$store.commit('toggleKeyboard');
      this.$store.commit('changeEnteringLetters', false);
    }
  }
};
</script>

<style scoped>
.keyboard {  
  font-size: 0.75rem;
  font-weight: 700;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100vmin;
  height: var(--lower-area-height);
  max-height: var(--lower-area-height);
  background: var(--blank-color);
  z-index: 2;
  transition: transform 400ms ease;
  text-shadow: -1px -1px 0 #00000088, 1px -1px 0 #00000088, -1px 1px 0 #00000088,
		1px 1px 0 #00000088;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
}
.key-row {
  display: flex;
  align-items: stretch;
  justify-content: center;
  /* padding: calc(var(--main-padding) / 4); */
  height: minmax(calc(var(--lower-area-height) / 16), calc(var(--lower-area-height) / 10));

}
.button-area {
  /* height: calc(var(--lower-area-height) / 7); */
  min-height: var(--header-height);
}
.keyboard button {
  height: 100%;
  width: 30vmin;
  font-size: calc(100vmin / 16);
}
.keyboard.closed {
  transform: translateY(100%);
}
.keyboard-key {
  width: 8vmin;
  background: var(--button-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 7vmin;
  border-radius: 30%;
  margin: 0.5vmin;
  transition: transform 105ms ease;
}
.delete-key:first-of-type {
  visibility: hidden;
  pointer-events: none;
  margin: 0;
}
.delete-key {
  width: 10vmin;
  font-size: 4vmin;
  margin: calc(var(--main-padding) / 4);
  background: var(--danger-color);
  /* align-self: flex-end; */
  
}
.keyboard-key:active {
  transform: scale(0.95);
}
.log-item {
  height: 100%;
  display: grid;
  grid-template-columns: calc(var(--main-padding) * 1) 1fr;
  grid-column-gap: var(--main-padding);  
  align-content: center;
}
.log-item.normal {
  background: #00000066;
  padding: 0 var(--main-padding);
}
.log-item.error {
  color: #ffaaaa;
}
.log-item.success {
  color: #aaffaa;
}

@media screen and (orientation: landscape) {
  .keyboard {
    display: none;
  }
}
</style>
