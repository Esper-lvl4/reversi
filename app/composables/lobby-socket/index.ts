import {useErrorPopup} from '../error-popup';
import {useUserName} from '../user-name';
import {useWebsockets} from '../websockets';

export function useLobby() {
  const {on, emit} = useWebsockets('lobby');
  const {addError} = useErrorPopup();
  const {username} = useUserName();

  const gameList = useState<GameList>(() => []);
  const currentGame = useState<GameRoomInfo | undefined>();

  function refreshGameList() {
    emit('get-game-list');
  }

  function createGame(name: string, password = '') {
    const options: GameCreationOptions = {name, password, playerName: username.value};
    emit('create-game', options);
  }

  function joinGame(gameId: number, password?: string) {
    emit('join-game', {id: gameId, password, playerName: username.value});
  }

  function leaveGame() {
    if (!currentGame.value) {
      return;
    }

    emit('leave-game', {id: currentGame.value.id});
    currentGame.value = undefined;
  }

  function togglePlayerReadiness() {
    if (!currentGame.value) {
      addError('Cannot change player readiness - player is not in the room!');
      return;
    }
    emit('toggle-player-readiness');
  }

  onMounted(() => {
    on('refresh-game-list', (info: unknown) => {
      if (!isGameList(info)) {
        addError('Could not refresh game list!');
        console.error('invalid refresh-game-list event info', info);
        return;
      }

      gameList.value = info;
    });

    on('refresh-current-room', (info) => {
      if (!isGameRoomInfo(info)) {
        addError('Could not refresh game room!');
        console.error('Invalid player-joined-the-game event info', info);
        return;
      }

      currentGame.value = info;

      if (info.players.every((player) => player.isReady)) {
        emit('start-game');
      }
    });

    on('player-left-the-game', (info) => {
      if (!isGameRoomInfo(info)) {
        addError('Error during player leaving this room');
        console.error('Invalid player-left-the-game event info!', info);
        return;
      }

      if (info.id === currentGame.value?.id) {
        currentGame.value = info;
      }

      const updatedGame = gameList.value.find((game) => game.id === info.id);

      if (!updatedGame) {
        addError('Could not update game in lobby - could not find the game');
        console.warn("Didn't find a room to update!", gameList, info);
        return;
      }

      updatedGame.playerCount = info.players.length;
    });

    on('has-reversi-game', (info) => {
      if (!isHasReversiGameEvent(info)) {
        addError('Error when checking for active games');
        console.error('Invalid has-reversi-game event info!', info);
        return;
      }

      navigateTo({path: `/game/${info.id}`});
    });

    on('incorrect-password', () => {
      addError('Incorrect password!');
    });

    emit('first-load-lobby');
  });

  return {
    emit,
    on,
    gameList,
    currentGame,
    createGame,
    joinGame,
    leaveGame,
    togglePlayerReadiness,
    refreshGameList,
  };
}
