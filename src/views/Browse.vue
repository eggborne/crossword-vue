<template>
  <div class="browse">
    <div class='diagram-list'>

    </div>
  </div>
</template>

<script>
import Button from '../components/Button';

export default {
  name: 'ControlPanel',
  data: () => ({
    diagrams: []
  }),
  props: {

  },
  components: {
    Button,
  },
  created: {

  },
  methods: {

  }
};
</script>

<style scoped>
.browse {
  background: #333;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: var(--main-padding)
}
button {
  width: 60vw;
  height: calc(var(--header-height) * 1.5);
  font-size: 1.25em;
}
@media (orientation: landscape) {

}
</style>
