<script setup lang="ts">
import {useUserName} from '~/composables/user-name';

const {username, usernamePopup, setUsername, loadUsername} = useUserName();

const nameField = ref('');
const nameValidation = ref('');

function trySavingUsername() {
  let hasErrors = false;

  if (nameField.value.length < 2) {
    nameValidation.value = 'User name cannot be shorter than 2 symbols';
    hasErrors = true;
  }

  if (nameField.value.length > 20) {
    nameValidation.value = 'User name cannot be longer than 20 symbols';
    hasErrors = true;
  }

  if (hasErrors) return;

  setUsername(nameField.value);
}

watch(usernamePopup, console.log, {immediate: true});

onMounted(() => {
  nameField.value = loadUsername();
});
</script>

<template>
  <SimplePopup
    v-model="usernamePopup"
    title="Enter your name"
    confirm-button-text="Save"
    :no-close="!username"
    :has-reject="Boolean(username)"
    @confirm="trySavingUsername"
  >
    <template #content>
      <TextField v-model="nameField" v-model:error="nameValidation" autofocus />
    </template>
  </SimplePopup>
</template>
