import { readFileSync, readdirSync, statSync } from "fs";
import { join, resolve, relative, extname } from "path";
function detectLanguage(filePath) {
    const ext = extname(filePath).toLowerCase();
    const languageMap = {
        ".ts": "typescript",
        ".tsx": "typescript",
        ".js": "javascript",
        ".jsx": "javascript",
        ".py": "python",
        ".java": "java",
        ".go": "go",
        ".rs": "rust",
        ".cpp": "cpp",
        ".c": "c",
        ".cs": "csharp",
        ".rb": "ruby",
        ".php": "php",
    };
    return languageMap[ext] || "text";
}
function shouldIgnorePath(filePath) {
    const ignoredDirs = [
        "node_modules",
        ".git",
        "dist",
        "build",
        ".venv",
        "__pycache__",
        ".pytest_cache",
        ".env",
    ];
    const parts = filePath.split(/[\\/]/);
    return parts.some((part) => ignoredDirs.includes(part));
}
function readDirectory(dirPath, basePath) {
    const files = [];
    const entries = readdirSync(dirPath);
    for (const entry of entries) {
        const fullPath = join(dirPath, entry);
        const relativePath = relative(basePath, fullPath);
        if (shouldIgnorePath(relativePath)) {
            continue;
        }
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
            files.push(...readDirectory(fullPath, basePath));
        }
        else if (stat.isFile()) {
            try {
                const content = readFileSync(fullPath, "utf-8");
                const language = detectLanguage(fullPath);
                files.push({
                    path: relativePath,
                    content,
                    language,
                });
            }
            catch {
                // Skip files that can't be read (binary, permissions, etc.)
            }
        }
    }
    return files;
}
export async function parseInput(inputPath, metadata) {
    const resolvedPath = resolve(inputPath);
    const stat = statSync(resolvedPath);
    const files = [];
    if (stat.isFile()) {
        const content = readFileSync(resolvedPath, "utf-8");
        const language = detectLanguage(resolvedPath);
        const fileName = resolvedPath.split(/[\\/]/).pop() || resolvedPath;
        files.push({
            path: fileName,
            content,
            language,
        });
    }
    else if (stat.isDirectory()) {
        files.push(...readDirectory(resolvedPath, resolvedPath));
    }
    return {
        files,
        metadata: metadata || {},
    };
}
//# sourceMappingURL=parser.js.map