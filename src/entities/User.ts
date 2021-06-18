import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Role } from "../types";
import Chat from "./Chat";

@Entity()
export default class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    login!: string;

    @Column()
    password!: string;

    @Column()
    role!: Role;

    @OneToMany(() => Chat, (chat) => chat.user, { eager: true, onDelete: 'CASCADE' })
    chats!: Chat[];
}
