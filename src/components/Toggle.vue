<template>
<div
  :class='[option.inputType, on && `on`]'
  @pointerdown='toggleOption'
>
	<div>{{ option.title }}</div>
  <div class='groove'> 
    <div class='knob'></div>
  </div>
</div>
</template>

<script>

export default {
	name: 'Toggle',
	props: {
    option: Object,
    on: Boolean,
    toggleOption: Function
	},
	created() {
		console.warn('toggle')
  },
  components: {
    
  }
};
</script>

<style scoped>
.toggle {	
	display: flex;
	border-radius: calc(var(--inner-padding) / 2);
  align-items: center;
  justify-content: space-between;
  justify-self: center;
  width: 100%;
	min-width: 60%;  
  
}
.toggle > div:first-child {
	width: max-content%;
	text-align: left;
}
.groove {
	border: 1px solid var(--cell-color);
	border-radius: var(--main-padding);
	width: calc(var(--header-height) * 1);
	height: var(--main-padding);
	background-color: #ffffff11;
	display: flex;
	align-items: center;
	opacity: 0.75;
  transition: opacity 210ms ease;
  margin-left: calc(var(--header-height) / 2);
  box-shadow: 0px 0px 2px 1px #00000088;
}
.knob {
	position: absolute;
	width: calc(var(--header-height) / 1.5);
	height: calc(var(--header-height) / 1.5);
	background-color: var(--cell-color);
	border-radius: 50%;
	transform: translateX(-25%);
	transform-origin: center;
	transition: transform 210ms ease;
  box-shadow: 0px 0px 2px 1px #00000088;
}
.toggle.on .groove {
	background-color: #ffffff66
}
.toggle.on .knob {
	transform: translateX(calc(var(--header-height) / 3));
}
</style>
