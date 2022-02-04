/// <reference path="../ccs-interpreter.d.ts" />
/// <reference path="../pseuco-lang.d.ts" />
/// <reference path="../ccs-compiler.d.ts" />

/**
 * This package provides support to running the pseuCo or CCS parsers on [[File]] objects.
 * It wraps the respective parsers, and converts warnings and errors from them to [[Issue]]s.
 * 
 * @packageDocumentation
 */

import CCS from '@pseuco/ccs-interpreter';
import PseuCo, { Decl, PrimitiveStmt } from '@pseuco/lang';
import CCSCompiler from '@pseuco/ccs-compiler';

import { Issue, TextFileData } from "../fileData";

/**
 * Converts an error or warning from the pseuCo or CCS toolchain into a proper [[Issue]].
 * @param e The error or warning.
 * @param isWarning Whether the problem is just a warning.
 */
// ↓ issues thrown by the pseuCo and CCS toolchains are too wild to be typed :-(
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export const exceptionToIssue = function (e: any, isWarning: boolean): Issue {
    const type = isWarning ? 'warning' : 'error';
    if (e && (e.location || (e.line && e.column)) && e.message && e.name) {
        // it looks like a parser error (location) or a warning from PseuCoCo (line + column)
        const row = e.location ? e.location.start.line - 1 : e.line - 1;
        const column = e.location ? e.location.start.column - 1 : e.column - 1;

        return {
            row: row,
            column: column,
            type: type,
            text: e.name + ": " + e.message + " (in column " + (column + 1) + ")",
            scope: "line"
        };
    } else if (e && !e.location && !e.line && !e.column && e.wholeFile && e.message && e.name) {
        return {
            type: type,
            text: e.name + ": " + e.message,
            scope: "file"
        };
    } else {
        console.log(e);
        return {
            type: 'error',
            text: "An unknown error occurred while processing your code: " + e.name + ": " + e.message,
            scope: "file"
        };
    }
};

const parseFrontMatter = (inputString: string): {
    frontMatter?: Record<string, unknown>;
    remainingInput: string;
} => {
    // search for front matter
    if (inputString.startsWith('---')) {
        const frontMatterEndIndex = inputString.indexOf('---', 3);
        const frontMatterString = inputString.substring(3, frontMatterEndIndex);
        const remainingInput = inputString.slice(frontMatterEndIndex + 3);
        try {
            return {
                frontMatter: JSON.parse(frontMatterString),
                remainingInput
            };
        } catch (e) {
            throw {
                wholeFile: true,
                name: "FrontMatterParseError",
                message: "Failed to parse the front matter as JSON."
            };
        }
    }
    return {
        remainingInput: inputString
    };
};

export const parsePseuCoFile = (file: TextFileData): {
    issues: Issue[],
    ast: PseuCo.Program | null,
    frontMatter?: Record<string, unknown>
} => {
    let issues = [];
    if (file.core) {
        try {
            const { frontMatter, remainingInput } = parseFrontMatter(file.core);
    
            const parseResult = PseuCo.parser.parse(remainingInput);
    
            issues = parseResult.warnings ? parseResult.warnings.map((warning) => exceptionToIssue(warning, true)) : [];

            return { issues, ast: parseResult, frontMatter };
        } catch (e) {
            return { issues: [exceptionToIssue(e, false)], ast: null };
        }
    } else {
        throw new Error("Trying to parse a file with no data.");
    }
};

export const parseCCSFile = (file: TextFileData): {
    issues: Issue[],
    ast: unknown | null,
    frontMatter?: Record<string, unknown>
} => {
    let issues = [];
    if (file.core) {
        try {
            const { frontMatter, remainingInput } = parseFrontMatter(file.core);
    
            const parseResult = CCS.parser.parse(remainingInput);
    
            issues = parseResult.warnings ? parseResult.warnings.map((warning) => exceptionToIssue(warning, true)) : [];
            return { issues, ast: parseResult.system, frontMatter };
        } catch (e) {
            return { issues: [exceptionToIssue(e, false)], ast: null };
        }
    } else {
        throw new Error("Trying to parse a file with no data.");
    }
};

