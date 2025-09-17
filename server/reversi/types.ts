export type ReversiGame = {
  id: number;
  lobbyGame: number;
  whitePlayer: Player;
  blackPlayer: Player;

  state: FieldState;
  currentTurn: CurrentTurn;
  movesLeft: number;
  moves: string[];
};

export type CurrentTurn = 'white' | 'black';

export type CellState = {
  figure: CurrentTurn | null;
  isValidMove: boolean;
};

export type FieldState = Array<CellState[]>;

export type ActionDirectionOptions = {
  game: ReversiGame;
  x: number;
  y: number;
  xDiff: number;
  yDiff: number;
  ally: CurrentTurn;
};

export type RefreshReversiGameEvent = {
  id: number;
};

export type MakingMoveEvent = {
  x: number;
  y: number;
};
