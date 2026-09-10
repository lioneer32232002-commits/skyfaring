/**
 * 論文導讀存檔的共用邏輯，給兩支 hook 借用：
 *   - post-push-archive.mjs：本機 git push 成功後，存這次推上去的文章
 *   - session-archive-sync.mjs：本機 session 開頭，補存雲端合併後漏掉的文章
 *
 * 存檔目的地 articles/ 是指向 skyfaring-research repo 的 junction；複製完要在那個 repo
 * commit + push，這裡也一併做掉（commitArchive），不再靠人記得。
 *
 * 判準：frontmatter 的 source / source_url / references / doi 指向 arXiv、DOI 或期刊與
 * 學術典藏網域 → 論文導讀類，要存。只有一般網址或沒有來源欄位 → 不存。
 * （先前用「有沒有來源欄位」當判準，會把有引用來源的敘事文一起存進去，2026-08-19 收窄。）
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const ARCHIVE_DIR = path.join(ROOT, "articles");
/** 同步記號：上次把 skyfaring origin/main 存檔到哪個 commit。放在 research repo 裡，兩台機器共用。 */
export const SYNC_STATE_FILE = ".sync-state.json";

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

/** 存檔目錄存在與否（雲端與新機器沒有 junction）。 */
export function archiveAvailable() {
  try {
    return fs.statSync(ARCHIVE_DIR).isDirectory();
  } catch {
    return false;
  }
}

/** 解析 junction，找出 skyfaring-research repo 的根目錄；不是 git repo 就回 null。 */
export function researchRoot() {
  try {
    const real = fs.realpathSync(ARCHIVE_DIR);
    const root = path.dirname(real);
    return fs.existsSync(path.join(root, ".git")) ? root : null;
  } catch {
    return null;
  }
}

export function gitIn(cwd, args, opts = {}) {
  const { raw = false, ...exec } = opts;
  const out = execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
    ...exec,
  });
  // raw：拿檔案內容（git show）時不能 trim，結尾換行是內容的一部分，少了就會判成「不同」
  return raw ? out : out.trim();
}

/** 比對內容時忽略換行差異：舊存檔是 autocrlf 檢出的 CRLF，文章本體是 LF。 */
const normalize = (s) => s.replace(/\r\n?/g, "\n");

/**
 * 把一批文章存進 articles/。
 * @param {Array<{name:string, content:string}>} posts 文章檔名與內容（內容可能來自工作樹或 git show）
 * @param matter gray-matter
 * @param {{dryRun?:boolean}} [opts] dryRun 只判斷、不寫檔
 * @returns {{copied:string[], unchanged:string[], skipped:string[], files:string[]}}
 *   files 是實際寫入的存檔檔名（相對 articles/），給 commitArchive 用
 */
export function archivePosts(posts, matter, { dryRun = false } = {}) {
  const copied = [];
  const unchanged = [];
  const skipped = [];
  const files = [];
  const existing = archiveIndex(ARCHIVE_DIR, matter);
  for (const { name, content } of posts) {
    let data = {};
    try {
      data = matter(content).data ?? {};
    } catch {
      continue;
    }
    // 只有來源指向 arXiv／DOI／期刊網域的才存檔
    if (!isPaperArticle(data)) {
      skipped.push(name);
      continue;
    }
    // 已有存檔就更新那一份（可能是帶日期前綴的舊檔名），沒有才用文章檔名新建
    const destName = (data.slug && existing.get(data.slug)) || name;
    const dest = path.join(ARCHIVE_DIR, destName);
    try {
      if (fs.existsSync(dest) && normalize(fs.readFileSync(dest, "utf8")) === normalize(content)) {
        unchanged.push(name);
        continue;
      }
      if (!dryRun) fs.writeFileSync(dest, content);
      copied.push(name);
      files.push(destName);
    } catch (e) {
      skipped.push(`${name}（複製失敗：${e.message}`);
    }
  }
  return { copied, unchanged, skipped, files };
}

/**
 * 在 skyfaring-research repo 把指定的存檔檔案 commit + push。
 * 只 add／commit 這些檔，不碰那個 repo 其他未提交的東西。
 * @param {string[]} files 相對 articles/ 的檔名
 * @returns {{ok:boolean, message:string}}
 */
export function commitArchive(files, message) {
  const root = researchRoot();
  if (!root) return { ok: false, message: "articles/ 不在 git repo 裡，存檔已複製但沒有 commit。" };
  if (files.length === 0) return { ok: true, message: "" };
  const rel = files.map((f) => path.posix.join("articles", f));
  try {
    // 先追上遠端，避免 push 被拒；失敗（離線、有衝突）就照樣往下，push 那步會回報
    try {
      gitIn(root, ["pull", "--ff-only", "-q"]);
    } catch {
      /* 離線或無法快轉：不阻擋本地 commit */
    }
    gitIn(root, ["add", "--", ...rel]);
    // 有可能內容其實跟 HEAD 一樣（例如只差換行）：沒東西可 commit 就算完成
    const staged = gitIn(root, ["diff", "--cached", "--name-only", "--", ...rel]);
    if (!staged) return { ok: true, message: "skyfaring-research 已有相同內容，不需 commit。" };
    gitIn(root, ["commit", "-q", "-m", message, "--", ...rel]);
  } catch (e) {
    return { ok: false, message: `skyfaring-research commit 失敗：${e.message}` };
  }
  try {
    gitIn(root, ["push", "-q"]);
  } catch (e) {
    return {
      ok: false,
      message: `skyfaring-research 已 commit 但 push 失敗（${e.message.split("\n")[0]}），下次到那個 repo 手動 push。`,
    };
  }
  return { ok: true, message: "skyfaring-research 已 commit 並 push。" };
}

export function readSyncState() {
  try {
    return JSON.parse(fs.readFileSync(path.join(ARCHIVE_DIR, SYNC_STATE_FILE), "utf8"));
  } catch {
    return null;
  }
}

export function writeSyncState(state) {
  fs.writeFileSync(path.join(ARCHIVE_DIR, SYNC_STATE_FILE), JSON.stringify(state, null, 2) + "\n");
}

export function stdinJson() {
  return new Promise((resolve) => {
    let buf = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (c) => (buf += c));
    process.stdin.on("end", () => resolve(buf));
    setTimeout(() => resolve(buf), 2000).unref?.();
  }).then((raw) => {
    try {
      return raw && raw.trim() ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
}

/** 以 hook 的 additionalContext 形式輸出，然後結束。 */
export function emit(hookEventName, lines) {
  const out = {
    hookSpecificOutput: { hookEventName, additionalContext: lines.join("\n") },
  };
  process.stdout.write(JSON.stringify(out), () => process.exit(0));
}
