import type {Peer} from 'crossws';
import type {MessageInfo} from './types';

export function isMessageInfo(item: unknown): item is MessageInfo {
  return isSomeObject(item) && typeof item.event === 'string';
}

export function sendEvent(peer: Peer, info: MessageInfo) {
  peer.send(JSON.stringify(info));
}

export function broadcastEvent(peer: Peer, topic: string, info: MessageInfo) {
  peer.publish(topic, JSON.stringify(info));
}

export function broadcastEventAndSend(peer: Peer, topic: string, info: MessageInfo) {
  sendEvent(peer, info);
  broadcastEvent(peer, topic, info);
}

export function sendErrorEvent(peer: Peer, error: string) {
  console.error(error);
  peer.send(
    JSON.stringify({
      message: error,
      isError: true,
    }),
  );
}
