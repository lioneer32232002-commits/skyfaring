---
title: "偷得走答案，卻練不出模型：當 AI 公司在輸出裡下毒。"
author: "AI 初稿 / skyfaring 編輯校正"
date: "2026-06-14"
updated: "2026-06-14"
slug: "ai-distillation-poisoning-defense"
tags:
  - AI
  - 資安
  - 模型安全
heroImage: "/images/ai-distillation-poisoning-defense-ink.jpg"
heroAlt: "一滴黑色墨水在清水中緩緩擴散"
heroCredit: "Vincent Botta / Unsplash"
heroCreditUrl: "https://unsplash.com/photos/eouEtrJf844"
excerpt: "上一篇說「在權重裡埋追蹤器」做不到，因為模型是一堆數字，不是會自己跑的程式。有人追問：那對蒸餾用的資料下毒呢。這一問正好打在防守方唯一握得住的地方，輸出。把答案調成既能用又會教壞山寨模型，或讓偷去的答案帶著可追溯的胎記，這兩條防線在 2024 到 2025 年真的被做了出來，也真的已經有人在拆。"
highlight: "上一招想在權重裡塞一段會自己跑的程式，那做不到。下毒改的是權重吐出來的東西，而那恰好是防守方唯一握得住的環節。"
source: "Yash Savani et al., Antidistillation Sampling, arXiv:2504.13146, 2025."
source_url: "https://arxiv.org/abs/2504.13146"
references:
  - title: "Information-Preserving Reformulation of Reasoning Traces for Antidistillation (PART), arXiv:2510.11545, 2025."
    url: "https://arxiv.org/abs/2510.11545"
  - title: "Tom Sander et al., Watermarking Makes Language Models Radioactive, NeurIPS 2024 (spotlight), arXiv:2402.14904."
    url: "https://arxiv.org/abs/2402.14904"
  - title: "Scalable watermarking for identifying large language model outputs (SynthID-Text), Nature, 2024."
    url: "https://www.nature.com/articles/s41586-024-08025-4"
  - title: "Unified Attacks to LLM Watermarks: Spoofing and Scrubbing in Unauthorized Knowledge Distillation (CDG-KD), arXiv:2504.17480, 2025."
    url: "https://arxiv.org/abs/2504.17480"
  - title: "Leyi Pan et al., Can LLM Watermarks Robustly Prevent Unauthorized Knowledge Distillation?, ACL 2025, arXiv:2502.11598."
    url: "https://arxiv.org/abs/2502.11598"
category: AI
---

上一篇談完那個諜報劇本，假模型、追蹤器、反向釣魚，結論卡在最核心的一個地方：訓練好的模型是一堆參數，不是一支會自己跑起來的程式，所以沒辦法在裡面埋一個會回頭通報的追蹤器。

文章發出去，有人追問了一句更尖的。如果不去動模型本身，而是對蒸餾用的資料下毒呢。

這一問，比原本那個劇本高明。它退一步，打在防守方真正握得住的地方，輸出。

先說清楚蒸餾是什麼。小偷不偷你的檔案，他付錢當個普通使用者，對你的 API 狂打問題，把模型吐出來的答案大量收集起來，再拿這批問答去訓練一個自己的山寨模型。原廠花上億訓練出來的能力，被人用一筆 API 帳單抄走了大半。

前一招要防的是偷檔案，這一招要防的是抄答案。而答案，是整條鏈上唯一完全由防守方生出來、也完全由防守方控制的東西。

於是對蒸餾資料下毒就有了著力點。只是它其實分成兩種完全不同的玩法，目的南轅北轍。

## 第一種：把山寨模型練壞

代表作是 2025 年 4 月的 Antidistillation Sampling，出自卡內基美隆大學的 locuslab。做法是策略性地調整老師模型「下一個 token」的機率分布，讓它產生的推理痕跡會毒害蒸餾，同時保住模型對正常使用者的可用性。

關鍵是一個叫 λ 的旋鈕。λ 調得愈高，就愈偏向去選那些會推高學生模型損失的 token，讓推理痕跡對蒸餾更具破壞力，即使這些 token 在原本分布下的機率稍低一點。

