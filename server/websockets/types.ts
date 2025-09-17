export type SocketEventInfo = {
  peer: UserPeer;
  info: MessageInfo;
  waitNextEvent: boolean;
};
