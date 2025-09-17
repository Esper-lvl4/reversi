import type {UserPeer} from '~~/shared/types/socket-types';
import {ADJACENCY, FIELD_HEIGHT, FIELD_WIDTH} from './consts';
import type {ActionDirectionOptions, CellState, FieldState, ReversiGame} from './types';
import {isMakingMoveEvent, isRefreshReversiGameEvent} from './utils';

const reversiGames: ReversiGame[] = [];
let id = 0;

function incrementId() {
  if (id >= 100000) {
    id = 0;
    return id;
  }

  return id++;
}

export function findReversiGame(id: number): ReversiGame | undefined {
  return reversiGames.find((game) => game.id === id);
}

export function findReversiGameByPeer(peer: UserPeer): ReversiGame | undefined {
  const {userId} = peer.context;
  return reversiGames.find((game) => game.whitePlayer.id === userId || game.blackPlayer.id === userId);
}

function getGameTopicId(reversiGame: ReversiGame): string {
  return `game-${reversiGame.lobbyGame}`;
}

export function prepareReversiGameForClient(peer: UserPeer, reversiGame: ReversiGame): ClientReversiGame {
  return {
    id: reversiGame.id,
    lobbyGame: reversiGame.lobbyGame,
    currentTurn: reversiGame.currentTurn,
    color: reversiGame.whitePlayer.id === peer.context.userId ? 'white' : 'black',
    moves: reversiGame.moves,
  };
}

export function refreshReversiGame(peer: UserPeer) {
  const reversiGame = findReversiGameByPeer(peer);

  if (!reversiGame) {
    return sendEvent(peer, {event: 'no-reversi-game'});
  }

  const topicId = getGameTopicId(reversiGame);
  peer.subscribe(topicId);

  sendEvent(peer, {event: 'refresh-reversi-game', info: prepareReversiGameForClient(peer, reversiGame)});
}

export function createReversiGame(lobbyGame: number, players: Player[]): number {
  const field: FieldState = [];

  for (let i = 0; i < FIELD_HEIGHT; i++) {
    const row: CellState[] = [];

    for (let j = 0; j < FIELD_WIDTH; j++) {
      row.push({
        figure: null,
        isValidMove: false,
      });
    }

    field.push(row);
  }

  field[3][3].figure = 'white';
  field[3][4].figure = 'black';
  field[4][3].figure = 'black';
  field[4][4].figure = 'white';

  const id = incrementId();
  const whitePlayerIndex = Math.round(Math.random());
  const game: ReversiGame = {
    id,
    lobbyGame,
    whitePlayer: whitePlayerIndex === 0 ? players[0] : players[1],
    blackPlayer: whitePlayerIndex === 0 ? players[1] : players[0],

    state: field,
    currentTurn: 'white',
    movesLeft: FIELD_WIDTH * FIELD_HEIGHT - 4,
    moves: [],
  };

  reversiGames.push(game);

  determineValidMoves(game);

  return game.id;
}

export function tryMakingMove(peer: UserPeer, info: unknown) {
  if (!isMakingMoveEvent(info)) {
    return sendErrorEvent(peer, 'Invalid info was provided for making a move!');
  }

  const {x, y} = info;
  const game = findReversiGameByPeer(peer);

  if (!game) {
    return sendErrorEvent(peer, 'Trying to make a move in the game, that does not exist');
  }

  const error = makeMove(game, x, y);

  if (error) {
    return sendErrorEvent(peer, error);
  }

  const topicId = getGameTopicId(game);

  const eventInfo = prepareReversiGameForClient(peer, game);

  sendEvent(peer, {
    event: 'refresh-reversi-game',
    info: eventInfo,
  });

  // have to send different event object here, so that player does not change color.
  eventInfo.color = eventInfo.color === 'white' ? 'black' : 'white';

  broadcastEvent(peer, topicId, {
    event: 'refresh-reversi-game',
    info: eventInfo,
  });
}

function getCell(fieldState: FieldState, x: number, y: number): CellState | undefined {
  return fieldState[y]?.[x];
}

function changeTurn(game: ReversiGame) {
  game.currentTurn = game.currentTurn === 'white' ? 'black' : 'white';
}

