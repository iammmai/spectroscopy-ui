/**
 * A single state of an LTS.
 */
export type LTSState = {
    /**
     * Transitions of this state.
     * Absence indicates transitions are *unknown*, while `[]` indicates the state is final.
     */
    transitions?: LTSTransition[];
    /**
     * Indicates a technical problem with a state that makes the successor states inaccessible.
     */
    error?: string;
    highlighted?: boolean;
}

export type LTSTransition = {
    weak?: boolean
    label: string;
    detailsLabel: string | false;
    target: string;
};

/**
 * Describes an LTS.
 */
export type LTS = {
    initialState: string;
    states: {
        [stateKey: string]: LTSState;
    };
}
