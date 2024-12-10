import { Token } from './tokenizer';

export interface LiteralNode {
    type: 'LITERAL';
    value: number;
}

export interface IdentifierNode {
    type: 'IDENTIFIER';
    value: string;
}

export interface BinaryExpressionAssignmentNode {
    type: 'BINARY_EXPRESSION_ASSIGNMENT';
    operator: string;
    variable: IdentifierNode | ScreenNode;
    value: ASTNode;
}

export interface BinaryExpressionNode {
    type: 'BINARY_EXPRESSION';
    operator: string;
    left: ASTNode;
    right: ASTNode;
}

export interface StatementNode {
    type: 'STATEMENT';
    value: ASTNode;
}

export interface BlockNode {
    type: 'BLOCK';
    body: StatementNode[];
}

export interface ScreenNode {
    type: 'SCREEN';
    name: string;
    x: ASTNode;
    y: ASTNode;
}

export type ASTNode = BlockNode | StatementNode | BinaryExpressionAssignmentNode | BinaryExpressionNode | LiteralNode | IdentifierNode | ScreenNode;

class Parser {
    private tokens: Token[];
    private index = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    parse(): BlockNode {
        const body: StatementNode[] = [];

        while (!this.isAtEnd()) {
            body.push(this.statement());
        }

        return { type: 'BLOCK', body };
    }

    statement(): StatementNode {
        const back = this.waypoint();

        try {
            const screen = this.screen();
            const node = this.assignment(screen);

            if ( ! this.isAtEnd() && this.peek().type === 'STATEMENT_END') {
                this.advance();
            }

            return { type: 'STATEMENT', value: node };
        }
        catch (e) {
            back();
            console.log(e, this.index);
        }

        if (this.match('IDENTIFIER')) {
            const node = this.assignment({ type: 'IDENTIFIER', value: this.previous().value });

            if ( ! this.isAtEnd() && this.peek().type === 'STATEMENT_END') {
                this.advance();
            }

            return { type: 'STATEMENT', value: node };
        }

        throw new Error('Unexpected token: ' + JSON.stringify(this.peek()));
    }

    assignment(variable: IdentifierNode | ScreenNode): BinaryExpressionAssignmentNode {
        const potentialOperator = this.peek();

        let operatorValue: string|null = null;

        if (potentialOperator?.type === 'OPERATOR') {
            operatorValue = potentialOperator.value;
            this.advance();
        }

        return {
            type: 'BINARY_EXPRESSION_ASSIGNMENT',
            variable,
            value: this.expression(),
            operator: operatorValue ?? '=',
        };
    }

    expression(): ASTNode {
        return this.binary(() => this.binary(() => this.term(), ['+', '-']), ['>', '<', '<=', '>=']);
    }

    term(): ASTNode {
        return this.binary(() => this.factor(), ['*', '/']);
    }

    factor(): ASTNode {
        if (this.match('NUMBER')) {
            return { type: 'LITERAL', value: parseFloat(this.previous().value) } satisfies LiteralNode;
        }

        if (this.match('IDENTIFIER')) {
            return { type: 'IDENTIFIER', value: this.previous().value };
        }

        if (this.peek()?.type === 'SQUARE_BRACKET_OPEN') {
            this.screen();
        }

        if (this.match('PARENTHESIS_OPEN')) {
            const expr = this.expression();
            this.consume('PARENTHESIS_CLOSE', 'Expect ")" after expression.');
            return expr;
        }

        throw new Error('Unexpected token: ' + JSON.stringify(this.peek()));
    }

    screen(): ScreenNode {
        this.match('SQUARE_BRACKET_OPEN')

        const name = this.consume('IDENTIFIER', 'Expected screen identifier.').value;
        this.consume('ACCESSOR', 'Expected ".".');
        this.consume('SQUARE_BRACKET_OPEN', 'Expected "[" for screen coordinate.');

        const x = this.expression();

        this.consume('COMMA', 'Expected "[" for screen coordinate.');

        const y = this.expression();

        this.consume('SQUARE_BRACKET_CLOSE', 'Expected "]" after expression.');
        this.consume('SQUARE_BRACKET_CLOSE', 'Expected "]" after expression.');

        return { type: 'SCREEN', name, x, y };
    }

    binary(parseLeft: () => ASTNode, operators: string[]): BinaryExpressionNode {
        let node = parseLeft();
        while (this.match('OPERATOR', operators)) {
            const operator = this.previous().value;
            const right = parseLeft();
            node = { type: 'BINARY_EXPRESSION', operator, left: node, right };
        }

        return <BinaryExpressionNode>node;
    }

    waypoint() {
        const previous = this.index;
        console.log(previous)

        return () => {
            console.log(previous)
            this.index = previous;
        };
    }

    match(types: string | string[], values?: string | string[]): boolean {
        if (this.isAtEnd()) {
            return false;
        }

        types = Array.isArray(types) ? types : [types];
        values = Array.isArray(values) || values == null ? values : [values];

        if (types.includes(this.peek().type) && (values == null || values.includes(this.peek().value))) {
            this.advance();
            return true;
        }

        return false;
    }

    consume(type: string | string[], errorMessage: string): Token {
        if (this.match(type)) return this.previous();
        throw new Error(errorMessage);
    }

    peek(): Token {
        return this.tokens[this.index];
    }

    previous(back = 1): Token {
        return this.tokens[this.index - back];
    }

    advance(): Token {
        if (!this.isAtEnd()) this.index++;
        return this.previous();
    }

    isAtEnd(): boolean {
        return this.index >= this.tokens.length;
    }
}

export function parse(tokens: Token[]): BlockNode {
    return (new Parser(tokens)).parse();
}
