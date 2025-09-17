import type {ServerMessageInfo} from '../utils/websockets/types';

export type Game = {
  id: number;
  name: string;
  players: Player[];
  password?: string;
  reversiGame?: number;
};

export type SaveUserIdEvent = ServerMessageInfo<User>;

export type RefreshEvent = ServerMessageInfo<GameInfo[]>;

export type GameCreatedEvent = ServerMessageInfo<GameRoomInfo>;
