import type {Peer} from 'crossws';

export type UserPeer = Peer & {
  context: {userId: string; [key: string]: unknown};
};

export type SocketHandler = (peer: UserPeer, info: unknown) => void;

export type SocketHandlersMap = {[key: string]: SocketHandler};
