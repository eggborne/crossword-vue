<template>
	<div class="browse-modal" :class='confirmShowing ? `showing-modal` : ``'>
    <header>
      <span>Sort: </span>
      <SelectBar
        :buttons='sortButtons'
        :option="{}"
        :targetValue="['date', 'size', 'shaded', 'swastika'].indexOf(sortType)"
        :adjustOption="changeSort"
      />
    </header>
    <div v-if='diagrams' class='diagram-list'>      
      <div
        class='browse-diagram'
        v-for='diagram in sortedDiagrams'
        v-on:click='() => handleClickDiagram(diagram)'
        v-bind:key='diagram.id'
      >
      <MiniBoard 
        :id='diagram.id'        
        :width='diagram.width'
        :height='diagram.height'
        :cellGrid='diagram.cells'
        :selected='diagramSelected === diagram'
        :addedToTraining='addedToTraining(diagram.id)'
        :swastikaPercent='diagram.swastikaPercent'
        :mlLabel='savedTrainingData.diagramIds.indexOf(diagram.id) > -1 ? savedTrainingData.output[savedTrainingData.diagramIds.indexOf(diagram.id)][`swastika`] : 0'
      />
      </div>
      <div class='list-margin'></div>
    </div>

    <div v-else class='diagram-list'>   
      <Spinner :direction='-1' />
      <div class='load-message'>loading...</div>
    </div>   

    <div v-if='diagramSelected' class='info-area'>
      <div class='text-area'>
        <div>
          <div>Diagram #{{ diagramSelected.id }} </div>
          <div>Creator: {{ diagramSelected.creator }}</div>
        </div>
        <div>
          <div>{{ diagramSelected.width }}x{{ diagramSelected.height }}</div>
          <div>{{ diagramSelected.width }} words</div>
        </div>
        <div>
          <div>{{ diagramSelected.swastikaPercent }}% swastika</div>
          <div>{{ diagramSelected.percentShaded }}% shaded</div>
        </div>
      </div>
      <div class='button-area'>
        <Button :class='addedToTraining(diagramSelected.id) ? `hidden` : ``'
          :label="`NOT A SWASTIKA`" :handleClick="() => {
            handleClickToLabel(diagramSelected.id, 'swastika', 0);
          }" 
        />
        <Button :class='addedToTraining(diagramSelected.id) ? `hidden` : ``'
          :label="`MAYBE A SWASTIKA`" :handleClick="() => {
            handleClickToLabel(diagramSelected.id, 'swastika', 0.5);
          }" 
        />
        <Button :class='addedToTraining(diagramSelected.id) ? `hidden` : ``'
          :label="`IS A SWASTIKA`" :handleClick="() => {
            handleClickToLabel(diagramSelected.id, 'swastika', 1);
          }" 
        />
        <Button id='delete-button'
          :label="`DELETE`" :handleClick="() => {
            callConfirmModal(`Really delete diagram #${diagramSelected.id}?`);          
          }" 
        />
      </div>      
    </div>
    <div v-else class='info-area'>
      Select a diagram for info
    </div>
    <div class='status-area'>
      savedTrainingData length: {{ savedTrainingData.diagramIds.length }}
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
    <div v-if='confirmShowing' class='confirm-modal'>
      <div>{{ confirmMessage }}</div>
      <div>
      <MiniBoard 
        :id='diagramSelected.id'        
        :width='diagramSelected.width'
        :height='diagramSelected.height'
        :cellGrid='diagramSelected.cells'
        :selected='false'
        :addedToTraining='addedToTraining(diagramSelected.id)'
        :mlLabel='savedTrainingData.diagramIds.indexOf(diagramSelected.id) > -1 ? savedTrainingData.output[savedTrainingData.diagramIds.indexOf(diagramSelected.id)][`swastika`] : 0'
      />
      </div>
      <Button 
        :label='`CANCEL`' :clickType='`click`' :handleClick='() => {
          confirmShowing = false;
        }'
      />
      <Button 
        :label='`DELETE`' :clickType='`click`' :handleClick='() => {
          handleClickDeleteDiagram(diagramSelected.id);
          diagramSelected = undefined;
          confirmShowing = false;
        }'
      />
    </div>    
	</div>
</template>

