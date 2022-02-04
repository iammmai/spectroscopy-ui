/**
 * Plucks a value out of an object or array if it exists.
 * @param value The object or array.
 * @param path An array of strings and numbers the specifies the path of properties and indexes to follow.
 * @param defaultValue The value to return if a type error prevents access. If it is an instance of [[Error]], it is thrown instead.
 */
export const get = (value: unknown, path: (string | number)[], defaultValue: unknown): unknown => {
    if (path.length <= 0) return value;
    const [head, ...rest] = path;
    if (typeof value === "object" && value !== null && head in value) {
        // we know something is in there, so the access is safe (but TS doesn't know that)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const valueAtHead = (value as any)[head] as unknown;
        return get(valueAtHead, rest, defaultValue);
    }

    if (defaultValue instanceof Error) throw defaultValue;
    return defaultValue;
};
