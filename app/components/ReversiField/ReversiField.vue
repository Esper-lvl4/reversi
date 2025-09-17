<script setup lang="ts">
import {useReversiGame} from '~/composables/reversi-socket';

const {fieldState, isUserTurn, tryMakingMove} = useFieldState();
const {emit} = useReversiGame();

onMounted(() => {
  emit('refresh-reversi-game');
});

function tryToMakeAMove(event: MouseEvent) {
  const {target} = event;

  if (!isDivElement(target)) {
    return;
  }

  const {x, y} = target.dataset;

  if (!x || !y || isNaN(+x) || isNaN(+y)) {
    console.warn('Clicked element is not a cell, or does not have coordinates.');
    return;
  }

  tryMakingMove(+x, +y);
}
</script>

<template>
  <div class="wrapper" @click="tryToMakeAMove($event)">
    <div v-for="(row, y) in fieldState" class="row">
      <div
        v-for="(column, x) in row"
        class="column"
        :class="{
          'is-valid-move': column.isValidMove && isUserTurn,
          white: column.figure === 'white',
          black: column.figure === 'black',
        }"
        :data-x="x"
        :data-y="y"
      />
    </div>
  </div>
</template>

<style lang="sass" scoped>
.wrapper
  --cellWidth: 90px
  --cellHeight: 90px

@media (max-width: 800px), (max-height: 800px)
  .wrapper
    --cellWidth: 80px
    --cellHeight: 80px

@media (max-width: 700px), (max-height: 700px)
  .wrapper
    --cellWidth: 70px
    --cellHeight: 70px

@media (max-width: 600px), (max-height: 760px)
  .wrapper
    --cellWidth: 40px
    --cellHeight: 40px

@keyframes pulsing
  from
    opacity: 1

  to
    opacity: 0.7

.row
  display: flex
  flex-direction: row
  align-items: center
  width: calc(var(--cellWidth) * 8)

  &:last-of-type .column
    border-bottom: 2px solid black

.column
  position: relative
  display: flex
  justify-content: center
  align-items: center
  width: var(--cellWidth)
  height: var(--cellHeight)
  padding: 5px
  border: 2px solid black
  border-bottom: none
  border-right: none

  &:last-of-type
    border-right: 2px solid black;

  &.is-valid-move::before
    position: absolute;
    top: 50%
    left: 50%
    z-index: 1
    transform: translate(-50%, -50%)
    content: ''
    width: 30%
    height: 30%
    border-radius: 50%
    background: gray
    animation: 1s infinite alternate pulsing

  &.white::before, &.black::before
    content: ''
    width: 90%
    height: 90%
    border-radius: 50%
    background: #bababa

  &.black::before
    background: red
</style>
