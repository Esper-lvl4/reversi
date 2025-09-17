import type {Peer} from 'crossws';

export function isSomeObject(item: unknown): item is SomeObject {
  return typeof item === 'object' && item !== null;
}

export function isDivElement(item: unknown): item is HTMLDivElement {
  return isSomeObject(item) && item.tagName === 'DIV';
}

export function isUserPeer(item: Peer): item is UserPeer {
  return typeof item.context.userId === 'string';
}
