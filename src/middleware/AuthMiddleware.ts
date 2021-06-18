import { Middleware } from '@decorators/express';
import { NextFunction, Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { User } from '../entities';
import { UserRepository } from '../repositories';
import { IJWT, Role } from '../types';
import { JWT } from '../utils';

export default abstract class AuthMiddleware implements Middleware {
    protected abstract _role: Role;

    public async use(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const token = this._getTokenFromRequestHeader(req);
            const decoded = this._decodeToken(token);
            const user = await this._getUserFromDB(decoded.userId);
            this._throwIfWrongRole(user.role);
            req.userId = user.id;
            req.role = user.role;
            next();
        } catch (error) {
            res.status(403).send({ reason: error.message });
        }
    }

    private _getTokenFromRequestHeader(req: Request): string {
        const token = req.headers['x-access-token'] as string | undefined;
        if (!token) throw new Error('Token was not provided.');
        return token;
    }

    private _decodeToken(token: string): IJWT {
        const decoded = JWT.decode(token);
        if (!decoded) throw new Error('Falsy token was provided.');
        return decoded;
    }

    private async _getUserFromDB(id: number): Promise<User> {
        const user = await getCustomRepository(UserRepository).findOne({ id });
        if (!user) throw new Error('User was not found.');
        return user;
    }

    private _throwIfWrongRole(realRole: Role): void {
        if (realRole !== this._role) throw new Error('This path is forbidden.');
    }
}