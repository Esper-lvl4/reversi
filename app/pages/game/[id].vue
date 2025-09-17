<script setup lang="ts">
import {useWebsocketConnection} from '~/composables/websockets';

const isReady = useWebsocketConnection('reversi');
</script>

<template>
  <div class="game-wrapper">
    <ReversiField v-if="isReady" />
  </div>
</template>

<style lang="sass">
.game-wrapper
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  gap: 8px
  height: 100%
</style>
