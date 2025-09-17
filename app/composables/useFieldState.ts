import {useReversiGame} from './reversi-socket';

export type CurrentTurn = 'white' | 'black';

export type CellState = {
  figure: CurrentTurn | null;
  isValidMove: boolean;
};

export type FieldState = Array<CellState[]>;

export type ActionDirectionOptions = {
  x: number;
  y: number;
  xDiff: number;
  yDiff: number;
  ally: CurrentTurn;
};

const ADJACENCY = [
  [-1, -1], // top left
  [0, -1], // top
  [1, -1], // top right
  [1, 0], // right
  [1, 1], // bottom right
  [0, 1], // bottom
  [-1, 1], // bottom left
  [-1, 0], // left
] as const;

const FIELD_WIDTH = 8;
const FIELD_HEIGHT = 8;

export const useFieldState = () => {
  const {reversiGame, tryMakingMove} = useReversiGame();

  const movesLeft = useState('moves-left', () => FIELD_WIDTH * FIELD_HEIGHT - 4);
  const currentTurn = useState<CurrentTurn>('current-turn', () => 'white');
  const processedMoves = useState<string[]>(() => []);
  const fieldState = useState('field-state', () => {
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

    // typescript is dumb sometimes
    if (field[3]?.[3] && field[3]?.[4] && field[4]?.[3] && field[4]?.[4]) {
      field[3][3].figure = 'white';
      field[3][4].figure = 'black';
      field[4][3].figure = 'black';
      field[4][4].figure = 'white';
    }

    return field;
  });

  watch(
    reversiGame,
    (game) => {
      if (!game) return;
      const {moves} = game;

      if (moves.length === processedMoves.value.length) return;

      const movesToProcess: string[] = [];

      for (let i = 0; i < moves.length; i++) {
        const processedMove = processedMoves.value[i];

        if (!processedMove) movesToProcess.push(moves[i] as string);
      }

      for (const move of movesToProcess) {
        const [xString, yString] = move.split(':');

        if (!xString || !yString) {
          return console.error('Invalid moves format!');
        }

        const x = +xString;
        const y = +yString;

        if (isNaN(x) || isNaN(y)) {
          return console.error('Invalid moves format!');
        }

        makeMove(x, y);
        processedMoves.value.push(move);
      }
    },
    {immediate: true},
  );

  function getCell(x: number, y: number): CellState | undefined {
    return fieldState.value[y]?.[x];
  }

  function changeTurn() {
    currentTurn.value = currentTurn.value === 'white' ? 'black' : 'white';
  }

  function hasAllyInDirection(options: ActionDirectionOptions): boolean {
    const {xDiff, yDiff, ally} = options;
    let x = options.x + xDiff;
    let y = options.y + yDiff;

    while (true) {
      const cell = getCell(x, y);

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
    const {xDiff, yDiff, ally} = options;
    let x = options.x + xDiff;
    let y = options.y + yDiff;
    const cellsToFlip: CellState[] = [];
    const targetCell = getCell(options.x, options.y);

    if (!targetCell) {
      return;
    }

    while (true) {
      const cell = getCell(x, y);

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

  function checkVictory() {
    const whiteCount = fieldState.value.reduce((acc, row) => {
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

  function showValidMoves(isInfiniteLoop = false) {
    if (movesLeft.value <= 0) {
      return checkVictory();
    }

    const allyFigure = currentTurn.value;
    const enemyFigure = allyFigure === 'white' ? 'black' : 'white';
    let x = 0;
    let y = 0;
    let hasValidMoves = false;

    while (y < FIELD_HEIGHT) {
      let isValidMove = false;
      const currentCell = getCell(x, y);

      if (!currentCell) {
        console.error('Somehow went out of field bounds!');
        break;
      }

      if (currentCell.figure === null) {
        for (const [xDiff, yDiff] of ADJACENCY) {
          const adjacentX = x + xDiff;
          const adjacentY = y + yDiff;

          const cell = getCell(adjacentX, adjacentY);

          if (!cell || cell.figure !== enemyFigure) {
            continue;
          }

          if (
            hasAllyInDirection({
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
        return checkVictory();
      }

      changeTurn();
      showValidMoves(true);
    }
  }

  function makeMove(x: number, y: number) {
    const cell = getCell(x, y);

    if (!cell) {
      console.warn('Trying to place a figure in a cell, that does not exist.');
      return;
    }

    if (cell.figure !== null || !cell.isValidMove) {
      console.warn('Trying to make an invalid move.');
      return;
    }

    const allyFigure = currentTurn.value;
    const currentCell = getCell(x, y);

    if (!currentCell) {
      console.error('Somehow went out of field bounds!');
      return;
    }

    if (currentCell.figure === null) {
      for (const [xDiff, yDiff] of ADJACENCY) {
        flipFiguresInDirection({
          x,
          y,
          xDiff,
          yDiff,
          ally: allyFigure,
        });
      }
    }

    changeTurn();
    showValidMoves();
  }

  showValidMoves();

  return {
    fieldState,
    currentTurn,
    tryMakingMove,
    isUserTurn: computed(() => reversiGame.value?.color === reversiGame.value?.currentTurn),
  };
};
