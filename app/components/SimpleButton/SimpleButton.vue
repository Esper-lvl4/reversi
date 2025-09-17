<script setup lang="ts">
const props = defineProps<{
  isDisabled?: boolean;
}>();
</script>

<template>
  <button class="button-wrapper" :disabled="props.isDisabled">
    <slot />
  </button>
</template>

<style lang="sass">
.button-wrapper
  margin: 0
  padding: 5px 20px
  border: 1px solid #cacaca
  border-radius: 15px
  outline: none
  box-shadow: none
  background: #161512
  color: #cacaca
  font-size: 17px
  font-weight: 600

  &:hover
    background: #cacaca
    color: #161512
    cursor: pointer

  &[disabled]
    pointer-events: none
    border-color: #888
    color: #888
</style>
