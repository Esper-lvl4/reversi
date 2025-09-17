import type {MakingMoveEvent, RefreshReversiGameEvent} from './types';

export function isMakingMoveEvent(item: unknown): item is MakingMoveEvent {
  return isSomeObject(item) && typeof item.x === 'number' && typeof item.y === 'number';
}
