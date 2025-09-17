import {useWebsockets} from '../websockets';

export function useReversiGame() {
  const reversiGame = useState<ClientReversiGame | undefined>();

  const {on, emit} = useWebsockets('reversi');

  function tryMakingMove(x: number, y: number) {
    if (!reversiGame.value) return;
    emit('try-making-move', {x, y});
  }

  onMounted(() => {
    on('refresh-reversi-game', (info) => {
      if (!isClientReversiGame(info)) {
        console.error('Invalid has-reversi-game event info!', info);
        return;
      }

      reversiGame.value = info;
    });

    on('no-reversi-game', () => {
      navigateTo('/');
    });
  });

  return {emit, tryMakingMove, reversiGame};
}
