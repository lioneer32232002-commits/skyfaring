# 把各專案掛到 skyfaring.net 子網域

規劃日期：2026-08-02。本機接手施工時照這份走。

## 結論：走子網域，不走子路徑

各專案用 `<專案>.skyfaring.net`，路徑那一層（`skyfaring.net/xxx/`）全部留給主站。

理由：

- 子網域在 Cloudflare 後台填一個名字就好，CNAME 自動建、憑證自動簽，程式碼零改動。子路徑要架 Worker 反向代理，而且每個子專案都得改 `basePath` 重新 build，不然它的 `/_next/`、`/assets/` 會打到主站根目錄變 404。
- 主站已經佔用了 `/blog/`、`/projects/`、`/tags/`、`/topics/`、`/tpbl-lens/` 這些路徑，往後新增分類或導讀頁還會再長。路徑留給主站，就不會有哪天撞到外部專案的問題。
- 子網域之間是不同 origin，localStorage 各自獨立，一個專案出事不會波及其他。子路徑同一個 origin，沒有隔離。
- 各專案獨立部署、獨立回滾，不必多養一層 Worker 當單點故障。

主站與專案的分工因此變成：`skyfaring.net/projects/<slug>/` 是主站上的導讀頁，`<slug>.skyfaring.net` 是專案本體，導讀頁的「前往專案」連向後者。

## 現況盤點

| 專案 | repo | 目前網址 | 建議子網域 |
| --- | --- | --- | --- |
| 解放軍動態追蹤 | `pla-tracker` | `pla-tracker.pages.dev` | `pla-tracker.skyfaring.net` |
| 投籃紀錄 | `shot-ledger` | `shot-ledger.pages.dev/#/home` | `shot-ledger.skyfaring.net` |
| 歷史學院 | `history-academy` | `history-academy.pages.dev` | `history-academy.skyfaring.net` |
| 戰史檔案館 | `battle-archive` | `battle-archive.pages.dev` | `battle-archive.skyfaring.net` |
| TPBL Lens | `tpbl-lens` | `tpbl-lens.pages.dev` | 待決，見下 |
| Lioneers | `lioneers-web` | `lioneers-web.pages.dev` | `lioneers-web.skyfaring.net` |
| 飛行線上 | `flight-deck` | `flightdecktw.net` | 不動，已有自己的網域 |

其他 repo（`traffic-dashboard`、`DARKLINE`、`basketball-3v3`、`thomas-train`、`gept-prep`、`badminton-2p`）目前沒有從主站連出去，要不要一起掛再決定。

## 待決：tpbl-lens 撞名

主站已經有 `skyfaring.net/tpbl-lens/`（`app/tpbl-lens/page.tsx`）。再開一個 `tpbl-lens.skyfaring.net`，兩個網址長太像，貼連結容易貼錯。兩個選項：

1. 把主站那頁併進 `/projects/` 底下，跟其他專案的導讀頁一致，子網域就叫 `tpbl-lens.skyfaring.net`。
2. 主站那頁不動，子網域換個名字。

## 施工順序

順序不能顛倒。先加自訂網域，確認新網址開得起來，最後才推轉址。反過來的話，轉址會把訪客送到還沒生效的網址，等於自己把站關掉。

1. **Cloudflare 後台加自訂網域**（手動，要登入，Claude 代勞不了）
   每個專案：Workers & Pages → 選專案 → Custom domains → Set up a custom domain → 填 `<專案>.skyfaring.net` → Activate。網域在同一個帳號，CNAME 自動建、憑證自動簽，等一兩分鐘生效。
2. **逐一開新網址確認**內容正常、資產沒 404。
3. **改主站連結**，共三個檔：
   - `lib/projects.ts`：pla-tracker、shot-ledger、history-academy、battle-archive
   - `lib/projectPages.ts`：同上四個
   - `app/tpbl-lens/page.tsx`：tpbl-lens、lioneers-web
4. **各專案加轉址中介層**，把舊的 `*.pages.dev` 301 到新子網域，避免兩個網址同時被索引。範本見下。
5. **合併部署**，push 到各 repo 的 main 觸發 Cloudflare Pages 自動部署。

第 3、4 步可以交給 Claude 做，repo 都有推送權限。

## 轉址中介層範本

放在各專案的 `functions/_middleware.js`，照主站 `functions/_middleware.js` 的寫法：

```js
// 舊網址 <專案>.pages.dev 一律轉到正式子網域，路徑與參數原樣保留
// 只轉列出的主機，不轉 preview 部署（<hash>.<專案>.pages.dev），保留預覽測試能力
// GET/HEAD 用 301；其他方法用 308，避免瀏覽器把 POST 改成 GET
const REDIRECT_HOSTS = ["<專案>.pages.dev"];
const CANONICAL_HOST = "<專案>.skyfaring.net";

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (REDIRECT_HOSTS.includes(url.hostname)) {
    url.hostname = CANONICAL_HOST;
    const status = ["GET", "HEAD"].includes(context.request.method) ? 301 : 308;
    return Response.redirect(url.toString(), status);
  }
  return context.next();
}
```

## 注意事項

- **憑證只涵蓋一層。** Cloudflare 免費的 Universal SSL 涵蓋 `*.skyfaring.net`，`pla-tracker.skyfaring.net` 沒問題，`a.b.skyfaring.net` 這種兩層要付費的 Advanced Certificate Manager。別那樣命名。
- **`www` 已被佔用。** 主站的 `functions/_middleware.js` 拿 `www.skyfaring.net` 做轉址，不能再當專案子網域用。
- **`_worker.js` 進階模式的專案，`functions/` 會被忽略。** 施工前先確認各 repo 的結構，那幾個要改在 `_worker.js` 裡處理轉址。
- **主站的中介層只管主站。** Pages Functions 綁在各自的 Pages 專案上，主站那份不會套用到子網域，每個專案要自己一份。
- **舊網址不會消失。** 掛了自訂網域之後 `*.pages.dev` 仍然活著、內容一樣，所以第 4 步的轉址是必要的，不是可有可無。
- **`shot-ledger` 帶 hash 路由**（`#/home`），換網域時把 hash 一起保留。
