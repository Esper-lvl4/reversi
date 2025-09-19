import type {Game} from '../lobby/types';

export type ReversiGame = {
  id: number;
  lobbyGame: Game;
  whitePlayer: Player;
  blackPlayer: Player;

  state: FieldState;
  currentTurn: PlayerColors;
  movesLeft: number;
  moves: string[];
  winner?: GameWinner;
};

export type CellState = {
  figure: PlayerColors | null;
  isValidMove: boolean;
};

export type FieldState = Array<CellState[]>;

export type ActionDirectionOptions = {
  game: ReversiGame;
  x: number;
  y: number;
  xDiff: number;
  yDiff: number;
  ally: PlayerColors;
};

export type MakingMoveEvent = {
  x: number;
  y: number;
};
