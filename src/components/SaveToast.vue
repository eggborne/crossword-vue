<template>
<div id='log' class='save-toast' :class='[$store.state.toastVisible && `showing`]'>
  {{ $store.state.toastMessage }}
</div>
</template>

<script>
export default {
  name: 'Savetoast',
  props: {
     
  },
  updated() {
    if (this.$store.state.toastOpen) {
      let logPanel = document.querySelector('#log')
      logPanel.scrollTop = logPanel.scrollHeight;
    }
  }
};
</script>

<style scoped>
.save-toast {
  font-size: 1rem;
  font-weight: 700;
  position: fixed;
  top: calc(var(--header-height) / 5);
  border-radius: calc(var(--main-padding) / 4);
  transform: translateX(-50%) translateY(calc(-100% - (var(--header-height) / 5)));
  left: 50%;
  /* width: 50vmin; */
  width: max-content;
  padding: 0 var(--main-padding);
  height: var(--header-height);
  background: #000000;
  color: white;
  transition: transform 210ms ease;
  display: flex;
  align-items: center;
  justify-content: center;
  grid-row-gap: calc(var(--main-padding) / 2);  
  z-index: 4;
}
.save-toast.showing {
  transform: translateX(-50%);
}
</style>
