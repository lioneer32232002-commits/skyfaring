---
title: 你選的是「位置」，還是「打法」？用數據重新定義籃球陣容的組建邏輯
author: "AI 初稿 / skyfaring 編輯校正"
date: 2026-05-20
slug: basketball-player-archetypes-roster-optimization
tags:
  - 籃球
  - 數據分析
  - NBA
  - FIBA
  - 選秀
excerpt: 一支球隊需要幾個控球後衛？這個問題問錯了。San Diego State University 的研究橫跨 110 個聯賽、22,500 名球員，把所有人分成 9 種打法原型，再從中推導出冠軍陣容的黃金比例。
heroImage: /images/basketball-player-arena-action.jpg
heroAlt: Basketball players competing in action during an indoor arena game
heroCredit: Simon Kessler
heroCreditUrl: https://unsplash.com/photos/basketball-players-in-action-during-a-game-h9teyHyKvds
highlight: 把一個在歐洲聯賽默默無聞的球員放進模型，看他落在哪個原型、PTS/MIN 排名在哪、和 NBA 同型球員的差距有多大——這件事教練用肉眼看不到，但模型可以。剩下的判斷，還是人的事。
source: "Penner, L. S. J. (2025). Player archetypes within basketball: optimizing roster composition to create a championship team. Frontiers in Sports and Active Living, 7, 1639431."
source_url: https://www.frontiersin.org/articles/10.3389/fspor.2025.1639431
category: 籃球研究
---

2024 年巴黎奧運，加拿大男籃時隔 24 年再次站上奧運舞台。陣中有 Shai Gilgeous-Alexander、Jamal Murray、Andrew Wiggins。這份名單，一份 2019 年寫出來的數據模型，預測到了其中大多數人。

Luke S. J. Penner 在 San Diego State University 花了數年時間建立這套模型。他的起點是一個很簡單的問題：教練說他需要一個控球後衛，但 Chris Paul 和 Russell Westbrook 都叫控球後衛——這個標籤到底告訴你什麼？

答案是：幾乎什麼都沒有。

## 22,500 人，110 個聯賽，9 種打法

這份研究的資料規模在籃球分析領域算得上罕見。Penner 從 EuroBasket、RealGM 及 USportsHoops 三個平台，收集了 2018/19 球季、橫跨 110 個聯賽的球員數據，從 NBA 到加拿大大學聯賽，從 Liga Endesa 到中國 CBA，共 27,363 名球員。排除上場時間極少的邊緣球員後，最終保留 22,500 人進行分析。

接下來的問題是：怎麼讓這些來自不同國家、不同水準聯賽的球員站在同一把尺上？

Penner 採用 13 項標準化數據——得分、進攻籃板、防守籃板、助攻、阻攻、抄截、犯規、罰球次數、罰球命中率、兩分與三分的出手次數和命中率——全部換算成每 48 分鐘的數值，消除上場時間的干擾。接著用 k-means 演算法讓數據自己找分群，並以「Within-Cluster Sum of Squares 手肘法」確認 9 個群集是最理想的切分。

## 九種人，九種角色

演算法產出的 9 個群集，Penner 根據各群最突出的特徵賦予名稱：

Low Efficiency Defender（低效率防守者）：兩分出手少、命中率低，但犯規多。代表球員是 OG Anunoby。這類球員在場上的價值往往不在數據欄位裡，但也因此容易被高估潛力。

Catch-and-Shoot Shooter（接球即射手）：三分出手多，幾乎不持球進攻。Eric Gordon 是典型。最乾淨的空間拉伸型球員，組織體系的附屬零件，換個核心就能換個樣貌。

3-and-D：Robert Covington 這類——高抄截、大量三分出手。防守強度與空間拉伸同時存在，是現代 NBA 陣容的標配需求。

Athletic Shooter（運動能力強的射手）：三分命中率高、籃板也強。Nikola Mirotic 為代表。比純定點射手更全面，但跟 Floor General 還差一段距離。

Aggressive Shot-Blocker（強力阻攻者）：JaVale McGee 的樣子——阻攻多、犯規多、籃板多。禁區嚇阻型，換防能力有限，進攻端貢獻偏少。

