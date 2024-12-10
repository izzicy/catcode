export function screenObjectStringifier(screens: { [key: string]: number[][] }) {
    let string = '';

    for (const screen in screens) {
        string += `[${screen}]\n`;

        for (const screenLines of screens[screen]) {
            string += `${screenLines.join(' ')};`;
            string += '\n';
        }

        string += `[/${screen}]\n`;
    }

    return string;
}
