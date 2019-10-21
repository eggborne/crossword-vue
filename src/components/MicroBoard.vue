<template>
  <div>
	<div id='micro-board'
    :style='{
      width: `${actualWidth}px`,
      height: `${actualHeight}px`,
      gridTemplateRows: `repeat(${height}, 1fr)`,
      gridTemplateColumns: `repeat(${width}, 1fr)`
    }'
  >
		<div
			v-for='(cellData, i) in cellGrid.flat()'
			v-bind:key='i'
			:class='cellData.shaded ? `micro-cell shaded` : `micro-cell`'
		></div>
	</div>

  </div>
</template>

<script>

export default {
  name: 'MicroBoard',
  props: {
    actualWidth: Number,
    actualHeight: Number,
    width: Number,
    height: Number,
    cellGrid: Array,
  }
};
</script>

<style scoped>
#micro-board {
  position: fixed;
  top: 0;
  left: 0;
  transform: translateX(-100%);
	background: white;
  display: grid;
}
.micro-cell {
  position: relative;
  width: 100%;
  height: 100%;
}
.micro-cell.shaded {
  background: black;
}
</style>
