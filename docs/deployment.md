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

`public/_routes.json` 把 `/_next/*`、`/images/*`、`/icons/*`、`/site.webmanifest`
與根目錄那幾個圖示排除掉，被排除的路徑直接由靜態資產伺服器回應，
官方文件明講不會呼叫 Function、也不計費。

（`/icons/*` 與 `/site.webmanifest` 是 PWA app 圖示與 manifest，2026-08-20 加。
圖示本身由 `scripts/make-icons.mjs` 產生，不是手工檔，改圖示要跑那支重產。）

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

## 已知問題：正式網域每頁都有 React #418（hydration 不符）

`skyfaring.net` 上每一頁的 console 都會噴 `Minified React error #418`
（server 端 HTML 與 client 端算出來的不一致）。`*.pages.dev` 上乾淨，只有正式網域有。

原因是 Cloudflare zone 的 **Email Obfuscation**（Scrape Shield）：它會把 HTML 裡的
`mailto:` 改寫成 `/cdn-cgi/l/email-protection#…` 並注入 `email-decode.min.js`，
而 React 在 client 端算出來的還是原本的 `mailto:`，兩邊對不起來。
觸發點是 `app/layout.tsx` 全站頁尾那個信箱連結，所以每一頁都中。

**與 `_routes.json` 無關**，2026-08-05 加 `_routes.json` 之前就存在
（把正式網域與同一份建置產物的 preview 網址做 HTML diff，差異只有 Cloudflare 注入的
email-protection 與 analytics beacon，其餘位元組一致）。

影響不大：React 會退回 client 端重繪那一塊，畫面正常，只是多一點成本。要根治的話
兩條路，都還沒做：把該 zone 的 Email Obfuscation 關掉（Cloudflare 主控台的
Scrape Shield，wrangler 的 token 只有 zone read，改不動），或讓頁尾信箱不要在
SSR HTML 裡出現字面上的 `mailto:`。

## 查用量

`wrangler login` 後從 `%APPDATA%/xdg.config/.wrangler/config/default.toml` 取
`oauth_token`，打 `https://api.cloudflare.com/client/v4/graphql`，查
`pagesFunctionsInvocationsAdaptiveGroups`（維度 `date`／`datetimeHour`／`datetimeMinute`
＋`scriptName`，帳號 tag `f171333970603616d44612bf079922b2`）。
這個資料集沒有專案名稱維度，只能靠 `scriptName` 對。

## Cloudflare 的「bot traffic 增加」警示信怎麼判讀（2026-09-06 加）

`em@em1.cloudflare.com` 會寄主旨「Unexpected increase in bot traffic for skyfaring.net」
的自動警示信。它是**行銷信**，收信時先看下面三件事再決定要不要動手，通常不用動。

**它講的是比例，不是流量。** 2026-09-06 那封說「自動化流量從 48% 增加 69% 到 81%」，
69% 是佔比的相對變化。查 zone 的 `httpRequests1dGroups` 之後，09-04 當天總請求
3,050 次，是那兩週的低點（08-27 有 12,710 次）；`pageViews` 只有 919，前後幾天是
1,400～1,600。分母縮了，分子沒怎麼變，佔比就跳上去了。多出來的機器人請求約一千次。

**先看爬蟲是誰。** 同一天的 UA 排行前幾名是 bingbot（272）、facebookexternalhit（169）、
Applebot（88），其餘是沒有標示的 Chrome UA。搜尋引擎與社群平台抓 OG 卡片的流量對這個站
是正面的。`threats` 欄位（09-04 是 68）已經是被 Cloudflare 擋掉的數量，不用另外處理。

**信裡的方案別當真。** 那封寫「As a Pro plan customer」，但 `skyfaring.net` 的 zone
實際是 Free Website。它推銷的 Super Bot Fight Mode 要 Pro 才有。

**不要開 Free 方案的 Bot Fight Mode。** 它會對判定為自動化的請求丟 JS 挑戰，這個站的價值
在被爬、被索引，擋錯了得不償失。

真正要盯的是上面〈`public/_routes.json` 是配額命脈〉那條，不是這封信：09-04 全帳號 13 個
Pages 專案的 Functions 呼叫加起來 13,336 次，離 10 萬次／日還很遠，skyfaring 自己不到一千。

### 查 zone 端的請求數與爬蟲

token 取法同上一節。zone tag 用 `GET /zones?name=skyfaring.net` 拿
（目前是 `88829c93d9e5a768606972cdb6c28926`，換 zone 會變，不要寫死）。

每日總量與威脅數用 `httpRequests1dGroups`：

```graphql
query($zone:String!,$from:Date!,$to:Date!){viewer{zones(filter:{zoneTag:$zone}){
  httpRequests1dGroups(limit:30,filter:{date_geq:$from,date_leq:$to},orderBy:[date_ASC]){
    dimensions{date} sum{requests pageViews threats} uniq{uniques}}}}}
```

當天的 UA 排行用 `httpRequestsAdaptiveGroups`（時間是 `Time!` 不是 `Date!`）：

```graphql
query($zone:String!,$from:Time!,$to:Time!){viewer{zones(filter:{zoneTag:$zone}){
  httpRequestsAdaptiveGroups(limit:30,filter:{datetime_geq:$from,datetime_leq:$to},
    orderBy:[count_DESC]){count dimensions{userAgent}}}}}
```
