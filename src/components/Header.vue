<template>
	<header id='page-header'>
		<h1>Crosswords<span style='opacity: 0.75' >.cc</span></h1>
		<div class="button-area">
			<Button :label="`TRAIN`" :handleClick="handleClickTrain" />
			<Button id='save-button' :label="`SAVE`" :handleClick="handleClickToSave" />
			<!-- <Button :label="`<`" :handleClick="handleClickPrevious" /> -->
			<Button :label="`BROWSE`" :handleClick="handleClickToBrowse" />
			<!-- <Button :label="`>`" :handleClick="handleClickNext" /> -->
			<SettingsMenu />
		</div>
	</header>
</template>

<script>
import Button from './Button';
import SettingsMenu from './SettingsMenu';

export default {
  name: 'Header',
  components: {
		Button,
		SettingsMenu
  },
  props: {
    handleClickToBrowse: Function,
    handleClickToSave: Function,
    handleClickPrevious: Function,
    handleClickNext: Function,
    handleClickTrain: Function,
  }
};
</script>

<style scoped>
header {
	background-color: var(--theme-color);
	width: 100vw;
	height: var(--header-height);
	min-height: var(--header-height);
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 calc(var(--main-padding) * 1);
	padding-right:  0;
	text-shadow: -2px -1px 0 #00000088, 2px -1px 0 #00000088, -2px 1px 0 #00000088,
		2px 1px 0 #00000088;
}
h1 {
	font-family: 'Catamaran';
	color: var(--text-color);
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
