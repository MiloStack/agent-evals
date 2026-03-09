export interface FileEntry {
    path: string;
    content: string;
    language: string;
}
export interface EvalInput {
    files: FileEntry[];
    metadata?: {
        agent?: string;
        prompt?: string;
    };
}
export interface Finding {
    file: string;
    line?: number;
    message: string;
    severity: "error" | "warning" | "info";
}
export interface CheckResult {
    check: string;
    passed: boolean;
    score: number;
    details: string;
    findings: Finding[];
}
export interface Check {
    name: string;
    domain: string;
    critical?: boolean;
    run(input: EvalInput): Promise<CheckResult>;
}
export interface EvalReport {
    timestamp: string;
    domain: string;
    inputFiles: number;
    checks: CheckResult[];
    overallScore: number;
    passed: boolean;
}
//# sourceMappingURL=types.d.ts.map