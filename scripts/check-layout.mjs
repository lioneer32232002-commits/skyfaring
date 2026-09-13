#!/usr/bin/env node
/**
 * 版面機械化檢查工具（headless Chrome + CDP，不裝任何 npm 套件）。
 *
 * 動機：主 session 對版型改版做驗收時，瀏覽器面板截圖不穩定，需要一個可重跑、
 * 可整頁截圖＋自動偵測「孤字」（段落/標題換行後最後一行只剩 1-2 個字）的指令列工具。
 *
 * 用法（Git Bash 會把 /projects/ 這種參數轉成 Windows 路徑，請用 PowerShell 跑，或寫成 //projects/）：
 *   node scripts/check-layout.mjs [--base http://localhost:3000] [--out <dir>]
 *                                  [--widths 375,768,1280] [--dark] [--json] [path ...]
 *
 * 不給 path 時使用預設清單（見 DEFAULT_PATHS）加上 content/posts 裡日期最新的一篇文章。
 * 需要先自行啟動 dev server（本工具不會自動啟動），否則會報清楚的錯誤並結束。
 *
 * 技術筆記：
 * - 用 Node 24 內建全域 WebSocket 連 Chrome DevTools Protocol，不依賴 node_modules 裡的 `ws`。
 * - 啟動 Chrome 用 `--remote-debugging-port=0`，從子行程 stderr 抓
 *   `DevTools listening on ws://...` 取得埠號，再打 `http://127.0.0.1:<port>/json/list`
 *   取得唯一的 page target 的 webSocketDebuggerUrl 連線（比手動呼叫
 *   Target.createTarget 簡單，且整支工具只需要一個分頁）。
 * - 同一個 page target 在不同寬度之間重複使用：每個寬度先呼叫
 *   Emulation.setDeviceMetricsOverride 換視窗寬度，再 Page.navigate 重新整頁載入，
 *   確保用該寬度重新 render（而不是只靠 CSS media query 反應，可能漏掉 client
 *   component 掛載時就決定版面的邏輯）。這比每個寬度各開一個 target 簡單，
 *   序列執行也不會有多個 target 互搶 CPU 的問題。
 * - 整頁截圖：不用 Page.getLayoutMetrics（不同 Chrome 版本欄位語意不穩定），改用
 *   Runtime.evaluate 讀 document.documentElement/body 的 scrollHeight 當作整頁高度，
 *   再用 Page.captureScreenshot 搭配 captureBeyondViewport + 明確 clip 截整頁。
 *   高度會被裁切到 MAX_PHYSICAL_CAPTURE_HEIGHT（實體像素）以內：實測 375 寬
 *   （deviceScaleFactor:2）截一個 CSS 高度四萬多的長頁面會讓 Chrome renderer
 *   直接崩潰、CDP 連線斷掉，且不會有任何逾時或錯誤訊息，整支工具會悄悄卡死。
 *
 * 孤字（orphan）偵測邏輯（在瀏覽器內執行，見 detectOrphansInPage）：
 * 1. 候選元素：h1-h6,p,li,a,button,span,dt,dd,figcaption,td,th,summary,blockquote,label。
 * 2. 去重複做法（避免同一段文字被父/子元素重複計算兩次）：
 *    a) 若元素有「非 inline 的子元素」（例如 <li> 只包一個 display:block 的 <a>），
 *       代表這個元素的文字被子元素的區塊切開，不是單一行流，交給子元素自己判斷，
 *       這個元素本身跳過。
 *    b) 若元素自己是 display:inline，且往上找到的「最近一個非 inline 祖先」剛好也命中
 *       候選選擇器（例如 <p><a>連結</a></p> 的 <a>），代表這個元素只是父層文字流的一部分，
 *       父層會涵蓋它的所有 rect，這個元素本身跳過，只在父層分析一次。
 *    這兩條規則搭配可以涵蓋「行內元素包在區塊容器裡」與「區塊容器裡混了自建版面的行內區塊」
 *    兩種常見巢狀情況，不會兩邊都報。
 * 3. 用 Range.getClientRects() 依 top（容差 2px）分組成行，行數 < 2 直接跳過（沒有換行就
 *    不可能有「最後一行孤字」問題）。
 * 4. 最後一行文字：從文字節點尾端逐字元建立單字元 Range，比對 rect.top 是否還在最後一行
 *    （容差 2px），一旦 top 跳到上一行就停止，往回收集到的字元反轉回正常順序即為最後一行。
 * 5. 判定：去除中英文標點後的字元數 <=1 → ERROR；=2 → WARN；去除標點與空白後只剩空字串
 *    （代表最後一行只有標點）→ ERROR；英文且最後一行只有一個 <=3 字母的單字 → WARN；其餘不標記。
 *
 * 已知簡化／限制（供使用者判斷是否要調整）：
 * - 可見性判定用 offsetParent === null，這會連帶跳過 position:fixed 的元素（例如置頂導覽列）。
 *   這是刻意的簡化：導覽列文字通常本來就短，不是這次要抓的內容區塊孤字，如果之後要驗收
 *   固定導覽列本身的排版，這條規則要另外處理。
 * - `.prose` 內的 p/li 一律跳過（文章內文本來就會自然換行，不在這次檢查範圍）。
 * - 每個寬度都是「換 viewport → 整頁重新 navigate」，不是純粹 resize 觀察 CSS 反應；
 *   如果要驗收的是「同一次載入內响應式縮放」的行為（而非分別載入），這裡的作法不適用。
 */