<script>
import Button from './Button';
import MiniBoard from './MiniBoard';
import SelectBar from './SelectBar';
import Spinner from './Spinner';
export default {
  name: 'BrowseModal',
  data: () => ({
    confirmShowing: false,
    confirmMessage: '',
    diagramSelected: undefined,
    sortType: 'date',    
    sortButtons: [
      {
				labelText: 'Date',
				valueAmount: 'date'
			},
      {
				labelText: 'Size',
				valueAmount: 'size'
			},
      {
				labelText: '% Black',
				valueAmount: 'shaded'
			},
      {
				labelText: 'Swastika',
				valueAmount: 'swastika'
			}
    ]
  }),  
  props: {
    diagrams: Array,
    savedTrainingData: Object,
    handleClickChooseDiagram: Function,
    handleClickCancelBrowse: Function,
    handleClickDeleteDiagram: Function,
    handleClickToLabel: Function,
  },
  components: {
    Button,
    MiniBoard,
    SelectBar,
    Spinner
  },
  computed: {
    sortedDiagrams() {
      let diagramList = [...this.diagrams];
      diagramList.forEach(diagram => diagram.percentShaded = 
      ((diagram.cells.flat().filter(cell => cell.shaded).length / diagram.cells.flat().length) * 100).toFixed(1));
      let sortAttr = 'id';
      if (this.sortType === 'size') {
        sortAttr = 'width';
      }
      if (this.sortType === 'shaded') {
        sortAttr = 'percentShaded';
      }
      if (this.sortType === 'swastika') {
        sortAttr = 'swastikaPercent';
      }
      let sortedDiagramList = diagramList.sort((a, b) => parseInt(b[sortAttr]) - parseInt(a[sortAttr]));      
      if (sortAttr === 'width' || sortAttr === 'percentShaded') {
        sortedDiagramList = sortedDiagramList.reverse();
      }
      return sortedDiagramList;
    }
  },
  methods: {
    handleClickDiagram(diagram) {
      if (this.diagramSelected !== diagram) {
        this.diagramSelected = diagram
      }
    },
    changeSort(name, newSort) {
      this.sortType = newSort;
    },
    callConfirmModal(message) {
      this.confirmMessage = message;
      this.confirmShowing = true;
    },
    addedToTraining(diagramId) {
      if (diagramId) {
        return this.savedTrainingData.diagramIds.includes(diagramId.toString());
      }
      return false;
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
.browse-modal::before {
  position: fixed;
  top: 0;
  left: 0;
  content: '';
  background: #000000dd;
  width: 100vw;
  height: var(--view-height);
  display: none;
}
.browse-modal.showing-modal::before, .browse-modal.showing-modal .confirm-modal {
  display: unset;
}
button.hidden {
  visibility: hidden;
}
header {
  font-size: 0.85rem;
  font-weight: 700;
  padding: var(--main-padding);
  padding-top: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
header span {
  margin: calc(var(--main-padding) / 2);
}
.select-bar {
  flex-grow: 1;
  height: var(--header-height);
}
.load-spinner, .load-message {
  grid-column-start: 2;
  margin-top: 50%;
  justify-self: center;
}
.diagram-list {
  position: relative;
  display: grid;
  height: 100%;
  width: 100%;
  grid-template-columns: repeat(3, calc((var(--board-size) - (var(--main-padding) * 3)) / 3));
  grid-auto-rows: calc((var(--board-size) - (var(--main-padding) * 3)) / 3);
  /* grid-row-gap: calc(var(--main-padding) / 1.5); */
  grid-row-gap: calc(var(--main-padding) * 2);

  grid-column-gap: calc(var(--main-padding) / 1.5);
  overflow-y: auto;
  padding: calc(var(--main-padding) / 1.5);
  justify-content: center;
  flex-grow: 1;
}
.list-margin {
  grid-column-start: 1;
  width: 100%;
  height: calc(var(--main-padding) / 2);
}
.browse-diagram > div {
  height: 100%;
}
.info-area {
  font-size: 0.85rem;
  font-weight: 700;
  min-height: calc(var(--board-size) / 3);
  width: 100%;
  padding: var(--main-padding);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  line-height: 150%;
  background: #00000033;
}
.text-area {
  width: 100%;
  display: flex;
  align-items: center;
  justify-items: space-between;
}
.text-area > div {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 33%;
  /* flex-grow: 1; */
}
.button-area, .status-area {
  grid-column-start: 1;
  grid-column-end: span 3;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}
.button-area {
  width: 100%;
}
.status-area {
  font-size: 0.75rem;
  padding-top: calc(var(--main-padding) / 2);
}
.info-area > div:first-child {
  grid-column-start: 1;
  grid-row-start: 1;
}
.info-area > div:nth-of-type(3) {
  grid-row-start: 1;
  grid-column-start: 2;
}
.info-area > div:nth-of-type(4) {
  grid-row-start: 1;
  grid-column-start: 3;
}
.info-area > div:nth-of-type(5) {
  grid-column-start: 3;
}
.info-area button:first-of-type {
  background: rgb(114, 170, 82);
}
.info-area button:nth-of-type(2) {
  background: rgb(209, 186, 108);
}
.info-area button {
  padding: var(--main-padding);
  height: var(--header-height);
  align-self: flex-end;
  background-color: rgb(110, 63, 63);
}
#delete-button {
  background-color: rgb(124, 58, 58);
  color: rgb(190, 143, 143);
  transform: scale(0.9);
  transform-origin: center;
  justify-self: end;
}
#browse-button-area {
  display: flex;
  align-self: stretch;
  padding: var(--main-padding);
  padding-bottom: 0;
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

.confirm-modal {
  position: absolute;
  color: white;
  font-size: 1.25rem;
  font-weight: 700;
  transform: translate(-50%, -50%);
  top: 50%;
  left: 50%;
  width: 90vw;
  min-height: calc(var(--board-size) / 1.5);  
  display: grid !important;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr calc(var(--board-size) / 1.5) auto;
  padding: calc(var(--main-padding) * 2);
  background: var(--header-color);
  box-shadow: 1px 1px calc(var(--main-padding) / 2) #00000066,
		-1px -1px calc(var(--main-padding) / 2) #00000066;
  justify-items: center;
  align-items: center;
  z-index: 3;
}
.confirm-modal > div {
  grid-column-end: span 2;
  text-align: center;
}
.confirm-modal > *:nth-child(2) {
  width: auto !important;
  height: auto !important;
  
}
.confirm-modal > div div {
  width: calc(var(--board-size) / 2);
  height: calc(var(--board-size) / 2);
}
.confirm-modal > div:nth-child(2) {
  grid-row-start: 2;
  grid-column-start: 1;
  grid-column-end: span 2;
  width: 40vw;
  height: 40vw;
}
.confirm-modal > button {
  font-size: 1.25rem;
  justify-self: stretch;
  height: calc(var(--header-height) * 1.5);
}
.confirm-modal > button:first-of-type {
  transform: scale(0.75);
}
.confirm-modal > button:last-of-type {
  font-size: 1.5rem;
  background: red;
}
</style>
