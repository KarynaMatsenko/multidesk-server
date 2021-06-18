import { config } from 'dotenv-safe'

config();
export const JWT_SECRET = process.env.JWT_SECRET as string;

const saltRounds = Number.parseInt(process.env.SALT_ROUNDS as string, 10);
if (Number.isNaN(saltRounds)) throw new Error('Salt rounds is not an int.');
export const SALT_ROUNDS = saltRounds;
