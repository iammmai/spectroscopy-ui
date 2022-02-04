/**
 * Functional map for object.
 * @param obj The object to map.
 * @param fn Gets value and key and should return new value.
 */
export const mapObject = <V1, V2>(obj: {[k: string]: V1}, fn: (v: V1, k: string) => V2): {[k: string]: V2} =>
    Object.fromEntries(
        Object.entries(obj).map(
            ([k, v]) => [k, fn(v, k)]
        )
    );

/**
 * Functional filter for object.
 * @param obj The object to filter.
 * @param fn Gets value and key and should return a boolean whether to keep the entry.
 */
export const filterObject = <V>(obj: {[k: string]: V}, fn: (v: V, k: string) => boolean): {[k: string]: V} =>
    Object.fromEntries(
        Object.entries(obj).filter(
            ([k, v]) => fn(v, k)
        )
    );

/**
 * Functional map for objects.
 * Works like [[mapObject]], but only returns the values.
 * @param obj The object to map.
 * @param fn Gets value and key and should return new value.
 */
export const mapObjectToArray = <V1, V2>(obj: {[k: string]: V1}, fn: (v: V1, k: string) => V2): V2[] => Object.values(mapObject(obj, fn));

/**
 * Flattens an array, one level deep.
 * @param a The array of arrays to flatten.
 */
export const flatten = <T>(a: T[][]): T[] => ([] as T[]).concat(...a);

/**
 * Concatenates two arrays.
 * @param a1 The first array.
 * @param a2 The second array.
 */
export const concat = <T>(a1: T[], a2: T[]): T[] => a1.concat(a2);

/**
 * Calls a method, if it exists. If not, nothing happens.
 * @param f The method to call, or nothing.
 * @param args The arguments to pass.
 */
export const callOrIgnore = <ReturnType, T extends (...args: never[]) => ReturnType>(f: (T) | undefined | null, ...args: Parameters<T>): void => { // `never` is a workaround to avoid using `any`
    if (f) f(...args);
};

/**
 * Computes the array [start, ..., end - 1].
 * @param end End of the range (exclusive).
 */
export const range = (start: number, end: number): number[] => (Array.from(new Array(end - start)).map((e, i) => i + start));

/**
 * Groups an array of values by a key.
 * @param values The values to group.
 * @param groupKey An accessor that converts a value to its string key.
 * @param sortBy If given, results are sorted according to this comparator.
 * @returns An object mapping keys to (possibly sorted) arrays of matching values.
 */
export const groupBy = <ValueType>(values: ValueType[], groupKey: (value: ValueType) => string, sortBy: ((v1: ValueType, v2: ValueType) => number) | null = null): { [key: string]: ValueType[] } => {
    const res: { [key: string]: ValueType[] } = {};
    for (const value of values) {
        const key = groupKey(value);
        if (!res[key]) res[key] = [];
        res[key].push(value);
    }
    if (sortBy) Object.values(res).forEach((a) => a.sort(sortBy));
    return res;
};
