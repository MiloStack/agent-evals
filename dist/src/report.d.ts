import type { CheckResult } from "./checks/types";
export type { Finding } from "./checks/types";
export interface EvalReport {
    timestamp: string;
    domain: string;
    inputFiles: number;
    checks: CheckResult[];
    overallScore: number;
    passed: boolean;
}
export declare function generateReport(checks: CheckResult[], domain: string, inputFileCount: number): EvalReport;
export declare function formatReportJson(report: EvalReport): string;
export declare function formatReportPretty(report: EvalReport): string;
//# sourceMappingURL=report.d.ts.map