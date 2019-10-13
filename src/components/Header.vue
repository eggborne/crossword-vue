<template>
	<header>
		<h2>Crossword Creator</h2>
	</header>
</template>

<script>
export default {
  name: 'Header'
};
</script>

<style scoped>
header {
	background-color: var(--header-color);
	width: 100vw;
	min-height: var(--header-height);
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	justify-content: center;
	padding-left: calc(var(--main-padding) * 1.5);
	text-shadow: -2px -1px 0 #00000088, 2px -1px 0 #00000088, -2px 1px 0 #00000088,
		2px 1px 0 #00000088;
}
@media (orientation: landscape) {
	header {
		grid-column-end: span 2;
	}
}
</style>
