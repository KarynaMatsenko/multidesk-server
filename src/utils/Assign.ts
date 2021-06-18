export default class Assign {
    public static object<T extends S, S>(target: T, source: S): T {
        return Object.assign(target, source);
    }
}
