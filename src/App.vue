<template>
	<div id="app">
    <Header />
		<router-view />
		<!-- <div id="nav">
			<router-link to="/">Home</router-link> |
			<router-link to="/about">About</router-link>
		</div> -->
	</div>
</template>

<script>
import Header from '@/components/Header.vue';

export default {
  name: 'App',
  components: {
    Header
  },
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

    console.error('USING CLICK -------', window.CLICK_METHOD, ' ------------------------');
  }
};
</script>

<style>
:root {
  --cells-wide: 13;
  --cells-high: 13;
  --header-height: 2.25rem;
  --footer-height: 1.5rem;
  --main-padding: 0.75rem;
  --board-size: calc(100vw - var(--main-padding) * 2.5);
  --body-bg-color: rgb(200, 200, 200);
  --header-color: #2d3038;
  --blank-color: #111;
  --cell-color: white;
  --button-color: rgb(58, 66, 109);
  --button-on-color: #0a0;
  --text-color: #eee;
  --main-font: 'Catamaran';
  --cell-width: calc(var(--board-size) / var(--cells-wide));
  --cell-height: calc(var(--board-size) / var(--cells-wide));
  --cell-letter-size: 1.2rem;
  --cell-number-size: 0.4rem;
}
html {
  font-size: calc(1rem + 1vmin);
  font-family: var(--main-font);
}
* {
  user-select: none;
  box-sizing: border-box;
}
a {
  text-decoration: none;
}
a:link, a:visited {
  color: var(--text-color);
}
body {
  position: fixed;
  max-width: 100vw;
  margin: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow: hidden;
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
