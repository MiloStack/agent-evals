import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
const LANG_MAP = {
    ".ts": "typescript", ".tsx": "typescript", ".js": "javascript", ".jsx": "javascript",
    ".py": "python", ".rb": "ruby", ".go": "go", ".rs": "rust", ".java": "java",
    ".sh": "shell", ".bash": "shell", ".yml": "yaml", ".yaml": "yaml", ".json": "json",
    ".md": "markdown", ".css": "css", ".html": "html", ".sql": "sql", ".tf": "terraform",
};
function detectLanguage(p) {
    if (p.toLowerCase().includes("dockerfile"))
        return "dockerfile";
    return LANG_MAP[extname(p).toLowerCase()] ?? "unknown";
}
function collectFiles(dir) {
    const entries = [];
    for (const item of readdirSync(dir)) {
        if (["node_modules", ".git", "dist"].includes(item))
            continue;
        const full = join(dir, item);
        const stat = statSync(full);
        if (stat.isDirectory())
            entries.push(...collectFiles(full));
        else if (stat.isFile()) {
            try {
                entries.push({ path: full, content: readFileSync(full, "utf-8"), language: detectLanguage(full) });
            }
            catch { /* skip unreadable */ }
        }
    }
    return entries;
}
export function parseInput(target) {
    const stat = statSync(target);
    if (stat.isFile()) {
        const content = readFileSync(target, "utf-8");
        return { files: [{ path: target, content, language: detectLanguage(target) }] };
    }
    if (stat.isDirectory())
        return { files: collectFiles(target) };
    throw new Error(`Unsupported target: ${target}`);
}
//# sourceMappingURL=parser.js.map