export const parseFile = (type: "ccs" | "pseuco", file: TextFileData): {
    issues: Issue[],
    ast: unknown | null,
    frontMatter?: Record<string, unknown>
} => {
    switch (type) {
        case "ccs": return parseCCSFile(file);
        case "pseuco": return parsePseuCoFile(file);
        default:
            throw new Error(`No parser available for file type ${type}.`);
    }
};

/**
 * 
 * @param ast Runs type-checking on a PseuCo AST, and converts any errors to proper issue objects.
 */
export const typeCheckPseuCoFile = (ast: PseuCo.Program): { 
    env: CCSCompiler.ProgramController,
    issues: Issue[]
} => {
    const env = new CCSCompiler.ProgramController(ast);
    try {
        ast.getType(env);
        return { env, issues: [] };
    } catch (e: any) {
        if (e && e.errorlist) {
            return { env, issues: e.data.map((error: unknown) => exceptionToIssue(error, false)) };
        } else {
            return { env, issues: [exceptionToIssue(e, false)] };
        }
    }
};

/**
 * Provides the CCSCompiler used by parseSupport, as using any other CCSCompiler causes internal issues.
 */
export const getCCSCompiler = (): unknown => CCSCompiler;

/**
 * Checks a pseuCo AST for usage of banned pseuCo-MP and pseuCo-SM features, and returns an array of errors containing all violations.
 * This check internally requests some types, so running it on a mistyped program can crash.
 * This check should be safe (i.e. reliably ban every illegal use of MP or SM).
 * 
 * @param ast The tree to check.
 * @param allowedDialects Which pseuCo dialects should be allowed.
 */