import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

const DEFAULT_PATHS = [
  "/",
  "/blog/",
  "/projects/",
  "/projects/drone-research/",
  "/projects/starmap/",
  "/topics/defense/",
  "/about/",
  "/tpbl-lens/",
];

const CHROME_CANDIDATES = [
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
];

const NAV_TIMEOUT_MS = 45000; // Next dev server 首次打開路由要現場編譯，給寬一點
const POST_LOAD_WAIT_MS = 800;
// 實測二分找出來的安全上限：對 /blog/（CSS 高度 40251px）在 375 寬
// （deviceScaleFactor:2）用 60000 實體像素會讓 renderer 直接崩潰、CDP 斷線；
// 16384（= 2^14，常見的 GPU 單一 texture 維度上限）可以穩定成功，8000 也穩定，
// 60000 不穩定，因此抓 16384 這個業界常見數字當上限，見 runOneCombo 內的說明。
const MAX_PHYSICAL_CAPTURE_HEIGHT = 16384;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 保底安全網：per-page/width 的整段工作若因為任何未預期原因卡住（不只是導覽逾時），
// 最多等這麼久就強制視為失敗、繼續下一組，避免單一頁面卡死整支工具。
const COMBO_TIMEOUT_MS = NAV_TIMEOUT_MS + 20000;

