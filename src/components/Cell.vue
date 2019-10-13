<template>
	<div class="cell"></div>
</template>

<script>
export default {
  name: 'Cell',
  components: {}
};
</script>

<style scoped>
.cell {
	width: var(--board-size);
  min-height: var(--board-size);
	max-height: calc(
		var(--board-size) * (var(--cells-high) / var(--cells-width) / 3)
	);
	display: grid;
	grid-template-rows: repeat(var(--cells-wide), 1fr);
	grid-template-columns: repeat(var(--cells-high), 1fr);
	box-shadow: 1px 1px calc(var(--main-padding) / 2) #00000066,
		-1px -1px calc(var(--main-padding) / 2) #00000066;
	outline: calc(var(--board-size) / var(--cells-wide) / 12) solid
		var(--blank-color);
}
@media (orientation: landscape) {
	@media (orientation: landscape) {
		.board {
			max-width: 60vw;
			max-height: 60vw;
		}
	}
}
</style>
