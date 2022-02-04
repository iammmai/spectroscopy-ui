import React, { useCallback, useEffect, useRef, useState } from "react";

import CodeMirror, { Hint, HintFunction, Position, TextMarker } from "codemirror";
import 'codemirror/addon/dialog/dialog';
import 'codemirror/addon/search/searchcursor';
import 'codemirror/addon/search/search';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/selection/active-line';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/anyword-hint';

import 'codemirror/theme/monokai.css';

import collapseUpIcon from '../../../glyphicons/glyphicons-basic/glyphicons-basic-428-square-triangle-up.svg';
import collapseDownIcon from '../../../glyphicons/glyphicons-basic/glyphicons-basic-427-square-triangle-down.svg';
import pencilIcon from '../../../glyphicons/glyphicons-basic/glyphicons-basic-31-pencil.svg';
import okIcon from '../../../glyphicons/glyphicons-basic/glyphicons-basic-194-circle-empty-check.svg';
import warningIcon from '../../../glyphicons/glyphicons-basic/glyphicons-basic-79-triangle-empty-alert.svg';
import errorIcon from '../../../glyphicons/glyphicons-basic/glyphicons-basic-193-circle-empty-remove.svg';
import chevronRightIcon from "../../../glyphicons/glyphicons-basic/glyphicons-basic-224-chevron-right.svg";
import playIcon from "../../../glyphicons/glyphicons-basic/glyphicons-basic-175-play.svg";


import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/dialog/dialog.css';
import 'codemirror/addon/hint/show-hint.css';

import "./TextEditor.scss";

import classNames from "classnames";
import { groupBy } from "../../../util/array";
import { callOrIgnore, range } from "../../../util/functional";
import { Issue, TextFileData } from "../../../fileData";


/**
 * A place in the code that the user can select by pressing tab, then replace with their own contents.
 */
type Placeholder = {
    marker: CodeMirror.TextMarker;
    trigger: () => void;
};

/**
 * @param editor expects the cursor to be set in {}, expands the middle into a new line, and places the cursor there
 */
const expandBraces = function (editor: CodeMirror.Editor) {
    editor.execCommand('newlineAndIndent');
    editor.execCommand('newlineAndIndent');
    editor.execCommand('goLineUp');
    editor.execCommand('indentMore');
};

type HintingDatabase = {
    [start: string]: HintingData[];
};

const pseuCoFixedKeywords = [
    'agent',
    'bool',
    'boolchan',
    'break',
    'case',
    'condition',
    'continue',
    'default',
    'do',
    'else',
    'false',
    'for',
    'if',
    'import',
    'int',
    'intchan',
    'join',
    'lock',
    'mainAgent',
    'monitor',
    'println',
    'return',
    'select',
    'signal',
    'signalAll',
    'start',
    'string',
    'stringchan',
    'struct',
    'true',
    'unlock',
    'void',
    'waitForCondition',
    'while',
    'with'
];

