#!/usr/bin/env node
/**
 * 文章格式守門員（確定性檢查，非 LLM）。
 *
 * 對照 CLAUDE.md 的發文規範逐項檢查單篇文章，回報問題。
 * 兩種嚴重度：
 *   ERROR — 高信心、會影響頁面或違反硬規則（缺必填欄位、作者錯、slug 不符、破折號、純文字來源區塊）
 *   WARN  — 需人judgement（AI 腔句式、盤古之白、標題標點、重複標題、h1）；CLAUDE.md 對這些有「除非原文真的這樣用」的例外
 *
 * 用法：
 *   node scripts/check-post.mjs content/posts/foo.md [more.md ...]
 * 結束碼：有任何 ERROR → 1，否則 0。WARN 不影響結束碼。
 *
 * 只做檢查與回報，絕不修改檔案。
 */
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import matter from "gray-matter";

const AUTHOR_FIXED = "AI 初稿 / skyfaring 編輯校正";

const REQUIRED_STRING_FIELDS = [
  "title",
  "author",
  "date",
  "slug",
  "excerpt",
  "heroImage",
  "heroAlt",
  "heroCredit",
  "heroCreditUrl",
  "highlight",
];

// 高信號 AI 腔字串（出現即提醒，由人判斷是否來源原文真的這樣用）
const AI_TIC_SUBSTRINGS = [
  "值得注意的是",
  "不容忽視的是",
  "顯而易見",
  "綜上所述",
  "總結來說",
  "歸根結底",
  "說到底",
  "換句話說",
  "某種程度上",
  "某種意義上",
  "眾所周知",
  "本文將探討",
  "不難發現",
  "我們可以看到",
  "這意味著",
  "更重要的是",
  "雙面刃",
  "冰山一角",
  "一言以蔽之",
  "時間會給出答案",
  "值得我們深思",
  "與其說",
  "不如說",
  "事實上",
  "進行一個",
];

// AI 腔對比句式（正則）
const AI_TIC_PATTERNS = [
  { re: /不是[^，。\n]{1,14}，?而是/, label: "「不是 X，而是 Y」對比句式" },
  { re: /表面上[^，。\n]{1,14}，?實際上/, label: "「表面上 X，實際上 Y」句式" },
  { re: /從來不是/, label: "「從來不是 X」句式" },
  { re: /真正的[^，。\n]{1,10}，是/, label: "「真正的 X，是 Y」句式" },
  { re: /的背後，是/, label: "「X 的背後，是 Y」句式" },
  { re: /這不僅是[^，。\n]{1,14}，更是/, label: "「這不僅是 X，更是 Y」句式" },
  { re: /隨著[^，。\n]{1,16}的發展/, label: "「隨著……的發展」開場套語" },
  { re: /在當今[^，。\n]{0,8}的?時代/, label: "「在當今……的時代」開場套語" },
];

const CJK = "一-鿿㐀-䶿";

function isQuestionTitle(s) {
  return s.includes("嗎") || /[?？]/.test(s);
}

function endsWithSentencePunc(s) {
  return /[。？]$/.test(s.trim());
}

// 偵測中英文之間缺半形空格，回傳命中的片段樣本
function panguMisses(s) {
  const out = [];
  const reA = new RegExp(`[${CJK}][A-Za-z0-9]`, "g");
  const reB = new RegExp(`[A-Za-z0-9][${CJK}]`, "g");
  let m;
  while ((m = reA.exec(s))) out.push(m[0]);
  while ((m = reB.exec(s))) out.push(m[0]);
  return [...new Set(out)];
}

// 把 body 拆成「非程式碼區塊」的行（略過 ``` fenced code）。
// lineOffset = body 在原始檔中的起始行（讓回報的行號對到檔案實際行號）。
function bodyLinesOutsideCode(body, lineOffset = 0) {
  const lines = body.split(/\r?\n/);
  const out = [];
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (!inFence) out.push({ n: i + 1 + lineOffset, text: line });
  }
  return out;
}

