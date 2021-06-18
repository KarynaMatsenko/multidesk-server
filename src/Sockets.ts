import http from 'http';
import { Server, Socket } from 'socket.io'
import { ExtendedError } from 'socket.io/dist/namespace';
import { getCustomRepository } from 'typeorm';
import { Chat, Message } from './entities';
import { ChatRepository, MessageRepository } from './repositories';
import TypedEventEmitter from './TypedEventEmitter';
import { IMessageRequest } from './types';
import { JWT } from './utils';

interface ISocketEvents {
    'new-message': (message: IMessageRequest) => void;
}

interface ISocketEmitEvents {
    'new-message': (message: Message) => void;
    'available-chat': (availableChatAmount: number) => void;
    'chat-ended': (chat: Chat) => void;
}

interface IEvents extends Record<string, unknown[]> {
    'message': [message: Message];
}

interface IMySocket extends Socket<ISocketEvents, ISocketEmitEvents> {
    userId: number
}

export default class Sockets extends TypedEventEmitter<IEvents> {
    private _socket: Server<ISocketEvents, ISocketEmitEvents>;
    private _connectedUsers: Map<number, string>;
    private _messageRepository: MessageRepository;
    private _chatRepository: ChatRepository;

    public constructor(server: http.Server) {
        super();
        this._connectedUsers = new Map();
        this._messageRepository = getCustomRepository(MessageRepository);
        this._chatRepository = getCustomRepository(ChatRepository);
        this._socket = new Server(server);
        this._socket.use((socket, next) => {
            this._auth(socket as IMySocket, next);
        });
        this._socket.on('connection', (socket) => {
            this._onConnect(socket as IMySocket);
        });
    }

    public async newMessage(message: Message) {
        const chat = await this._chatRepository.getById(message.chatId);
        if (!chat) return;
        const socketId = this._connectedUsers.get(chat.userId as number);
        if (!socketId) return;
        this._socket.to(socketId).emit('new-message', message);
    }

    public availableChat(numberOfAvailableChats: number) {
        this._socket.emit('available-chat', numberOfAvailableChats);
    }

    public chatEnded(chat: Chat) {
        const socketId = this._connectedUsers.get(chat.userId as number);
        if (!socketId) return;
        this._socket.to(socketId).emit('chat-ended', chat);
    }

    private async _auth(socket: IMySocket, next: (err?: ExtendedError) => void): Promise<void> {
        const token = socket.handshake?.query?.token;
        if (typeof token === 'string') {
            const decoded = JWT.decode(token);
            if (!decoded) return;
            socket.userId = decoded.userId;
            next();
        }
    }

    private _onConnect(socket: IMySocket) {
        this._connectedUsers.set(socket.userId, socket.id);
        socket.on('disconnect', () => {
            this._onDisconnect(socket.userId);
        });
        socket.on('new-message', async (message) => {
            await this._onMessage(message, socket.userId);
        });
    }

    private _onDisconnect(userId: number) {
        this._connectedUsers.delete(userId);
    }

    private async _onMessage(messageData: IMessageRequest, userId: number) {
        const message = await this._messageRepository.createNewMessageFromUser(messageData.chatId, messageData.messageContent);
        this.emit('message', message);
    }
}
