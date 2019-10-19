<template>
	<div class='load-spinner'>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
</template>

<script>

export default {
  name: 'Spinner',
  props: {
    direction: Number // -1 or 1
  },
  created() {
    document.documentElement.style.setProperty('--spin-direction', this.direction)
  }
};
</script>

<style scoped>
.load-spinner {
  transform-origin: center;
	background: var(--cell-color);
  width: calc((var(--header-height)));
  height: calc((var(--header-height)));
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  outline: 1px solid var(--blank-color);
  animation: spin;
  animation-duration: 900ms;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  animation-play-state: running;
  animation-fill-mode: forwards;
}
.load-spinner > div:nth-child(2), .load-spinner > div:nth-child(3) {
  background: var(--blank-color);
}
@keyframes spin {
  0% {
    transform: rotate(0) scale(1);
  }
  50% {
    transform: rotate(calc(180deg * var(--spin-direction))) scale(1.2);
  }
  100% {
    transform: rotate(calc(360deg * var(--spin-direction))) scale(1);
  }
}
</style>
