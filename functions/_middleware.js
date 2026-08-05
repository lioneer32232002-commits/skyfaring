// 舊網址 skyfaring.pages.dev 與 www 子網域一律轉到正式網域，路徑與參數原樣保留
// 只轉列出的主機，不轉 preview 部署（<hash>.skyfaring.pages.dev），保留預覽測試能力
// GET/HEAD 用 301；其他方法用 308，避免瀏覽器把 POST 改成 GET
//
// ⚠️ 這支檔案在 functions/ 根目錄，Pages 預設會讓**全站每一個請求**都先進來，
// 連 `_next/` 的 JS／CSS chunk 與圖片都各算一次 Functions 呼叫（實測首頁 13 個請求
// 裡有 12 個是靜態檔）。免費方案的 10 萬次／日是**整個帳號 13 個 Pages 專案共用**的，
// 姊妹專案 flight-deck 2026-08-04 就是這樣一天燒掉 74,213 次、收到 75% 警告信。
// 因此 `public/_routes.json` 把靜態路徑排除掉，只有 HTML 文件會進到這裡。
// 放在 public/ 是因為 Pages 讀的是建置產物 `out/`，而 Next 的 static export 會把
// public/ 原樣複製過去。**新增靜態目錄時要一起加進那份 exclude。**
const REDIRECT_HOSTS = ["skyfaring.pages.dev", "www.skyfaring.net"];
const CANONICAL_HOST = "skyfaring.net";

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (!REDIRECT_HOSTS.includes(url.hostname)) return context.next();

  url.hostname = CANONICAL_HOST;
  const status = ["GET", "HEAD"].includes(context.request.method) ? 301 : 308;
  // 轉址一律 no-store：301／308 在沒有 Cache-Control 時會被瀏覽器**無限期快取**，
  // 之後就算改了轉址規則，那些瀏覽器也可能很久都不再問伺服器（改了不生效）。
  // 用 new Response 而非 Response.redirect()，後者產生的回應是 immutable、加不了標頭。
  // 對 SEO 無影響：爬蟲認的是 301 這個狀態碼本身，不靠瀏覽器快取。
  return new Response(null, {
    status,
    headers: { Location: url.toString(), "Cache-Control": "no-store" },
  });
}