const pseuCoHints: HintingDatabase = {
    case: [
        {
            displayText: "case ...: {...}",
            template: 'case : {}',
            hasContinuation: true,
            placeholders: [
                { position: 5, text: "/* case specification */" },
                { position: 8, expand: true, text: "/* statements */" }
            ]
        },
        {
            displayText: "case ... <! ...: {...}",
            template: 'case  <! : {}',
            hasContinuation: true,
            placeholders: [
                { position: 5, text: "/* channel */" },
                { position: 9, text: "/* expression */" },
                { position: 12, expand: true, text: "/* statements */" }
            ]
        },
        {
            displayText: "case ... = <? ...: {...}",
            template: 'case  = <? : {}',
            hasContinuation: true,
            placeholders: [
                { position: 5, text: "/* identifier */" },
                { position: 11, text: "/* channel */" },
                { position: 14, expand: true, text: "/* statements */" }
            ]
        },
        {
            displayText: "case <? ...: {...}",
            template: 'case <? : {}',
            hasContinuation: true,
            placeholders: [
                { position: 8, text: "/* channel */" },
                { position: 11, expand: true, text: "/* statements */" }
            ]
        }
    ],
    condition: [
        {
            displayText: "condition ... with (...);",
            template: 'condition  with ();',
            hasContinuation: true,
            placeholders: [
                { position: 10, text: "/* name */" },
                { position: 17, text: "/* expression */" }
            ]
        }
    ],
    default: [
        {
            displayText: "default: {...}",
            template: 'default: {}',
            placeholders: [
                { position: 10, expand: true, text: "/* statements */" }
            ]
        }
    ],
    do: [
        {
            displayText: "do {...} while (...)",
            template: 'do {} while ();',
            hasContinuation: true,
            placeholders: [
                { position: 4, expand: true, text: "/* statements */" },
                { position: 13, text: "true" }
            ]
        }
    ],
    else: [
        {
            displayText: "else {...}",
            template: 'else {}',
            hasContinuation: true,
            placeholders: [
                { position: 6, expand: true, text: "/* statements */" }
            ]
        },
        {
            displayText: "else if (...) {...}",
            template: 'else if () {}',
            hasContinuation: true,
            placeholders: [
                { position: 9, text: "/* condition */" },
                { position: 12, expand: true, text: "/* statements */" }
            ]
        }
    ],
    for: [
        {
            displayText: "for (..., ..., ...) {...}",
            template: 'for (; ; ) {};',
            hasContinuation: true,
            placeholders: [
                { position: 5, text: "/* initializer */" },
                { position: 7, text: "/* condition */" },
                { position: 9, text: "/* update */" },
                { position: 12, expand: true, text: "/* statements */" }
            ]
        }
    ],
    if: [
        {
            displayText: "if (...) {...}",
            template: 'if () {}',
            hasContinuation: true,
            placeholders: [
                { position: 4, text: "/* condition */" },
                { position: 7, expand: true, text: "/* statements */" }
            ]
        }
    ],
    join: [
        {
            displayText: "join(...)",
            template: 'join();',
            hasContinuation: true,
            placeholders: [
                { position: 5, text: "/* agent */" }
            ]
        }
    ],
    lock: [
        {
            displayText: "lock ...",
            template: 'lock ;',
            hasContinuation: true,
            placeholders: [
                { position: 5, text: "/* identifier */" }
            ]
        },
        {
            displayText: "lock(...)",
            template: 'lock();',
            hasContinuation: true,
            placeholders: [
                { position: 5, text: "/* lock */" }
            ]
        }
    ],
    mainAgent: [
        {
            displayText: "mainAgent {...}",
            template: 'mainAgent {}',
            placeholders: [
                { position: 11, expand: true, text: "/* statements */" }
            ]
        }
    ],
    monitor: [
        {
            displayText: "monitor ... {...}",
            template: 'monitor  {}',
            hasContinuation: true,
            placeholders: [
                { position: 8, text: "/* Identifier */" },
                { position: 10, expand: true, text: "/* declarations */" }
            ]
        }
    ],
    println: [
        {
            displayText: "println(...)",
            template: 'println();',
            hasContinuation: true,
            placeholders: [
                { position: 8, text: "/* expression */" }
            ]
        }
    ],
    return: [
        {
            displayText: "return;",
            template: 'return;'
        },
        {
            displayText: "return ...;",
            template: 'return ;',
            placeholders: [
                { position: 7, text: "/* expression */" }
            ]
        }
    ],
    select: [
        {
            displayText: "select {...}",
            template: 'select {};',
            hasContinuation: true,
            placeholders: [
                { position: 8, expand: true, text: "/* case- and default-clauses */" }
            ]
        }
    ],
    signal: [
        {
            displayText: "signal(...)",
            template: 'signal();',
            hasContinuation: true,
            placeholders: [
                { position: 7, text: "/* condition */" }
            ]
        }
    ],
    signalAll: [
        {
            displayText: "signalAll(...)",
            template: 'signalAll();',
            hasContinuation: true,
            placeholders: [
                { position: 10, text: "/* condition */" }
            ]
        }
    ],
    start: [
        {
            displayText: "start(...)",
            template: 'start();',
            hasContinuation: true,
            placeholders: [
                { position: 6, text: "/* procedure call */" }
            ]
        }
    ],
    struct: [
        {
            displayText: "struct ... {...}",
            template: 'struct  {}',
            hasContinuation: true,
            placeholders: [
                { position: 7, text: "/* Identifier */" },
                { position: 9, expand: true, text: "/* declarations */" }
            ]
        }
    ],
    unlock: [
        {
            displayText: "unlock(...)",
            template: 'unlock();',
            hasContinuation: true,
            placeholders: [
                { position: 7, text: "/* lock */" }
            ]
        }
    ],
    waitForCondition: [
        {
            displayText: "waitForCondition(...)",
            template: 'waitForCondition();',
            hasContinuation: true,
            placeholders: [
                { position: 17, text: "/* condition */" }
            ]
        }
    ],
    while: [
        {
            displayText: "while (...) {...}",
            template: 'while () {};',
            hasContinuation: true,
            placeholders: [
                { position: 7, text: "true" },
                { position: 10, expand: true, text: "/* statements */" }
            ]
        }
    ]
};

