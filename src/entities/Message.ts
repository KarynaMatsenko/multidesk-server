import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import Chat from "./Chat";

@Entity()
export default class Message {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Chat, (chat) => chat.messages)
    chat!: Chat;

    @Column()
    chatId!: number;

    @Column()
    content!: string;

    @Column()
    fromUser!: boolean;

    @Column()
    dateInISO!: string;
}
