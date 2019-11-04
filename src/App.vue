<template>
	<div id="app" :class='`${$store.state.uiOptions.theme}-theme`'>
		<router-view />
		<!-- <div id="nav">
			<router-link to="/">Home</router-link> |
			<router-link to="/browse">Browse</router-link>
		</div> -->
	</div>
</template>

<script>
export default {
  name: 'App',
  created() {
    console.error('APP created', this.$store.state);
    document.documentElement.style.setProperty('--view-height', `${window.innerHeight}px`);
    window.addEventListener('resize', () => {
      document.documentElement.style.setProperty('--view-height', `${window.innerHeight}px`);
    });
    const options = localStorage.getItem('cc-options');
    const retrievedUiOptions = options && JSON.parse(options).uiOptions;
    const retrievedPuzzleOptions = options && JSON.parse(options).puzzleOptions;
    if (retrievedUiOptions) {
      console.warn('got local', retrievedUiOptions);
      this.$store.dispatch('loadSavedUIOptions', retrievedUiOptions)
      // this.$store.dispatch('changeUIColor', {attr: 'themeColor', newValue: retrievedUiOptions.themeColor, save: false});
      // this.$store.dispatch('changeUIColor', {attr: 'bodyBgColor', newValue: retrievedUiOptions.bodyBgColor, save: false});
      // this.$store.dispatch('changeUIColor', {attr: 'cellColor', newValue: retrievedUiOptions.cellColor, save: false});
      // this.$store.dispatch('changeUIColor', {attr: 'blankColor', newValue: retrievedUiOptions.blankColor, save: false});
      // this.$store.dispatch('toggleDarkTheme', { newValue: retrievedUiOptions.theme, save: false});
    } else {
      const manifest = require("../public/manifest.json");
      document.querySelector("meta[name=theme-color]").setAttribute("content", manifest.theme_color);
      console.warn('NO ENTRY IN LOCAL STORAGE');
    }
    if (window.PointerEvent) {
      window.CLICK_METHOD = { down: 'onPointerDown', up: 'onPointerUp' };
    } else if (window.TouchEvent) {
      window.CLICK_METHOD = { down: 'onTouchStart', up: 'onTouchEnd' };
    } else {
      window.CLICK_METHOD = { down: 'onMousedown', up: 'onMouseUp' };
    }
  }
};
</script>

<style>
:root {
  --cells-wide: 15;
  --cells-high: 15;
  --header-height: 2.5rem;
  --footer-height: 1.5rem;
  --main-padding: 0.75rem;
  --board-size: calc(100vw - var(--main-padding) * 3.5);
  --body-bg-color: #c8c8c8;
  --theme-color: #153282;
  --blank-color: #060606;
  --cell-color: white;
  --cell-text-color: var(--blank-color);
  --pane-highlight-color: rgba(255, 166, 0, 0.326);
  --button-color: rgb(48, 60, 126);
  --button-on-color: blue;
  --button-selected-color: rgb(35, 167, 33);
  --text-color: #eee;
  --secondary-text-color: #222;
  --danger-color: #7c3a3a;
  --main-font: 'Roboto';
  --cell-width: calc(var(--board-size) / var(--cells-wide));
  --cell-height: calc(var(--board-size) / var(--cells-wide));
  --cell-letter-size: calc(var(--cell-width) / 1.5);
  --cell-number-size: calc(var(--cell-width) / 3.5);
  --control-row-height: calc(var(--header-height) * 1.25);
  --control-panel-min-height: calc((var(--control-row-height) * 3.75) + (var(--main-padding) * 3));
  --theme-word-color: rgba(0, 0, 255, 0.25);
  --theme-word-color-2: rgb(58, 173, 240);
}
html {
  font-size: calc(1rem);
  font-family: var(--main-font);
  overflow: hidden;
}
* {
  user-select: none;
  box-sizing: border-box;
  /* transition: background 320ms ease; */
}
body {
  /* position: fixed; */
  max-width: 100vw;
  margin: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow: hidden;
}
.dark-theme {
  --body-bg-color: #111;
  --theme-color: #090909;
  --button-color: rgb(21, 24, 44);
  --button-on-color: rgb(44, 44, 79);
  --button-selected-color: rgb(16, 54, 15);
  --text-color: #888;
  --secondary-text-color: var(--text-color);
  --cell-color: #555;
  --blank-color: #111;
  --cell-text-color: var(--blank-color);
  --pane-highlight-color: rgba(255, 166, 0, 0.121);
}
.dark-theme button {
  border-color: var(--text-color) !important;
}
.dark-theme header {
  color: var(--text-color)
}
a {
  text-decoration: none;
}
a:link, a:visited {
  color: var(--text-color);
}
h1 {
	font-size: calc(var(--header-height) / 2.5);
	padding: 0;
	margin: 0;
}
input[type='range'] {
	
	position: relative;
	-webkit-appearance: none; /* Override default CSS styles */
	appearance: none;
	/* flex-grow: 1; */
	height: calc(var(--main-padding) / 1.5);
	border: 1px solid var(--cell-color);
	border-radius: var(--main-padding);
	/* background: transparent; */
	outline: none;
	/* opacity: 0.75; */
}
input::-webkit-slider-thumb {
	border-radius: 50%;
	-webkit-appearance: none;
	appearance: none;
	width: calc(var(--header-height) / 2);
	height: calc(var(--header-height) / 2);
	transform-origin: center;
	transform: scale(1.25);
	background: var(--cell-color);
	cursor: pointer;
}
input::-moz-range-thumb {
	border-radius: 50%;
	width: calc(var(--header-height) / 2);
	height: calc(var(--header-height) / 2);
	transform-origin: center;
	transform: scale(1.25);
	background: var(--cell-color);
	cursor: pointer;
}
#app {
	color: var(--text-color);
  background: var(--body-bg-color);
  min-height: var(--view-height);
  width: 100vw;
  display: grid;
  align-items: stretch;
  justify-items: stretch;
  grid-template-rows:
    var(--header-height)
    1fr
  ;
}
.dimmed {
  opacity: 0.5;
}
#nav {
	padding: 30px;
}

#nav a {
	font-weight: bold;
	color: #2c3e50;
}

#nav a.router-link-exact-active {
	color: #42b983;
}
</style>
