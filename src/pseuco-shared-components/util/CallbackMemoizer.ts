export class PassthroughCallbackMemoizer<EventArgs extends unknown[]> {
    private memo: {
        [identifier: string]: {
            inCallback: ((identifier: string, ...eventArgs: EventArgs) => void) | undefined;
            outCallback: ((...eventArgs: EventArgs) => void);
        };
    } = {};

    /**
     * Creates a callback that calls a preexisting callback, passing a constant identifier as the first argument, and passing through additional event arguments.
     * The result is memorized: If the callback is identical to the previous invocation on the same instance with the same identifier, the result is the same callback function.
     * Can work with undefined callbacks.
     * @param callback The callback to be wrapped.
     * @param identifier The fixed first argument to pass to the callback.
     */
    public getCallback(identifier: string, callback: ((identifier: string, ...eventArgs: EventArgs) => void) | undefined): ((...eventArgs: EventArgs) => void) {
        const m = this.memo[identifier];
        if (m && m.inCallback === callback) return m.outCallback;
        const outCallback = callback ? (...eventArgs: EventArgs): void => callback(identifier, ...eventArgs) : ((): void => {/* do nothing */});
        this.memo[identifier] = { inCallback: callback, outCallback };
        return outCallback;
    }
}

export class ConstantCallbackMemoizer<CallbackArgs extends unknown[]> {
    private memo: {
        [identifier: string]: {
            inCallback: ((...args: CallbackArgs) => void) | undefined;
            outCallback: (() => void);
        };
    } = {};

    /**
     * Creates a callback that calls a preexisting callback, passing constant arguments. Additional arguments are ignored.
     * The result is memorized: If the callback is identical to the previous invocation on the same instance with the same identifier, the result is the same callback function.
     * Can work with undefined callbacks.
     * @param callback The callback to be wrapped.
     * @param identifier An identifier for memoization. Will _not_ be passed to the callback
     * @param arguments The arguments to pass to the callback.
     */
    public getCallback(identifier: string, callback: ((...args: CallbackArgs) => void) | undefined, ...args: CallbackArgs): (() => void) {
        const m = this.memo[identifier];
        if (m && m.inCallback === callback) return m.outCallback;
        const outCallback = callback ? (): void => callback(...args) : ((): void => {/* do nothing */});
        this.memo[identifier] = { inCallback: callback, outCallback };
        return outCallback;
    }
}
