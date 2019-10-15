<template>
	<div id="app">    
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
    console.error('APP created');
    document.documentElement.style.setProperty('--view-height', `${window.innerHeight}px`);
    window.addEventListener('resize', () => {
      document.documentElement.style.setProperty('--view-height', `${window.innerHeight}px`);
    });
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
  --cells-wide: 13;
  --cells-high: 13;
  --header-height: 2.5rem;
  --footer-height: 1.5rem;
  --main-padding: 0.75rem;
  --board-size: calc(100vw - var(--main-padding) * 2.5);
  --body-bg-color: #c8c8c8;
  --header-color: #2d3038;
  --blank-color: #111;
  --cell-color: white;
  --button-color: rgb(58, 66, 109);
  --button-on-color: #0a0;
  --text-color: #eee;
  --main-font: 'Roboto';
  --cell-width: calc(var(--board-size) / var(--cells-wide));
  --cell-height: calc(var(--board-size) / var(--cells-wide));
  --cell-letter-size: calc(var(--cell-width) / 2.5);
  --cell-number-size: calc(var(--cell-width) / 3.5);
}
html {
  font-size: calc(1rem);
  font-family: var(--main-font);
}
* {
  user-select: none;
  box-sizing: border-box;
}
body {
  position: fixed;
  max-width: 100vw;
  margin: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow: hidden;
}
a {
  text-decoration: none;
}
a:link, a:visited {
  color: var(--text-color);
}
h1 {
	font-size: 1.15rem;
	padding: 0;
	margin: 0;
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
    /* 100vmin */
    /* auto */
    1fr
    /* var(--footer-height) */
  ;
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
