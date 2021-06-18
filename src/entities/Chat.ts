import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { ChatStatus } from "../types";
import Message from "./Message";
import User from "./User";

type Messenger = 'viber' | 'telegram' | 'whatsapp';

@Entity()
export default class Chat {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    messengerId!: string;

    @Column()
    messenger!: Messenger;

    @ManyToOne(() => User, (user) => user.chats, { nullable: true })
    user!: User | null;

    @Column({ nullable: true })
    userId!: number | null;

    @Column()
    status!: ChatStatus;

    @OneToMany(() => Message, (message) => message.chat, { onDelete: 'CASCADE' })
    messages!: Message[];
}