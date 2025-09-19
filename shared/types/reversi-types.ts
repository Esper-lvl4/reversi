export type PlayerColors = 'white' | 'black';

export type GameWinner = 'white' | 'black' | 'draw';

export type ClientReversiGame = {
  id: number;
  lobbyGame: number;
  moves: string[];
  currentTurn: PlayerColors;
  color: PlayerColors;
  winner?: GameWinner;
};
