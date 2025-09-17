<script setup lang="ts">
import {useErrorPopup} from '~/composables/error-popup';
import {useLobby} from '~/composables/lobby-socket';
import {useUserName} from '~/composables/user-name';

const {gameList, currentGame, createGame, joinGame} = useLobby();
const {addError} = useErrorPopup();
const {openUsernamePopup} = useUserName();

const createPopup = ref(false);
const protectedGame = ref<GameInfo | undefined>();
const passwordPopup = ref(false);

const selectedGameIndex = ref(-1);

const name = ref('');
const password = ref('');
const joinPassword = ref('');

const nameValidation = ref('');
const passwordValidation = ref('');

function openCreatePopup() {
  createPopup.value = true;
}

function tryCreatingGame() {
  let hasErrors = false;

  if (name.value.length < 3) {
    nameValidation.value = 'Room name cannot be shorter than 3 symbols';
    hasErrors = true;
  }

  if (name.value.length > 20) {
    nameValidation.value = 'Room cannot be longer than 20 symbols';
    hasErrors = true;
  }

  if (password.value.length > 20) {
    passwordValidation.value = 'Password cannot be longer than 20 symbols';
    hasErrors = true;
  }

  if (hasErrors) {
    return;
  }

  createGame(name.value, password.value);
  createPopup.value = false;
}

function selectGame(index: number) {
  if (selectedGameIndex.value === index) {
    selectedGameIndex.value = -1;
    return;
  }
  selectedGameIndex.value = index;
}

function tryJoiningGame(index?: number) {
  const selectedIndex = index ?? selectedGameIndex.value;
  if (selectedIndex === -1 || selectedIndex >= gameList.value.length) {
    selectedGameIndex.value = -1;
    addError('Could not join the game - existing game was not selected!');
    return;
  }
  const game = gameList.value[selectedIndex];

  if (!game) {
    addError('Could not join the game - existing game was not selected!');
    return;
  }

  if (game.hasPassword) {
    protectedGame.value = game;
    passwordPopup.value = true;
    return;
  }
  joinGame(game.id);
}

function joinGameWithPassword() {
  if (!protectedGame.value) return;

  joinGame(protectedGame.value.id, joinPassword.value);

  joinPassword.value = '';
}
</script>

<template>
  <template v-if="!currentGame">
    <div class="game-list">
      <div class="hosted-game titles">
        <div class="game-name">Room</div>
        <div class="game-players">Players</div>
        <div class="requires-password">Password</div>
      </div>
      <div class="hosted-games">
        <div
          v-for="(game, index) in gameList"
          :key="game.id"
          class="hosted-game"
          :class="{'is-selected': selectedGameIndex === index}"
          @click="selectGame(index)"
          @dblclick="tryJoiningGame(index)"
        >
          <div class="game-name">{{ game.name }}</div>
          <div class="game-players">{{ game.playerCount }}</div>
          <div class="requires-password">{{ game.hasPassword ? 'Yes' : 'No' }}</div>
        </div>
      </div>
      <div class="game-list-controls">
        <SimpleButton @click="openCreatePopup">Create Game</SimpleButton>
        <SimpleButton :is-disabled="selectedGameIndex === -1" @click="tryJoiningGame()">Join Game</SimpleButton>
        <SimpleButton @click="openUsernamePopup">Change your name</SimpleButton>
      </div>
    </div>

    <SimplePopup v-model="createPopup" title="Create Game" :on-confirm="tryCreatingGame">
      <template #content>
        <TextField v-model="name" v-model:error="nameValidation" autofocus label="Name" />
        <TextField v-model="password" v-model:error="passwordValidation" label="Password" />
      </template>
    </SimplePopup>

    <SimplePopup
      v-model="passwordPopup"
      title="Enter password"
      confirm-button-text="Join"
      close-on-confirm
      @confirm="joinGameWithPassword"
      @close="protectedGame = undefined"
    >
      <template #content>
        <TextField v-model="joinPassword" autofocus label="Game password" />
      </template>
    </SimplePopup>
  </template>
</template>

<style lang="sass" scoped>
.game-list
  display: flex
  flex-direction: column
  max-width: 100%
  width: 600px
  height: 600px
  background: #262421

.hosted-games
  flex-grow: 1
  overflow: auto

.hosted-game
  display: grid
  grid-template: auto / 1fr 100px 150px
  padding: 3px 12px
  border-bottom: 1px solid #404040
  color: #bababa
  font-size: 16px

  &:hover:not(.titles)
    background: #bababa
    color: #262421
    cursor: pointer

  &.is-selected
    background: #999
    color: #262421

  &.titles
    border-bottom-color: #cacaca
    font-weight: 600
    font-size: 18px
    justify-content: center

.game-name
  pointer-events: none
  user-select: none

.game-players, .requires-password
    justify-self: center
    pointer-events: none
    user-select: none

.game-list-controls
  display: flex
  flex-wrap: wrap
  justify-content: center
  align-items: center
  gap: 8px
  padding: 8px 10px
</style>
