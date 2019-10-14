<template>
	<button v-on:pointerdown='handleClick'>
		{{ label.toUpperCase() }}
	</button>
</template>

<script>
export default {
	name: 'Button',
	props: {
    label: String,
    handleClick: Function
	}
};
</script>

<style scoped>
button {
  font-family: inherit;
	background-color: var(--button-color);
  color: var(--text-color);
  padding: unset;
  border-radius: calc(var(--main-padding) / 4);
  font-size: calc(var(--main-padding) * 1.1);
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	text-shadow: -2px -1px 0 #00000088, 2px -1px 0 #00000088, -2px 1px 0 #00000088,
		2px 1px 0 #00000088;
}
button:active {
  background-color: var(--button-on-color);
}
</style>
