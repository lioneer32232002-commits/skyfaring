#!/usr/bin/env node
/**
 * PostToolUse hook 轉接器：Write/Edit 動到 content/posts/*.md 時，
 * 跑格式檢查並把結果以 additionalContext 回給 Claude（純提醒，不阻擋、不改檔）。
 *
 * 非文章檔（站台程式等）一律無動作，零干擾。
 * 任何例外都吞掉並 exit 0，確保永遠不會卡住正常編輯。
 */
function readStdin() {
  return new Promise((resolve) => {
    let buf = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (c) => (buf += c));
    process.stdin.on("end", () => resolve(buf));
    // 沒有 stdin 時不要永遠等下去
    setTimeout(() => resolve(buf), 2000).unref?.();
  });
}

function isPostFile(p) {
  if (!p) return false;
  const norm = String(p).replace(/\\/g, "/");
  // 絕對路徑（…/content/posts/foo.md）或相對路徑（content/posts/foo.md）都接受
  return /(^|\/)content\/posts\/[^/]+\.mdx?$/.test(norm);
}

async function main() {
  let input = {};
  try {
    const raw = await readStdin();
    if (raw && raw.trim()) input = JSON.parse(raw);
  } catch {
    process.exit(0); // 讀不到輸入就安靜退出
  }

  const filePath = input?.tool_input?.file_path;
  if (!isPostFile(filePath)) process.exit(0);

  let result;
  try {
    // 動態 import：就算檢查器或其相依（gray-matter）載入失敗，也安靜退出，不卡編輯
    const mod = await import("../check-post.mjs");
    result = mod.checkPost(filePath);
  } catch {
    process.exit(0);
  }

  const { errors = [], warnings = [] } = result;
  if (errors.length === 0 && warnings.length === 0) process.exit(0);

  const parts = [];
  parts.push(`文章格式檢查（${filePath.replace(/\\/g, "/").split("/content/posts/")[1] ?? filePath}）：`);
  if (errors.length) {
    parts.push(`需修正 ${errors.length} 項（發文前必須清掉）：`);
    for (const e of errors) parts.push(`  ✗ ${e}`);
  }
  if (warnings.length) {
    parts.push(`待確認 ${warnings.length} 項（除非來源原文真的這樣用）：`);
    for (const w of warnings) parts.push(`  ! ${w}`);
  }
  parts.push("這是提醒，不阻擋編輯；發文前請把 ✗ 項清乾淨。");

  const out = {
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: parts.join("\n"),
    },
  };
  // 等 stdout 真正寫出再退出，避免 process.exit 截斷輸出
  process.stdout.write(JSON.stringify(out), () => process.exit(0));
}

main();