function withTimeout(promise, ms, label) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} 逾時（${ms}ms）`)), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

// ---------------------------------------------------------------------------
// CLI 參數解析（不用套件，手動掃 argv）
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const opts = {
    base: "http://localhost:3000",
    out: path.join(REPO_ROOT, ".layout-check"),
    widths: [375, 768, 1280],
    dark: false,
    json: false,
    paths: [],
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const eqIndex = arg.startsWith("--") ? arg.indexOf("=") : -1;
    const flag = eqIndex >= 0 ? arg.slice(0, eqIndex) : arg;
    const inlineValue = eqIndex >= 0 ? arg.slice(eqIndex + 1) : null;

    const takeValue = () => {
      if (inlineValue !== null) return inlineValue;
      const next = argv[i + 1];
      i++;
      return next;
    };

    switch (flag) {
      case "--base":
        opts.base = takeValue();
        break;
      case "--out":
        opts.out = path.resolve(takeValue());
        break;
      case "--widths":
        opts.widths = takeValue()
          .split(",")
          .map((s) => parseInt(s.trim(), 10))
          .filter((n) => Number.isFinite(n) && n > 0);
        break;
      case "--dark":
        opts.dark = true;
        break;
      case "--json":
        opts.json = true;
        break;
      default:
        if (arg.startsWith("--")) {
          throw new Error(`不認得的參數：${arg}`);
        }
        opts.paths.push(arg);
        break;
    }
  }

  return opts;
}

// ---------------------------------------------------------------------------
// 預設頁面清單：固定清單 + content/posts 裡日期最新的一篇文章
// ---------------------------------------------------------------------------

function getLatestPostPath() {
  const postsDir = path.join(REPO_ROOT, "content", "posts");
  if (!fs.existsSync(postsDir)) return null;
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));

  let latest = null;
  for (const file of files) {
    const raw = fs.readFileSync(path.join(postsDir, file), "utf8");
    let data;
    try {
      ({ data } = matter(raw));
    } catch {
      continue;
    }
    if (!data || !data.date || !data.slug) continue;
    const dateStr = String(data.date);
    if (!latest || dateStr > latest.date) {
      latest = { date: dateStr, slug: String(data.slug) };
    }
  }

  return latest ? `/blog/${latest.slug}/` : null;
}

function resolvePagePaths(cliPaths) {
  if (cliPaths.length > 0) return cliPaths;
  const paths = [...DEFAULT_PATHS];
  const latest = getLatestPostPath();
  if (latest) paths.push(latest);
  return paths;
}

// ---------------------------------------------------------------------------
// 檔名輔助
// ---------------------------------------------------------------------------

function pathToSlug(urlPath) {
  const trimmed = urlPath.replace(/^\/+|\/+$/g, "");
  return trimmed === "" ? "home" : trimmed.replace(/\//g, "-");
}

// ---------------------------------------------------------------------------
// 找 Chrome / Edge 執行檔
// ---------------------------------------------------------------------------

function findBrowserExecutable() {
  for (const candidate of CHROME_CANDIDATES) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(
    "找不到 Chrome 或 Edge，已檢查以下路徑：\n" + CHROME_CANDIDATES.join("\n")
  );
}

// ---------------------------------------------------------------------------
// dev server 預檢：不自動啟動，只確認有沒有在跑
// ---------------------------------------------------------------------------

async function checkDevServer(base) {
  try {
    await fetch(base, { signal: AbortSignal.timeout(30000) });
  } catch (err) {
    throw new Error(
      `連不到 dev server：${base}\n` +
        `請先手動執行 npm run dev（本工具不會自己啟動 server）。\n` +
        `原始錯誤：${err.message}`
    );
  }
}

// ---------------------------------------------------------------------------
// 啟動 headless Chrome，從 stderr 抓 DevTools websocket URL
// ---------------------------------------------------------------------------

// child.kill() 在 Windows 上只會終止被 spawn 的那個 PID，headless Chrome 底下的
// renderer/utility/crashpad-handler 子行程不會一起結束，實測會留下一堆孤兒 chrome.exe，
// 拖垮後續執行甚至塞爆系統資源。改用 taskkill /t（連子行程樹一起殺）；非 Windows 平台
// 才退回 child.kill()。
function killBrowserTree(child) {
  if (process.platform === "win32" && child.pid) {
    try {
      execFileSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
        stdio: "ignore",
      });
      return;
    } catch {
      // 行程可能已經自己結束了，忽略即可
    }
  }
  try {
    child.kill();
  } catch {
    // ignore
  }
}

function launchBrowser(execPath, userDataDir, initialWidth, initialHeight) {
  const args = [
    "--headless=new",
    "--remote-debugging-port=0",
    `--user-data-dir=${userDataDir}`,
    `--window-size=${initialWidth},${initialHeight}`,
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "about:blank",
  ];
  return spawn(execPath, args, { stdio: ["ignore", "ignore", "pipe"] });
}

function waitForDevtoolsWsUrl(child, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    let buf = "";
    let settled = false;

    const timer = setTimeout(() => {
      finish(() => reject(new Error("等待 Chrome DevTools 逾時")));
    }, timeoutMs);

    function onData(chunk) {
      buf += chunk.toString("utf8");
      const m = buf.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (m) finish(() => resolve(m[1]));
    }

    function onExit(code) {
      finish(() =>
        reject(new Error(`Chrome 在取得 DevTools URL 前就結束了，exit code ${code}`))
      );
    }

    function finish(action) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      child.stderr.off("data", onData);
      child.off("exit", onExit);
      action();
    }

    child.stderr.on("data", onData);
    child.on("exit", onExit);
  });
}

async function getPageWsUrl(port, retries = 30) {
  const listUrl = `http://127.0.0.1:${port}/json/list`;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(listUrl, { signal: AbortSignal.timeout(2000) });
      const list = await res.json();
      const page = list.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      // Chrome 可能還沒就緒，繼續重試
    }
    await sleep(300);
  }
  throw new Error("取不到 Chrome 的 page target，可能還沒就緒或已崩潰");
}

