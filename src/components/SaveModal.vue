<template>
	<div class="save-modal">
    <input 
    id='name-input' 
    type='text' 
    placeholder='Leroy'
    v-model='nameValue'
    v-on:input='handleNameChange'
    />
    <div id='save-button-area'>
      <Button 
        :label="`SAVE`" :handleClick="() => handleSaveDiagram(nameValue)" 
      />
      <Button 
        :label="`NO`" :handleClick="handleClickCancelSave" 
      />
    </div>
	</div>
</template>

<script>
import Button from './Button';
export default {
  name: 'SaveModal',
  data: () => ({
    nameValue: ''
  }),  
  props: {
    handleSaveDiagram: Function,
    handleClickCancelSave: Function,    
  },
  components: {
    Button
  },
  methods: {
    handleNameChange(e, newValue) {
      // this.nameValue = newValue;
    }
  }
};
</script>

<style scoped>
.save-modal {
  position: fixed;
  top: var(--main-padding);
  /* top: 50%; */
  left: 50%;;
	background: var(--body-bg-color);
	color: var(--blank-color);
	width: 95%;
  min-height: 100vw;
  padding: calc(var(--main-padding) * 2);
  
  /* transform: translate(-50%, -50%); */
  transform: translate(-50%, 0);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: space-between;

	box-shadow: 1px 1px calc(var(--main-padding) / 2) #00000066,
		-1px -1px calc(var(--main-padding) / 2) #00000066;
	outline: calc(var(--board-size) / var(--cells-wide) / 12) solid
    var(--blank-color);
    z-index: 1;
}
#save-button-area {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;  
}
button {
  font-size: 2rem;
	flex-grow: 1;
  height: calc(var(--header-height) * 1.5);
  padding: var(--header-height)
}
button:last-of-type {
  font-size: 0.8rem;
	flex-grow: 0.5;
  height: calc(var(--header-height) * 1.25);
  padding: calc(var(--header-height) / 2);
  margin-left: var(--main-padding);
}
input {
  padding: 0.5rem;
  text-align: center;
  background: var(--cell-color);
  color: var(--blank-color);
  font-size: 2rem;
  font-family: inherit;
  font-weight: bold;
  height: var(--header-height);
  box-shadow: 1px 1px 2px #00000066,
		-1px -1px 2px #00000066;
}
</style>
