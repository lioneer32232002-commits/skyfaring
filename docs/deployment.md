# 部署與 Cloudflare Pages 設定

Next.js（App Router）＋ `output: "export"` 靜態輸出，部署在 Cloudflare Pages。

| 項目 | 值 |
|---|---|
| Pages 專案名 | `skyfaring` |
| build 指令 | `npm run build`（`prebuild` 會先跑 `scripts/make-thumbs.mjs`） |
| 建置產物目錄 | `out`（Pages 讀這裡，不是 repo 根目錄） |
| 正式網域 | https://skyfaring.net |
| 舊網址 | `skyfaring.pages.dev`、`www.skyfaring.net`，由 middleware 301 轉到正式網域 |

## ⚠️ `public/_routes.json` 是配額命脈（2026-08-05 加）

`functions/_middleware.js` 放在 `functions/` 根目錄。Cloudflare Pages 在**沒有**
`_routes.json` 時會自動套用 `include: ["/*"]`，於是**全站每一個請求都先進 middleware**，
連 `_next/` 的 JS／CSS chunk 與圖片都各算一次 Pages Functions 呼叫。

實測首頁 13 個請求裡有 12 個是靜態檔，等於每個訪客被放大 13 倍。

免費方案的 **10 萬次／日是整個帳號 13 個 Pages 專案共用**的。姊妹專案 flight-deck
2026-08-04 就是這樣一天燒掉 74,213 次、收到 Cloudflare 的 75% 警告信；而且因為連
靜態檔都走 Function，撞到上限時整站會一起打不開，不只是某個 API 掛掉。

`public/_routes.json` 把 `/_next/*`、`/images/*` 與根目錄那幾個圖示排除掉，
被排除的路徑直接由靜態資產伺服器回應，官方文件明講不會呼叫 Function、也不計費。

放在 `public/` 而不是 repo 根目錄，是因為 Pages 讀的是建置產物 `out/`，
而 Next 的 static export 會把 `public/` 原樣複製過去。

**新增靜態目錄（例如 `public/videos/`）時要一起加進 exclude**，否則那個目錄的每個檔
又會開始吃配額。`_routes.json` 是嚴格 JSON、寫不了註解，所以說明放在這裡與 middleware 開頭。

### 怎麼確認排除有生效

對舊網域打一個帶 `Sec-Fetch-Dest: document` 的靜態檔，會被 middleware 轉址就代表它有跑到：

```bash
curl -sI -H "Sec-Fetch-Dest: document" https://skyfaring.pages.dev/favicon.svg
```

排除生效前是 `301`，生效後是 `200`。

## 轉址一律帶 `Cache-Control: no-store`

301／308 在沒有 `Cache-Control` 時會被瀏覽器**無限期快取**，之後就算改了轉址規則，
那些瀏覽器也可能很久都不再問伺服器。所以 middleware 用 `new Response` 而不是
`Response.redirect()`（後者產生的回應是 immutable、加不了標頭）。
對 SEO 無影響：爬蟲認的是 301 這個狀態碼本身，不靠瀏覽器快取。

## 查用量

`wrangler login` 後從 `%APPDATA%/xdg.config/.wrangler/config/default.toml` 取
`oauth_token`，打 `https://api.cloudflare.com/client/v4/graphql`，查
`pagesFunctionsInvocationsAdaptiveGroups`（維度 `date`／`datetimeHour`／`datetimeMinute`
＋`scriptName`，帳號 tag `f171333970603616d44612bf079922b2`）。
這個資料集沒有專案名稱維度，只能靠 `scriptName` 對。
