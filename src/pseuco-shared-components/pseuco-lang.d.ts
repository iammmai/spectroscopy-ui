declare module '@pseuco/lang' {
    class Type {} // PCTType, from type checker
    class ClassType extends Type {
        identifier: string;
    } /// PCTClassType
    
    class ChannelType extends Type {
        capacity: number;
        channeledType: Type;
    }

    class Node {
        line: number;
        column: number;
        children: Node[];
        parent: Node | null;
        getType(env?: EnvironmentController): Type; // there are very peculiar rules about the argument, but no type system in the world can express them
    }

    class Program extends Node {}

    class BaseTypeNode extends Node {}
    class SimpleTypeNode extends BaseTypeNode {
        type: SimpleTypeNumber;

        static VOID: 0;
        static BOOL: 1;
        static INT: 2;
        static STRING: 3;
        static LOCK: 4;
        static MUTEX: 5;
        static AGENT: 6;
    }

    type SimpleTypeNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6;

    class ClassTypeNode extends BaseTypeNode {
        className: string;
    }
    class ArrayTypeNode extends Node {
        children: [BaseTypeNode | ArrayTypeNode | ChannelTypeNode];
        size: number;
    }
    class ChannelTypeNode extends Node {
        capacity: number;
    }

    class Statement extends Node {}
    class VariableDeclarator extends Node {
        name: string;
        getInitializer: () => VariableInitializer | null;
    }
    class Decl extends Node {
        getDeclarators(): VariableDeclarator[];
        getTypeNode(): Node;
    }
    class ProcedureDecl extends Node {
        name: string;
        getResultType(): Type;
        getBody(): StmtBlock;
        getArgumentCount(): number;
        getArgumentAtIndex(index: number): FormalParameter;
    }
    class FormalParameter extends Node {
        identifier: string;
    }
    class VariableInitializer extends Node {
        children: [Expression] | VariableInitializer[] // one value or brace-delimited initializer list
        isArray: () => boolean;
    }
    class Struct extends Node {
        name: string;
    }
    class Monitor extends Node {
        name: string;
    }
    class ConditionDecl extends Node {
        name: string;
    }
    class StmtBlock extends Node {}
    class MainAgent extends Node {}
    class StmtExpression extends Node {}
    class PrintStmt extends Node {
        _toString: (indent: string) => string; // that's private, but there's no other way
    }
    class WhileStmt extends Node {}
    class DoStmt extends Node {}
    class ForStmt extends Node {
        body: Statement;
        init: ForInit;
        expression: Expression;
        update: StmtExpression[];
    }
    class ForInit extends Node {}
    class ContinueStmt extends Node {}
    class IfStmt extends Node {}
    class SelectStmt extends Node {
        children: Case[];
    }
    class Case extends Node {
        getCondition: () => StmtExpression | null;
        getExecution: () => Statement;
    }
    class ReturnStmt extends Node {}
    class PrimitiveStmt extends Node {
        kind: 0 | 1 | 2 | 3 | 4 | 5;

        static JOIN: 0;
        static LOCK: 1;
        static UNLOCK: 2;
        static WAIT: 3;
        static SIGNAL: 4;
        static SIGNAL_ALL: 5;
    }
    class BreakStmt extends Node {}
    class AssignDestination extends Node {
        identifier: string;
    }
    
    class Expression extends Node {}
    
    class AdditiveExpression extends Expression {
        operator: string;
    }
    class MultiplicativeExpression extends Expression {
        operator: string;
    }
    class AndExpression extends Expression {}
    class OrExpression extends Expression {}
    class RelationalExpression extends Expression {
        operator: string;
    }
    class EqualityExpression extends Expression {
        operator: string;
    }
    class LiteralExpression extends Expression {
        value: boolean | string | number;
    }
    class IdentifierExpression extends Expression {
        identifier: string;
    }
    class AssignExpression extends Expression {
        children: [AssignDestination, Expression];
        operator: string;
    }
    class ProcedureCall extends Expression {
        procedureName: string;
    }
    class ClassCall extends Expression {
        children: [Expression, ProcedureCall];
    }
    class StartExpression extends Expression {}
    class ConditionalExpression extends Expression {}
    class SendExpression extends Expression {}
    class ReceiveExpression extends Expression {}
    class UnaryExpression extends Expression {
        operator: string;
    }
    class PostfixExpression extends Expression {
        children: [AssignDestination];
        operator: string;
    }
    class ArrayExpression extends Expression {}

    class EnvironmentController {}

    const parser: {
        parse: (program: string) => (Program & {
            warnings: unknown[];
        });
    };
}
