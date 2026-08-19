#!/usr/bin/env node
/**
 * PostToolUse hook：git push 成功後，把這次推上去的論文導讀文章複製一份到 articles/。
 *
 * 為什麼要這層：CLAUDE.md〈文章存檔規範〉要求論文導讀 / PDF 翻譯類文章發文後
 * 同步存一份到 articles/（實體在 OneDrive，走檔案同步、不進 git）。這一步先前
 * 只寫在規範裡、靠人記得，實際上 80 篇文章有 25 篇該存而沒存。
 *
 * 判準：frontmatter 有 source / source_url / references / doi 其中之一 → 論文導讀類，要存。
 * 都沒有 → 賽後分析類（攻城獅那批），跳過。這條規則在既有 80 篇上零誤判。
 *
 * 只複製這次 push 實際推上去的文章（用 upstream 的 reflog 取推之前的位置），
 * 不做全庫回填，避免把使用者刻意沒存的舊文一次灌進去。
 *
 * 任何例外都吞掉並 exit 0：這是發文流程的最後一步，絕不能因為存檔失敗就卡住。
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const POSTS_DIR = "content/posts";
const ARCHIVE_DIR = path.join(ROOT, "articles");

function readStdin() {
  return new Promise((resolve) => {
    let buf = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (c) => (buf += c));
    process.stdin.on("end", () => resolve(buf));
    setTimeout(() => resolve(buf), 2000).unref?.();
  });
}

const git = (args) =>
  execFileSync("git", args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();

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

function emit(lines) {
  const out = {
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: lines.join("\n"),
    },
  };
  process.stdout.write(JSON.stringify(out), () => process.exit(0));
}

async function main() {
  let input = {};
  try {
    const raw = await readStdin();
    if (raw && raw.trim()) input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

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

  // articles/ 是指向 OneDrive 的 junction，新 clone 的機器上不會自動存在
  if (!fs.existsSync(ARCHIVE_DIR)) {
    emit([
      `存檔略過：找不到 ${ARCHIVE_DIR}。`,
      "articles/ 是指向 OneDrive 的 junction，新機器要自己建（見 CLAUDE.md〈論文與存檔資料夾〉）。",
      `待存檔：${posts.map((p) => path.basename(p)).join("、")}`,
    ]);
    return;
  }

  const copied = [];
  const skipped = [];
  const unchanged = [];
  for (const rel of posts) {
    const src = path.join(ROOT, rel);
    const name = path.basename(rel);
    let data = {};
    try {
      data = matter(fs.readFileSync(src, "utf8")).data ?? {};
    } catch {
      continue;
    }
    // 論文導讀 / PDF 翻譯類才存檔；賽後分析類沒有來源欄位，跳過
    if (!(data.source || data.source_url || data.references || data.doi)) {
      skipped.push(name);
      continue;
    }
    const dest = path.join(ARCHIVE_DIR, name);
    try {
      if (fs.existsSync(dest) && fs.readFileSync(dest, "utf8") === fs.readFileSync(src, "utf8")) {
        unchanged.push(name);
        continue;
      }
      fs.copyFileSync(src, dest);
      copied.push(name);
    } catch (e) {
      skipped.push(`${name}（複製失敗：${e.message}）`);
    }
  }

  // 全部都已經是最新的就安靜退出：指令字串裡剛好提到 git push 也會觸發這個 hook，
  // 沒有實際動作時不要製造雜訊
  if (copied.length === 0 && skipped.length === 0) process.exit(0);

  const lines = [];
  if (copied.length) lines.push(`已存檔到 articles/：${copied.join("、")}`);
  if (unchanged.length) lines.push(`articles/ 已有相同內容，未覆寫：${unchanged.join("、")}`);
  if (skipped.length) lines.push(`未存檔（無來源欄位，屬賽後分析類）：${skipped.join("、")}`);
  lines.push("articles/ 在 OneDrive、不進 git，這是備份用的副本。");
  emit(lines);
}

main().catch(() => process.exit(0));
