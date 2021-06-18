import { IncomingMessage, ServerResponse } from "http";
import { getCustomRepository } from "typeorm";
import { IMainBot, MainBot, IContext, IBot, ITextMessage } from "../../../multibot";
import { Chat, Message } from "./entities";
import { ChatRepository, MessageRepository } from "./repositories";
import TypedEventEmitter from "./TypedEventEmitter";

const settings = require('../settings.json');

const registeredMessage = 'Дякуємо за звернення, будь ласка, зачекайте диспейчера.';
const pleaseWaitMessage = 'Будь-ласка зачекайте поки мы шукаємо вам диспейчера.';

type RegisteredMessengers = 'telegram' | 'viber';

interface IEvents extends Record<string, unknown[]> {
    'new-message': [message: Message];
    'new-chat': [chat: Chat];
    'end-chat': [chat: Chat];
}

export default class Bot extends TypedEventEmitter<IEvents> {
    private _multiBot!: IMainBot<RegisteredMessengers>;
    private _chatRepository!: ChatRepository;
    private _messageRepository!: MessageRepository;

    public async start(): Promise<void> {
        this._multiBot = new MainBot(settings);
        await this._multiBot.start();
        this._chatRepository = getCustomRepository(ChatRepository);
        this._messageRepository = getCustomRepository(MessageRepository);

        this._multiBot.on('text-message', this._onTextMessage.bind(this));
    }

    public getMiddleware(): (req: IncomingMessage, res: ServerResponse, next?: () => void) => void {
        return this._multiBot.getMiddleware();
    }

    public async sendMessage(message: Message) {
        const chat = await this._chatRepository.getById(message.chatId);
        if (!chat) return;
        this._multiBot.bots[chat.messenger as RegisteredMessengers].sendTextMessage(chat.messengerId, message.content);
    }

    public async sendEndMessage(chat: Chat) {
        this._multiBot.bots[chat.messenger as RegisteredMessengers].sendTextMessage(chat.messengerId, 'Диспетчер закічнив розмову.');
    }

    private async _onTextMessage(context: IContext<IBot, ITextMessage>) {
        let messengerId = context.message.from.id;
        if (typeof messengerId === 'number') messengerId = messengerId.toString();
        const waitingChat = await this._chatRepository.getWaitingChatByMessengerId(messengerId);
        if (waitingChat) return await this._onWaitingChat(context);
        const inProgressChat = await this._chatRepository.getInProgressChatByMessengerId(messengerId);
        if (inProgressChat) return await this._onInProgressChat(context, inProgressChat);
        await this._onNewChat(context, messengerId);
    }

    private async _onWaitingChat(context: IContext<IBot, ITextMessage>) {
        await context.bot.sendTextMessage(context.message.from.id, pleaseWaitMessage);
    }

    private async _onInProgressChat(context: IContext<IBot, ITextMessage>, chat: Chat) {
        if (context.message.content === '/end') {
            const endedChat = await this._chatRepository.endChatAsMessenger(chat);
            this.emit('end-chat', endedChat);
            return;
        }
        const message = await this._messageRepository.createNewMessageFromMessenger(chat.id, context.message.content);
        this.emit('new-message', message);
    }

    private async _onNewChat(context: IContext<IBot, ITextMessage>, messengerId: string) {
        const chat = await this._chatRepository.createChat(messengerId, context.message.messenger);
        this.emit('new-chat', chat);
        await context.bot.sendTextMessage(context.message.from.id, registeredMessage);
    }
}
