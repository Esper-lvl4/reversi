export type MessageInfo = {
  event: string;
  info?: unknown;
};

export type ServerMessageInfo<Info = unknown> = {
  event: string;
  info: Info;
};
