import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../configuration';
import { IJWT } from '../types';

export default class JWT {
    static create(data: IJWT): string {
        return jwt.sign(data, JWT_SECRET, { algorithm: 'HS512', expiresIn: '12h' });
    }
    
    static decode(token: string): IJWT | undefined {
        try {
            return jwt.verify(token, JWT_SECRET, { algorithms: ['HS512'] }) as IJWT;
        } catch (error) {
            return undefined;
        }
    }
}
