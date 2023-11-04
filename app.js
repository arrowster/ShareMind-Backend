import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import dotenv from 'dotenv'
import { Client } from '@stomp/stompjs';
import { WebSocket } from 'ws';
Object.assign(global, { WebSocket });
dotenv.config()

import indexRouter from './routes/index.js';
import usersRouter from "./routes/users.js";
import mqRouter from './routes/mq.js'


const app = express();
const __dirname = path.resolve();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/mq', mqRouter);

console.log('서버 ON')

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const z = new Error('Not Found');
  z.status = 404;
  next(z);
});

const client = new Client({
  brokerURL: process.env.MQ_URL,
  connectHeaders: {
    login: process.env.MQ_ID,
    passcode: process.env.MQ_PASSWORD
  },
  onConnect: () => {
    console.log('mq connected')
    client.subscribe(`/topic/rooms.*`, message => {
      console.log(message.headers.destination)
      console.log(message.body)
    })
  },
  onWebSocketClose(event) {
    console.log('mq disconnected')
  },
  debug(str) {
  },
  reconnectDelay: 1000,
});
client.activate()

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

export default app;
