import {readFileSync} from "node:fs";
import path from "node:path";

export function readLegalMarkdown(fileName: "terms.md" | "privacy.md"): string {
  return readFileSync(path.join(process.cwd(), "content", "legal", fileName), "utf8");
}
