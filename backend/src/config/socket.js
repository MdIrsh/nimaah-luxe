import { Server } from 'socket.io';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    // Client joins a specific product room for targeted updates
    socket.on('join:product', (productId) => {
      if (productId) {
        socket.join(`product:${productId}`);
      }
    });

    socket.on('leave:product', (productId) => {
      if (productId) {
        socket.leave(`product:${productId}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  console.log('[Socket.IO] Real-time engine initialized successfully');
  return io;
};

export const getIO = () => {
  return io;
};

// Real-time broadcast helpers
export const broadcastReviewEvent = (event, payload) => {
  if (!io) return;

  // Broadcast globally (e.g. for catalog / product cards / admin)
  io.emit(event, payload);

  // If payload contains productId, also emit to that product room specifically
  const productId = payload?.productId || payload?.review?.product?._id || payload?.review?.product;
  if (productId) {
    io.to(`product:${productId}`).emit(event, payload);
  }
};
