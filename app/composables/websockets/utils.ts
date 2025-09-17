import type {SocketEvent} from './types';

export function isSocketEvent(item: unknown): item is SocketEvent {
  return isSomeObject(item) && typeof item.event === 'string';
}

export function isUserIdInfo(item: unknown): item is {userId: string} {
  return isSomeObject(item) && typeof item.userId === 'string';
}
