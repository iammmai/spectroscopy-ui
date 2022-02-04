import { LTS } from "./lts/lts";

export type FileData = {
    core: unknown;
    extended: Record<string, unknown>
}

export type LTSFileData = FileData & {
    core: LTS | null,
    extended: {
        dataId?: number,
        minimized?: LTSFileData,
        explored?: boolean,
        explorationInProgress?: boolean,
        fullyExploredParent?: boolean, // if minimized instance, state if the parent was compressed or minimized
        versionNumber?: number,
        counters?: {
            states: number,
            transitions: number
        },
        highlightedStateCallback?: (label: string | null) => void,
        frontMatter?: {
            hideWeakLabels: boolean
        },
        explorationTask?: any
    }
};

export type TextFileData = FileData & {
    core: string | null;
    extended: {
        /**
         * The list of detected issues in the file, to be shown by an editor.
         */
        issues?: Issue[];

        /**
         * If this is set, editors should highlight the line indicated by this (zero-based) number.
         */
        highlightedLine?: number;
    };
};

export type Issue = {
    text: string;
    type: "error" | "warning";
    scope: string;
} & ({
    scope: "line";
    row: number;
    column: number;
} | {
    scope: "file";
})
