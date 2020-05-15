import io from 'socket.io-client';

const socketHost = 'https://beta-data.mometic.com';

export const connect = () => {
  window.socket = io(socketHost, {
    transports: ['polling']
  });

  this.socket.on('compressedUpdate', (data) => {
    const event = new CustomEvent('compressedUpdate', data);
    window.dispatchEvent(event)
  });
  this.subscribeChannels(data_filter.category);
}

export const disconnect = () => {
  if (window.socket) {
    window.socket.disconnect()
  }
}