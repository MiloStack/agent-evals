import type { Check } from "../types.js";
import { hasTests } from "./has-tests.js";
import { noSecrets } from "./no-secrets.js";
import { noTodoFixme } from "./no-todo-fixme.js";
import { fileSize } from "./file-size.js";
import { errorHandling } from "./error-handling.js";

const ALL: Check[] = [hasTests, noSecrets, noTodoFixme, fileSize, errorHandling];

export function getChecksForDomain(domain: string): Check[] {
  return ALL.filter(c => c.domain === domain);
}

export { hasTests, noSecrets, noTodoFixme, fileSize, errorHandling };
