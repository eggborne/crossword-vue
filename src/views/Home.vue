<template>
  <div class="home">
    <div class='board-area'>
      <Board />
    </div>
    <ControlPanel />
  </div>
</template>

<script>
import Board from '../components/Board.vue';
import ControlPanel from '../components/ControlPanel.vue';

export default {
  name: 'home',
  components: {
    Board,
    ControlPanel
  },
};
</script>

<style scoped>
.home {
  min-height: 100%;
  display: grid;
  grid-template-rows:
    100vmin
    1fr
    /* var(--footer-height) */
  ;
}
.board-area {
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}
@media (orientation: landscape) {
	.board-area {
		grid-column-start: 1;
	}
}
</style>