function hasAllyInDirection(options: ActionDirectionOptions): boolean {
  const {xDiff, yDiff, ally, game} = options;
  let x = options.x + xDiff;
  let y = options.y + yDiff;

  while (true) {
    const cell = getCell(game.state, x, y);

    if (!cell || cell.figure === null) {
      return false;
    }

    if (cell.figure === ally) {
      return true;
    }

    x += xDiff;
    y += yDiff;
  }
}

function flipFiguresInDirection(options: ActionDirectionOptions) {
  const {xDiff, yDiff, ally, game} = options;
  let x = options.x + xDiff;
  let y = options.y + yDiff;
  const cellsToFlip: CellState[] = [];
  const targetCell = getCell(game.state, options.x, options.y);

  if (!targetCell) {
    return;
  }

  while (true) {
    const cell = getCell(game.state, x, y);

    if (!cell || cell.figure === null) {
      return;
    }

    if (cell.figure === ally) {
      for (const currentCell of cellsToFlip) {
        currentCell.figure = ally;
      }

      if (cellsToFlip.length > 0) {
        targetCell.figure = ally;
      }

      return;
    }

    cellsToFlip.push(cell);

    x += xDiff;
    y += yDiff;
  }
}

function checkVictory(game: ReversiGame) {
  const whiteCount = game.state.reduce((acc, row) => {
    return acc + row.reduce((cellAcc, cell) => cellAcc + Number(cell.figure === 'white'), 0);
  }, 0);
  const halfCellCount = (FIELD_WIDTH * FIELD_HEIGHT) / 2;

  if (halfCellCount > whiteCount) {
    console.log('Black won!');
    return;
  }

  if (halfCellCount < whiteCount) {
    console.log('White won!');
    return;
  }

  console.log('Draw!');
  return;
}

function determineValidMoves(game: ReversiGame, isInfiniteLoop = false) {
  if (game.movesLeft <= 0) {
    return checkVictory(game);
  }

  const allyFigure = game.currentTurn;
  const enemyFigure = allyFigure === 'white' ? 'black' : 'white';
  let x = 0;
  let y = 0;
  let hasValidMoves = false;

  while (y < FIELD_HEIGHT) {
    let isValidMove = false;
    const currentCell = getCell(game.state, x, y);

    if (!currentCell) {
      console.error('Somehow went out of field bounds!');
      break;
    }

    if (currentCell.figure === null) {
      for (const [xDiff, yDiff] of ADJACENCY) {
        const adjacentX = x + xDiff;
        const adjacentY = y + yDiff;

        const cell = getCell(game.state, adjacentX, adjacentY);

        if (!cell || cell.figure !== enemyFigure) {
          continue;
        }

        if (
          hasAllyInDirection({
            game,
            x: adjacentX,
            y: adjacentY,
            xDiff,
            yDiff,
            ally: allyFigure,
          })
        ) {
          isValidMove = true;
          hasValidMoves = true;
          break;
        }
      }
    }

    currentCell.isValidMove = isValidMove;

    x++;

    if (x === FIELD_WIDTH) {
      x = 0;
      y++;
    }
  }

  if (!hasValidMoves) {
    console.warn('Current player has no valid moves! Skipping his turn');

    if (isInfiniteLoop) {
      return checkVictory(game);
    }

    changeTurn(game);
    determineValidMoves(game, true);
  }
}

function makeMove(game: ReversiGame, x: number, y: number) {
  const cell = getCell(game.state, x, y);

  if (!cell) {
    return 'Trying to place a figure in a cell, that does not exist.';
  }

  if (cell.figure !== null || !cell.isValidMove) {
    return 'Trying to make an invalid move.';
  }

  const allyFigure = game.currentTurn;
  const currentCell = getCell(game.state, x, y);

  if (!currentCell) {
    return 'Somehow went out of field bounds!';
  }

  if (currentCell.figure === null) {
    for (const [xDiff, yDiff] of ADJACENCY) {
      flipFiguresInDirection({
        game,
        x,
        y,
        xDiff,
        yDiff,
        ally: allyFigure,
      });
    }
  }

  changeTurn(game);
  determineValidMoves(game);
  addMoveToHistory(game, x, y);
}

function addMoveToHistory(game: ReversiGame, x: number, y: number) {
  game.moves.push(`${x}:${y}`);
}
