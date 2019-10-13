<template>
	<div class="control-panel">

	</div>
</template>

<script>
export default {
  name: 'ControlPanel',
  components: {

  }
};
</script>

<style scoped>
.control-panel {
	--panel-space: calc(var(--view-height) - var(--header-height) - 100vw);
  font-size: calc(var(--header-height) / 3.5);
  position: relative;
  max-width: 100%;
  background: var(--header-color);
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: var(--header-height) repeat(2, 3rem);
  grid-column-gap: var(--main-padding);
  grid-row-gap: var(--main-padding);
  padding: var(--main-padding);
}
@media (orientation: landscape) {
	.control-panel {
    width: 100%;
    height: 100%;
    grid-template-columns: 0.5fr 0.5fr;
    grid-column-start: 2;
    justify-self: end;
  }
}
</style>
