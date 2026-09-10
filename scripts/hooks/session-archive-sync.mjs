#!/usr/bin/env node
/**
 * SessionStart hook（本機）：補存雲端 session 合併後漏掉的論文導讀存檔。
 *
 * 為什麼要這層：post-push-archive.mjs 只在「本機 push」時動作。雲端 session（claude.ai/code、
 * 排程代理）沒有 articles/ junction，push 之後只能回報「待存檔」，接著就靠人記得——
 * 2026-09-10 超長程機師睡眠一文就是這樣漏掉的。這支改成看 git：skyfaring-research 的
 * `articles/.sync-state.json` 記著上次存檔到 skyfaring origin/main 的哪個 commit，每個本機
 * session 開頭 fetch 一次，把記號之後 content/posts/ 有動到的論文類文章補存、commit、push，
 * 再把記號推進。誰 push 的、從哪台機器 push 的都不重要，只看 origin/main。
 *
 * 只補記號之後的差異，不做全庫回填：舊存檔是發文當下的快照，之後全站文字清理沒有回寫，
 * 那是刻意的，不要一次覆蓋。
 *
 * 用法（除了當 hook）：
 *   node scripts/hooks/session-archive-sync.mjs --dry-run          # 只列出會做什麼
 *   node scripts/hooks/session-archive-sync.mjs --from <sha>       # 暫時改用別的起點（測試用）
 *
 * 任何例外都吞掉並 exit 0：這是 session 開頭的背景步驟，不能擋住使用者。
 */
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ROOT,
  SYNC_STATE_FILE,
  archiveAvailable,
  archivePosts,
  commitArchive,
  emit,
  gitIn,
  readSyncState,
  writeSyncState,
} from "./archive-lib.mjs";

const git = (args, opts) => gitIn(ROOT, args, opts);
const argv = process.argv.slice(2);
const DRY_RUN = argv.includes("--dry-run");
const FROM = argv.includes("--from") ? argv[argv.indexOf("--from") + 1] : null;
const EVENT = "SessionStart";

function log(lines) {
  if (DRY_RUN) {
    console.log(lines.join("\n"));
    process.exit(0);
  }
  emit(EVENT, lines);
}

async function main() {
  // 雲端與沒建 junction 的機器：這裡做不了事，交給有 junction 的那台
  if (!archiveAvailable()) process.exit(0);

  let matter;
  try {
    matter = (await import("gray-matter")).default;
  } catch {
    process.exit(0);
  }

  // 只看 origin/main（部署來源），不依賴本機 main 有沒有先合併；離線就用上次 fetch 到的
  try {
    git(["fetch", "-q", "origin", "main"], { timeout: 30000 });
  } catch {
    /* 離線：沿用本地的 origin/main */
  }
  const head = git(["rev-parse", "origin/main"]);

  const state = readSyncState();
  let base = FROM || state?.skyfaring_head;
  if (!base) {
    // 第一次啟用：以現在為起點，不回填。之前的存檔狀態已由人工確認過。
    if (DRY_RUN) log([`尚無同步記號，會以 ${head.slice(0, 7)} 為起點建立 ${SYNC_STATE_FILE}。`]);
    writeSyncState({ skyfaring_head: head, synced_at: new Date().toISOString(), by: os.hostname() });
    const r = commitArchive([SYNC_STATE_FILE], `存檔同步記號：起點 ${head.slice(0, 7)}`);
    log([`建立存檔同步記號 ${SYNC_STATE_FILE}（起點 ${head.slice(0, 7)}）。${r.message}`]);
    return;
  }
  if (base === head) process.exit(0);

  // 記號不在 origin/main 歷史上（force push、記號被手改）：退到共同祖先，找不到就從頭
  try {
    git(["merge-base", "--is-ancestor", base, head]);
  } catch {
    try {
      base = git(["merge-base", base, head]);
    } catch {
      base = null;
    }
  }

  const changed = (base ? git(["diff", "--name-only", base, head, "--", "content/posts"]) : git(["ls-tree", "-r", "--name-only", head, "--", "content/posts"]))
    .split("\n")
    .map((f) => f.trim())
    .filter((f) => /^content\/posts\/[^/]+\.mdx?$/.test(f));

  // 這段期間沒動到任何文章：記號不推進，下次再看（避免每次 main 有雜項 commit 就多一個記號 commit）
  if (changed.length === 0) process.exit(0);

  // 被刪掉的文章（撤稿）不動存檔；只處理 head 上還在的
  const posts = [];
  for (const rel of changed) {
    try {
      posts.push({ name: path.basename(rel), content: git(["show", `${head}:${rel}`], { raw: true }) });
    } catch {
      /* 在 head 上已不存在 */
    }
  }

  const { copied, unchanged, skipped, files } = archivePosts(posts, matter, { dryRun: DRY_RUN });
  const lines = [];
  const range = `${(base || "root").slice(0, 7)}..${head.slice(0, 7)}`;
  if (copied.length) lines.push(`補存雲端合併的論文導讀到 articles/（${range}）：${copied.join("、")}`);
  if (unchanged.length) lines.push(`已有相同存檔：${unchanged.join("、")}`);
  if (skipped.length) lines.push(`不屬論文導讀，未存：${skipped.join("、")}`);

  if (DRY_RUN) {
    lines.push(`（dry-run：不寫入、不 commit；會把記號推進到 ${head.slice(0, 7)}）`);
    log(lines);
  }

  writeSyncState({ skyfaring_head: head, synced_at: new Date().toISOString(), by: os.hostname() });
  const r = commitArchive(
    [...files, SYNC_STATE_FILE],
    copied.length ? `補存：${copied.join("、")}（skyfaring ${range}）` : `存檔同步記號推進到 ${head.slice(0, 7)}`
  );
  if (r.message) lines.push(r.message);

  // 沒有任何文章被存、也沒出錯：安靜結束，不打擾使用者
  if (copied.length === 0 && r.ok) process.exit(0);
  log(lines);
}

const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) main().catch(() => process.exit(0));
