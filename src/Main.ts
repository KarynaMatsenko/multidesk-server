import { attachControllers as attachExpressControllers } from "@decorators/express";
import bodyParser from "body-parser";
import express from "express";
import { createServer, Server } from 'http';
import helmet from "helmet";
import { Connection, createConnection, getCustomRepository } from "typeorm";
import { controllers as expressControllers } from "./controllers/express";
import Bot from "./Bot";
import Sockets from "./Sockets";
import { ChatRepository } from "./repositories";
import { BCrypt } from "./utils";
import { Chat } from "./entities";

export default class Main {
    private _port = 80;
    private _app!: express.Application;
    private _bot!: Bot;
    private _sockets!: Sockets;
    private _connection!: Connection;
    private _server!: Server;
    private _chatRepository!: ChatRepository;

    public async start(): Promise<void> {
        this._app = express();
        this._server = createServer(this._app);
        // this._app.use(helmet());
        // this._app.use(bodyParser.json());
        this._connection = await createConnection();
        this._chatRepository = getCustomRepository(ChatRepository);
        attachExpressControllers(this._app, expressControllers);
        this._bot = new Bot();
        await this._bot.start();
        this._app.use('/bots', this._bot.getMiddleware());
        this._sockets = new Sockets(this._server);
        this._server.listen(this._port);
        this._addConnections();
    }

    public async endChat(chat: Chat) {
        await this._bot.sendEndMessage(chat);
    }

    private _addConnections() {
        this._sockets.on('message', async (message) => {
            await this._bot.sendMessage(message);
        });

        this._bot.on('new-message', async (message) => {
            await this._sockets.newMessage(message);
        })

        this._bot.on('new-chat', async () => {
            const amountOfWaitingChats = await this._chatRepository.getAmountOfWaitingChats();
            this._sockets.availableChat(amountOfWaitingChats);
        })

        this._bot.on('end-chat', (chat) => {
            this._sockets.chatEnded(chat);
        })
    }
}
