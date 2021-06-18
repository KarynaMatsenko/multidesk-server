import { Chat, Message, User } from "../entities";

export interface IGetUsersResponse {
    users: User[];
}

export interface IPostUserResponse {
    user: User;
}

export interface IPostLoginResponse {
    token: string;
}

export interface IGetChatsResponse {
    chats: Chat[];
}

export interface IPostStartChatResponse {
    chat: Chat;
}

export interface IGetChatMessagesResponse {
    messages: Message[];
}

export interface IGetAvailableChatsResponse {
    amount: number;
}
