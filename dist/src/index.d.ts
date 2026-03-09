export { parseInput } from "./parser.js";
export { getChecksForDomain } from "./checks/index.js";
export { generateReport, formatReportJson, formatReportPretty } from "./report.js";
export type { EvalInput, EvalReport, Check, CheckResult, Finding, FileEntry } from "./types.js";
import type { EvalReport } from "./types.js";
export declare function evaluate(target: string, domain?: string): Promise<EvalReport>;
//# sourceMappingURL=index.d.ts.map