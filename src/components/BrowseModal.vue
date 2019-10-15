<template>
	<div class="browse-modal">
    <div class='diagram-list'>      
      <div
        class='browse-diagram'
        v-for='diagram in diagrams'
        v-on:pointerdown='() => handleClickDiagram(diagram)'
        v-bind:key='diagram.id'
      >
      <MiniBoard 
        :id='diagram.id'        
        :width='diagram.width'
        :height='diagram.height'
        :cellGrid='diagram.cells'
        :selected='diagramSelected === diagram'
      />
      <!-- <div>
      id #{{ diagram.id }}
      </div>
      <div>
      creator: {{ diagram.creator }}
      </div>
      <div>
      size: {{ diagram.width }}
      </div>
      <Button 
        :label="`LOAD`" :handleClick="() => handleClickChooseDiagram(diagram)" 
      /> -->
      </div>
    </div>
    <div v-if='diagramSelected' class='info-area'>
      <div>
        #{{ diagramSelected.id }} by {{ diagramSelected.creator }} 
      </div>
      <div>
        Size: {{ diagramSelected.width }}x{{ diagramSelected.height }}
      </div>
    </div>
    <div v-else class='info-area'>
      Select a diagram for info
    </div>
    <div id='browse-button-area'>
      <Button 
        :label="`BACK`" :handleClick="handleClickCancelBrowse" 
      />
      <Button 
        :class='diagramSelected || `disabled`'
        :label="`LOAD`" :handleClick="() => handleClickChooseDiagram(diagramSelected)" 
      />
    </div>
	</div>
</template>

<script>
import Button from './Button';
import MiniBoard from './MiniBoard';
export default {
  name: 'BrowseModal',
  data: () => ({
    diagramSelected: undefined
  }),  
  props: {
    diagrams: Array,
    handleClickChooseDiagram: Function,
    handleClickCancelBrowse: Function,    
  },
  components: {
    Button,
    MiniBoard
  },
  methods: {
    handleClickDiagram(diagram) {
      if (this.diagramSelected !== diagram) {
        this.diagramSelected = diagram
      }
    }
  }
};
</script>

<style scoped>
.browse-modal {
  position: fixed;
  top: var(--main-padding);
  left: 50%;;
	background: var(--body-bg-color);
	color: var(--blank-color);
	width: calc(100vw - var(--main-padding) * 2);
  height: calc(var(--view-height) - var(--main-padding) * 2);
  padding: var(--main-padding) 0;
  transform: translate(-50%, 0);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;

	box-shadow: 1px 1px calc(var(--main-padding) / 2) #00000066,
		-1px -1px calc(var(--main-padding) / 2) #00000066;
    z-index: 1;
}
.diagram-list {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-row-gap: calc(var(--main-padding) / 2);
  grid-column-gap: calc(var(--main-padding) / 2);
  overflow-y: auto;
  padding: calc(var(--main-padding) / 2);
  align-content: start;
  flex-grow: 1;
}
.info-area {
  font-weight: 700;
  height: calc(var(--board-size) / 3);
  width: 100%;
  padding: var(--main-padding);
  display: flex;
  /* flex-direction: column; */
  align-items: center;
  justify-content: space-evenly;
}
#browse-button-area {
  display: flex;
  align-self: stretch;
  padding: var(--main-padding);
  justify-content: center;
  align-items: flex-end;
  height: calc(var(--header-height) * 2);
}
#browse-button-area button {
  font-size: 1.25rem;
  width: 50%;
  height: calc(var(--header-height) * 1.5);
  padding: calc(var(--header-height) / 2)
}
#browse-button-area button.disabled {
  background: rgb(152, 168, 147) !important;
  border: 0;
  /* color: gray; */
  pointer-events: none;

}
#browse-button-area button:last-child {
  background: green;
}
</style>