export const validatePseuCoDialect = (ast: PseuCo.Program, allowedDialects: { mp: boolean, sm: boolean }): Issue[] => {
    if (Object.values(allowedDialects).every((allowed) => allowed)) return []; // nothing banned, short-circuit checking

    type Location = {
        global: boolean;
        inStruct: boolean;
    }

    const nodeToError = (node: PseuCo.Node, text: string): Issue => ({
        type: "error",
        scope: "line",
        text,
        row: node.line - 1,
        column: node.column - 1
    });

    const heapUsingProcedures: string[] = [];
    const procedureStarts: PseuCo.ProcedureCall[] = [];

    const processNode = (location: Location) => (node: PseuCo.Node): Issue[] => {
        if (node instanceof Decl) {
            const type = node.getTypeNode();
            if (type instanceof PseuCo.ChannelTypeNode) {
                if (!allowedDialects.mp) return [nodeToError(node, `pseuCo-MP is disabled: Declaration of ${type.toString()} is forbidden.`)];
            } else {
                if (!allowedDialects.sm && location.global) return [nodeToError(node, `pseuCo-SM is disabled: Global declaration of ${type.toString()} is forbidden.`)];
                if (type instanceof PseuCo.SimpleTypeNode) {
                    switch (type.type) {
                        case (PseuCo.SimpleTypeNode.LOCK): {
                            if (!allowedDialects.sm) return [nodeToError(node, `pseuCo-SM is disabled: Lock declarations are forbidden.`)];
                        }
                    }
                }
            }
        } else if (node instanceof PrimitiveStmt) {
            switch (node.kind) {
                case PrimitiveStmt.JOIN: {
                    if (!allowedDialects.sm) return [nodeToError(node, `pseuCo-SM is disabled: Join() is forbidden.`)];
                    break;
                }
            }
        } else if (node instanceof PseuCo.Monitor) {
            if (!allowedDialects.sm) return [nodeToError(node, `pseuCo-SM is disabled: Monitor declarations are forbidden.`)];
        } else if (node instanceof PseuCo.StartExpression) {
            const child = node.children[0];
            if (child instanceof PseuCo.ProcedureCall) {
                procedureStarts.push(child);
                if (location.inStruct && !allowedDialects.sm) return [nodeToError(node, `pseuCo-SM is disabled: Starting agents from a struct is forbidden.`)];
            } else if (child instanceof PseuCo.ClassCall) {
                if (!allowedDialects.sm) return [nodeToError(node, `pseuCo-SM is disabled: Class calls are forbidden.`)];
            }
        } else if (node instanceof PseuCo.ProcedureDecl) {
            const name = node.name;
            const argumentCount = node.getArgumentCount();

            const args = [];
            for (let i = 0; i < argumentCount; i++) {
                args.push(node.getArgumentAtIndex(i));
            }

            let hasHeapUsingArgument = false;

            const argTypes = args.map((n) => n.children[0]);
            for (const type of argTypes) {
                if (type instanceof PseuCo.ChannelTypeNode) {
                    if (!allowedDialects.mp) return [nodeToError(node, `pseuCo-MP is disabled: ${type.toString()} arguments are forbidden.`)];
                } else if (type instanceof PseuCo.ClassTypeNode || type instanceof PseuCo.ArrayTypeNode) {
                    hasHeapUsingArgument = true;
                } else {
                    if (type instanceof PseuCo.SimpleTypeNode) {
                        switch (type.type) {
                            case (PseuCo.SimpleTypeNode.LOCK): {
                                if (!allowedDialects.sm) return [nodeToError(node, `pseuCo-SM is disabled: Lock arguments are forbidden.`)];
                                break;
                            }
                            case (PseuCo.SimpleTypeNode.AGENT): {
                                hasHeapUsingArgument = true;
                                break;
                            }
                        }
                    }
                }
            }

            if (hasHeapUsingArgument) heapUsingProcedures.push(name);
        } else if (node instanceof PseuCo.AssignExpression) {
            const assignDestination = node.children[0];
            const type = assignDestination.getType();
            if (type instanceof PseuCo.ChannelType) {
                if (!allowedDialects.sm) return [nodeToError(node, `pseuCo-SM is disabled: Assignments to channel variables are forbidden.`)];
            }
        }
        const isScopeSpanningNode = node instanceof PseuCo.Struct || node instanceof PseuCo.Monitor || node instanceof PseuCo.ProcedureDecl || node instanceof PseuCo.StmtBlock;
        const isStruct = node instanceof PseuCo.Struct;
        return node.children.flatMap(processNode({ global: location.global && !isScopeSpanningNode, inStruct: location.inStruct || isStruct }));
    };

    const issues = processNode({ global: true, inStruct: false })(ast);

    if (!allowedDialects.sm) {
        procedureStarts.forEach((procedureStart) => {
            if (heapUsingProcedures.includes(procedureStart.procedureName)) {
                issues.push(nodeToError(procedureStart, `pseuCo-SM is disabled: Procedure starts with arguments that may involve the heap are forbidden.`));
            }
        });
    }

    return issues;
};

/**
 * One-stop pseuCo parser and checker: Parse a file, run type-checking and ban dialects, if necessary.
 */
export const parseAndCheckPseuCoFile = (file: TextFileData, allowedDialects: { mp: boolean, sm: boolean }): {
    issues: Issue[],
    ast: PseuCo.Program | null,
    frontMatter?: Record<string, unknown>,
    env: CCSCompiler.ProgramController | null
} => {
    let { issues, ast, frontMatter } = parsePseuCoFile(file);
    if (ast) {
        const { issues: typeIssues, env } = typeCheckPseuCoFile(ast);
        const dialectViolationIssues = typeIssues.length <= 0 ? validatePseuCoDialect(ast, allowedDialects) : []; // do not run dialect checks if they are type errors
        issues = [...issues, ...dialectViolationIssues, ...typeIssues];
        return {
            issues,
            ast,
            env,
            frontMatter
        };
    } else {
        return {
            issues,
            ast: null,
            env: null,
            frontMatter
        };
    }
};
