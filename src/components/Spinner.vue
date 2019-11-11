<template>
	<div class='load-spinner' :class='[direction === 1 && `clockwise`]'>
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
  }
};
</script>

<style scoped>
.load-spinner {
  --spin-direction: -1;
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
.clockwise {
  --spin-direction: 1;
}
@keyframes spin {
  0% {
    transform: rotate(0);
  }
  /* 50% {
    transform: rotate(calc(180deg * var(--spin-direction))) scale(1.3);
  } */
  100% {
    transform: rotate(calc(360deg * var(--spin-direction)));
  }
}
</style>
