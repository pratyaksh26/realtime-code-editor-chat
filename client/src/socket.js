import { io } from 'socket.io-client';

export const initSocket = async () => {
  const options = {
    transports: ['websocket'],
    reconnectionAttempts: 5,
    timeout: 10000,
  };

  return io('http://localhost:5000', options); 
};
