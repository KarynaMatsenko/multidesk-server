import bcrypt from 'bcrypt';
import { SALT_ROUNDS } from '../configuration';

export default class BCrypt {
    private static _salt = bcrypt.genSaltSync(SALT_ROUNDS);

    public static hash(data: string): Promise<string> {
        return bcrypt.hash(data, BCrypt._salt);
    }

    public static compare(plain: string, hash: string): Promise<boolean> {
        return bcrypt.compare(plain, hash);
    }
}