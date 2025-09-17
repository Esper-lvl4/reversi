<script setup lang="ts">
import type {TextFieldProps} from './types';

const fieldValue = defineModel<string>();
const error = defineModel<string>('error');

const inputRef = useTemplateRef('input');

const {label, autofocus} = defineProps<TextFieldProps>();

watch(fieldValue, () => {
  error.value = '';
});

onMounted(() => {
  if (autofocus) {
    inputRef.value?.focus();
  }
});
</script>

<template>
  <div class="text-field">
    <label v-if="label">{{ label }}</label>
    <input ref="input" v-model="fieldValue" type="text" />
    <span v-if="error" class="error-text">{{ error }}</span>
  </div>
</template>

<style lang="sass">
.text-field
  position: relative
  width: 100%
  padding: 3px 0

  label
    display: block
    padding-left: 11px
    font-size: 12px
    font-weight: 600
    color: #cacaca

  input
    display: block
    width: 100%
    margin: 0
    padding: 6px 10px
    border: 1px solid #cacaca
    border-radius: 10px
    outline: none
    box-shadow: none
    background: #161311
    overflow: hidden
    color: #cacaca

.error-text
  display: block
  max-width: 100%
  padding: 6px 0 0 11px
  color: #eb3333
  font-size: 12px
  white-space: nowrap
  text-overflow: ellipsis
  overflow: hidden
</style>
