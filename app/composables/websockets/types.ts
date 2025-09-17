export type SocketInstanceMap = {[key: string]: SocketInstance | undefined};

export type SocketInstance = {
  socket: WebSocket;
  handlers: SocketEventHandlers;
  isReady: boolean;
};

export type SocketEvent = {
  event: string;
  info: unknown;
};

export type SocketEmitInfo = {
  event: string;
  info: unknown;
};

export type SocketEventHandler = (info?: unknown) => void;

export type SocketEventHandlers = {
  [key: string]: SocketEventHandler[];
};
