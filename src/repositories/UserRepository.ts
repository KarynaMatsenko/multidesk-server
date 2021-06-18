import { EntityRepository, Repository } from "typeorm";
import { Chat, User } from "../entities";
import { IPostUserRequest, Role } from "../types";
import { Assign, BCrypt } from "../utils";

@EntityRepository(User)
export default class UserRepository extends Repository<User> {
    public async getUserChats(id: number): Promise<Chat[]> {
        const user = await this.findOne({ id });
        if (!user) return [];
        return user.chats;
    }

    public getAllUsers(): Promise<User[]> {
        return this.find();
    }

    public async saveUser(userData: IPostUserRequest): Promise<User | undefined> {
        const user = new User();
        const passwordHash = await BCrypt.hash(userData.password);
        Assign.object(user, { ...userData, password: passwordHash, role: Role.User });
        try {
            const newUser = await this.save(user);
            return newUser;
        } catch (error) {
            return undefined;
        }
    }

    public async addAdmin(login: string, password: string): Promise<User> {
        const user = new User();
        user.login = login;
        user.password = await BCrypt.hash(password);
        user.role = Role.Admin;
        return this.save(user);
    }

    public async getUserByCredentials(userData: IPostUserRequest): Promise<User | undefined> {
        const user = await this.findOne({ login: userData.login });
        if (!user) return undefined;
        const compareResult = await BCrypt.compare(userData.password, user.password);
        if (compareResult === false) return undefined;
        return user;
    }
}
