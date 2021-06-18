import { Role } from '../types';
import AuthMiddleware from './AuthMiddleware';

export default class AdminAuthMiddleware extends AuthMiddleware {
    _role = Role.Admin;
}
