export type ClientReversiGame = {
  id: number;
  lobbyGame: number;
  moves: string[];
  currentTurn: 'white' | 'black';
  color: 'white' | 'black';
};
