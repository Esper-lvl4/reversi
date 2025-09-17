<template>
  <div class="global-wrapper">
    <NuxtPage />
    <ErrorPopup />
    <UsernamePopup />
  </div>
</template>

<style lang="sass">
*
  box-sizing: border-box

body
  margin: 0

.global-wrapper
  height: 100vh
  padding: 8px
  background: linear-gradient(to bottom, #2e2a24, #161512 116px) no-repeat;
</style>
