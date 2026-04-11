---
title: "Gemini 導讀了一篇不存在的論文"
author: "AdamP"
date: "2026-04-11"
updated: "2026-04-11"
slug: "ai-hallucination-academic-papers"
tags: ["AI", "Gemini", "幻覺", "學術研究", "籃球數據"]
heroImage: "/images/ai-hallucination-hero.jpg"
heroAlt: "有人指著筆電螢幕上的內容"
heroCredit: "John Schnobrich / Unsplash"
heroCreditUrl: "https://unsplash.com/photos/person-using-laptop-computer-FlPc9_VocJ4"
excerpt: "我請 Gemini 導讀一篇 SCI 論文，它給了我作者、期刊、核心數據、對我網站的客製化建議。那篇論文根本不存在。更可怕的是，整個過程完整到我完全沒有起疑。"
source: "Nature Scientific Reports, ChatGPT Citation Fabrication Study (2023)"
source_url: "https://www.nature.com/articles/s41598-023-41032-5"
---

那篇論文的標題看起來很正常。

*Predicting Basketball Game Outcomes Using Optimized Machine Learning Models and Dynamic Feature Selection*，《Applied Sciences》，MDPI，2025 年第 13 卷。我請 Gemini 導讀，它給了我完整的摘要，XGBoost 與 LightGBM 的集成架構、動態特徵選擇的設計邏輯、ROC 曲線與 AUC 的評估數字，然後還附上了針對我網站的客製化建議，說根據這篇論文，我目前的預測公式應該加入「近 3 場表現趨勢」作為第三個權重變數，預測準確率可以提升約 4.2%。

然後我點了它附的連結，打不開。

## 去找那篇論文

起初我以為是暫時的網路問題。但去 MDPI 官網搜尋那個標題，什麼也沒有。換 Google Scholar，沒有。搜作者名，沒有。那個 DOI 存在，但指向另一篇完全不相關的論文。

我直接問 Gemini：你給的這篇，我找不到。

它說：

> 「是的，我必須坦白。那篇論文的標題、研究摘要、4.2% 的準確度提升、具體的加權公式，全部都是錯誤的。由於論文標題本身是幻想出來的產物，底下的研究摘要與數據，是模型根據籃球統計學與機器學習的相關知識，自動拼湊出的虛擬內容。」

所以它沒有讀過任何一篇真實存在的論文。它只是知道「一篇關於籃球機器學習預測的論文大概會長什麼樣子」，然後把那個形狀填滿了。

## 為什麼這次我完全沒有起疑

AI 幻覺不是新鮮事，我也不是第一次聽說這個問題。但這次讓我真正覺得棘手的，是它做得太像了。

說謊通常有破綻，邏輯不通，細節對不上，數字超出常識範圍。但 Gemini 給我的這份導讀，每一個數字都在學術論文的正常範圍內，每一個建議都和我自己平常的思考方向一致。如果那個連結沒有壞掉，我不知道我有沒有機會發現。

這個問題其實有實際的規模。根據 Nature 的研究，GPT-3.5 在生成學術引用時，有約 55% 是編造的；即使是更新的 GPT-4，比例也有 18%。2025 年 NeurIPS 和 2026 年 ICLR 兩場頂級 AI 學術會議，都有論文夾帶了 AI 幻覺出來的假引用，而且通過了同儕審查。

AI 在生成幻覺的時候，對自己的輸出是有信心的。它沒有「我不確定這筆資料對不對」的狀態，它就是在做它最擅長的事，把一個「應該長這樣」的形狀填滿。

## 我試過設定「95% 把握才能回答」

沒有用。

「我不確定就不要說」這種指令對人有效，因為人知道自己什麼時候在猜。AI 不知道。它在編造一篇完整的假論文時，主觀上並沒有感覺自己在猜。所以信心門檻設多高，都無法阻止幻覺發生。

解法在於讓它沒有空間去編。

## 現在的作法，白名單

我給了 Gemini 一份期刊名單，它只能從這些地方找論文：

- *Journal of Quantitative Analysis in Sports (JQAS)*，ASA 統計與運動分部的核心期刊，Impact Factor 1.53，2026 年轉型開放取用
- *Journal of Sports Analytics (JSA)*，開放取用，雙盲審查
- *International Journal of Computer Science in Sport (IJCSS)*，CiteScore 2.4，2016 年起全面開放取用
- *Journal of Sports Science and Medicine (JSSM)*，Web of Science、SCOPUS、MEDLINE 均收錄，Impact Factor 3.04，h-index 87
- *International Journal of Sports Science and Engineering*

每次導讀必須提供與期刊官網 100% 吻合的標題、有效的 DOI 連結，摘要內容嚴格對應原文，不能加上任何未經驗證的 AI 推論。找不到就回報「今天沒有符合條件的論文」，不生成一篇替代品。

邏輯很簡單。白名單裡的期刊都是真實存在且可查詢的，AI 如果真的搜尋了，找不到就是找不到。它沒有辦法憑空生成一篇同時符合「標題存在」、「DOI 有效」、「期刊在名單內」這三個條件的假論文。

## 那 4.2% 的建議還能用嗎

「近 3 場表現趨勢作為預測權重」這個方向，在真實的運動預測研究裡是有根據的。問題是我現在沒有辦法引用任何東西來支撐它，因為唯一給過我這個建議的「來源」根本不存在。

這是 AI 幻覺最讓人矛盾的地方，它指向的方向有時候是對的，只是路徑是假的。就像有人告訴你「往東走會到海邊」，方向可能沒錯，但他拿出來的那張地圖是他剛畫的。

我現在的原則，AI 可以幫我找方向，但每一個數字、每一個標題、每一個 DOI，都要自己驗一遍。

---

*AI 幻覺引用率數據來源：[Nature Scientific Reports, 2023](https://www.nature.com/articles/s41598-023-41032-5)。期刊資訊均已透過各官網與 Web of Science 資料庫核實。*
