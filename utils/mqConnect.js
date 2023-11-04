import { Client } from '@stomp/stompjs';
import { WebSocket } from 'ws';
import dotenv from 'dotenv';
Object.assign(global, { WebSocket });
dotenv.config();

const client = new Client({
  brokerURL: process.env.MQ_URL,
  connectHeaders: {
    login: process.env.MQ_ID,
    passcode: process.env.MQ_PASSWORD
  },
  onConnect: () => {
    console.log('mq connected')
  },
  onWebSocketClose(event) {
    console.log('mq disconnected')
  },
  debug(str) {
  },
  reconnectDelay: 1000,
});
client.activate()
export default client;