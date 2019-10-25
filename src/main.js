/* eslint-disable linebreak-style */
/* eslint-disable global-require */
import Vue from 'vue';
import Vuex from 'vuex';
// import VueWorker from 'vue-worker';
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';

Vue.use(Vuex);
// Vue.use(VueWorker, '$webWorker');

window.addEventListener('load', () => {
  console.error('LOADED.');  
  const manifest = require("../public/manifest.json");
  document.querySelector("meta[name=theme-color]").setAttribute("content", manifest.theme_color);
});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
