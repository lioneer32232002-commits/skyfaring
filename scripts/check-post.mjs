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
  "值得一提的是",
  "歸根究柢",
  "歸根結柢",
  "某程度",
  "縮影",
  "弔詭",
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
  "擺在一起看",
  "攤開來",
  "對得上",
  "交集就是",
  "湊在同一",
  "浮出來",
];

// 中國用語（台灣慣用語對照，除非引文原文如此）
const CN_TERM_PATTERNS = [
  { re: /幹活|活兒|的活(?=[。，、；：！？\s」』）])/, label: "「活」當「工作」講（幹活／練的活／活兒），改「事、工作、本事」" },
  { re: /視頻/, label: "「視頻」，改「影片」" },
  { re: /信息/, label: "「信息」，改「資訊」" },
  { re: /質量(?!守恆|數)/, label: "「質量」（指品質時），改「品質」" },
  { re: /軟件|硬件/, label: "「軟件／硬件」，改「軟體／硬體」" },
  { re: /網絡/, label: "「網絡」，改「網路」" },
  { re: /水平(?=[偏很不高低]|[。，、；：！？\s」』）])/, label: "「水平」（指程度時），改「水準」" },
  { re: /立馬/, label: "「立馬」，改「立刻」" },
  { re: /靠譜/, label: "「靠譜」，改「可靠」" },
  { re: /(?<![演預結清決])算法/, label: "「算法」（單獨使用時），改「演算法」" },
  { re: /可視化/, label: "「可視化」，改「視覺化」" },
  { re: /貝葉斯/, label: "「貝葉斯」，改「貝氏」" },
  { re: /智能體/, label: "「智能體／多智能體」，改「代理人／多代理人」" },
  { re: /承托/, label: "「承托板／承托」（球鞋部件），改「碳纖維板」「抗扭片」「支撐」" },
  { re: /車間(?!距)/, label: "「車間」（工廠廠區），改「廠房」「工場」" },
];

// AI 腔對比句式（正則）
const AI_TIC_PATTERNS = [
  { re: /不是[^，。\n]{1,14}，?而是/, label: "「不是 X，而是 Y」對比句式" },
  { re: /表面上[^，。\n]{1,14}，?實際上/, label: "「表面上 X，實際上 Y」句式" },
  { re: /從來不是/, label: "「從來不是 X」句式" },
  { re: /真正的[^，。\n]{1,10}，是/, label: "「真正的 X，是 Y」句式" },
  { re: /的背後，是/, label: "「X 的背後，是 Y」句式" },
  { re: /這不僅是[^，。\n]{1,14}，更是/, label: "「這不僅是 X，更是 Y」句式" },
  { re: /不在於[^，。\n]{1,20}，?而在於/, label: "「關鍵不在於 X，而在於 Y」句式" },
  { re: /以為[^，。\n]{1,14}，?其實/, label: "「你以為是 A，其實是 B」句式" },
  { re: /看似[^，。\n]{1,14}，?(其實|實則|但)/, label: "「看似 X，其實 Y」悖論化句式" },
  { re: /更?深層(地|一層)?[看想]|深一層看/, label: "「更深層地看」句式" },
  { re: /真正的問題/, label: "「真正的問題是……」句式" },
  { re: /隨著[^，。\n]{1,16}的發展/, label: "「隨著……的發展」開場套語" },
  { re: /在當今[^，。\n]{0,8}的?時代/, label: "「在當今……的時代」開場套語" },
  { re: /這個數字(裡|背後|的意思|意味)/, label: "「這個數字」回指式推進（數字出現當下就解讀完）" },
  { re: /欄位/, label: "「欄位」疑似當比喻（只能指真實表格或資料庫的欄位）" },
  { re: /一筆[^，。\n]{0,8}帳/, label: "「一筆帳」比喻（除非指真實的金額計算）" },
  { re: /算不[清平]的帳/, label: "「算不清的帳」比喻" },
  { re: /卻[^，。\n]{0,6}難反駁/, label: "「最不浪漫卻最難反駁」式框架" },
  { re: /，(講|說|指|寫)的(都)?是同[一樣]/, label: "自我複述定性句（「……，講的是同一次任務」）：把剛寫完的句子再定性一次，不增加資訊" },
  { re: /[打撐扛]不[動起](一|這)?場?(仗|硬仗|戰爭|戰役)/, label: "概括斷言代替具體事實（「九個人打不動一場仗」）：改寫他們實際帶什麼、能做什麼" },
  { re: /後來還是/, label: "「後來還是」undercut：前一句剛講成功，這句又推翻，讀者不知道結果。把時序寫清楚" },
  { re: /[排擺湊抄拼]在一起|[攤排擺]開來/, label: "並列歸納句式（「擺在一起看」「抄在一起」「攤開來」）：共同點要直接指認，不靠排在一起自己浮現" },
  { re: /(查得出來|很明確|很清楚|很直白|很簡單|很單純|講得很白|說得很白|只有一個)：/, label: "宣告式引子句（「身分查得出來：」「需求很明確：」「說法很直白：」）：宣告句沒有資訊，刪掉直接寫內容" },
  { re: /建立在[^，。\n]{0,10}(條件|前提|基礎)上/, label: "抽象歸納句（「都建立在同一個條件上」）：共同點用具體事實直接寫，不先蓋抽象名詞" },
];

