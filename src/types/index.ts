import { Role } from './enums'

export interface IJWT {
    userId: number;
}

declare global {
    namespace Express {
        export interface Request {
            role: Role;
            userId: number;
        }
    }
}

export * from './requests';
export * from './responses';
export * from './botEventEmitter';
export * from './sockets';
export * from './enums';
