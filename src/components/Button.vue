<template>
	<button v-if='!clickType' @pointerdown='handleClick' :class='highlighted ? `highlighted` : ``'>
		{{ label.toUpperCase() }}
	</button>
	<button v-else-if='clickType === `click`' @click='handleClick' :class='highlighted ? `highlighted` : ``'>
		{{ label.toUpperCase() }}
	</button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    label: String,
    highlighted: Boolean,
    clickType: String,
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
  font-size: var(--main-padding);
  font-weight: 700;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	text-shadow: -1px -1px 0 #00000088, 1px -1px 0 #00000088, -1px 1px 0 #00000088,
		2px 1px 0 #00000088;
}
button.highlighted {
  background-color: var(--button-on-color);
}
button:active {
  background-color: var(--button-on-color);
}
button.disabled {
  pointer-events: none;
  background: gray !important;
  opacity: 0.5;
}
.highlighted {
	background-color: orange;
}
</style>
