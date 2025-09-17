import {refreshReversiGame, tryMakingMove} from '../reversi/reversi';
import {handleSocketEvent} from '../websockets';

const socketEvents: SocketHandlersMap = {
  'try-making-move': tryMakingMove,
  'refresh-reversi-game': refreshReversiGame,
};
export default defineWebSocketHandler({
  open() {
    console.log('ws open reversi game');
  },

  message(peer, message) {
    handleSocketEvent(peer, message, socketEvents);
  },

  close(peer, event) {
    console.log('[ws] close', event);
  },

  error(peer, error) {
    console.log('[ws] error', error);
  },
});
