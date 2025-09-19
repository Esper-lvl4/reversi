<script setup lang="ts">
import {useReversiGame} from '~/composables/reversi-socket';

const {fieldState, pieceCount, winner, isUserTurn, tryMakingMove} = useFieldState();
const {emit} = useReversiGame();

const winLosePopup = ref(false);

const popupTitle = computed(() => (winner.value ? 'You won.' : 'You lost.'));
const popupMessage = computed(() => (winner.value ? 'Congrats!' : 'Better luck next time!'));

watch(
  winner,
  (currentValue) => {
    console.log(currentValue);
    if (currentValue !== undefined) {
      winLosePopup.value = true;
    }
  },
  {immediate: true},
);

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

function goBackToLobby() {
  navigateTo('/');
}
</script>

<template>
  <div class="wrapper" @click="tryToMakeAMove($event)">
    <div class="piece-count">
      <div class="white">x {{ pieceCount.white }}</div>
      <div class="black">x {{ pieceCount.black }}</div>
    </div>
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

    <SimplePopup v-model="winLosePopup" :title="popupTitle" no-close @confirm="goBackToLobby">
      <template #content>
        <div class="popup-message">{{ popupMessage }}</div>
        <div class="piece-count in-popup">
          <div class="white">x {{ pieceCount.white }}</div>
          <div class="black">x {{ pieceCount.black }}</div>
        </div>
      </template>
    </SimplePopup>
  </div>
</template>

<style lang="sass" scoped>
$white-piece-color: #bababa
$black-piece-color: red

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
    background: $white-piece-color

  &.black::before
    background: $black-piece-color

.popup-message
  padding-bottom: 6px
  text-align: center

.piece-count
  position: absolute
  top: 5px
  left: 50%
  z-index: 1
  transform: translateX(-50%)
  display: flex
  justify-content: center
  align-items: center
  gap: 10px

  &.in-popup
    position: static
    transform: none

  & > .white, & > .black
    display: flex
    align-items: center
    font-size: 18px
    line-height: 1
    color: white
    white-space: nowrap
    &::before
      content: ''
      width: 20px
      height: 20px
      margin-right: 6px
      border-radius: 50%
      background: $white-piece-color

  & >.black::before
    background: $black-piece-color

@media (max-height: 400px)
  .piece-count:not(.in-popup)
    & > .white, & > .black
      font-size: 14px

      &::before
        width: 15px
        height: 15px
</style>