Aggressive Scorer（強力得分者）：James Harden。得分、罰球、三分出手三項同時爆表。這是整份研究裡最稀缺、對陣容影響力最大的原型。

High Efficiency Scorer（高效率得分者）：Giannis Antetokounmpo。大量兩分出手、三分少，靠近籃框解決戰鬥。和 Aggressive Scorer 的差距在於持球創造威脅的方式不同。

Fouler（犯規型球員）：Jon Leuer 的形象——犯規多，防守積極性卻未必高（抄截少）。這個群集在成功陣容裡幾乎看不到。

Floor General（場上指揮官）：Chris Paul。高助攻、兩分與三分命中率都高，是組織與效率的結合體，而不只是傳球員。

ANOVA 驗證了這 9 個群集的統計顯著性——13 項變項全數在群間達到顯著差異（p < 0.001），936 組兩兩配對比較中有 864 組達到顯著，說明這不是勉強切割出來的分類，而是數據裡真實存在的結構。

## 成功陣容的配方

知道球員屬於哪個原型是第一步。第二步是：冠軍球隊到底用了什麼比例？

Penner 分析了兩組參照群體：2018/19 NBA 球季中，正負值至少 +15 且上場時間充足的 320 名球員（NBA 最佳陣容）；以及 2014 至 2018 年 FIBA 國際賽事所有獎牌得主共 324 名球員。

結論很清楚：

Aggressive Scorer 在 NBA 最佳陣容佔 29.1%，在國際獎牌球隊佔 17.6%——這是兩個群體中佔比最高或前列的原型。High Efficiency Scorer 和 Floor General 同樣穩定出現在各類成功陣容裡。Low Efficiency Defender 和 Fouler 在 NBA 最佳陣容中幾近缺席（各 0.9% 和 0.6%）。

換算成 15 人名單的建議配額：Aggressive Scorer 3–4 人，Catch-and-Shoot Shooter 2–3 人，High Efficiency Scorer 2–3 人，Floor General 2–3 人，Athletic Shooter 2–3 人，Aggressive Shot-Blocker 1–2 人，Low Efficiency Defender 和 Fouler 各 0–1 人。

這個配方的內在邏輯很直接：進攻效率優先，防守靠多功能球員覆蓋，組織球權不能缺少。整體陣容需要有人能自己創造得分（Aggressive Scorer、High Efficiency Scorer），有人能維持節奏和組織（Floor General），有人能靠空間拉伸讓進攻核心的運作更順暢（Catch-and-Shoot Shooter）。

## 跨聯賽的換算

這套模型真正的難題不在分群，而在怎麼讓 NBA 球員和歐洲二級聯賽的球員站在同一個排名裡。

Penner 的解法是雙層加權系統。第一層是聯賽品質權重：NBA 為基準（1.10），G-League 0.85，Europe Pro A 0.90，Europe Pro B 0.70，大學聯賽依級別從 0.50 到 0.70 不等。第二層是賽事競賽加乘：NBA 季後賽 2.00，EuroLeague 1.90，EuroCup 1.80，NCAA 第一級三月瘋 1.70。這套邏輯仿照 UEFA 積分制：不只看球員在哪個聯賽打，也看他的球隊有沒有打進高強度的賽事。

實務意義是：一個在 EuroCup 打進決賽的球員，他的每分鐘得分排名會比他的原始數字更高；一個在弱聯賽打出亮眼成績但從未面對頂級競爭的球員，排名會相應下調。

## 2019 年的預言

模型的實用性最終要靠預測來驗證。

Penner 用這套方法，在 2019 年選出了一份假想的加拿大隊 2019 FIBA 世界盃名單：首發五人包含 Jamal Murray、Dillon Brooks、Shai Gilgeous-Alexander、Dwight Powell 和 Kelly Olynyk，替補陣容有 R.J. Barrett、Andrew Wiggins、Trey Lyles 和 Chris Boucher。

