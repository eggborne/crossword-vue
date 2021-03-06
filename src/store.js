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
    loaded: false,
    gotMLData: false,
    gotMLTrainingData: false,
    editMode: 'diagram',
    editDirection: 'across',
    enteringLetters: false,
    savingType: 'diagram',
    selectedWord: {},
    selectedCell: {},
    uiOptions: {
      theme: 'light',
      themeColor: '#153282',
      bodyBgColor: '#c8c8c8',
      cellColor: '#ffffff',
      blankColor: '#060606'
    },
    editorOptions: {
      logLength: 100
    },
    puzzleOptions: {
      rules: {
        themeWords: 2,
        wordLengths: {
          min: 3,
          max: 23
        },
        allChecked: true,
        blackRate: 30,
        contiguous: true
      }
    },
    dictionaryOptions: {
      sortBy: 0,
      filterBy: 0,
      sortTypes: [
        { labelText: `A-Z`, valueAmount: 0 },
        { labelText: `Scrabble`, valueAmount: 1 },
        { labelText: `Clued`, valueAmount: 2 },
      ],
      filterTypes: [
        { labelText: `First Letter`, valueAmount: 0 },
        { labelText: `Length`, valueAmount: 1 },
      ],
      viewLetter: undefined,
      viewLength: '3'
    },
    menuOpen: false,
    logOpen: false,
    keyboardOpen: false,
    toastVisible: false,
    toastMessage: ''
  },
  mutations: {
    setRule(state, payload) {
      state[payload.attr] = payload.newValue;
    },
    setLoaded(state) {
      state.loaded = true;
    },
    changeTheme(state, newTheme) {
      state.uiOptions.theme = newTheme;
    },
    toggleMenu(state, force) {
      state.menuOpen = force || !state.menuOpen;
    },
    toggleKeyboard(state, force) {
      state.keyboardOpen = force || !state.keyboardOpen;
    },
    toggleLog(state, force) {
      state.logOpen = force || !state.logOpen;
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
    changeEditDirection(state, newDirection) {
      state.editDirection = newDirection;
    },
    changeEnteringLetters(state, newValue) {
      state.enteringLetters = newValue;
    },
    changeSavingType(state, newValue) {
      state.savingType = newValue;
    },
    changeSelectedWord(state, newWord) {
      state.selectedWord = newWord;
    },
    changeSelectedCell(state, newCell) {
      state.selectedCell = newCell;
    },
    setLoadedState(state, payload) {
      state[payload.loadEvent] = payload.loadedStatus;
    },
    setToastMessage(state, message) {
      state.toastMessage = message;
    },
    setToastVisible(state, newVisibleState) {
      state.toastVisible = newVisibleState;
    },
    setDictionarySort(state, newSort) {
      state.dictionaryOptions.sortBy = newSort;
    },
    setDictionaryViewLetter(state, newViewLetter) {
      state.dictionaryOptions.viewLetter = newViewLetter;
    },
    setDictionaryFilter(state, newFilter) {
      state.dictionaryOptions.filterBy = newFilter;
    },
    setDictionaryViewLength(state, newViewLength) {
      state.dictionaryOptions.viewLength = newViewLength;
    },
    setDictionaryViewLetter(state, newViewLetter) {
      state.dictionaryOptions.viewLetter = newViewLetter;
    }
  },
  actions: {
    // adjustRule(context, payload) {

    // },
    loadSavedUIOptions(context, payload) {
      Object.keys(payload).forEach((attr) => {
        const attrPayload = {
          attr,
          newValue: payload[attr]
        };
        console.log('dispatching', attrPayload);
        context.dispatch('changeUIColor', attrPayload);
      });
      requestAnimationFrame(() => {
        document.querySelector("meta[name=theme-color]").setAttribute("content", payload.themeColor); 
      });
    },
    changeUIColor(context, payload) {
      const { attr, newValue, save } = payload;
      const mutation = `change${attr[0].toUpperCase() + attr.slice(1)}`;
      const cssVar = `--${attr.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase()}`;
      document.documentElement.style.setProperty(cssVar, newValue);
      context.commit(mutation, newValue);
      requestAnimationFrame(() => {
        if (attr === 'themeColor') {
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
    toggleDirection(context) {
      const newDirection = context.state.editDirection === 'across' ? 'down' : 'across';
      context.commit('changeEditDirection', newDirection);
    },
    setLoaded(context, loadEvent) {
      context.commit('setLoadedState', { loadEvent, loadedStatus: true });
    },
    updateSelectedCell(context, payload) {
      context.commit('changeSelectedCell', { ...payload });
    }

  }
});
