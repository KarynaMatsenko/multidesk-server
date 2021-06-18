import { EntityRepository, Repository } from "typeorm";
import { Message } from "../entities";

@EntityRepository(Message)
export default class UserRepository extends Repository<Message> {
    public getMessagesByChatId(chatId: number): Promise<Message[]> {
        return this.find({ chatId });
    }

    public createNewMessageFromMessenger(chatId: number, content: string): Promise<Message> {
        return this._createNewMessage(chatId, content, false);
    }

    public createNewMessageFromUser(chatId: number, content: string): Promise<Message> {
        return this._createNewMessage(chatId, content, true);
    }

    private _createNewMessage(chatId: number, content: string, fromUser: boolean): Promise<Message> {
        const message = new Message();
        message.chatId = chatId;
        message.content = content;
        message.dateInISO = new Date().toISOString();
        message.fromUser = fromUser;
        return this.save(message);
    }
}
