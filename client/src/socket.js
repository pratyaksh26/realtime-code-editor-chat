import { io } from 'socket.io-client';

export const initSocket = async () => {
  const options = {
    transports: ['websocket'],
    reconnectionAttempts: 5,
    timeout: 10000,
  };

  return io('wss://realtime-code-editor-chat.onrender.com', options);
};