原始論文測的是 GSM8K、MATH、MMLU 這幾種題庫，模型規模也只到 7B 上下。真正讓人皺眉的數字來自後續研究。2025 年 10 月一篇叫 PART 的論文把同樣的想法推到更大的模型，結果連一個 32B 的學生模型都被拉低，在 AIME 2024 這個數學競賽題庫上，正確率從 54.17% 掉到 46.88%，相對少了約 13.5%。

白話講，小偷照樣能用你的 API 拿到好答案，他自己用起來毫無異狀。但他把這些答案蒐集起來、拿去訓練山寨模型的那一刻，答案裡早就被摻進了教壞小孩的成分，練出來的東西就是不行。

## 第二種：讓偷去的答案帶著胎記

第二種玩法不破壞，只標記。它是上一篇講的指紋的升級版，術語叫浮水印的「放射性」。

核心發現是這樣。如果老師模型本身帶著浮水印，那麼從它 API 收集到的訓練資料，就天生帶著浮水印的痕跡。用這批資料訓練出來的學生模型，輸出會保留同一套浮水印模式，讓原作者能在事後偵測、追溯這場沒有授權的蒸餾。

出處是 Meta FAIR 的 Sander 等人，2024 年 NeurIPS 的 spotlight 論文。他們發現，只要可疑模型是開源權重，哪怕訓練資料裡只有 5% 帶浮水印，也能以極高的信心揪出來，誤判的機率低於十萬分之一。

這條路不只停在論文。Google DeepMind 把自家的 SynthID-Text 整合進 Gemini，在近 2000 萬則回應上實測，人們沒有察覺加了浮水印的回答品質變差，事後還把整套方法開源。OpenAI、Anthropic、Meta 的 Llama 也都在服務條款或授權條款裡明文禁止拿它們的輸出去蒸餾，衝著的就是這件事。

你不去阻止他偷，但他偷練出來的模型身上會留下你的 DNA，哪天對簿公堂，這就是證據。

## 三個跨不過去的現實

第一，最大的死結是你分不出小偷和真客戶。同一份答案，既送給付錢的使用者，也送給小偷，因為在 API 那一端，兩者長得一模一樣。下毒下得太輕，擋不住蒸餾；下得太重，正常使用者拿到的品質就跟著爛掉。Antidistillation 那個 λ 旋鈕之所以存在，本身就是在承認保護強度和自家產品好不好用是互相拉扯的，沒有免費的午餐。

第二，這是一場還在打的軍備競賽。已經有研究專門在拆這些防線。有人提出能同時做偽造（spoofing）和洗除（scrubbing）的攻擊框架，也有論文標題直接挑明問，LLM 的浮水印到底擋不擋得住未授權蒸餾，而它給的答案是改寫訓練資料、或在推理時中和浮水印，兩種手法都能把胎記乾乾淨淨洗掉。矛和盾還在同一張桌子上輪流加碼。

第三，它只防一種特定的偷法。下毒也好，放射性也好，守的都是不偷檔案、改用 API 大量抄輸出這條蒸餾路線。如果對方是直接把你的權重檔案整個搬走，那他手上拿到的就是真貨，跟蒸餾下毒完全無關。這時候能救你的，還是上一篇講的那套無聊東西，靜態加密、機密運算、存取控管。

## 回到那個問題

接回上一篇那個對照，會發現追問的人，直覺其實抓對了方向。

上一篇那個劇本錯在哪。它想在權重裡塞一段會自己跑、會回頭通報的程式，而模型是資料不是程式，這一步做不到。

在輸出層下毒之所以可行，正是因為它沒有再犯同一個錯。它不去碰權重本身，改的是權重吐出來的東西，而那恰好是防守方唯一真正控制得了的環節。

兩篇放在一起，分界就清楚了。電影感最強的那一套，假模型、追蹤器、反向釣魚，全都賭對手會乖乖照鋪好的路走，對手一專業就垮。在輸出裡下毒這一套，賭的不是對手會犯錯，而是一個更冷的事實，凡是模型吐出來的東西，防守方都能搶先動過手腳。

守得住的那條線，畫在出口。
