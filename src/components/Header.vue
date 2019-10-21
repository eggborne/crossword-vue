<template>
	<header>
		<h1>Crosswords<span style='color: #ccc' >.cc</span></h1>
		<div class="button-area">
			<!-- <Button :label="`TRAIN`" :handleClick="handleClickTrain" /> -->
			<Button id='save-button' :label="`SAVE`" :handleClick="handleClickToSave" />
			<Button :label="`<`" :handleClick="handleClickPrevious" />
			<Button :label="`BROWSE`" :handleClick="handleClickToBrowse" />
			<Button :label="`>`" :handleClick="handleClickNext" />
		</div>
	</header>
</template>

<script>
import Button from './Button';

export default {
  name: 'Header',
  components: {
    Button
  },
  props: {
    handleClickToBrowse: Function,
    handleClickToSave: Function,
    handleClickPrevious: Function,
    handleClickNext: Function,
    handleClickTrain: Function,
    scanBoardForImage: Function
  }
};
</script>

<style scoped>
header {
	background-color: var(--header-color);
	width: 100vw;
	height: var(--header-height);
	min-height: var(--header-height);
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 calc(var(--main-padding) * 1);
	padding-right: 0;
	text-shadow: -2px -1px 0 #00000088, 2px -1px 0 #00000088, -2px 1px 0 #00000088,
		2px 1px 0 #00000088;
}
h1 {
	font-family: 'Catamaran';
	color: #eef;
}
.button-area {
	display: flex;
	align-items: center;
	justify-content: space-between;
}
.button-area button {
	height: calc(var(--header-height)  - var(--main-padding));
	padding: 0 calc(var(--main-padding) / 1.5);
	margin: calc(var(--main-padding) / 8);
	z-index: 0;
}
#save-button {
	margin-right: calc(var(--main-padding) / 4);
	background: rgb(53, 71, 53);
}
@media (orientation: landscape) {
	header {
		grid-column-end: span 2;
	}
}
</style>
