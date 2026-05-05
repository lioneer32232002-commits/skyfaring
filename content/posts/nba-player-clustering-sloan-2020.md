---
title: 「控球後衛」這個標籤，已經是個落後的分類了。
author: AdamP
date: 2026-05-05
slug: nba-player-clustering-sloan-2020
tags:
  - 籃球
  - 數據分析
  - NBA
  - 機器學習
excerpt: Chris Paul 和 Derrick Rose 都叫控球後衛，但打法根本是兩種球員。MIT Sloan 2020 年的研究，用機器學習把 NBA 的位置系統打掉重練，找出九個更精確的功能性角色。
heroImage: /images/nba-player-clustering-sloan-2020-hero.jpg
heroAlt: Basketball court under arena lights
heroCredit: Markus Spiske
heroCreditUrl: https://unsplash.com/photos/BfphcCvhl6E
highlight: 一支球隊如果知道現有四個球員是什麼類型，可以直接查模型，找出第五個缺口最適合哪種角色，再去自由市場或選秀上尋找對應的球員。球探報告上的位置欄位，是一個滯後指標，記錄的是球員最初被訓練成什麼，不是他在場上實際做了什麼。
source: "Kalman, S. & Bosch, J. (2020). NBA Lineup Analysis on Clustered Player Tendencies: A new approach to the positions of basketball & modeling lineup efficiency of soft lineup aggregates. MIT Sloan Sports Analytics Conference."
source_url: https://www.sloansportsconference.com/research-papers/nba-lineup-analysis-on-clustered-player-tendencies-a-new-approach-to-the-positions-of-basketball-modeling-lineup-efficiency
---

2011 年的某場比賽，Chris Paul 持球推進，停下腳步，把球傳給切入的隊友，讓對手的防守體系整個錯位。Derrick Rose 同樣的位置，直接殺進禁區，完成上籃。

球探報告上，兩個人都寫著「控球後衛」。

這個標籤毫無意義。它告訴你他們站在場上的哪個位置，卻沒有告訴你他們實際在做什麼、對球隊貢獻什麼、以及把他們配在一起會發生什麼事。

Samuel Kalman 和 Jonathan Bosch 在 2020 年的 MIT Sloan Sports Analytics Conference 上提出了一個問題：如果傳統五個位置根本不能描述現代 NBA 球員，那什麼才能？

他們的答案，不是修改位置的定義，而是把整套系統砍掉重來。

## 讓數據自己分群

研究資料來自 2009 至 2018 年的十個 NBA 賽季，涵蓋 3,608 筆球員賽季紀錄，每筆資料包含 23 個變數，包含進攻效率、投籃分佈、使用率（usage rate）、助攻率、籃板率等。所有數據以每 100 次進攻回合正規化，確保出場時間的差異不影響比較結果。

研究者刻意不告訴演算法哪個球員打哪個位置。讓數據自己說話。

方法是高斯混合模型（Gaussian Mixture Model，GMM）。不同於 k-means 的硬性分類，GMM 給出機率分佈。球員可以是「70% 的 Ball Dominant Scorer、30% 的 Stretch Forward」，而不是被強迫塞進單一框格。貝葉斯資訊準則（BIC）自動決定最佳群集數。

演算法跑完後，資料收斂到九個群集。

## 九個角色，取代五個位置

![NBA Functional Role Distribution — 9 Clusters showing player-season counts from 2009 to 2018](/images/nba-player-clustering-nine-roles.png)

九個群集大小差異明顯。Three Point Shooting Guard 最多（646 筆），Ball Dominant Scorer 最少（150 筆），反映出 NBA 頂層攻擊核心本來就稀缺。

每個群集都有清晰的特徵：

High Usage Guard（持球主導後衛）：手握球權、兼顧傳導，但效率低於 Ball Dominant Scorer。代表球員：Lou Williams、Brandon Jennings。

Stretch Forward（拉開空間前鋒）：以三分球拉開空間，比 Three Point Shooting Guard 更高大、籃板更好。代表球員：Shane Battier、Steve Novak。

Three Point Shooting Guard（定點三分後衛）：接球即射，不持球、不創造機會、幾乎不衝進禁區。代表球員：Klay Thompson、JJ Redick。

Traditional Center（傳統中鋒）：靠近籃框，靠灌籃和籃板貢獻，幾乎不投三分。代表球員：DeAndre Jordan、Tyson Chandler。

Versatile Role Player（萬用角色球員）：各項指標接近平均，無明顯強項或弱項，是後衛和前鋒的混合體。代表球員：Shaun Livingston、Bam Adebayo。

