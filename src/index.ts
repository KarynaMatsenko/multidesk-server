import { IMainBot, MainBot } from '../../../multibot'
import express from 'express';
const app = express();
import http from 'http';
const server = http.createServer(app);
import { Server } from 'socket.io';
import { join } from 'path';
const io = new Server(server);

const settings = require('../settings.json');

const client = new MainBot(settings) as IMainBot;

let writer: string | number;
let messenger: 'telegram' | 'viber';

app.use('/bots', client.getMiddleware());

client.on('text-message', (context) => {
    console.log(context.message);
    writer = context.message.from.id;
    messenger = context.message.messenger;
    io.emit('chat message', `${context.message.from.username}: ${context.message.content}`);
});

client.start();

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '../index.html'));
});

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
      io.emit('chat message', msg);
      if (writer) {
        client.bots[messenger]?.sendTextMessage(writer as never, msg);
      }
    });
});

server.listen(80, () => {
    console.log('listening on *:80');
});
