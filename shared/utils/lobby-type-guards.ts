export function isGameInfo(item: unknown): item is GameInfo {
  return (
    isSomeObject(item) &&
    typeof item.id === 'number' &&
    typeof item.name === 'string' &&
    typeof item.playerCount === 'number' &&
    typeof item.hasPassword === 'boolean'
  );
}

export function isClientPlayer(item: unknown): item is ClientPlayer {
  return isSomeObject(item) && typeof item.name === 'string' && typeof item.isReady === 'boolean';
}

export function isGameRoomInfo(item: unknown): item is GameRoomInfo {
  return (
    isSomeObject(item) &&
    typeof item.id === 'number' &&
    typeof item.name === 'string' &&
    Array.isArray(item.players) &&
    isClientPlayer(item.players[0])
  );
}

export function isGameList(item: unknown): item is GameList {
  if (!Array.isArray(item)) {
    return false;
  }

  return item.length === 0 || isGameInfo(item[0]);
}

export function isHasReversiGameEvent(item: unknown): item is HasReversiGameEvent {
  return isSomeObject(item) && typeof item.id === 'number';
}
