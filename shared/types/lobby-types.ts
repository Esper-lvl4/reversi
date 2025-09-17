export type User = {
  userId: string;
};

export type GameInfo = {
  id: number;
  name: string;
  hasPassword: boolean;
  playerCount: number;
};

export type GameList = GameInfo[];

export type ClientPlayer = {
  name: string;
  isReady: boolean;
};

export type GameCreationOptions = {
  name: string;
  password: string;
  playerName: string;
};

export type GameRoomInfo = {
  id: number;
  name: string;
  players: ClientPlayer[];
};

export type JoinGameOptions = {
  id: number;
  playerName: string;
  password?: string;
};

export type LeaveGameOptions = {
  id: number;
};

export type HasReversiGameEvent = {
  id: number;
};
