---
description: 用正確的 frontmatter 範本建立一篇新文章草稿
argument-hint: <slug>（英文 kebab-case，例如 nba-shot-quality-model）
---

建立一篇新的 skyfaring 文章草稿。

slug：$ARGUMENTS

步驟：

1. 若上面的 slug 是空的，先問使用者要用什麼 slug（英文 kebab-case），不要自己亂編。
2. 確認 `content/posts/<slug>.md` 不存在（存在就停下來告知，不要覆蓋）。
3. 用下面的範本建立 `content/posts/<slug>.md`。`author` 一定要是固定值，`date` 填今天（格式 YYYY-MM-DD），`slug` 要和檔名一致。其餘 `TODO` 欄位留給後續填，但**所有欄位都必須在發文前補齊**（缺任何一個格式守門員都會擋）。

```markdown
---
title: "TODO：標題。含逗號或為問句時結尾補。或？，純短語則不加標點"
author: "AI 初稿 / skyfaring 編輯校正"
date: "TODO-今天 YYYY-MM-DD"
slug: "<slug>"
tags:
  - TODO-至少一個
excerpt: "TODO：一段引言，中英文之間記得空格"
heroImage: "/images/<slug>-描述.jpg"
heroAlt: "TODO：圖片替代文字"
heroCredit: "TODO：攝影師或來源"
heroCreditUrl: "TODO：來源連結"
highlight: "TODO：文章中段的重點引文，缺了頁面不會渲染這一區"
source: "TODO：論文或報告出處（有來源時）"
source_url: "TODO：來源連結（讓出處可點擊）"
category: "TODO：對應主題分類"
---

（內文從這裡開始，用 ## 以下層級，不要用 #。
寫作風格照 CLAUDE.md：場景化開頭、長短段交錯、無破折號、無 AI 腔套語、無感嘆號。）
```

4. 建好後提醒使用者：寫完要發文時用 `/publish-post <slug>` 跑審查再上線。

只建立檔案，不要開始寫內文，除非使用者要你接著寫。