export function checkPost(filePath) {
  const errors = [];
  const warnings = [];
  const add = (arr, msg) => arr.push(msg);

  let raw;
  try {
    raw = fs.readFileSync(filePath, "utf8");
  } catch (e) {
    return { errors: [`讀檔失敗：${e.message}`], warnings: [] };
  }

  let data, body;
  try {
    const parsed = matter(raw);
    data = parsed.data || {};
    body = parsed.content || "";
  } catch (e) {
    return { errors: [`frontmatter 解析失敗（YAML 可能格式錯誤）：${e.message}`], warnings: [] };
  }

  // 1. 必填字串欄位
  for (const f of REQUIRED_STRING_FIELDS) {
    const v = data[f];
    if (v === undefined || v === null || String(v).trim() === "") {
      add(errors, `缺少必填欄位 \`${f}\``);
    }
  }

  // 2. tags 至少一個
  if (!Array.isArray(data.tags) || data.tags.length === 0) {
    add(errors, "缺少 `tags`（至少需一個）");
  }

  // 3. author 固定值
  if (data.author && data.author !== AUTHOR_FIXED) {
    add(errors, `author 應為「${AUTHOR_FIXED}」，目前是「${data.author}」`);
  }

  // 4. slug = 檔名
  const base = path.basename(filePath).replace(/\.mdx?$/, "");
  if (data.slug && data.slug !== base) {
    add(errors, `slug（${data.slug}）與檔名（${base}）不一致`);
  }

  // 5. date 格式
  if (data.date && !/^\d{4}-\d{2}-\d{2}$/.test(String(data.date))) {
    add(warnings, `date 格式建議 YYYY-MM-DD，目前是「${data.date}」`);
  }

  // 6. heroImage 路徑
  if (data.heroImage && !String(data.heroImage).startsWith("/images/")) {
    add(warnings, `heroImage 路徑通常為 /images/...，目前是「${data.heroImage}」`);
  }

  // 7. 標題標點規則
  if (data.title) {
    const t = String(data.title);
    const hasComma = t.includes("，");
    const isQ = isQuestionTitle(t);
    if ((hasComma || isQ) && !endsWithSentencePunc(t)) {
      add(warnings, "標題含逗號或為問句，結尾需補。或？");
    }
    if (!hasComma && !isQ && /。$/.test(t.trim())) {
      add(warnings, "純短語標題（無逗號、非問句）不應以。結尾");
    }
  }

  // 8. 盤古之白（title + excerpt；body 與 highlight 由渲染端 addPangu 自動處理，不查）
  for (const f of ["title", "excerpt"]) {
    if (data[f]) {
      const miss = panguMisses(String(data[f]));
      if (miss.length) {
        add(warnings, `${f} 中英文間疑似缺半形空格：${miss.slice(0, 6).join("、")}`);
      }
    }
  }

  // 8b. frontmatter 顯示欄位的破折號（會直接渲染到頁面）
  for (const f of ["title", "excerpt", "highlight"]) {
    if (data[f] && /[—―]/.test(String(data[f]))) {
      add(errors, `${f} 含破折號（——/—），一律禁用，改逗號或分段`);
    }
  }

  // 9. body 檢查（行號對到檔案實際行）
  const bodyStart = raw.indexOf(body);
  const lineOffset = bodyStart >= 0 ? raw.slice(0, bodyStart).split(/\r?\n/).length - 1 : 0;
  const lines = bodyLinesOutsideCode(body, lineOffset);

  // 9a. 破折號（— U+2014 / ― U+2015），無例外
  for (const { n, text } of lines) {
    if (/[—―]/.test(text)) {
      add(errors, `第 ${n} 行有破折號（——/—），一律禁用，改逗號或分段`);
    }
  }

  // 9b. 純文字「本文資料來源」區塊
  for (const { n, text } of lines) {
    if (/本文資料來源/.test(text)) {
      add(errors, `第 ${n} 行有「本文資料來源」純文字區塊，來源請用 frontmatter 的 source/references`);
    }
  }

  // 9c. body 內 h1（# ）
  for (const { n, text } of lines) {
    if (/^#\s+\S/.test(text)) {
      add(warnings, `第 ${n} 行用了 # 一級標題，內文請用 ## 以下`);
    }
  }

  // 9d. 重複的 ## 標題
  const h2seen = new Map();
  for (const { n, text } of lines) {
    const m = text.match(/^##\s+(.+?)\s*$/);
    if (m) {
      const key = m[1].trim();
      if (h2seen.has(key)) {
        add(warnings, `重複的段落標題「${key}」（第 ${h2seen.get(key)} 行與第 ${n} 行）`);
      } else {
        h2seen.set(key, n);
      }
    }
  }

  // 9e. ## 標題標點
  for (const { n, text } of lines) {
    const m = text.match(/^##\s+(.+?)\s*$/);
    if (m) {
      const h = m[1].trim();
      const hasComma = h.includes("，");
      const isQ = isQuestionTitle(h);
      if ((hasComma || isQ) && !endsWithSentencePunc(h)) {
        add(warnings, `第 ${n} 行子標題「${h}」含逗號或為問句，結尾需補。或？`);
      }
    }
  }

  // 9f. AI 腔（字串 + 句式）— 全文（含 frontmatter 顯示欄位）
  const haystack = [data.title, data.excerpt, data.highlight, body]
    .filter(Boolean)
    .join("\n");
  for (const s of AI_TIC_SUBSTRINGS) {
    if (haystack.includes(s)) add(warnings, `疑似 AI 腔用語「${s}」（除非來源原文真的這樣用）`);
  }
  for (const { re, label } of AI_TIC_PATTERNS) {
    if (re.test(haystack)) add(warnings, `疑似 AI 腔：${label}（除非來源原文真的這樣用）`);
  }

  return { errors, warnings };
}

// ---- CLI ----
function isMainModule() {
  return process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
}

if (isMainModule()) {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error("用法：node scripts/check-post.mjs <file.md> [...]");
    process.exit(2);
  }
  let totalErrors = 0;
  for (const f of files) {
    const { errors, warnings } = checkPost(f);
    totalErrors += errors.length;
    const rel = path.relative(process.cwd(), f) || f;
    if (errors.length === 0 && warnings.length === 0) {
      console.log(`✓ ${rel} — 通過`);
      continue;
    }
    console.log(`\n${rel}`);
    for (const e of errors) console.log(`  ✗ ERROR  ${e}`);
    for (const w of warnings) console.log(`  ! WARN   ${w}`);
  }
  console.log(`\n共 ${files.length} 篇，ERROR ${totalErrors} 項`);
  process.exit(totalErrors > 0 ? 1 : 0);
}

export { fileURLToPath };
