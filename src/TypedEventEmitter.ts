import EventEmitter from "events";

type Arguments<ArgumentArray> = ArgumentArray extends unknown[] ? ArgumentArray : never;
type ObjectKeys<Keys> = Keys extends keyof Record<string, unknown> ? Keys : never;

export default abstract class TypedEventEmitter<BotEvents extends Record<string, unknown[]>> extends EventEmitter {
    public on = <Key extends ObjectKeys<keyof BotEvents>>(event: Key, listener: (...args: Arguments<BotEvents[Key]>) => void): this => {
        return super.on(event, listener as (...args: any[]) => void);
    }
}
