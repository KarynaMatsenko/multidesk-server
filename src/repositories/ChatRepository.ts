import { EntityRepository, Repository } from "typeorm";
import { Messenger } from "../../../../multibot";
import { Chat } from "../entities";
import { ChatStatus } from "../types";

@EntityRepository(Chat)
export default class ChatRepository extends Repository<Chat> {
    public getAllChatsByUserId(userId: number): Promise<Chat[]> {
        return this.find({ userId, status: ChatStatus.InProgress });
    }

    public getFreeChat(): Promise<Chat | undefined> {
        return this.findOne({ status: ChatStatus.Waiting });
    }

    public async startChat(chatId: number, userId: number): Promise<Chat | undefined> {
        const chat = await this.findOne({ id: chatId });
        if (!chat || chat.status !== ChatStatus.Waiting) return undefined;
        chat.userId = userId;
        chat.status = ChatStatus.InProgress;
        try {
            const newChat = await this.save(chat);
            return newChat;
        } catch (error) {
            return undefined;
        }
    }

    public async endChat(chatId: number, userId: number): Promise<boolean> {
        const chat = await this.findOne({ id: chatId });
        if (!chat || chat.userId !== userId || chat.status !== ChatStatus.InProgress) return false;
        chat.status = ChatStatus.Finished;
        try {
            await this.save(chat);
            return true;
        } catch (error) {
            return false;
        }
    }

    public endChatAsMessenger(chat: Chat): Promise<Chat> {
        chat.status = ChatStatus.Finished;
        return this.save(chat);
    }

    public getById(id: number): Promise<Chat | undefined> {
        return this.findOne({ id });
    }

    public getWaitingChatByMessengerId(messengerId: string): Promise<Chat | undefined> {
        return this.findOne({ messengerId, status: ChatStatus.Waiting });
    }

    public getInProgressChatByMessengerId(messengerId: string): Promise<Chat | undefined> {
        return this.findOne({ messengerId, status: ChatStatus.InProgress });
    }

    public createChat(messengerId: string, messenger: Messenger): Promise<Chat> {
        const chat = new Chat();
        chat.messengerId = messengerId;
        chat.status = ChatStatus.Waiting;
        chat.messenger = messenger;
        chat.userId = null;
        return this.save(chat);
    }

    public async getAmountOfWaitingChats(): Promise<number> {
        const chats = await this.find({ status: ChatStatus.Waiting });
        return chats.length;
    }
}
