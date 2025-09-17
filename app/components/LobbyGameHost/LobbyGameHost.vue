<script setup lang="ts">
import {useLobby} from '~/composables/lobby-socket';

const {currentGame, leaveGame, togglePlayerReadiness} = useLobby();
</script>

<template>
  <div v-if="currentGame" class="host-wrapper">
    <div class="room-title">Awaiting player's readiness</div>
    <div class="room-participants">
      <div
        v-for="(player, index) in currentGame.players"
        :key="`participant-${index}`"
        :class="{'is-ready': player.isReady}"
        class="participant"
      >
        {{ player.name }}
      </div>
    </div>
    <div class="room-controls">
      <SimpleButton @click="togglePlayerReadiness">Ready</SimpleButton>
      <SimpleButton @click="leaveGame">Leave</SimpleButton>
    </div>
  </div>
</template>

<style lang="sass" scoped>
.host-wrapper
  display: flex
  flex-direction: column
  max-width: 100%
  width: 600px
  height: 600px
  background: #262421

.room-title
  padding: 5px 8px
  border-bottom: 1px solid #cacaca
  color: #bababa
  text-align: center
  font-size: 20px

@media (max-width: 500px)
  .room-title
    font-size: 16px

.room-participants
  flex-grow: 1

.participant
  position: relative
  padding: 3px 25px
  border-bottom: 1px solid #404040
  color: #bababa
  font-size: 16px

  &::before
    content: ''
    position: absolute
    left: 5px
    top: 50%
    z-index: 1
    transform: translateY(-50%)
    display: block
    width: 15px
    height: 15px
    border-radius: 50%
    background: #ba0000

  &.is-ready::before
    background: #00ba00

@media (max-width: 500px)
  .participant
    font-size: 14px

    &::before
      left: 6px
      width: 13px
      height: 13px

.room-controls
  display: flex
  flex-wrap: wrap
  justify-content: center
  align-items: center
  gap: 8px
  padding: 20px 15px
</style>