/**
 * maps file types to CodeMirror modes
 */
const modes: { [fileType: string]: string } = {
    pseuco: 'pseuco'
};

CodeMirror.defineMode("pseuco", function (options) {
    // this is a simple parser for pseuCo syntax highlighting

    const isLetter = function (char: string | null) { return char && /[$A-Z_a-z\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff\u0100-\u1fff\u3040-\u318f\u3300-\u337f\u3400-\u3d2d\u4e00-\u9fff\uf900-\ufaff]/.test(char); };
    const isDigit = function (char: string | null) { return char && /[0-9\u0660-\u0669\u06f0-\u06f9\u0966-\u096f\u09e6-\u09ef\u0a66-\u0a6f\u0ae6-\u0aef\u0b66-\u0b6f\u0be7-\u0bef\u0c66-\u0c6f\u0ce6-\u0cef\u0d66-\u0d6f\u0e50-\u0e59\u0ed0-\u0ed9\u1040-\u1049]/.test(char); };

    const isKeyword = function (word: string) {
        if (pseuCoFixedKeywords.includes(word)) return true;
        if (/(int|bool|string)chan(0|[1-9][0-9]*)/.test(word)) return true;
        return false;
    };

    return {
        startState: function () {
            return {
                isInMultiLineComment: false,
                currentIndentation: 0,
                identifiers: {}
            };
        },
        copyState: function (state) {
            return JSON.parse(JSON.stringify(state));
        },
        token: function (stream, state) {
            if (state.isInMultiLineComment) {
                while (stream.skipTo('*')) {
                    stream.next(); // eat *
                    if (stream.next() == '/') {
                        state.isInMultiLineComment = false;
                        return 'comment';
                    }
                }

                stream.skipToEnd();
                return 'comment';
            } else { // regular parsing
                if (stream.match(/\/\//)) {
                    stream.skipToEnd();
                    return 'comment';
                } else if (stream.match(/\/\*/)) {
                    state.isInMultiLineComment = true;
                    return 'comment';
                } else if (isLetter(stream.peek())) {
                    let word = stream.next();
                    if (!word) throw new Error("Internal inconsistency during pseuCo quick identifier / keyword parsing.");

                    let next = stream.peek();
                    while (next && (isLetter(next) || isDigit(next))) {
                        word += next;
                        stream.next();
                        next = stream.peek();
                    }
                    if (isKeyword(word)) return 'keyword';

                    state.identifiers[word] = (state.identifiers[word] || 0) + 1; // count this as an identifier

                    return 'identifier';
                } else if (stream.match(/"/)) {
                    while (true) {
                        const stringCharacter = stream.next();
                        if (!stringCharacter) {
                            break; // broken string
                        } else if (stringCharacter === '"') {
                            break;
                        } else if (stringCharacter === '\\') {
                            stream.next(); // escaped character
                        } else {
                            // ignore - part of the string
                        }
                    }

                    return 'string';
                } else if (stream.match(/\(|\[|\{/)) {
                    state.currentIndentation++;
                    return null;
                } else if (stream.match(/\)|\]|\}/)) {
                    state.currentIndentation--;
                    return null;
                } else {
                    stream.next();
                    return null;
                }
            }
        },
        indent: function (state, textAfter) {
            return (options.indentUnit ?? 4) * (state.currentIndentation - (/^\}/.test(textAfter) ? 1 : 0));
        },
        lineComment: '//',
        blockCommentStart: '/*',
        blockCommentEnd: '*/',
        electricChars: '([{}])'
    };
});

/**
 * Internal representation of a hypothetical placeholder, i.e. a part of a [[HintingData]] that will turn into a [[Placeholder]].
 */
type PlaceholderData = {
    position: number;
    expand?: true;
    text: string;
};

/**
 * Internal representation of a hint, i.e. a snippet that the editor can insert.
 * Not related to [[CodeMirror.Hint]].
 */
type HintingData = {
    displayText: string;
    template: string;
    hasContinuation?: true;
    placeholders?: PlaceholderData[];
};

export type DebugMarker = {
    agent: number;
    line: number;
    isTop: boolean;
};

/**
 * This component is an editor for text-based files.
 * It is based on [CodeMirror](https://codemirror.net/) which provides the lower-level editor functionality, but adds several features on top:
 * 
 *  - syntax highlighting and auto-indentation for pseuCo
 *  - snippets (“hints”) for pseuCo, including
 *      - support for _placeholders_ in snippets, i.e. areas of the code that can be selected by <kbd>Tab</kbd>
 *      - support for _continuations_, locations in the code that can be selected by <kbd>Tab</kbd> and are indicated by a small pencil icon
 *  - identifier hints for pseuCo, and word hints for all other languages
 *  - visualization of parser errors and warnings in the gutter and inline
 *  - a status bar with a summary of warnings and errors
 *  - a pop-out list of all warnings and errors
 *  - externally-controlled line highlighting
 *  - breakpoint management UI
 *  - optional callback that is called once the user has stopped typing
 * 
 * This is a controlled component, requiring its user to implement state management for the editor contents.
 */
const TextEditor: React.FC<{
    data: TextFileData;
    onDataChange?: (newCoreData: string | null) => void;
    onDataSettled?: (coreData: string | null) => void;
    readOnly?: boolean;
    type: string;
    options?: {
        gutters?: string[];
        theme?: "light" | "dark";

        /**
         * Completely disables the status bar, preventing access to the list of issues.
         */
        noStatusBar?: boolean;

        /**
         * Normally, TextEditor tries to fully utilize its height.
         * With this set, it will try to take the natural size for its content (which means the height can dynamically change through edits or by toggling the status bar).
         */
        naturalHeight?: boolean;

        /**
         * Disables the active line background color
         */
        noActiveLineBackground?: boolean;
    };
    debugMarkers?: DebugMarker[];
    breakpoints?: number[];
    onToggleBreakpoint?: (line: number) => void;
}> = (props) => {
    const [showErrors, setShowErrors] = useState<boolean>(false);

    let [placeholders, setPlaceholders] = useState<Placeholder[]>([]);

    const insertPlaceholder = function (editor: CodeMirror.Editor, text: string) { // inserts a placeholder that the user can select by Tab
        editor.replaceSelection(text, 'around');
        const selection = editor.listSelections()[0];

        const marker = editor.markText(selection.anchor, selection.head, {
            className: 'snippet-placeholder',
            clearOnEnter: true,
            inclusiveLeft: true
        });
        const remove = function () {
            const position = marker.find();
            if (position) editor.setSelection(position.from, position.to);
            setPlaceholders(placeholders.filter(({ marker: m }) => m !== marker));
            marker.clear();
        };
        marker.on('clear', remove);

        placeholders.push({ marker, trigger: remove });
    };

    const insertContinuation = function (editor: CodeMirror.Editor) {
        const widget = document.createElement('img');
        widget.className = 'code-mirror-continuation';
        widget.src = pencilIcon;

        const selection = editor.listSelections()[0];

        const marker = editor.setBookmark(selection.anchor, {
            widget: widget,
            handleMouseEvents: true
        });
        const remove = function () {
            const position = marker.find();
            if (position) editor.setSelection(position);
            setPlaceholders(placeholders.filter(({ marker: m }) => m !== marker));
            marker.clear();
        };
        marker.on('clear', remove);

        placeholders.push({ marker, trigger: remove });
    };

    const hasPlaceholder = function () {
        // clean up the list
        setPlaceholders(placeholders = placeholders.filter(({ marker }) => marker.find())); // assignment to ensure potential future setPlaceholder calls are based on the updated value

        return placeholders.length > 0;
    };

    const positionIsGreater = function (pos1: Position, pos2: Position) {
        if (pos1.line === pos2.line) {
            return pos2.ch > pos1.ch;
        } else {
            return pos2.line > pos1.line;
        }
    };

    const getPlaceholderFirstPosition = function (placeholder: Placeholder): CodeMirror.Position {
        const findResult = placeholder.marker.find();
        if (!findResult) throw new Error("Internal inconsistency: Placeholder could not be located.");

        if (findResult instanceof CodeMirror.Pos) return findResult;
        return findResult.from;
    };

    const jumpToNextPlaceholder = function (editor: CodeMirror.Editor) {
        // try to find the next placeholder from the cursor, if not found: first one
        let [bestPlaceholder, ...remainingPlaceholders] = placeholders;
        let bestPlaceholderPosition = getPlaceholderFirstPosition(bestPlaceholder);

        const currentPosition = editor.getCursor();

        remainingPlaceholders.forEach((placeholder) => {
            const placeholderPosition = getPlaceholderFirstPosition(placeholder);

            if (positionIsGreater(placeholderPosition, currentPosition)) {
                // // placeholder is before the cursor
                if (positionIsGreater(currentPosition, bestPlaceholderPosition)) {
                    // candidate is before the cursor, but we already found one behind - ignore
                    return;
                } else {
                    if (positionIsGreater(currentPosition, bestPlaceholderPosition)) {
                        // found no placeholder behind the cursor so far, and this one is closer to the start
                        bestPlaceholder = placeholder;
                        bestPlaceholderPosition = placeholderPosition;
                    }
                }
            } else {
                // placeholder is behind the cursor
                if (positionIsGreater(currentPosition, bestPlaceholderPosition)) {
                    // we already know a placeholder behind the cursor
                    if (positionIsGreater(placeholderPosition, bestPlaceholderPosition)) {
                        // ... but this one is better
                        bestPlaceholder = placeholder;
                        bestPlaceholderPosition = placeholderPosition;
                    }
                } else {
                    // we found the first placeholder behind the cursor
                    bestPlaceholder = placeholder;
                    bestPlaceholderPosition = placeholderPosition;
                }
            }
        });

        bestPlaceholder.trigger();
    };

    /**
     * converts our own special "hint data"-objects to a real CodeMirror hint object
     */
    const generateHint = function (editor: CodeMirror.Editor, hintingData: HintingData): CodeMirror.Hint {
        return {
            text: hintingData.displayText,
            hint: function (editor, data) {
                const placeholderActions = (hintingData.placeholders ?? []).sort((a, b) => a.position - b.position).reduceRight<{ first: boolean; placeholderData: PlaceholderData }[]>((memo, placeholderData, index) => {
                    memo.push({ first: index === 0, placeholderData: placeholderData });
                    return memo;
                }, []);

                editor.operation(function () {
                    editor.setSelection(data.from, data.to);
                    editor.replaceSelection(hintingData.template);

                    if (hintingData.hasContinuation && placeholderActions.length > 0) {
                        editor.setCursor(data.from.line, data.from.ch + hintingData.template.length);
                        insertContinuation(editor);
                    }

                    placeholderActions.forEach((placeholderAction) => {
                        editor.setCursor(data.from.line, data.from.ch + placeholderAction.placeholderData.position);
                        if (placeholderAction.placeholderData.expand) expandBraces(editor);

                        if (placeholderAction.first) {
                            editor.replaceSelection(placeholderAction.placeholderData.text, 'around');
                        } else {
                            insertPlaceholder(editor, placeholderAction.placeholderData.text);
                        }
                    });
                });
            }
        };
    };

    const hintingFunctions: { [language: string]: HintFunction } = {
        pseuco: function (editor) {
            const specialHintObjects: HintingDatabase = pseuCoHints;

            const word = /[\w$]+/;

            const cur = editor.getCursor();
            const curLine = editor.getLine(cur.line);

            const end = cur.ch;
            let start = end;

            while (start && word.test(curLine.charAt(start - 1))) --start;
            const curWord = start != end && curLine.slice(start, end); // the word we want to complete

            if (!curWord) return { // found nothing to complete
                list: [],
                from: CodeMirror.Pos(cur.line, start),
                to: CodeMirror.Pos(cur.line, end)
            };

            let list: (string | Hint)[] = [];
            const seen: { [text: string]: true } = {};

            const addCompletionSuggestion = function (suggestion: string | Hint) {
                let suggestionText;
                if (typeof (suggestion) === 'string') {
                    suggestionText = suggestion;
                } else {
                    suggestionText = suggestion.text;
                }

                if (!seen[suggestionText]) {
                    seen[suggestionText] = true;
                    list.push(suggestion);
                }
            };

            const identifierCounts = editor.getStateAfter(undefined).identifiers;
            const identifiers = Object.keys(identifierCounts);

            let addedSelf = false;

            if (identifierCounts[curWord] > 1) {
                addCompletionSuggestion(curWord);
                addedSelf = true;
            }

            pseuCoFixedKeywords.forEach((keyword) => {
                if (keyword.lastIndexOf(curWord, 0) === 0 && (keyword !== curWord || specialHintObjects[keyword])) {
                    if (specialHintObjects[keyword]) {
                        specialHintObjects[keyword].forEach(function (specialHintObject) {
                            addCompletionSuggestion(generateHint(editor, specialHintObject));
                        });
                    } else {
                        addCompletionSuggestion(keyword);
                    }
                }
            });

            identifiers.forEach(function (identifier) {
                if (identifier.lastIndexOf(curWord, 0) === 0 && identifier !== curWord) {
                    addCompletionSuggestion(identifier);
                }
            });

            if (addedSelf && list.length === 1) list = []; // only one suggestion added, it is the currently typed identifier itself

            return {
                list: list,
                from: CodeMirror.Pos(cur.line, start),
                to: CodeMirror.Pos(cur.line, end)
            };
        }
    };

    const worstIssueType: false | "warning" | "error" = props.data.extended.issues?.length ? (props.data.extended.issues.some((issue) => issue.type === 'error') ? 'error' : 'warning') : false;

    const issueToScope = (issue: Issue): string => issue.scope;

    const options = {
        gutters: props.options?.gutters ?? ['syntax'],
        theme: props.options?.theme ?? 'light'
    };

    const getErrorSummary = () => {
        if (!props.data.extended.issues || !props.data.extended.issues.length) return "No issues.";

        if (showErrors) return props.data.extended.issues.length > 1 ? props.data.extended.issues.length + " issues" : "1 issue";

        const errors = (props.data.extended.issues ?? []).filter((issue) => issue.type === 'error');
        const worstError = errors.length ? errors[0] : props.data.extended.issues[0];
        return worstError.text + (props.data.extended.issues.length > 1 ? ` (+ ${props.data.extended.issues.length - 1} more problem${props.data.extended.issues.length === 2 ? "" : "s"})` : "");
    };

    const codeMirrorRef = useRef<HTMLDivElement>(null);

    const [editor, setEditor] = useState<CodeMirror.Editor | null>(null);

    // ↓ we check the editor manually (and do not want to fight with all the callbacks)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (!editor) {
            if (!codeMirrorRef.current) throw new Error("Failed to resolve CodeMirror ref.");
            const editor = CodeMirror(codeMirrorRef.current, {
                mode: modes[props.type],
                lineWrapping: true,
                lineNumbers: true,
                gutters: options.gutters.map((gutter) => `code-mirror-${gutter}-gutter`),
                specialChars: /[\s\t\u0000-\u0019\u00ad\u200b-\u200f\u2028\u2029\ufeff]/g, /*eslint no-control-regex: "off"*/
                matchBrackets: true,
                autoCloseBrackets: "()[]{}''",
                styleActiveLine: true,
                indentUnit: 4,
                tabSize: 4,
                indentWithTabs: false,
                extraKeys: {
                    'Tab': function (cm) {
                        if (hasPlaceholder()) {
                            jumpToNextPlaceholder(cm);
                            return;
                        }

                        const doc = cm.getDoc();

                        if (doc.somethingSelected()) {
                            return CodeMirror.Pass;
                        }

                        const spacesPerTab = cm.getOption('indentUnit') ?? 4;
                        const spacesToInsert = spacesPerTab - (doc.getCursor('start').ch % spacesPerTab);
                        const spaces = (new Array(spacesToInsert + 1)).join(" ");
                        cm.replaceSelection(spaces);
                    },
                    'Ctrl-Space': function () {
                        for (let i = 0; i <= editor.lastLine(); i++) {
                            editor.indentLine(i);
                        }
                    }
                }
            });

            editor.on('keyup', function (s, e) {
                if (e.keyCode >= 65 && e.keyCode <= 90) { // A-Z
                    editor.showHint({
                        completeSingle: false,
                        hint: function (editor: CodeMirror.Editor) {
                            if (hintingFunctions[props.type]) return hintingFunctions[props.type](editor, {});
                            return CodeMirror.hint.anyword(editor, {});
                        }
                    });
                }
            });

            const defaultSpecialCharPlaceholder = editor.getOption('specialCharPlaceholder');
            if (!defaultSpecialCharPlaceholder) throw new Error("Failed to find default special char placeholder function.");
            editor.setOption('specialCharPlaceholder', function (ch) {
                if ((/[\s]/g).test(ch)) {
                    const e = document.createElement('span');
                    e.className = 'code-mirror-space-highlight';
                    e.appendChild(document.createTextNode('·'));
                    return e;
                } else {
                    return defaultSpecialCharPlaceholder(ch);
                }
            });

            editor.setSize('100%', '100%');

            setEditor(editor);
        }
    });

    const [changeSettledTimeout, setChangeSettledTimeout] = useState<null | number>(null);

    const editorOnChange = useCallback((editor: CodeMirror.Editor) => {
        props.onDataChange?.(editor.getValue());
        if (changeSettledTimeout !== null) clearTimeout(changeSettledTimeout);
        setChangeSettledTimeout(window.setTimeout(() => {
            props.onDataSettled?.(editor.getValue());
        }, 500));
    }, [changeSettledTimeout, props]);

    useEffect(() => {
        if (editor) {
            editor.on("change", editorOnChange);
        }
        return () => {
            if (editor) {
                editor.off("change", editorOnChange);
            }
        };
    }, [editor, editorOnChange]);

    useEffect(() => {
        if (editor) {
            const dataFromProps = props.data.core ?? "";
            if (editor.getValue() !== dataFromProps) {
                editor.setValue(dataFromProps);
                editor.clearHistory();
            }
        }
    }, [editor, props.data.core]);

    useEffect(() => {
        if (editor) {
            editor.setOption("readOnly", props.readOnly);
        }
    }, [editor, props.readOnly]);

    useEffect(() => {
        if (editor) {
            editor.setOption("theme", options.theme === 'dark' ? 'monokai' : 'pseuco-light');
        }
    }, [editor, options.theme]);

    useEffect(() => {
        if (editor) editor.refresh(); // give CodeMirror a chance to re-consider its need for a scrollbar
    }, [editor, showErrors]);

    const [inlineIssueMarkers] = useState<TextMarker[]>([]);

    useEffect(() => {
        if (editor) {
            const issues = props.data.extended.issues ?? [];
            const lineSpecificIssues = issues.filter((issue) => issue.scope === "line");

            const issueGroups = groupBy(lineSpecificIssues, (issue) => issue.type);

            // remove existing markers
            inlineIssueMarkers.forEach((inlineIssueMarker) => {
                inlineIssueMarker.clear();
            });

            // We now clear inlineIssueMarkers, improperly, by simply mutating it.
            // This prevents React from doing another render cycle. In this case, this is intentional:
            // inlineIssueMarkers is completely rebuilt in this effect, and that should only happen once our data source, the issues array, has changed.
            inlineIssueMarkers.length = 0;

            editor.clearGutter('code-mirror-syntax-gutter');

            lineSpecificIssues.forEach((issue) => {
                if (issue.scope !== "line") throw new Error("Internal inconsistency: Unexpected non-line issue scope.");

                const widget = document.createElement('span');
                widget.className = 'code-mirror-syntax-inline-marker-' + issue.type;

                inlineIssueMarkers.push(editor.setBookmark({
                    line: issue.row,
                    ch: issue.column
                }, {
                    widget: widget,
                    handleMouseEvents: true,
                    insertLeft: true
                }));
            });

            ['warning', 'error'].forEach((issueType) => {
                issueGroups[issueType]?.forEach((issue) => { // the "?" ensures this does not crash when there is no issue of that type
                    if (issue.scope !== "line") throw new Error("Internal inconsistency: Unexpected non-line issue scope.");
                    const marker = document.createElement('div');
                    marker.className = 'code-mirror-syntax-marker-' + issueType;

                    editor.setGutterMarker(issue.row, 'code-mirror-syntax-gutter', marker);
                });
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor, props.data.extended.issues]);

    const [highlightedLine, setHighlightedLine] = useState<number | undefined>();
    useEffect(() => {
        if (editor && props.data.extended.highlightedLine !== highlightedLine) {
            if (highlightedLine !== undefined) editor.removeLineClass(highlightedLine - 1, 'background', 'line-highlight');
            setHighlightedLine(props.data.extended.highlightedLine);
            if (props.data.extended.highlightedLine !== undefined) editor.addLineClass(props.data.extended.highlightedLine - 1, 'background', 'line-highlight');
        }
    }, [editor, props.data.extended.highlightedLine, highlightedLine]);

    useEffect(() => {
        if (editor) {
            editor.clearGutter('code-mirror-debugger-gutter');
            const debugMarkers = props.debugMarkers ?? [];
            const linesWithDebugMarkers = new Set(debugMarkers.map((m) => m.line));
            linesWithDebugMarkers.forEach((line) => {
                const markers = debugMarkers.filter((m) => m.line === line);
                const agentsHTML = markers.map((marker) => `<span>${marker.agent}</span><img class="icon" src="${marker.isTop ? playIcon : chevronRightIcon}" />`).join(`<span class="code-mirror-debugger-agent-separator"></span>`);
                const marker = document.createElement('div');
                marker.className = 'code-mirror-debugger-agent';
                marker.innerHTML = agentsHTML;
                editor.setGutterMarker(line - 1, 'code-mirror-debugger-gutter', marker);
            });
        }
    }, [editor, props.debugMarkers]);

    useEffect(() => {
        if (editor) {
            editor.clearGutter('code-mirror-breakpoints-gutter');
            range(0, editor.lineCount()).forEach((l) => {
                const line = l + 1;
                const breakpointSpan = document.createElement('span');
                breakpointSpan.onclick = () => callOrIgnore(props.onToggleBreakpoint, line);
                breakpointSpan.innerText = "⬤";
                const marker = document.createElement('div');
                marker.className = 'code-mirror-breakpoint' + (props.breakpoints?.includes(line) ? ' breakpoint-set' : '');
                marker.appendChild(breakpointSpan);
                editor.setGutterMarker(line - 1, 'code-mirror-breakpoints-gutter', marker);
            });
        }
    }, [editor, props.breakpoints, props.breakpoints?.length, props.onToggleBreakpoint]); // TODO-post-Angular: since breakpoints is mutated because Angular.js does not like us swapping out the array, we also have the length as a dependency to ensure an update happens on every change

    return <div className={classNames({ "text-editor-container": true, "no-status-bar": props.options?.noStatusBar, "natural-height": props.options?.naturalHeight, "no-active-line-background": props.options?.noActiveLineBackground })} onKeyDown={ (e) => e.stopPropagation() }>
        <div className={classNames({ "code-mirror-container": true })}>
            <div className="code-mirror-text-editor" ref={codeMirrorRef}></div>
        </div>
        {showErrors ? <div className="code-mirror-errors">
            <table className="table table-striped table-condensed">
                <tbody>
                    <tr>
                        <th className="error-table-fixed-column" scope="col">Scope</th>
                        <th className="error-table-fixed-column" scope="col">Kind</th>
                        <th scope="col">Message</th>
                    </tr>
                    {props.data.extended.issues?.map((issue, i) => <tr key={i}>
                        <td>{issueToScope(issue)}</td>
                        <td>{issue.type}</td>
                        <td>{issue.text}</td>
                    </tr>)}
                </tbody>
            </table>
        </div> : null}
        <div className="code-mirror-status-bar" onClick={() => {
            if (props.data.extended.issues || showErrors) {
                setShowErrors(!showErrors);
            }
        }}>
            { props.data.extended.issues || showErrors ? <span><img className="code-mirror-status-bar-icon" src={showErrors ? collapseDownIcon : collapseUpIcon} alt="toggle visibility of error list" /></span> : null }
            { props.data.extended.issues ? <span className="code-mirror-issues">
                {!worstIssueType ? <img className="issue-status-icon" src={okIcon} alt="no issues" /> : worstIssueType === "warning" ? <img className="issue-status-icon" src={warningIcon} alt="warning" /> : worstIssueType === "error" ? <img className="issue-status-icon" src={errorIcon} alt="error" /> : null}
                <span>{getErrorSummary()}</span>
            </span> : null }
        </div>
    </div>;
};

export default TextEditor;