// ---------------------------------------------------------------------------
// 極簡 CDP client：id 對應 pending Promise，method 對應事件監聽
// ---------------------------------------------------------------------------

class CDPClient {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    this.closed = false;

    ws.addEventListener("message", (ev) => {
      let msg;
      try {
        msg = JSON.parse(ev.data);
      } catch {
        return;
      }
      if (msg.id !== undefined && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
        else resolve(msg.result);
      } else if (msg.method) {
        const cbs = this.listeners.get(msg.method);
        if (cbs) for (const cb of [...cbs]) cb(msg.params);
      }
    });

    // 關鍵修正：WebSocket 斷線（例如 renderer target 崩潰、Chrome 整個掛掉）時，
    // 若不主動 reject 所有還在等待回應的 send()，那些 Promise 會永遠 pending。
    // Node 的事件迴圈在 WebSocket 關閉、沒有其他 timer/IO 的情況下會判定「無事可做」
    // 而自然結束行程，不會拋出任何錯誤、也不會走到 catch，看起來就像整支工具
    // 「跑到一半悄悄消失」。實測就是踩到這個：換頁到第二個 path 時 renderer 掛掉，
    // 之後完全沒有任何 [fail] 訊息，process 卻在幾分鐘後以 exit code 0 結束。
    ws.addEventListener("close", (ev) =>
      this.forceDisconnect(`close code=${ev.code} reason=${ev.reason || "(無)"}`)
    );
    ws.addEventListener("error", (ev) => this.forceDisconnect(`error ${ev.message || ev}`));
  }

  // 供 ws close/error 呼叫，也給 Inspector.targetCrashed 這類「連線沒斷但頁面已經死了」
  // 的情況主動呼叫，讓所有卡住的 send() 立刻用明確錯誤結束，不要一路撐到 45 秒逾時。
  forceDisconnect(reason) {
    if (this.closed) return;
    this.closed = true;
    const err = new Error(`CDP 連線已中斷：${reason}`);
    for (const { reject } of this.pending.values()) reject(err);
    this.pending.clear();
  }

  send(method, params = {}) {
    if (this.closed) {
      return Promise.reject(new Error(`CDP WebSocket 已斷線，無法送出 ${method}`));
    }
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  on(method, cb) {
    if (!this.listeners.has(method)) this.listeners.set(method, new Set());
    this.listeners.get(method).add(cb);
    return () => this.listeners.get(method)?.delete(cb);
  }

  waitFor(method, timeoutMs = NAV_TIMEOUT_MS) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        off();
        reject(new Error(`等待事件 ${method} 逾時`));
      }, timeoutMs);
      const off = this.on(method, (params) => {
        clearTimeout(timer);
        off();
        resolve(params);
      });
    });
  }
}

async function gotoAndWaitLoad(client, url) {
  const loadPromise = client.waitFor("Page.loadEventFired", NAV_TIMEOUT_MS);
  await client.send("Page.navigate", { url });
  await loadPromise;
}

// ---------------------------------------------------------------------------
// 孤字偵測（這個函式整包序列化後丟進瀏覽器執行，只能用 DOM API，不能引用外部變數）
// ---------------------------------------------------------------------------

