export interface IBaseSocketRequest {
    token: string;
}

export interface IMessageRequest extends IBaseSocketRequest {
    chatId: number;
    messageContent: string;
}
