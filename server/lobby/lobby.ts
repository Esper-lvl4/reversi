import {createReversiGame} from '../reversi/reversi';
import type {Game} from './types';
import {isGameCreationOptions, isJoinGameOptions, isLeaveGameOptions} from './utils';
import {LOBBY_TOPIC} from './consts';

export const gameList: Game[] = [];
let id = 0;

function incrementId() {
  if (id >= 100000) {
    id = 0;
    return id;
  }

  return id++;
}

function findGame(id: number): Game | undefined {
  return gameList.find((game) => game.id === id);
}

function findGameIndex(id: number): number {
  return gameList.findIndex((game) => game.id === id);
}

function findGameByPeer(peer: UserPeer): Game | undefined {
  return gameList.find((game) => game.players.find((player) => player.id === peer.context.userId) !== undefined);
}

function findPlayerInGame(peer: UserPeer, game: Game): Player | undefined {
  const player = game.players.find((gamePlayer) => gamePlayer.id === peer.context.userId);

  if (!player) return;

  return player;
}

function getGameTopicId(game: Game): string {
  return `game-${game.id}`;
}

function prepareGameListForClient(): GameInfo[] {
  return gameList
    .filter((game) => game.reversiGame === undefined)
    .map((game) => ({
      id: game.id,
      name: game.name,
      playerCount: game.players.length,
      hasPassword: Boolean(game.password),
    }));
}

function preparePlayersForClient(game: Game): ClientPlayer[] {
  return game.players.map((player) => ({name: player.name, isReady: player.isReady}));
}

function prepareGameRoomForClient(game: Game): GameRoomInfo {
  return {
    id: game.id,
    name: game.name,
    players: preparePlayersForClient(game),
  };
}

export function firstLoadLobby(peer: UserPeer) {
  const game = findGameByPeer(peer);

  if (game) {
    peer.subscribe(getGameTopicId(game));

    if (game?.reversiGame !== undefined) {
      sendEvent(peer, {
        event: 'has-reversi-game',
        info: {id: game.reversiGame},
      });
    }
    sendEvent(peer, {event: 'refresh-current-room', info: prepareGameRoomForClient(game)});
  }

  peer.subscribe(LOBBY_TOPIC);
  sendEvent(peer, {
    event: 'refresh-game-list',
    info: prepareGameListForClient(),
  });
}

export function getGameList(peer: UserPeer) {
  sendEvent(peer, {
    event: 'refresh-game-list',
    info: prepareGameListForClient(),
  });
}

export function createGame(peer: UserPeer, options: unknown) {
  if (!isGameCreationOptions(options)) {
    return sendErrorEvent(peer, 'Could not create a game: invalid data provided!');
  }

  const {name, playerName} = options;

  const password = typeof options.password === 'string' ? options.password : undefined;

  if (typeof password === 'string' && password?.length > 12) {
    return sendErrorEvent(peer, 'Password cannot be longer than 12 symbols!');
  }

  const game: Game = {
    id: incrementId(),
    name,
    password,
    players: [{id: peer.context.userId, name: playerName, isReady: false}],
  };

  gameList.push(game);

  peer.subscribe(getGameTopicId(game));

  broadcastEventAndSend(peer, LOBBY_TOPIC, {
    event: 'refresh-game-list',
    info: prepareGameListForClient(),
  });

  const info: GameRoomInfo = {
    id: game.id,
    name: game.name,
    players: [{name: playerName, isReady: false}],
  };

  sendEvent(peer, {
    event: 'refresh-current-room',
    info,
  });
}

export function addPlayerToGame(peer: UserPeer, options: unknown) {
  if (!isJoinGameOptions(options)) {
    return sendErrorEvent(peer, 'Could not join the game: invalid information provided!');
  }

  const game = findGame(options.id);
  if (!game) {
    return sendErrorEvent(peer, 'Could not add player to the game that does not exist!');
  }

  if (game.players.length >= 2) {
    return sendErrorEvent(peer, 'Game room is full!');
  }

  const {userId} = peer.context;

  if (game.players.find((player) => player.id === userId)) {
    return sendErrorEvent(peer, 'Player is already in the room');
  }

  if (game.password && options.password !== game.password) {
    return sendEvent(peer, {event: 'incorrect-password'});
  }

  game.players.push({id: userId, name: options.playerName, isReady: false});

  const topicId = getGameTopicId(game);

  peer.subscribe(topicId);
  broadcastEventAndSend(peer, topicId, {event: 'refresh-current-room', info: prepareGameRoomForClient(game)});
}

export function togglePlayerReadiness(peer: UserPeer) {
  const game = findGameByPeer(peer);

  if (!game) return;

  const player = findPlayerInGame(peer, game);

  if (!player) return;

  const topicId = getGameTopicId(game);
  player.isReady = !player.isReady;

  broadcastEventAndSend(peer, topicId, {event: 'refresh-current-room', info: prepareGameRoomForClient(game)});
}

export function removePlayerFromGame(peer: UserPeer, options: unknown) {
  if (!isLeaveGameOptions(options)) {
    return sendErrorEvent(peer, 'Could not leave the game: invalid information provided!');
  }

  const gameIndex = findGameIndex(options.id);

  if (gameIndex === -1) {
    return sendErrorEvent(peer, 'Could not add player to the game that does not exist!');
  }

  const game = gameList[gameIndex];
  const index = game.players.findIndex((player) => player.id === peer.context.userId);
  const topicId = getGameTopicId(game);

  if (index === -1) {
    return sendErrorEvent(peer, 'Could not find player with provided id in this room');
  }

  if (game.players.length < 2) {
    gameList.splice(gameIndex, 1);
    const info = prepareGameListForClient();
    broadcastEventAndSend(peer, LOBBY_TOPIC, {event: 'refresh-game-list', info});
  } else {
    game.players.splice(index, 1);

    const info: GameRoomInfo = {
      id: game.id,
      name: game.name,
      players: preparePlayersForClient(game),
    };

    broadcastEventAndSend(peer, LOBBY_TOPIC, {
      event: 'player-left-the-game',
      info,
    });

    peer.unsubscribe(topicId);
  }
}

export function startGame(peer: UserPeer) {
  const game = findGameByPeer(peer);

  if (!game) {
    return sendErrorEvent(peer, 'Could not find game!');
  }

  if (game.players.length !== 2) {
    return sendErrorEvent(peer, 'You can only start the game if there are 2 players!');
  }

  const topicId = getGameTopicId(game);
  let reversiGameId = game.reversiGame;

  if (reversiGameId === undefined) {
    reversiGameId = createReversiGame(game.id, game.players);
    game.reversiGame = reversiGameId;
  }

  if (reversiGameId === undefined) {
    return sendErrorEvent(peer, 'Could not find Reversi game, that should exist!');
  }

  broadcastEventAndSend(peer, topicId, {
    event: 'has-reversi-game',
    info: {id: reversiGameId},
  });
}