Floor General（組織核心）：以傳球為優先，不強調得分，助攻率最高。代表球員：Jason Kidd、Rajon Rondo。

Mid-Range Big（中距離大個子）：在禁區附近出手中距離跳投，但不投三分。代表球員：Pau Gasol、Tiago Splitter。

Skilled Forward（技術型前鋒）：高大且技術全面，可切入、可協助組織，三分多靠隊友傳球助攻。代表球員：Anthony Davis、Serge Ibaka。

Ball Dominant Scorer（持球得分核心）：全隊攻勢發動點，高效率高使用率，切入為主要得分方式。代表球員：James Harden、LeBron James。

## 位置標籤的崩潰

GMM 的機率分佈讓幾件事變得可見。

2017 年的 Dirk Nowitzki，落在 Stretch Forward 和 Skilled Forward 的邊界，各佔 50%。他能像 Stretch Forward 投三分，也能像 Skilled Forward 在中距離單打。傳統「大前鋒」這個標籤，沒辦法說清楚這件事。

Kawhi Leonard 的職業生涯轉變被模型完整追蹤到。他在聖安東尼奧馬刺隊早期被分類為 Stretch Forward，等到被交易到多倫多暴龍隊前後，角色已經變成 Ball Dominant Scorer。

2018 年的 Shaun Livingston，位置登記為控球後衛，但演算法把他分類為 75% 的 Traditional Center、25% 的 Versatile Role Player，因為他幾乎所有出手都在禁區附近，從不投三分。Traditional Center 加上 Versatile Role Player，比「控球後衛」這三個字，更精確地描述了他為球隊帶來的東西。

## 哪種組合的陣容最有效？

分類球員只是第一步。Kalman 和 Bosch 把問題推進了一層：知道每個球員的群集之後，能不能預測哪種五人組合的陣容效率最高？

他們收集了同期的 20,000 筆五人陣容資料，用「貝葉斯調整後 Net Rating」（每 100 次攻守回合的得失分差）為目標，建立 Random Forest 模型，測試 310 萬種可能的陣容組合。

研究者把每個球員的群集機率加總成「軟性陣容」（soft lineup），讓那些身處兩個群集邊界的球員也能被精確表示，例如一個陣容可能包含「0.7 個 Ball Dominant Scorer、1.3 個 Stretch Forward」這樣的組合。

結果如下：

![Which Roles Drive Lineup Efficiency — Linear regression coefficients showing each role's impact on adjusted Net Rating](/images/nba-player-clustering-lineup-efficiency.png)

Ball Dominant Scorer 的係數遠高於其他角色。論文分析的最佳陣容（預測 Net Rating +14.5 至 +15.5）組成是 1.25 個 Ball Dominant Scorer、2.25 個 Versatile Role Player、1 個 Traditional Center、0.5 個 Stretch Forward。跨所有陣容分析的一致結論是：場上必須有效率的持球核心，再搭配能拉開空間的射手，才能讓陣容協同效應最大化。

最差陣容是兩個 High Usage Guard，缺乏 Ball Dominant Scorer 也沒有 Stretch Forward，預測 Net Rating 落在 -10.3 至 -10.7。

Mid-Range Big 在所有高效陣容中幾乎缺席。中距離出手在三分球時代帶來的回報，不足以彌補空間壓縮的代價。

Warriors 的「死亡陣容」代入模型，預測 Net Rating 為 +12.4。驗證結果和現實吻合。論文同時標注了每位球員對應的群集：Kevin Durant（Ball Dominant Scorer）、Stephen Curry（Ball Dominant Scorer）、Klay Thompson（Three Point Shooting Guard）、Draymond Green（Versatile Role Player）、Andre Iguodala（Versatile Role Player）。一個陣容裡有兩個持球得分核心、一個定點三分射手、兩個萬用角色球員，這是讓模型給出高預測值的組成邏輯。

## 一套更精確的語言

這套方法的核心不是分類本身，而是讓「球員角色」變成可以運算的變數。

一支球隊如果知道現有四個球員是什麼類型，可以直接查模型，找出第五個缺口最適合哪種角色，再去自由市場或選秀上尋找對應的球員。球探報告上的位置欄位，是一個滯後指標，記錄的是球員最初被訓練成什麼，不是他在場上實際做了什麼。

位置這個概念，在籃球裡從來都是近似值。Kalman 和 Bosch 的研究說明的是，近似值可以做得更精確，而代價只是讓數據自己說話。
