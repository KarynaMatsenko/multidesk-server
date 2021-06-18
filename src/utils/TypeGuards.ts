import { IPostUserRequest } from "../types";

type JSTypes = 'bigint' | 'boolean' | 'function' | 'number' | 'object' | 'string' | 'symbol' | 'undefined';
type ObjectIndexTypes = string | number

export default class TypeGuards {
    private static _isObject(value: unknown): value is Record<ObjectIndexTypes, any> {
        if (typeof value === 'object' && value !== null) return true;
        return false;
    }

    private static _objectHas(value: unknown, key: ObjectIndexTypes, type: JSTypes): boolean {
        if (!this._isObject(value)) return false;
        if (value.hasOwnProperty(key) && typeof value[key] === type) return true;
        return false;
    }

    public static isPostUserRequest(value: unknown): value is IPostUserRequest  {
        if (TypeGuards._objectHas(value, 'login', 'string')
        && TypeGuards._objectHas(value, 'password', 'string')) return true;
        return false;
    }
}