function detectOrphansInPage() {
  const SELECTOR =
    "h1,h2,h3,h4,h5,h6,p,li,a,button,span,dt,dd,figcaption,td,th,summary,blockquote,label";
  const PUNCT_RE =
    /[，。、；：？！」『』（）〈〉《》〔〕【】,.;:!?'"()[\]{}<>\-—~]/g;

  function isVisible(el) {
    if (el.closest('[aria-hidden="true"]')) return false;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") return false;
    if (el.offsetParent === null) return false;
    return true;
  }

  function isInline(el) {
    return getComputedStyle(el).display === "inline";
  }

  function hasNonInlineElementChild(el) {
    for (const child of el.children) {
      if (!isInline(child)) return true;
    }
    return false;
  }

  function nearestBlockAncestorMatches(el) {
    let node = el.parentElement;
    while (node) {
      const cs = getComputedStyle(node);
      if (cs.display !== "inline" && cs.display !== "contents") {
        return node.matches(SELECTOR) ? node : null;
      }
      node = node.parentElement;
    }
    return null;
  }

  function countLines(el) {
    const range = document.createRange();
    range.selectNodeContents(el);
    const rects = Array.from(range.getClientRects()).filter(
      (r) => r.width > 0.5 && r.height > 0.5
    );
    const tops = [];
    for (const r of rects) {
      if (!tops.some((t) => Math.abs(t - r.top) <= 2)) tops.push(r.top);
    }
    return tops.length;
  }

  function buildCharList(el) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const chars = [];
    let node;
    while ((node = walker.nextNode())) {
      const text = node.nodeValue;
      for (let i = 0; i < text.length; i++) chars.push({ node, index: i, ch: text[i] });
    }
    return chars;
  }

  function getLastLineText(chars) {
    let lastTop = null;
    const collected = [];
    for (let i = chars.length - 1; i >= 0; i--) {
      const c = chars[i];
      if (lastTop === null && /\s/.test(c.ch)) continue; // 忽略尾端純空白
      let rect = null;
      try {
        const r = document.createRange();
        r.setStart(c.node, c.index);
        r.setEnd(c.node, c.index + 1);
        rect = r.getClientRects()[0] || null;
      } catch {
        rect = null;
      }
      if (!rect || (rect.width === 0 && rect.height === 0)) {
        collected.push(c.ch);
        continue;
      }
      if (lastTop === null) {
        lastTop = rect.top;
        collected.push(c.ch);
        continue;
      }
      if (Math.abs(rect.top - lastTop) <= 2) {
        collected.push(c.ch);
      } else {
        break;
      }
    }
    return collected.reverse().join("");
  }

  function classify(lastLineRaw) {
    const noPunct = lastLineRaw.replace(PUNCT_RE, "");
    const trimmed = noPunct.trim();
    if (trimmed === "") return "ERROR";
    const charCount = trimmed.replace(/\s+/g, "").length;
    if (charCount <= 1) return "ERROR";
    if (charCount === 2) return "WARN";
    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length === 1 && /^[A-Za-z]+$/.test(words[0]) && words[0].length <= 3) {
      return "WARN";
    }
    return null;
  }

  function shortSelector(el) {
    const parts = [];
    let node = el;
    let depth = 0;
    while (node && node.nodeType === 1 && depth < 4) {
      let part = node.tagName.toLowerCase();
      if (node.classList && node.classList.length) {
        part += "." + Array.from(node.classList).slice(0, 2).join(".");
      }
      parts.unshift(part);
      node = node.parentElement;
      depth++;
    }
    return parts.join(" > ");
  }

  const results = [];
  const candidates = document.querySelectorAll(SELECTOR);
  for (const el of candidates) {
    if (!isVisible(el)) continue;
    if ((el.tagName === "P" || el.tagName === "LI") && el.closest(".prose")) continue;
    const text = el.textContent.trim();
    if (!text) continue;
    if (hasNonInlineElementChild(el)) continue;
    if (isInline(el) && nearestBlockAncestorMatches(el)) continue;

    const lineCount = countLines(el);
    if (lineCount < 2) continue;

    // line-clamp 截掉的行在畫面上看不到，Range 卻仍算得到它們的 rect。
    // 被截掉時可見的最後一行以刪節號收尾、寬度是滿的，沒有孤字問題，整個元素跳過；
    // 沒被截掉（行數在 clamp 以內）才照常檢查最後一行。
    const clamp = parseInt(getComputedStyle(el).webkitLineClamp, 10);
    if (Number.isFinite(clamp) && clamp > 0 && lineCount > clamp) continue;

    const chars = buildCharList(el);
    const lastLine = getLastLineText(chars);
    const level = classify(lastLine);
    if (!level) continue;

    results.push({
      level,
      tag: el.tagName.toLowerCase(),
      text: text.slice(0, 60),
      lastLine: lastLine.trim(),
      selector: shortSelector(el),
    });
  }
  return results;
}

