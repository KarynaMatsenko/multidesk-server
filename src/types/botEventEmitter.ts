type Arguments<ArgumentArray> = ArgumentArray extends unknown[] ? ArgumentArray : never;
type ObjectKeys<Keys> = Keys extends keyof Record<string, unknown> ? Keys : never;

export interface ITypedEventEmitter<BotEvents extends Record<string, unknown>> extends NodeJS.EventEmitter {
    on<Key extends ObjectKeys<keyof BotEvents>>(event: Key, listener: (...args: Arguments<BotEvents[Key]>) => void): this;
    on<Key extends string | symbol>(event: Exclude<Key, keyof BotEvents>, listener: (...args: unknown[]) => void): this;

    once<Key extends ObjectKeys<keyof BotEvents>>(event: Key, listener: (...args: Arguments<BotEvents[Key]>) => void): this;
    once<Key extends string | symbol>(event: Exclude<Key, keyof BotEvents>, listener: (...args: unknown[]) => void): this;

    emit<Key extends ObjectKeys<keyof BotEvents>>(event: Key, ...args: Arguments<BotEvents[Key]>): boolean;
    emit<Key extends string | symbol>(event: Exclude<Key, keyof BotEvents>, ...args: unknown[]): boolean;

    off<Key extends ObjectKeys<keyof BotEvents>>(event: Key, listener: (...args: Arguments<BotEvents[Key]>) => void): this;
    off<Key extends string | symbol>(event: Exclude<Key, keyof BotEvents>, listener: (...args: unknown[]) => void): this;

    removeAllListeners<Key extends ObjectKeys<keyof BotEvents>>(event?: Key): this;
    removeAllListeners<Key extends string | symbol>(event?: Exclude<Key, keyof BotEvents>): this;
}
