export interface FileInfo {
    path: string;
    content: string;
    language: string;
}
export interface EvalInput {
    files: FileInfo[];
    metadata?: {
        agent?: string;
        prompt?: string;
    };
}
export declare function parseInput(inputPath: string, metadata?: {
    agent?: string;
    prompt?: string;
}): Promise<EvalInput>;
//# sourceMappingURL=parser.d.ts.map