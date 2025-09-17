import {USER_ID_STORAGE_KEY} from './consts';
import type {SocketEmitInfo, SocketInstance, SocketEventHandler, SocketInstanceMap} from './types';
import {isSocketEvent, isUserIdInfo} from './utils';

export const useWebsocketsStore = defineStore('websockets', () => {
  const socketMap = ref<SocketInstanceMap>({});

  function getSocket(name: string): SocketInstance | undefined {
    return socketMap.value[name];
  }

  function emit(name: string, event: string, info?: unknown) {
    const socketInstance = getSocket(name);
    console.log(name, event, info, socketInstance);

    if (!socketInstance) {
      console.warn('trying to use sockets before mounting!');
      return;
    }

    const emitInfo: SocketEmitInfo = {event, info};
    const jsonString = JSON.stringify(emitInfo);

    socketInstance.socket.send(jsonString);
  }

  function on(name: string, event: string, handler: SocketEventHandler) {
    const socketInstance = getSocket(name);

    if (!socketInstance) {
      console.warn('Trying to subscribe to a websocket event without connection!');
      return;
    }

    const {handlers} = socketInstance;

    if (!handlers[event]) {
      handlers[event] = [];
    }

    handlers[event].push(handler);
  }

  function callAllHandlers(name: string, event: string, info: unknown) {
    const socketInstance = getSocket(name);

    if (!socketInstance) {
      console.warn('Trying to subscribe to a websocket event without connection!');
      return;
    }

    const callbacks = socketInstance.handlers[event];

    if (!callbacks) {
      return;
    }

    callbacks.forEach((handler) => handler(info));
  }

  function connectWebsocket(name: string, userId: string | null) {
    return new Promise<undefined | string>((resolve) => {
      // Connection is already established.
      if (getSocket(name)) return;

      const isSecure = window.location.protocol === 'https:';
      const websocketUrl = `${isSecure ? 'wss' : 'ws'}://${window.location.host}/${name}`;

      const socketInstance = new WebSocket(websocketUrl);

      socketInstance.addEventListener('open', (_) => {
        socketMap.value[name] = {socket: socketInstance, handlers: {}, isReady: false};
        emit(name, 'link-user', userId);
      });

      socketInstance.addEventListener('message', (message) => {
        if (message.data === 'pong') {
          return;
        }

        if (message.data === 'is-ready') {
          resolve(undefined);
        }

        const eventInfo = JSON.parse(message.data);

        if (!isSocketEvent(eventInfo)) {
          return;
        }

        const {event, info} = eventInfo;

        if (event === 'save-user' && isUserIdInfo(info)) {
          resolve(info.userId);
        }

        callAllHandlers(name, eventInfo.event, eventInfo.info);
      });
    });
  }

  function disconnectSocket(name: string) {
    const socketInstance = getSocket(name);
    if (!socketInstance) return;

    socketInstance.socket.close();
    socketMap.value[name] = undefined;
  }

  function socketIsReady(name: string) {
    const socketInstance = getSocket(name);

    if (!socketInstance) return;

    socketInstance.isReady = true;
  }

  return {socketMap, emit, on, callAllHandlers, connectWebsocket, disconnectSocket, socketIsReady};
});

// Connecting and disconnecting from a given websocket on a given page.
export function useWebsocketConnection(name: string) {
  const {userId, saveUserId} = useUserId();
  const store = useWebsocketsStore();
  const {socketMap} = storeToRefs(store);
  const {connectWebsocket, disconnectSocket, socketIsReady} = store;

  onMounted(async () => {
    const id = await connectWebsocket(name, userId.value);

    if (id) saveUserId(id);

    socketIsReady(name);
  });

  onUnmounted(() => {
    disconnectSocket(name);
  });

  return computed(() => socketMap.value[name]?.isReady || false);
}

// Find and interact with an active websocket connection.
export function useWebsockets(name: string) {
  const {on, emit} = useWebsocketsStore();

  function namedOn(event: string, handler: SocketEventHandler) {
    on(name, event, handler);
  }

  function namedEmit(event: string, info?: unknown) {
    emit(name, event, info);
  }

  return {emit: namedEmit, on: namedOn};
}

export function useUserId() {
  const userId = ref<string | null>(null);

  function saveUserId(id: string) {
    if (!localStorage) {
      console.warn('Could not save user id to local storage! The function ran at the server for some reason!');
      return;
    }

    localStorage.setItem(USER_ID_STORAGE_KEY, id);
    userId.value = id;
  }

  onMounted(() => {
    userId.value = localStorage.getItem(USER_ID_STORAGE_KEY);
  });

  return {
    userId,
    saveUserId,
  };
}
