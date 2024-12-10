import { BinaryExpressionNode, BlockNode, ASTNode, StatementNode, BinaryExpressionAssignmentNode } from './parser';

class Interpreter
{
    private ast: BlockNode;
    private variables = {};
    private screens;

    public constructor(ast: BlockNode, screens: { [key: string]: number[][] }) {
        this.ast = ast;
        this.screens = screens;
    }

    public interpret() {
        for (const node of this.ast.body) {
            this.statement(node);
        }

        return this.screens;
    }

    private statement(node: StatementNode) {
        if (node.value.type === 'BINARY_EXPRESSION_ASSIGNMENT') {
            return this.assignment(node.value);
        }

        if (node.value.type === 'BINARY_EXPRESSION') {
            return this.binary(node.value);
        }
    }

    private expression(node: ASTNode) {
        if (node.type === 'LITERAL') {
            return node.value;
        }

        if (node.type === 'IDENTIFIER') {
            return this.variables[node.value];
        }

        if (node.type === 'BINARY_EXPRESSION') {
            return this.binary(node);
        }

        if (node.type === 'SCREEN') {
            const xValue = this.expression(node.x);
            const yValue = this.expression(node.y);

            return this.screens[node.name][xValue][yValue];
        }
    }

    private assignment(node: BinaryExpressionAssignmentNode) {
        const value = this.expression(node.value);
        const variable = node.variable;

        if (variable.type === 'IDENTIFIER') {
            const name = variable.value;

            switch (node.operator) {
                case '*':
                    return this.variables[name] *= value;
                case '/':
                    return this.variables[name] /= value;
                case '+':
                    return this.variables[name] += value;
                case '-':
                    return this.variables[name] -= value;
                case '>':
                    return this.variables[name] = Number(this.variables[name] > value);
                case '<':
                    return this.variables[name] = Number(this.variables[name] < value);
                case '<=':
                    return this.variables[name] = Number(this.variables[name] <= value);
                case '>=':
                    return this.variables[name] = Number(this.variables[name] >= value);
                case '=':
                    return this.variables[name] = value;
            }
        }

        if (variable.type === 'SCREEN') {
            const screen = this.screens[variable.name];
            const xValue = this.expression(variable.x);
            const yValue = this.expression(variable.y);

            switch (node.operator) {
                case '*':
                    screen[xValue][yValue] *= value;
                    break;
                case '/':
                    screen[xValue][yValue] /= value;
                    break;
                case '+':
                    screen[xValue][yValue] += value;
                    break;
                case '-':
                    screen[xValue][yValue] -= value;
                    break;
                case '>':
                    screen[xValue][yValue] = Number(screen[xValue][yValue] > value);
                    break;
                case '<':
                    screen[xValue][yValue] = Number(screen[xValue][yValue] < value);
                    break;
                case '<=':
                    screen[xValue][yValue] = Number(screen[xValue][yValue] <= value);
                    break;
                case '>=':
                    screen[xValue][yValue] = Number(screen[xValue][yValue] >= value);
                    break;
                case '=':
                    screen[xValue][yValue] = value;
                    break;
            }

            return screen[xValue][yValue] = Math.min(Math.max(screen[xValue][yValue], 0), 9);
        }

        return value;
    }

    private binary(node: BinaryExpressionNode) {
        const leftValue = this.expression(node.left);
        const rightValue = this.expression(node.right);

        switch (node.operator) {
            case '*':
                return leftValue * rightValue;
            case '/':
                return leftValue / rightValue;
            case '+':
                return leftValue + rightValue;
            case '-':
                return leftValue - rightValue;
            case '>':
                return Number(leftValue > rightValue);
            case '<':
                return Number(leftValue < rightValue);
            case '<=':
                return Number(leftValue <= rightValue);
            case '>=':
                return Number(leftValue >= rightValue);
        }
    }
}

export function interpreter(ast: BlockNodem, screens: { [key: string]: number[][] }) {
    const interpreter = new Interpreter(ast, screens);

    return interpreter.interpret();
}
