import { Token } from './tokenizer';

export interface NumberNode {
    type: 'NUMBER';
    value: number;
}

export interface ScreenLineNode {
    type: 'SCREEN_LINE';
    body: NumberNode[];
}

export interface ScreenNode {
    type: 'SCREEN';
    name: string;
    body: ScreenLineNode[];
}

export interface BlockNode {
    type: 'BLOCK';
    body: ScreenNode[];
}

export type ASTNode = BlockNode | ScreenNode | ScreenLineNode | NumberNode;

class Parser {
    private tokens: Token[];
    private index = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    parse(): BlockNode {
        const body: ScreenNode[] = [];

        while (!this.isAtEnd()) {
            body.push(this.screen());
        }

        return { type: 'BLOCK', body };
    }

    private screen(): ScreenNode {
        const body: ScreenLineNode[] = [];

        this.consume('SQUARE_BRACKET_OPEN', 'Expected "[".');
        const name = this.consume('IDENTIFIER', 'Expected screen identifier.').value;

        this.consume('SQUARE_BRACKET_CLOSE', 'Expected "]".');

        while ( ! this.isAtEnd() && this.peek().type !== 'SQUARE_BRACKET_OPEN') {
            body.push(this.screenLine());
        }

        this.consume('SQUARE_BRACKET_OPEN', 'Expected "[".');

        this.consume('SLASH', 'Expected "/".');

        this.consume('IDENTIFIER', 'Expected screen identifier.');

        this.consume('SQUARE_BRACKET_CLOSE', 'Expected "]".');

        return { type: 'SCREEN', body, name };
    }

    private screenLine(): ScreenLineNode {
        const body: NumberNode[] = [];

        while ( ! this.isAtEnd() && this.peek().type !== 'STATEMENT_END') {
            body.push(this.number());
        }

        this.consume('STATEMENT_END', 'Expected ";".');

        return { type: 'SCREEN_LINE', body };
    }

    private number(): NumberNode {
        const token = this.consume('NUMBER', 'Expected a number.');

        return { type: 'NUMBER', value: Number(token.value) };
    }

    waypoint() {
        const index = this.index;

        return () => {
            this.index = index;
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
        throw new Error(errorMessage + this.previous().type);
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