// 可讀性（非 AI 腔，但讀者會讀錯意思）
const READABILITY_PATTERNS = [
  { re: /不[是算][^，。\n]{0,8}沒有/, label: "雙重否定（「答案不是「完全沒有」」）：解釋數字時正面直述，改「75 人選了「有幾天」以上」" },
  { re: /並非沒有|並非不|不是不|沒有人不|無一不/, label: "雙重否定：改成正面直述（問卷選項、法規條文照抄原文不在此限）" },
  { re: /達標(?=[\s\S]*(篩檢|篩出|量表|憂鬱|焦慮|盛行率|陽性|PHQ))|(篩檢|篩出|量表|憂鬱|焦慮|盛行率|陽性|PHQ)[\s\S]*達標/, label: "「達標」用在篩檢陽性會被讀成「達成目標」，改「被篩出X」「分數落在X範圍」" },
  { re: /(過了|通過)[^，。\n]{0,8}篩檢|(過了|通過)[^，。\n]{0,10}(憂鬱|焦慮|症狀|疾患|陽性|自殺|風險|篩檢|量表|PHQ)[^，。\n]{0,6}門檻|(篩檢|量表|PHQ|憂鬱|焦慮)[^。\n]{0,20}(過了|通過)[^，。\n]{0,8}門檻/, label: "「過了門檻／通過篩檢」讀起來像通過檢驗＝健康，意思正好相反，改「被篩出X」「篩檢陽性」" },
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

  // 5. date 格式（YAML 會把未加引號的日期解析成 Date 物件，屬合法格式）
  if (data.date && !(data.date instanceof Date) && !/^\d{4}-\d{2}-\d{2}$/.test(String(data.date))) {
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

  // 9a2. 粗體強調（**…**），反面清單一律禁止（靠段落結構製造層級）
  for (const { n, text } of lines) {
    if (/\*\*[^*\n]+\*\*/.test(text)) {
      add(errors, `第 ${n} 行有粗體強調（**…**），一律禁用，靠段落結構製造層級`);
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

  // 9f2. 可讀性（雙重否定、正負向會被讀反的詞）— 全文（含 frontmatter 顯示欄位）
  for (const { re, label } of READABILITY_PATTERNS) {
    if (re.test(haystack)) add(warnings, `可讀性：${label}`);
  }

  // 9g. 中國用語（台灣慣用語對照）
  for (const { re, label } of CN_TERM_PATTERNS) {
    if (re.test(haystack)) add(warnings, `疑似中國用語：${label}（除非引文原文如此）`);
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
