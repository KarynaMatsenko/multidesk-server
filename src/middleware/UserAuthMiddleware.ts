import { Role } from '../types';
import AuthMiddleware from './AuthMiddleware';

export default class UserAuthMiddleware extends AuthMiddleware {
    _role = Role.User;
}
