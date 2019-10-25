import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const saveToLocalStorage = (payload) => {
  const finalPayload = JSON.stringify({ [payload.name]: payload.value });
  console.warn('sending to local:', finalPayload);
  window.localStorage.setItem('cc-options', finalPayload);
};

export default new Vuex.Store({
  state: {
    gotMLData: false,
    gotMLTrainingData: false,
    editMode: 'diagram',
    uiOptions: {
      theme: 'light',
      themeColor: '#153282',
      bodyBgColor: '#c8c8c8',
      cellColor: '#ffffff',
      blankColor: '#060606'
    },
    puzzleOptions: {
      rules: {
        themeWords: 2,
        wordLengths: {
          min: 3,
          max: 15
        },
        allChecked: true,
        blackRate: 16,
        contiguous: true
      }
    },
    menuOpen: false
  },
  mutations: {
    changeTheme(state, newTheme) {
      state.uiOptions.theme = newTheme;
    },
    toggleMenu(state, force) {
      state.menuOpen = force || !state.menuOpen;
    },
    changeThemeColor(state, newColor) {
      state.uiOptions.themeColor = newColor;
    },
    changeBodyBgColor(state, newColor) {
      state.uiOptions.bgColor = newColor;
    },
    changeCellColor(state, newColor) {
      state.uiOptions.cellColor = newColor;
    },
    changeBlankColor(state, newColor) {
      state.uiOptions.blankColor = newColor;
    },
    changeEditMode(state, newMode) {
      state.editMode = newMode;
    },
    setLoadedState(state, payload) {
      state[payload.loadEvent] = payload.loadedStatus;
    }
  },
  actions: {
    changeUIColor(context, payload) {
      const { newValue, attrName, save } = payload;
      const mutation = `change${attrName[0].toUpperCase() + attrName.slice(1)}`;
      const cssVar = `--${attrName.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase()}`;
      document.documentElement.style.setProperty(cssVar, newValue);
      context.commit(mutation, newValue);
      requestAnimationFrame(() => {
        if (attrName === 'themeColor') {
          document.querySelector("meta[name=theme-color]").setAttribute("content", newValue);
        }
        if (save) { saveToLocalStorage({ name: 'uiOptions', value: context.state.uiOptions }); }
      });
    },
    toggleDarkTheme(context, payload) {
      console.warn('toggleDarkTheme received payload', payload);

      const { newValue, save } = payload;
      let newTheme;
      if (newValue) {
        newTheme = newValue;
      } else if (context.state.uiOptions.theme === 'light') {
        newTheme = 'dark';
      } else {
        newTheme = 'light';
      }
      context.commit('changeTheme', newTheme);
      requestAnimationFrame(() => {
        const headerColor = window.getComputedStyle(document.getElementById('page-header'), null).getPropertyValue('background-color');
        document.querySelector("meta[name=theme-color]").setAttribute("content", headerColor);
        if (save) { saveToLocalStorage({ name: 'uiOptions', value: context.state.uiOptions }); }
      });
    },
    setLoaded(context, loadEvent) {
      context.commit('setLoadedState', { loadEvent, loadedStatus: true });
    }
  }
});