async function runOrphanDetection(client) {
  const expression = `(${detectOrphansInPage.toString()})()`;
  const evalResult = await client.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: false,
  });
  if (evalResult.exceptionDetails) {
    throw new Error(`頁面內孤字偵測腳本出錯：${evalResult.exceptionDetails.text}`);
  }
  return evalResult.result?.value || [];
}

async function getFullPageHeight(client) {
  const evalResult = await client.send("Runtime.evaluate", {
    expression:
      "Math.max(document.body ? document.body.scrollHeight : 0, document.documentElement.scrollHeight, document.documentElement.clientHeight)",
    returnByValue: true,
  });
  const value = evalResult.result?.value;
  return Number.isFinite(value) && value > 0 ? Math.ceil(value) : 800;
}

async function captureFullPage(client, outPath, width, height) {
  const { data } = await client.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width, height, scale: 1 },
  });
  fs.writeFileSync(outPath, Buffer.from(data, "base64"));
}

// ---------------------------------------------------------------------------
// 主流程
// ---------------------------------------------------------------------------

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const pagePaths = resolvePagePaths(opts.paths);

  await checkDevServer(opts.base);

  fs.mkdirSync(opts.out, { recursive: true });

  const execPath = findBrowserExecutable();
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "layout-check-"));
  const initialWidth = Math.max(...opts.widths, 1280);

  const child = launchBrowser(execPath, userDataDir, initialWidth, 1200);
  let client = null;
  const findings = [];
  const errors = [];

  try {
    const wsUrl = await waitForDevtoolsWsUrl(child);
    const port = new URL(wsUrl).port;
    const pageWsUrl = await getPageWsUrl(port);

    const ws = new WebSocket(pageWsUrl);
    await new Promise((resolve, reject) => {
      ws.addEventListener("open", () => resolve(), { once: true });
      ws.addEventListener(
        "error",
        (e) => reject(new Error("WebSocket 連線失敗：" + e.message)),
        { once: true }
      );
    });

    client = new CDPClient(ws);
    await client.send("Page.enable");
    await client.send("Runtime.enable");

    for (const pagePath of pagePaths) {
      const url = new URL(pagePath, opts.base).toString();

      for (const width of opts.widths) {
        const isMobileWidth = width === 375;
        const deviceScaleFactor = isMobileWidth ? 2 : 1;

        const runOneCombo = async () => {
          await client.send("Emulation.setDeviceMetricsOverride", {
            width,
            height: 900,
            deviceScaleFactor,
            mobile: isMobileWidth,
          });

          await client.send("Emulation.setEmulatedMedia", {
            features: [
              { name: "prefers-color-scheme", value: opts.dark ? "dark" : "light" },
            ],
          });

          await gotoAndWaitLoad(client, url);
          await sleep(POST_LOAD_WAIT_MS);

          const orphans = await runOrphanDetection(client);
          for (const o of orphans) {
            findings.push({ ...o, path: pagePath, width });
          }

          let fullHeight = await getFullPageHeight(client);
          // 實測踩到的坑：deviceScaleFactor:2（375 寬那組）遇到很長的頁面（例如
          // /blog/ 文章列表全部攤開，CSS 高度四萬多）時，實體高度 = CSS 高度 * 2
          // 會超過 Chrome 這台機器上能穩定 rasterize 的單一 surface 高度，
          // Page.captureScreenshot 直接讓 renderer 崩潰，CDP WebSocket 跟著斷線
          // ——不會有任何逾時或一般錯誤訊息，只會整段卡死，後面所有頁面全部陪葬。
          // 這裡主動把 CSS 高度限制在「實體高度不超過 MAX_PHYSICAL_CAPTURE_HEIGHT」，
          // 超過就裁切並印警告，寧可截圖不是完整整頁，也不要讓整個 headless session
          // 死掉、拖累後面所有頁面。
          const maxCssHeight = Math.floor(MAX_PHYSICAL_CAPTURE_HEIGHT / deviceScaleFactor);
          if (fullHeight > maxCssHeight) {
            console.error(
              `[warn] ${pagePath} @ ${width}px 頁面過長（${fullHeight}px），` +
                `實體高度會超過 Chrome 的 raster 上限，裁切到 ${maxCssHeight}px`
            );
            fullHeight = maxCssHeight;
          }

          const shotName = `${pathToSlug(pagePath)}-${width}${opts.dark ? "-dark" : ""}.png`;
          await captureFullPage(client, path.join(opts.out, shotName), width, fullHeight);

          console.log(`[ok] ${pagePath} @ ${width}px -> ${shotName}`);
        };

        try {
          await withTimeout(runOneCombo(), COMBO_TIMEOUT_MS, `${pagePath} @ ${width}px`);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          errors.push({ path: pagePath, width, message });
          console.error(`[fail] ${pagePath} @ ${width}px: ${message}`);
        }
      }
    }
  } finally {
    try {
      if (client) client.ws.close();
    } catch {
      // ignore
    }
    killBrowserTree(child);
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {
      // Windows 上 Chrome 行程可能還沒完全釋放檔案鎖，忽略即可
    }
  }

  printReport(findings, errors, opts);

  if (opts.json) {
    const reportPath = path.join(opts.out, "report.json");
    fs.writeFileSync(
      reportPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          base: opts.base,
          widths: opts.widths,
          dark: opts.dark,
          pages: pagePaths,
          findings,
          errors,
        },
        null,
        2
      )
    );
    console.log(`\n完整 JSON 報告：${reportPath}`);
  }

  const errorCount = findings.filter((f) => f.level === "ERROR").length;
  if (errorCount > 0 || errors.length > 0) {
    process.exitCode = 1;
  }
}

