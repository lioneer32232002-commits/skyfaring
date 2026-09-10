#!/usr/bin/env node
/**
 * PostToolUse hook：git push 成功後，把這次推上去的論文導讀文章複製一份到 articles/，
 * 並在 skyfaring-research repo commit + push。
 *
 * 為什麼要這層：CLAUDE.md〈文章存檔規範〉要求論文導讀 / PDF 翻譯類文章發文後
 * 同步存一份到 articles/。這一步先前只寫在規範裡、靠人記得，實際上 80 篇文章有 25 篇
 * 該存而沒存；後來 hook 會複製但「到 research repo commit + push」仍靠人記得，
 * 2026-09-10 起連這一步也自動做。
 *
 * 只複製這次 push 實際推上去的文章（用 upstream 的 reflog 取推之前的位置），
 * 不做全庫回填，避免把使用者刻意沒存的舊文一次灌進去。
 *
 * 雲端 session 沒有 articles/ junction，這裡只能回報「待存檔」；補存由本機下一個 session
 * 開頭的 session-archive-sync.mjs 依 origin/main 的差異自動完成（2026-09-10 超長程機師
 * 睡眠一文就是在雲端合併後漏存，才補這條路）。
 *
 * 判準與共用邏輯在 archive-lib.mjs。任何例外都吞掉並 exit 0：這是發文流程的最後一步，
 * 絕不能因為存檔失敗就卡住。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ROOT,
  ARCHIVE_DIR,
  archiveAvailable,
  archivePosts,
  commitArchive,
  emit,
  gitIn,
  stdinJson,
} from "./archive-lib.mjs";

// 舊的匯入端（回填工具等）仍可從這支拿判準
export { ARCHIVABLE_SOURCE, isPaperArticle, archiveIndex } from "./archive-lib.mjs";

const git = (args) => gitIn(ROOT, args);

/** 這次 push 推上去的檔案清單。優先用 upstream reflog（涵蓋一次推多個 commit），取不到就退回 HEAD 單一 commit。 */
function pushedFiles() {
  try {
    const upstream = git(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"]);
    const before = git(["rev-parse", `${upstream}@{1}`]);
    return git(["diff", "--name-only", before, upstream]).split("\n");
  } catch {
    return git(["show", "--name-only", "--pretty=format:", "HEAD"]).split("\n");
  }
}

/** HEAD 是否真的已經在 upstream 上（push 失敗時就不動作）。 */
function pushSucceeded() {
  try {
    return git(["rev-parse", "HEAD"]) === git(["rev-parse", "@{u}"]);
  } catch {
    return false;
  }
}

async function main() {
  const input = await stdinJson();
  const command = String(input?.tool_input?.command ?? "");
  if (!/\bgit\b[^\n]*\bpush\b/.test(command)) process.exit(0);
  if (!pushSucceeded()) process.exit(0);

  let matter;
  try {
    matter = (await import("gray-matter")).default;
  } catch {
    process.exit(0);
  }

  const posts = pushedFiles()
    .map((f) => f.trim())
    .filter((f) => /^content\/posts\/[^/]+\.mdx?$/.test(f))
    .filter((f) => fs.existsSync(path.join(ROOT, f)));
  if (posts.length === 0) process.exit(0);

  // articles/ 是指向 skyfaring-research 的 junction，雲端與新 clone 的機器上不會有
  if (!archiveAvailable()) {
    emit("PostToolUse", [
      `存檔略過：找不到 ${ARCHIVE_DIR}。`,
      "articles/ 是指向 skyfaring-research 的 junction；本機下一個 session 開頭會依 origin/main 自動補存（session-archive-sync）。",
      "新機器要跑 node scripts/setup-junctions.mjs 建連結（見 CLAUDE.md〈論文與存檔資料夾〉）。",
      `待存檔：${posts.map((p) => path.basename(p)).join("、")}`,
    ]);
    return;
  }

  const { copied, unchanged, skipped, files } = archivePosts(
    posts.map((rel) => ({
      name: path.basename(rel),
      content: fs.readFileSync(path.join(ROOT, rel), "utf8"),
    })),
    matter
  );

  // 全部都已經是最新的就安靜退出：指令字串裡剛好提到 git push 也會觸發這個 hook，
  // 沒有實際動作時不要製造雜訊
  if (copied.length === 0 && skipped.length === 0) process.exit(0);

  const lines = [];
  if (copied.length) lines.push(`已存檔到 articles/：${copied.join("、")}`);
  if (unchanged.length) lines.push(`articles/ 已有相同內容，未覆寫：${unchanged.join("、")}`);
  if (skipped.length) lines.push(`未存檔（來源不是 arXiv／DOI／期刊網域）：${skipped.join("、")}`);
  if (files.length) {
    const r = commitArchive(files, `存檔：${copied.join("、")}`);
    lines.push(r.message);
  }
  emit("PostToolUse", lines);
}

// 被當成 hook 直接執行時才跑；被其他腳本 import（例如回填工具借用判準）時只匯出函式
const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) main().catch(() => process.exit(0));
