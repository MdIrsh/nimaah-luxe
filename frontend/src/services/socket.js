import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_API_URL?.replace('/api', '') ||
      (import.meta.env.PROD ? window.location.origin : 'http://localhost:5000');

    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      withCredentials: true,
    });

    socket.on('connect', () => {
      // Socket connected
    });

    socket.on('disconnect', () => {
      // Socket disconnected
    });
  }

  return socket;
};

export const joinProductRoom = (productId) => {
  const s = getSocket();
  if (s && productId) {
    s.emit('join:product', productId);
  }
};

export const leaveProductRoom = (productId) => {
  const s = getSocket();
  if (s && productId) {
    s.emit('leave:product', productId);
  }
};
