export function isClientReversiGame(item: unknown): item is ClientReversiGame {
  return (
    isSomeObject(item) &&
    typeof item.id === 'number' &&
    typeof item.lobbyGame === 'number' &&
    typeof item.currentTurn === 'string' &&
    typeof item.color === 'string' &&
    Array.isArray(item.moves)
  );
}
