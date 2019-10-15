<template>
	<header>
		<h1>Crossword Creator</h1>
		<div class="button-area">
			<Button id='save-button' :label="`SAVE`" :handleClick="handleClickToSave" />
			<Button :label="`BROWSE`" :handleClick="handleClickToBrowse" />
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
		handleClickToSave: Function
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
	padding: 0 calc(var(--main-padding) * 1.5);
	padding-right: 0;
	text-shadow: -2px -1px 0 #00000088, 2px -1px 0 #00000088, -2px 1px 0 #00000088,
		2px 1px 0 #00000088;
}
h1 {
	font-family: 'Catamaran';
}
.button-area {
	display: flex;
	align-items: stretch;
	justify-content: space-between;
	align-self: stretch;
	/* width: calc(var(--header-height) * 2.5); */
	padding: 0.2rem;
}
.button-area button {
	flex-grow: 0.45;
	background: rgb(61, 79, 105);
	color: white;
	padding: var(--main-padding);
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
