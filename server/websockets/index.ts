import type {Peer, Message} from 'crossws';

export function handleSocketEvent(peer: Peer, message: Message, socketHandlerMap: SocketHandlersMap) {
  if (message.text() === 'ping') {
    peer.send('pong');
    return;
  }

  const messageInfo = message.json();
  console.log('message: ', messageInfo);

  if (!isMessageInfo(messageInfo)) {
    return;
  }

  const {event, info} = messageInfo;

  if (event === 'link-user') {
    if (info) {
      peer.context.userId = info;
      peer.send('is-ready');
      return;
    }

    const userInfo: User = {userId: peer.id};
    peer.context.userId = peer.id;

    sendEvent(peer, {event: 'save-user', info: userInfo});

    return;
  }

  if (!isUserPeer(peer)) {
    const info = {message: 'Socket connection is not registered!', isError: true};
    peer.send(JSON.stringify(info));
    return;
  }

  if (!socketHandlerMap[event]) {
    return;
  }

  socketHandlerMap[event](peer, info);
}
