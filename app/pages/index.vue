<script setup lang="ts">
import {useWebsocketConnection} from '~/composables/websockets';

const isReady = useWebsocketConnection('lobby');
</script>

<template>
  <div class="lobby-wrapper">
    <LobbyGameList v-if="isReady" />
    <LobbyGameHost v-if="isReady" />
  </div>
</template>

<style lang="sass">
.lobby-wrapper
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  gap: 8px
  height: 100%
</style>
