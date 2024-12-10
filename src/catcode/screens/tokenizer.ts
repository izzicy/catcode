export type Token = {
    type: string;
    value: string;
    line: number;
    column: number;
};

class Tokenizer
{
    private input: string;
    private index = 0;
    private line = 0;
    private column = 0;
    private tokens: Token[] = [];

    public constructor(input: string)
    {
        this.input = input;
    }

    public tokenize()
    {
        const tokenize = (partialToken: { value: string; type: string; }) => {
            this.tokens.push({
                ...partialToken,
                line: this.line,
                column: this.column,
            });
        };

        while (this.index < this.input.length) {
            if (this.match(/^[a-zA-Z]/)) {
                let value = this.current();

                this.next();

                while (this.match(/^[a-zA-Z0-9]/)) {
                    value += this.current();
                    this.next();
                }

                tokenize({ type: 'IDENTIFIER', value });
            } else if (this.match(/^(\n|\s)/)) {
                this.next();
            }else if (this.match('[')) {
                tokenize({ type: 'SQUARE_BRACKET_OPEN', value: this.current() });
                this.next();
            } else if (this.match(']')) {
                tokenize({ type: 'SQUARE_BRACKET_CLOSE', value: this.current() });
                this.next();
            } else if (this.match('/')) {
                tokenize({ type: 'SLASH', value: this.current() });
                this.next();
            }  else if (this.match(/^\d/)) {
                tokenize({ type: 'NUMBER', value: this.current() });
                this.next();
            } else if (this.match(';')) {
                tokenize({ type: 'STATEMENT_END', value: this.current() });
                this.next();
            } else {
                tokenize({ type: 'UNEXPECTED', value: this.current() });
                this.next();
            }
        }

        return this.tokens;
    }

    private match(test: RegExp | string) {
        const substr = this.input.substring(this.index);

        if (typeof test === 'string') {
            return substr.startsWith(test);
        }

        return substr.match(test);
    }

    private current() {
        return this.input.charAt(this.index);
    }

    private next() {
        const nextChar = this.input.charAt(++this.index);

        this.column++;

        if (nextChar === '\n') {
            this.line += 1;
            this.column = 0;
        }

        return nextChar;
    }
}

export function tokenize(input: string): Token[] {
    return new Tokenizer(input).tokenize();
}
