<template>
	<button v-if='clickMethod === `onpointerdown`' @pointerdown='pointerDownAction' @pointerup='pointerUpAction' class='clickable'>
		<slot></slot>
	</button>
	<button v-else-if='clickMethod === `ontouchstart`' @touchstart='pointerDownAction' @touchend='pointerUpAction' class='clickable'>
		<slot></slot>
	</button>
	
	<!-- maybe use onmousedown/up? -->
	<button v-else-if='clickMethod === `onclick`'  @click='pointerDownAction' class='clickable'>
		<slot></slot>
	</button>
</template>

<script>
export default {
	name: 'Touchable',
	data: () => ({ 
		// clickMethod: window.CLICK_METHOD
	}),
	computed: {
		clickMethod: () => { return window.CLICK_METHOD }
	},
	props: {
		pointerDownAction: Function,
		pointerUpAction: {
      type: Function,
      default: () => null
    }
	}
};
</script>
