import ts from 'typescript';

export type StepName = 'Original' | 'Remove Interfaces' | 'Remove Parameter Types' | 'Remove Return Types' | 'Remove Variable Types' | 'Final';

export interface TransformationStep {
    name: StepName;
    code: string;
    removedRanges: { start: number; end: number }[];
}

export function generateSteps(sourceCode: string): TransformationStep[] {
    const steps: TransformationStep[] = [];

    // Step 0: Original
    steps.push({
        name: 'Original',
        code: sourceCode,
        removedRanges: []
    });

    let currentCode = sourceCode;

    // Helper to parse and get ranges
    const getRanges = (code: string, kind: 'interfaces' | 'params' | 'returns' | 'variables') => {
        const sourceFile = ts.createSourceFile('temp.ts', code, ts.ScriptTarget.Latest, true);
        const ranges: { start: number; end: number }[] = [];

        const visit = (node: ts.Node) => {
            if (kind === 'interfaces') {
                if (ts.isInterfaceDeclaration(node)) {
                    ranges.push({ start: node.getStart(), end: node.getEnd() });
                }
            } else if (kind === 'params') {
                if (ts.isParameter(node) && node.type) {
                    // We want to remove the colon and the type
                    // node.type.getStart() gives the start of the type
                    // We need to find the colon before it.
                    // A simple heuristic: look backwards from type.pos
                    const typeStart = node.type.getStart();
                    const typeEnd = node.type.getEnd();
                    // Include the colon. The colon is between node.name.end and node.type.start
                    // We can just take the range from the end of the name to the end of the type?
                    // Wait, we might have optional '?'
                    // param?: Type
                    // We want to remove '?: Type' or ': Type'

                    let start = node.type.getFullStart();
                    // getFullStart includes leading trivia (whitespace), which we might want to keep or not.
                    // Usually we want to remove the colon.
                    // Let's scan backwards from type start for the colon.
                    // Or better, just use the range from (name.end or questionToken.end) to type.end

                    const nameEnd = node.name.getEnd();
                    const questionToken = node.questionToken;
                    const startSearch = questionToken ? questionToken.getEnd() : nameEnd;

                    // We want to remove everything from startSearch to typeEnd
                    // But we should be careful about whitespace.
                    // Let's just remove the type node and the preceding colon.

                    // A safer way:
                    // Find the colon token.
                    const colon = node.getChildren().find(c => c.kind === ts.SyntaxKind.ColonToken);
                    if (colon) {
                        ranges.push({ start: colon.getStart(), end: node.type.getEnd() });
                    } else {
                        // Maybe it's just the type (unlikely for param unless implicit, but this is TS)
                        ranges.push({ start: node.type.getStart(), end: node.type.getEnd() });
                    }
                }
            } else if (kind === 'returns') {
                if ((ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node)) && node.type) {
                    // Remove colon and type
                    const colon = node.getChildren().find(c => c.kind === ts.SyntaxKind.ColonToken);
                    if (colon) {
                        ranges.push({ start: colon.getStart(), end: node.type.getEnd() });
                    } else {
                        ranges.push({ start: node.type.getStart(), end: node.type.getEnd() });
                    }
                }
            } else if (kind === 'variables') {
                if (ts.isVariableDeclaration(node) && node.type) {
                    const colon = node.getChildren().find(c => c.kind === ts.SyntaxKind.ColonToken);
                    if (colon) {
                        ranges.push({ start: colon.getStart(), end: node.type.getEnd() });
                    } else {
                        ranges.push({ start: node.type.getStart(), end: node.type.getEnd() });
                    }
                }
            }

            ts.forEachChild(node, visit);
        };

        visit(sourceFile);
        return ranges.sort((a, b) => b.start - a.start); // Sort reverse to remove safely
    };

    // Apply removal
    const applyRemoval = (code: string, ranges: { start: number; end: number }[]) => {
        let newCode = code;
        for (const range of ranges) {
            newCode = newCode.substring(0, range.start) + newCode.substring(range.end);
        }
        return newCode;
    };

    // Step 1: Remove Interfaces
    const interfaceRanges = getRanges(currentCode, 'interfaces');
    currentCode = applyRemoval(currentCode, interfaceRanges);
    steps.push({ name: 'Remove Interfaces', code: currentCode, removedRanges: interfaceRanges });

    // Step 2: Remove Parameter Types
    const paramRanges = getRanges(currentCode, 'params');
    currentCode = applyRemoval(currentCode, paramRanges);
    steps.push({ name: 'Remove Parameter Types', code: currentCode, removedRanges: paramRanges });

    // Step 3: Remove Return Types
    const returnRanges = getRanges(currentCode, 'returns');
    currentCode = applyRemoval(currentCode, returnRanges);
    steps.push({ name: 'Remove Return Types', code: currentCode, removedRanges: returnRanges });

    // Step 4: Remove Variable Types
    const varRanges = getRanges(currentCode, 'variables');
    currentCode = applyRemoval(currentCode, varRanges);
    steps.push({ name: 'Remove Variable Types', code: currentCode, removedRanges: varRanges });

    return steps;
}
