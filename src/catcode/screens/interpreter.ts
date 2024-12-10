import { ScreenNode, BlockNode } from './parser';

class Interpreter
{
    private ast: BlockNode;
    private screens = {};

    public constructor(ast: BlockNode) {
        this.ast = ast;
    }

    public interpret() {
        for (const node of this.ast.body) {
            this.screen(node);
        }

        return this.screens;
    }

    private screen(node: ScreenNode) {
        const rows: number[][] = new Array(node.body.length);

        for (let i = 0; i < node.body.length; i++) {
            const line = node.body[i];
            const columns = new Array(line.body.length);

            for (let j = 0; j < line.body.length; j++) {
                columns[j] = line.body[j].value;
            }

            rows[i] = columns;
        }

        this.screens[node.name] = rows;
    }
}

export function interpreter(ast: BlockNode) {
    const interpreter = new Interpreter(ast);

    return interpreter.interpret();
}
