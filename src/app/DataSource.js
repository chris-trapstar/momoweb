import io from 'socket.io-client';

const socketHost = 'https://beta-data.mometic.com';
// const socketHost = 'http://localhost:3001';


export const connect = () => {
  window.socket = io(socketHost, {
    transports: ['polling']
  });

  window.socket.on('compressedUpdate', (data) => {
    const event = new CustomEvent('compressedUpdate', { detail: data });
    window.dispatchEvent(event)
  });
}

export const disconnect = () => {
  if (window.socket) {
    window.socket.disconnect()
  }
}

export const subscribe = (channel) => {
  if (window.socket) {
    window.socket.emit('subscribe', channel)
  }
}

export const unsubscribe = (channel) => {
  if (window.socket) {
    window.socket.emit('unsubscribe', channel)
  }
}
