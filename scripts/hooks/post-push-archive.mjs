#!/usr/bin/env node
/**
 * PostToolUse hook：git push 成功後，把這次推上去的論文導讀文章複製一份到 articles/。
 *
 * 為什麼要這層：CLAUDE.md〈文章存檔規範〉要求論文導讀 / PDF 翻譯類文章發文後
 * 同步存一份到 articles/（實體在 skyfaring-research repo，本 repo 的 articles/ 是指向它的 junction，
 * 複製完要到那個 repo commit + push）。這一步先前
 * 只寫在規範裡、靠人記得，實際上 80 篇文章有 25 篇該存而沒存。
 *
 * 判準：frontmatter 的 source / source_url / references / doi 指向 arXiv、DOI 或期刊與
 * 學術典藏網域 → 論文導讀類，要存。只有一般網址或沒有來源欄位 → 不存。
 * （先前用「有沒有來源欄位」當判準，會把有引用來源的敘事文一起存進去，2026-08-19 收窄。）
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
const ARCHIVE_DIR = path.join(ROOT, "articles");

/**
 * 要存檔的來源特徵，兩類：
 *   1. 學術：arXiv、DOI（`doi.org` 或 `10.xxxx/` 前綴）、期刊出版社與機構典藏網域
 *   2. 報告：智庫與國際組織的研究報告發布網域（IISS、IFRI、CSIS、RUSI、ICAO 等）
 * 新增網域時直接加進對應那一組，不要改回寬鬆的「有來源欄位就算」——那會把
 * 有引用來源的敘事文（球鞋、戰史、新聞評論）一起掃進來。
 */
export const ARCHIVABLE_SOURCE = new RegExp(
  [
    // 學術
    "\\barxiv\\b|\\bdoi\\b|\\b10\\.\\d{4,9}\\/|arxiv\\.org|doi\\.org|biorxiv|medrxiv|engrxiv|osf\\.io|ssrn",
    "semanticscholar|ncbi\\.nlm\\.nih\\.gov|europepmc|pubmed|sciencedirect|springer|nature\\.com|wiley\\.com",
    "tandfonline|sagepub|mdpi\\.com|frontiersin|plos\\.org|ieee\\.org|acm\\.org|cambridge\\.org|oup\\.com",
    "jstor|researchgate|digital-?commons|openreview|mlr\\.press|neurips|aaai\\.org|iopscience|aps\\.org",
    "aiaa\\.org|lww\\.com|jamanetwork|nejm\\.org|thelancet|bmj\\.com|karger|hindawi|degruyter|emerald",
    "sloansportsconference",
    // 智庫與國際組織報告
    "iiss\\.org|ifri\\.org|carnegieendowment|csis\\.org|rusi\\.org|rand\\.org|atlanticcouncil|cfr\\.org",
    "brookings|chathamhouse|sipri\\.org|crsreports|cfe-dmha|iata\\.org|icao\\.int|dset\\.tw",
    // 有些報告只在 source 文字裡指名發布機構，連結卻指向報導該報告的新聞
    "Congressional Research Service|China Maritime Studies Institute",
  ].join("|"),
  "i"
);

/** frontmatter 判斷這篇是不是要存檔的論文／報告導讀類。 */
export function isPaperArticle(data = {}) {
  const cited = [data.source, data.source_url, data.doi, data.references].filter(Boolean);
  if (cited.length === 0) return false;
  return ARCHIVABLE_SOURCE.test(JSON.stringify(cited));
}

/**
 * articles/ 現有存檔的 slug → 檔名對照。
 * 舊存檔的檔名帶日期前綴（`2026-06-24-iiss-uninhabited-war-ukraine.md`），
 * 所以要認 frontmatter 的 slug，不能只比檔名，否則同一篇會存成兩份。
 */
export function archiveIndex(dir, matter) {
  const bySlug = new Map();
  for (const f of fs.readdirSync(dir).filter((f) => /\.mdx?$/.test(f))) {
    try {
      const s = matter(fs.readFileSync(path.join(dir, f), "utf8")).data?.slug;
      if (s && !bySlug.has(s)) bySlug.set(s, f);
    } catch {
      /* 讀不動的舊檔跳過 */
    }
  }
  return bySlug;
}

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

  // articles/ 是指向 skyfaring-research 的 junction，新 clone 的機器上不會自動存在
  if (!fs.existsSync(ARCHIVE_DIR)) {
    emit([
      `存檔略過：找不到 ${ARCHIVE_DIR}。`,
      "articles/ 是指向 skyfaring-research 的 junction，新機器跑 node scripts/setup-junctions.mjs 建（見 CLAUDE.md〈論文與存檔資料夾〉）。",
      `待存檔：${posts.map((p) => path.basename(p)).join("、")}`,
    ]);
    return;
  }

  const copied = [];
  const skipped = [];
  const unchanged = [];
  const existing = archiveIndex(ARCHIVE_DIR, matter);
  for (const rel of posts) {
    const src = path.join(ROOT, rel);
    const name = path.basename(rel);
    let data = {};
    try {
      data = matter(fs.readFileSync(src, "utf8")).data ?? {};
    } catch {
      continue;
    }
    // 只有來源指向 arXiv／DOI／期刊網域的才存檔
    if (!isPaperArticle(data)) {
      skipped.push(name);
      continue;
    }
    // 已有存檔就更新那一份（可能是帶日期前綴的舊檔名），沒有才用文章檔名新建
    const dest = path.join(ARCHIVE_DIR, (data.slug && existing.get(data.slug)) || name);
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
  if (skipped.length) lines.push(`未存檔（來源不是 arXiv／DOI／期刊網域）：${skipped.join("、")}`);
  lines.push("articles/ 實體在 skyfaring-research repo，記得到那邊 commit + push 這份存檔。");
  emit(lines);
}

// 被當成 hook 直接執行時才跑；被其他腳本 import（例如回填工具借用判準）時只匯出函式
const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) main().catch(() => process.exit(0));