function printReport(findings, navErrors, opts) {
  console.log("\n=== 摘要 ===");
  const summaryMap = new Map();
  for (const pagePath of new Set(findings.map((f) => f.path))) {
    for (const width of opts.widths) {
      const key = `${pagePath}@${width}`;
      summaryMap.set(key, { path: pagePath, width, ERROR: 0, WARN: 0 });
    }
  }
  for (const f of findings) {
    const key = `${f.path}@${f.width}`;
    if (!summaryMap.has(key)) {
      summaryMap.set(key, { path: f.path, width: f.width, ERROR: 0, WARN: 0 });
    }
    summaryMap.get(key)[f.level]++;
  }
  const summaryRows = [...summaryMap.values()].sort(
    (a, b) => a.path.localeCompare(b.path) || a.width - b.width
  );
  if (summaryRows.length > 0) {
    console.table(summaryRows);
  } else {
    console.log("（無頁面完成偵測，或全部零發現）");
  }

  console.log("\n=== 逐筆列表 ===");
  if (findings.length === 0) {
    console.log("沒有偵測到孤字。");
  } else {
    for (const f of findings) {
      console.log(
        `[${f.level}] width=${f.width} path=${f.path}\n` +
          `  lastLine="${f.lastLine}"  tag=<${f.tag}>  selector=${f.selector}\n` +
          `  text="${f.text}"`
      );
    }
  }

  if (navErrors.length > 0) {
    console.log("\n=== 執行失敗的頁面／寬度 ===");
    for (const e of navErrors) {
      console.log(`[fail] path=${e.path} width=${e.width}: ${e.message}`);
    }
  }

  const errorCount = findings.filter((f) => f.level === "ERROR").length;
  const warnCount = findings.filter((f) => f.level === "WARN").length;
  console.log(`\n總計：ERROR ${errorCount}、WARN ${warnCount}、執行失敗 ${navErrors.length}`);
}

main().catch((err) => {
  console.error("執行失敗：", err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
