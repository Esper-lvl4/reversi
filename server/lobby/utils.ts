export function isGameCreationOptions(item: unknown): item is GameCreationOptions {
  return isSomeObject(item) && typeof item.name === 'string' && typeof item.playerName === 'string';
}

export function isJoinGameOptions(item: unknown): item is JoinGameOptions {
  return isSomeObject(item) && typeof item.id === 'number' && typeof item.playerName === 'string';
}

export function isLeaveGameOptions(item: unknown): item is LeaveGameOptions {
  return isSomeObject(item) && typeof item.id === 'number';
}
