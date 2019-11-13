<template>
<div id='log' class='activity-log' :class='[$store.state.logOpen || `closed`]'>
  <div 
    v-show='$store.state.logOpen'
    v-for='(logItem, i) in logItems'
    :key='i'
    :class='[`log-item`, logItem.type]'
  >
    <div>{{ logItem.iterations }}</div>
    <div>{{ logItem.message }}</div>      
  </div>
  <div>&nbsp;</div>
</div>
</template>

<script>
export default {
  name: 'ActivityLog',
  props: {
    logItems: Array,   
  },
  updated() {
    if (this.$store.state.logOpen) {
      let logPanel = document.querySelector('#log')
      logPanel.scrollTop = logPanel.scrollHeight;
    }
  }
};
</script>

<style scoped>
.activity-log {
  font-size: 0.65rem;
  font-weight: 700;
  position: fixed;
  top: var(--header-height);
  right: 0;
  /* height: var(--board-size); */
  min-width: 75vmin;
  max-width: 100vmin;
  height: 100vmin;
  min-height: 100vmin;
  max-height: 100vmin;
  background: #333333;
  padding: var(--main-padding);
  transition: transform 400ms ease;
  border-bottom-left-radius: calc(var(--main-padding) / 4);
  /* text-shadow: -2px -1px 0 #00000088, 2px -1px 0 #00000088, -2px 1px 0 #00000088,
		2px 1px 0 #00000088; */
  display: grid;
  grid-auto-rows: calc(var(--header-height) / 2);
  align-items: center;
  align-content: stretch;
  grid-row-gap: calc(var(--main-padding) / 2);  
  z-index: 3;
  overflow-y: auto;
  /* scroll-behavior: smooth; */
}
.activity-log.closed {
  transform: translateX(100%);
  scroll-behavior: unset;
}
.activity-log button {
  
  width: var(--header-height);
  height: var(--header-height);
  padding: 0;
  display: flex;
  margin-left: calc(var(--main-padding) / 2);
  align-items: center;
  justify-content: center;
  border-radius: calc(var(--main-padding) / 4);
  background: var(--button-selected-color);
}
.activity-log.closed > button {
  background: var(--button-color);
}
.log-item {
  height: 100%;
  display: grid;
  grid-template-columns: 0.25rem 1fr;
  grid-column-gap: var(--main-padding);  
  align-content: center;
}
.log-item.normal {
  background: #00000066;
  padding: 0 var(--main-padding);
  justify-self: stretch;
  text-align: right;
}
.log-item.error {
  color: #ffaaaa;
}
.log-item.success {
  color: #aaffaa;
}
</style>
