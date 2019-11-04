<template>
  <div class="clues-modal">
    Clues for {{ wordObj.word }} <input
    id='word-input'
    type='text'
    placeholder=''
    v-model='clueValue'
    />
    <div id='save-button-area'>
      <Button
        id='cancel-button'
        :label="`Cancel`" :handleClick="handleClickCancelSave"
      />
      <Button
        id='save-button'
        :label="`Save`" :handleClick="() => handleSaveWord(clueValue)"
      />
    </div>
  </div>
  <!-- <Spinner :direction='-1' />
  <div class='load-message'>loading...</div> -->
</template>

<script>
import Button from './Button';
import Spinner from './Spinner';

export default {
  name: 'ClueModal',
  data: () => ({
    clueValue: '',
  }),
  props: {
    handleSaveClue: Function,
    handleClickCancelSave: Function,
  },
  components: {
    Button,
    Spinner
  },
  methods: {
    handleNameChange(e, newValue) {
      // this.clueValue = newValue;
    }
  }
};
</script>

<style scoped>
.clues-modal {
  position: fixed;
  top: var(--main-padding);
  left: 50%;;
	background: var(--body-bg-color);
	color: var(--blank-color);
	width: 95%;
  padding: calc(var(--main-padding) * 1.5);
  transform: translate(-50%, 0);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  /* justify-content: space-between; */
	box-shadow: 1px 1px calc(var(--main-padding) / 2) #00000066,
		-1px -1px calc(var(--main-padding) / 2) #00000066;
  z-index: 1;
  text-align: center;
}
.status-area {
  height: var(--header-height);
  font-size: 1rem;
  font-weight: 700;
  color: green;
}
.status-area.error {
  color: red;
}
#save-button-area {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: calc(var(--header-height) * 1.25);
  justify-self: flex-end;
  flex-grow: 1;
}
button {
  height: 100%;
}
#save-button {
  font-size: 1.5rem;
  padding: 0 var(--header-height);
  margin-left: var(--main-padding);
}
#cancel-button {
  font-size: 0.8rem;
  padding: 0 calc(var(--header-height) / 2);
  background: rgb(123, 124, 95)
}
input {
  padding: 0.5rem;
  margin: var(--main-padding);
  text-align: center;
  background: var(--cell-color);
  color: var(--blank-color);
  font-size: 1.5rem;
  font-family: inherit;
  font-weight: bold;
  height: 2.25rem;
  box-shadow: 1px 1px 2px #00000066,
		-1px -1px 2px #00000066;
}
#word-input {
  text-transform: uppercase;
}
</style>
