/**
 * Removes all elements from an array not fulfilling a condition.
 * @param a The array to filter.
 * @param f The predicate. Elements where the return value is `false` are removed.
 */
export const mutatingFilter = <T>(a: T[], f: (element: T) => boolean): void => {
    for (let i = a.length - 1; i >= 0; i--) {
        if (!f(a[i])) a.splice(i, 1);
    }
};

/**
 * Removes an element from an array.
 * @param a The array to mutate.
 * @param e The element to find by equality and remove.
 * @returns Whether a value was removed.
 */
export const mutatingRemove = <T>(a: T[], e: T): boolean => {
    const i = a.indexOf(e);
    if (i < 0) return false;
    a.splice(i, 1);
    return true;
};