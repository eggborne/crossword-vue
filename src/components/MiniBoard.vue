<template>
  <div 
    :style='addedToTraining ? { 
      outline: `calc(var(--main-padding) / 4) solid ${mlLabel === 1 ? `#a44` : mlLabel === 0.5 ? `rgb(255, 200, 0)` : `rgb(114, 170, 82)`}` 
    } : ``'
  >
	<div :class="[selected ? `mini-board selected` : `mini-board`]"
    :style='{
      gridTemplateRows: `repeat(${height}, 1fr)`,
      gridTemplateColumns: `repeat(${width}, 1fr)`
    }'
  >
		<div
			v-for='(cellData, i) in cellGrid.flat()'
			v-bind:key='i'
			:class='cellData.shaded ? `shaded` : ``'
		></div>
	</div>
  <div class='added-message'>
    {{ swastikaPercent }}%
  </div>
  </div>
</template>

<script>

export default {
  name: 'MiniBoard',
  props: {
    width: Number,
    height: Number,
    cellGrid: Array,
    selected: Boolean,
    addedToTraining: Boolean,
    mlLabel: Number,
    swastikaPercent: Number,
    onClickDiagram: Function
  }
};
</script>

<style scoped>
.mini-board {
  position: relative;
	background: var(--cell-color);
	color: var(--blank-color);	
  width: 100%;
  height: 100%;
  display: grid;
}
.mini-board.selected {
  background-color: rgba(93, 255, 93, 0.605);
}
.added-message {
  font-size: 0.75rem;
  font-weight: 700;
  width: 100%;
  text-align: center;
  transform: translateY(20%);
  /* display: none; */
}
.added .added-message {
  display: block;
}
.mini-board > div {
  border: 1px solid var(--blank-color);
}
.mini-board > div.shaded {
  background: var(--blank-color);
}
@media (orientation: landscape) {
	@media (orientation: landscape) {
		.mini-board {
			
		}
	}
}
</style>
