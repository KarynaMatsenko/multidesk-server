export interface IGetUsersRequest { }

export interface IDeleteUserRequest {
    id: number;
}

export interface IPostUserRequest {
    login: string;
    password: string;
}

export interface IPostEndChatRequest {
    id: number
}

export interface IGetChatMessagesRequest {
    chatId: number;
}

export interface IPostCheckTokenRequest {
    token: string;
}
