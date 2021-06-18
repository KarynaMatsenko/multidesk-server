import { Container, InjectionToken } from "@decorators/di";
import { getCustomRepository } from "typeorm";
import { ChatRepository, MessageRepository, UserRepository } from "./repositories";

export const USER_REPOSITORY = new InjectionToken('USER_REPOSITORY');
export const CHAT_REPOSITORY = new InjectionToken('CHAT_REPOSITORY');
export const MESSAGE_REPOSITORY = new InjectionToken('MESSAGE_REPOSITORY');

Container.provide([
    { provide: USER_REPOSITORY, useFactory: () => getCustomRepository(UserRepository) },
    { provide: CHAT_REPOSITORY, useFactory: () => getCustomRepository(ChatRepository) },
    { provide: MESSAGE_REPOSITORY, useFactory: () => getCustomRepository(MessageRepository) },
]);
