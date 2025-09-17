import {LOBBY_TOPIC} from '../lobby/consts';
import {
  addPlayerToGame,
  createGame,
  firstLoadLobby,
  getGameList,
  removePlayerFromGame,
  startGame,
  togglePlayerReadiness,
} from '../lobby/lobby';
import {handleSocketEvent} from '../websockets';

const socketEvents: SocketHandlersMap = {
  'first-load-lobby': firstLoadLobby,
  'get-game-list': getGameList,
  'create-game': createGame,
  'join-game': addPlayerToGame,
  'leave-game': removePlayerFromGame,
  'toggle-player-readiness': togglePlayerReadiness,
  'start-game': startGame,
};

export default defineWebSocketHandler({
  open(peer) {
    peer.subscribe(LOBBY_TOPIC);
    console.log('ws open');
  },

  message(peer, message) {
    handleSocketEvent(peer, message, socketEvents);
  },

  close(peer, event) {
    console.log('[ws] close', event);
    peer.unsubscribe(LOBBY_TOPIC);
  },

  error(peer, error) {
    console.log('[ws] error', error);
  },
});
