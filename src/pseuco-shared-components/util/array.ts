/**
 * Adds a separator between all elements of an array.
 * @param array The array containing the non-separator elements.
 * @param separator The separator to add in-between elements.
 */
export const intersperse = <T>(array: T[], separator: T): T[] => array.reduce<T[]>((prev, el, i) => i <= 0 ? [el] : [...prev, separator, el], []);

/**
 * Adds a separator between all elements of an array.
 * @param array The array containing the non-separator elements.
 * @param separator A generating function for the in-between elements. The index argument of the separator is the index of the element which will follow the separator
 */
export const intersperseWith = <T>(array: T[], separator: (index: number) => T): T[] => array.reduce<T[]>((prev, el, i) => i <= 0 ? [el] : [...prev, separator(i), el], []);

/**
 * Adds a separator between all elements of an array, with the last separator being handled separately.
 * @param array The array containing the non-separator elements.
 * @param mainSeparator The separator added betwenn all but the last two elements.
 * @param lastSeparator The separator added between the last two elements.
 * @param onlySeparator If specified, this separator overrides the other options if exactly one separator is required.
 * @returns 
 */
export const intersperseWithMainLast = <T>(array: T[], mainSeparator: T, lastSeparator: T, onlySeparator?: T): T[] => intersperseWith(array, (i) => array.length === 2 && onlySeparator !== undefined ? onlySeparator : i >= array.length - 1 ? lastSeparator : mainSeparator);

/**
 * From an array, groups all elements together that share a specific key.
 * @param array The array containing the elements to be grouped.
 * @param getKey Given an element of the array, this function returns the key to be grouped by.
 */
export const groupBy = <T>(array: T[], getKey: (elem: T) => string): { [key: string]: T[] } => {
    const groups: { [key: string]: T[] } = {};

    array.forEach((e) => {
        const key = getKey(e);
        const group = groups[key];
        if (group) {
            group.push(e);
        } else {
            groups[key] = [e];
        }
    });
    
    return groups;
};