模型在 2019 年選中的 12 人當中，有 7 人後來入選了 2024 年巴黎奧運的加拿大隊名單。沒有被選中的 5 人是 Luguentz Dort、Nickeil Alexander-Walker、Melvin Ejim、Andrew Nembhard 和 Khem Birch——前兩人當時還在 2019 選秀班，Nembhard 還在念大學，Birch 和 Ejim 則是入選了實際加拿大隊的資深球員，可能因領導力因素獲教練青睞。

最有說服力的一個數字：Shai Gilgeous-Alexander 在 2019 年只是一個 NBA 菜鳥，但模型的 Floor General 原型和 PTS/MIN 排名讓他進了首發名單。2025 年，他成為 NBA MVP、NBA 總冠軍 MVP，並以得分王之姿寫下 NBA 史上第 4 位達成這項紀錄的球員。

回溯 2000 年的加拿大奧運隊（最終第 7 名），問題變得更清晰：該隊在 Catch-and-Shoot Shooter、3-and-D、Aggressive Shot-Blocker 和 Fouler 這四個原型上人數過多，在 Aggressive Scorer（僅 1 人，理想值 3 人）、Floor General（0 人）、Athletic Shooter（1 人）上嚴重不足。陣容的結構性缺陷，在事後以模型比對時一目了然。

## 數據做不到的事

這份研究誠實地說出了自己的邊界。

Penner 在和加拿大國家隊教練討論時，教練明確提到某些非量化因素——資歷、更衣室影響力、球員願不願意配合戰術——這些東西不會出現在 box score 裡，但對臨場決策有真實影響。模型建議選 Brandon Clarke，教練選了 Khem Birch；模型建議選 Conor Morgan，教練選了 Cory Joseph。這些替換不是模型的錯誤，而是模型無法涵蓋的資訊。

Daryl Morey 說過，數據的真正優勢在於提供人類直覺看不到的洞見，而不是取代判斷。這套原型模型也是這樣定位自己的：它是教練做決策之前的情報層，不是決策本身。

把一個在歐洲聯賽默默無聞的球員放進模型，看他落在哪個原型、PTS/MIN 排名在哪、和 NBA 同型球員的差距有多大——這件事教練用肉眼看不到，但模型可以。剩下的判斷，還是人的事。

## 和 Sloan 2020 的那篇研究有什麼不同？

如果你讀過我們介紹過的另一篇分群研究——[「控球後衛」這個標籤，已經是個落後的分類了。](/blog/nba-player-clustering-sloan-2020/)——你大概已經注意到，兩篇研究都找到了「9 種球員類型」這個答案。但這個表面上的相似，掩蓋了非常不同的問題意識。

Kalman & Bosch（Sloan 2020）問的是：如果把傳統五個位置全部拋掉，NBA 的球員實際上分成幾種打法？他們的資料只有 NBA、橫跨 10 個賽季（2009–2018）、共 3,608 筆球員賽季紀錄。用的是高斯混合模型（GMM）——「軟性分群」，每個球員同時屬於多個群集、有不同的機率比例，所以 Dirk Nowitzki 可以是「50% Stretch Forward、50% Skilled Forward」，而不是被強迫塞進一格。這篇研究的重點最終落在陣容效率預測：哪五種原型組合在一起，Net Rating 最高？

Penner（2025）問的是完全不同的問題：我怎麼比較一個在 EuroCup 打球的前鋒，和一個在加拿大大學聯賽打球的後衛，以及一個在 NBA 的得分後衛？他的資料是 110 個聯賽、22,500 人、單一賽季（2018/19）。用的是 k-means——「硬性分群」，每個球員只屬於一個群集。這篇研究的重點落在跨聯賽選才與陣容比例：每個原型的最佳球員排名是誰，以及一支冠軍球隊應該帶多少個這種人？

兩篇研究指向不同的使用情境。Sloan 2020 更適合 NBA 球隊的陣容分析師，問的是「現有球員怎麼組搭才有化學反應」；Penner 2025 更適合國家隊選才或選秀情報，問的是「哪個聯賽還有符合我需要的原型，而且被低估了」。都是有用的工具，只是刀口不同。
