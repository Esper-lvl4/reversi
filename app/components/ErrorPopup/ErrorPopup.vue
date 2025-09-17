<script setup lang="ts">
import {useErrorPopup} from '~/composables/error-popup';

const {currentError, isPopupActive} = useErrorPopup();
</script>

<template>
  <Transition>
    <div v-if="isPopupActive" class="error-popup">{{ currentError }}</div>
  </Transition>
</template>

<style lang="sass" scoped>
.error-popup
  position: fixed
  top: 10px
  left: 50%
  z-index: 11
  transform: translateX(-50%)
  max-width: 90%
  padding: 6px 15px
  border-radius: 15px
  text-align: center
  background: #aa3030
  color: #ffffff
  white-space: pre-wrap

.v-enter-active, .v-leave-active
  transition: all 0.5s ease

.v-enter-from, .v-leave-to
  top: -100%
</style>
