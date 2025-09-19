<script setup lang="ts">
import type {SimplePopupProps} from './types';

const {
  title,
  message,
  hasReject,
  confirmButtonText = 'Confirm',
  rejectButtonText = 'Cancel',
  noClose,
  closeOnConfirm,
  closeOnReject,
} = defineProps<SimplePopupProps>();

const isOpen = defineModel<boolean>();
const emit = defineEmits(['confirm', 'reject', 'close']);

function close() {
  isOpen.value = false;
  emit('close');
}

function confirm() {
  emit('confirm');

  if (closeOnConfirm) {
    close();
  }
}

function reject() {
  emit('reject');

  if (closeOnReject) {
    close();
  }
}

function closeWhenClickOutside() {
  if (noClose) return;
  close();
}
</script>

<template>
  <div
    v-if="isOpen"
    class="simple-popup"
    @click.stop
    @click.self="closeWhenClickOutside"
    @keyup.enter="confirm"
    @keyup.esc="close"
  >
    <div class="popup-wrapper">
      <slot :confirm="confirm" :reject="reject" :close="close">
        <button v-if="!noClose" class="close-button" @click.prevent="close" />
        <div class="popup-title">{{ title }}</div>
        <div class="popup-content">
          {{ message }}
          <slot v-if="!message" name="content" />
        </div>
        <div class="popup-controls">
          <SimpleButton class="confirm-button" @click.prevent="confirm">{{ confirmButtonText }}</SimpleButton>
          <SimpleButton v-if="hasReject" class="reject-button" @click.prevent="reject">{{
            rejectButtonText
          }}</SimpleButton>
        </div>
      </slot>
    </div>
  </div>
</template>

<style lang="sass">
.simple-popup
  position: fixed
  top: 0
  left: 0
  z-index: 10
  display: flex
  justify-content: center
  align-items: center
  width: 100%
  height: 100%
  overflow: hidden
  background: rgba(0, 0, 0, 0.5)

.popup-wrapper
  position: relative
  display: flex
  flex-direction: column
  max-width: 90%
  max-height: 90%
  width: 400px
  padding: 15px
  border-radius: 20px
  background: #262421

.popup-title
  font-size: 18px
  font-weight: 600
  color: #cacaca
  text-align: center

.popup-content
  flex-grow: 1
  padding-top: 15px
  font-size: 16px
  color: #cacaca

.popup-controls
  display: flex
  justify-content: space-around
  align-items: center
  padding-top: 15px

.close-button
  position: absolute
  top: 10px
  right: 10px
  z-index: 1
  width: 30px
  height: 30px
  margin: 0
  padding: 0
  border: none
  border-radius: 50%
  outline: none
  box-shadow: none
  background: none

  &:hover
    background: #cacaca
    cursor: pointer

    &::before, &::after
      background: #161512


  &::before, &::after
    content: ''
    position: absolute
    top: 50%
    left: 50%
    z-index: 1
    width: 20px
    height: 1px
    background: #cacaca

  &::before
    transform: translate(-50%, -50%) rotate(45deg)

  &::after
    transform: translate(-50%, -50%) rotate(-45deg)
</style>
