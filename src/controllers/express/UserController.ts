import { Inject, Injectable } from "@decorators/di";
import { Controller, Response as Res, Request as Req, Post, Get } from "@decorators/express";
import { Request, Response } from "express";
import { app } from "../..";
import { Chat } from "../../entities";
import { CHAT_REPOSITORY, MESSAGE_REPOSITORY } from "../../injectors";
import { BodyParserMiddleware, UserAuthMiddleware } from "../../middleware";
import { ChatRepository, MessageRepository } from "../../repositories";
import { IGetAvailableChatsResponse, IGetChatMessagesResponse, IGetChatsResponse, IPostStartChatResponse } from "../../types";

@Injectable()
@Controller('/user', [BodyParserMiddleware, UserAuthMiddleware])
export default class UserController {
    public constructor(
        @Inject(CHAT_REPOSITORY) private _chatRepository: ChatRepository,
        @Inject(MESSAGE_REPOSITORY) private _messageRepository: MessageRepository,
    ) {}
    
    @Get('/chats')
    public async getAllUserChats(@Req() req: Request, @Res() res: Response) {
        const chats = await this._chatRepository.getAllChatsByUserId(req.userId);
        const postChatsResponse: IGetChatsResponse = { chats: chats };
        res.send(postChatsResponse);
    }

    @Post('/chat/start')
    public async startChat(@Req() req: Request, @Res() res: Response) {
        const chat = await this._chatRepository.getFreeChat();
        if (!chat) return res.sendStatus(406);
        const startedChat = await this._chatRepository.startChat(chat.id, req.userId);
        if (!startedChat) return res.sendStatus(406);
        const postStartChatResponse: IPostStartChatResponse = { chat: startedChat };
        res.send(postStartChatResponse);
    }

    @Post('/chat/end')
    public async endChat(@Req() req: Request, @Res() res: Response) {
        const chatId = req.body.id;
        if (typeof chatId !== 'number') return res.sendStatus(400);
        const chat = await this._chatRepository.getById(chatId);
        const result = await this._chatRepository.endChat(chatId, req.userId);
        if (result === false) return res.sendStatus(409);
        res.sendStatus(200);
        app.endChat(chat as Chat);
    }

    @Get('/chat/messages')
    public async getMessages(@Req() req: Request, @Res() res: Response) {
        const chatIdString = req.query.chatId as string;
        const chatId = Number.parseInt(chatIdString, 10);
        if (Number.isNaN(chatId)) return res.sendStatus(400);
        const messages = await this._messageRepository.getMessagesByChatId(chatId);
        if (messages.length > 0) {
            const chat = await this._chatRepository.getById(messages[0].chatId);
            if (!chat || chat.userId !== req.userId) return res.sendStatus(401);
        }
        const getChatMessagesResponse: IGetChatMessagesResponse = { messages };
        res.send(getChatMessagesResponse);
    }

    @Get('/chats/available')
    public async getNumberOfAvailableChats(@Res() res: Response) {
        const amount = await this._chatRepository.getAmountOfWaitingChats();
        const getChatMessagesResponse: IGetAvailableChatsResponse = { amount };
        res.send(getChatMessagesResponse);
    }
}