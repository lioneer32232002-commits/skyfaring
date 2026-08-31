---
title: 為了減少三分出手，歐洲聯賽三分線外移半公尺，有效嗎？
author: "AI 初稿 / skyfaring 編輯校正"
date: 2026-08-31
slug: euroleague-three-point-line-extension
tags:
  - 籃球
  - 數據分析
  - EuroLeague
  - NBA
  - NCAA
  - FIBA
excerpt: 2010 年歐洲聯賽把三分線從 6.25 公尺推到 6.75 公尺。19 個球季、5,034 場比賽的分段迴歸估出，那半公尺讓每 100 球權的三分出手立刻少了 2.47 次，然後在往後的球季裡漲了回來。NCAA 2019 年推遠 43 公分，NBA 1994 年反過來把線移近，結果是同一個形狀。
heroImage: /images/euroleague-three-point-line-extension-arena.jpg
heroAlt: 2019 年歐洲聯賽四強賽在西班牙 Fernando Buesa Arena 的球場全景
heroCredit: "Vanbasten 23 / Wikimedia Commons（CC BY-SA 4.0）"
heroCreditUrl: https://commons.wikimedia.org/wiki/File:Panor%C3%A1mica_del_Fernando_Buesa_Arena.jpg
highlight: 2010-11 球季，歐洲聯賽球員腳下那條弧線從 6.25 公尺退到 6.75 公尺。那一季每 100 次球權的三分出手從 29.4 次掉到 27.1 次，出手距離的中位數往外跑了。
source: "Contreras García, J. M., & Molina Portillo, E. (2026). Immediate disruption and long-term tactical adaptation after the three-point line extension in EuroLeague basketball: A segmented longitudinal analysis, 2007-2026. Journal of Sports Sciences."
source_url: https://doi.org/10.1080/02640414.2026.2722815
doi: 10.1080/02640414.2026.2722815
references:
  - title: "Contreras García & Molina Portillo, Immediate disruption and long-term tactical adaptation after the three-point line extension in EuroLeague basketball, Journal of Sports Sciences, 2026（PMID 42635417）。"
    url: "https://doi.org/10.1080/02640414.2026.2722815"
  - title: "The FIBA Central Board approves historic rule changes, FIBA, 2008。"
    url: "https://www.fiba.basketball/en/news/pr-n-025-the-fiba-central-board-approves-historic-rule-changes"
  - title: "Andy Wittry, Mid-season update: 3-point shooting in men's college basketball is pretty much back to normal in 2020, NCAA.com, 2020-01-28。"
    url: "https://www.ncaa.com/news/basketball-men/article/2020-01-28/3-point-shooting-mens-basketball-pretty-much-back-normal"
  - title: "Andy Wittry, Here's how the extended 3-point line has (and hasn't) affected college basketball this season, NCAA.com, 2019-12-19。"
    url: "https://www.ncaa.com/news/basketball-men/article/2019-12-11/impact-college-basketballs-new-3-point-line-2019-20-season"
  - title: "NBA commissioner Adam Silver vows to fix 3-point shooting issue, FOX Sports, 2025-01-15。"
    url: "https://www.foxsports.com/stories/nba/nba-commissioner-adam-silver-vows-fix-3-point-shooting-issue-we-it"
  - title: "NBA League Averages, Per Game, Basketball Reference（歷季出手佔比由此表計算）。"
    url: "https://www.basketball-reference.com/leagues/NBA_stats_per_game.html"
category: 籃球研究
---

2025 年 1 月，Adam Silver 被問到聯盟的三分球是不是投得太多。他的回答是：「我不想都還沒想清楚，就把三分線往後移。」

理由是線推遠了，球員會全部擠到籃下，那種球也不好看。

一年多之後，西班牙 Granada 大學的 José Miguel Contreras García 與 Elena Molina Portillo 在《Journal of Sports Sciences》發表了一篇研究，做的正好是這件事的實測。他們的對象是歐洲聯賽。

## 歐洲聯賽 2010 年把三分線推遠半公尺，NBA 那條線 1997 年之後沒再動過。

FIBA 中央委員會 2008 年 4 月通過一批規則變動，2010-11 球季生效。三分線從 6.25 公尺退到 6.75 公尺，禁區從梯形改成長方形，籃下多了一個不吹進攻犯規的半圓。歐洲聯賽從 2010-11 球季跟進。

半公尺。整條弧線一起往外挪。

這是一個罕見的研究對象，因為時間點乾淨。規則在某一天生效，前後都有連續的官方逐球回合資料。這種設計在經濟學裡叫自然實驗，運動科學不常遇到。

對照組就在大西洋另一邊。NBA 那條 23 呎 9 吋、角落 22 呎的弧線，從 1997-98 球季恢復至今沒有再動過。

## 分段迴歸要同時估三件事，才分得開規則效果和原本的趨勢。

難處在於，三分出手本來就一直在往上長。直接比 2009-10 和 2010-11 兩季的數字，看到的是趨勢跟規則效果混在一起的結果，分不出哪一份是誰造成的。

作者用的是分段迴歸，也就是中斷時間序列分析。把 2010-11 設成中斷點，模型同時估三個參數：規則生效前的趨勢斜率、生效當下的水準落差、生效之後斜率的改變。落差歸落差，斜率歸斜率。

資料橫跨 19 個球季，2007-08 到 2025-26。5,034 場比賽、10,068 筆球隊單場觀測、614,442 次出手，其中 233,323 次是三分。三種來源併在一起：投籃位置座標、逐球回合紀錄、技術統計。

主要指標是每 100 次估計球權的三分出手數。用球權標準化，是為了把比賽節奏的差異拿掉，讓 19 個球季用同一把尺量。

## 規則生效當下，歐洲聯賽每 100 球權少投 2.47 次三分。

改制前，歐洲聯賽每 100 球權投 29.4 次三分。2010-11 球季掉到 27.1 次。

分段迴歸估出來的立即水準落差是每 100 球權減少 2.47 次，95% 信賴區間 [-3.62, -1.32]，p 小於 0.001。29.4 到 27.1 這段實際觀測到的跌幅，是將近 8%。

信賴區間沒有跨過零，方向是明確的。球隊確實踩了煞車。

## 三分命中率沒有崩，但出手距離的中位數往外跑了。

改制後第一季的三分命中率在描述統計上是下滑的。可是模型不支持「命中率在規則生效當下出現一次階梯式下降」這個說法。那段下滑比較像是沿著原本的走勢慢慢發生，沒有被那半公尺一刀切下來。

三分出手距離的中位數在改制後上升。這一項有規則本身的成分：弧線外推之後，原本落在 6.25 到 6.75 公尺之間的出手不再算三分，距離的下限被墊高了。

命中率沒有出現階梯式下降，出手量有。球員在那一季少投了三分，投出去的那些並沒有變得比較不準。

作者自己標出了這篇的弱點。歐洲聯賽在 2010-11 之前只有三個球季的資料可用，前段趨勢的斜率是用三個點估出來的，不確定性偏高。中斷時間序列的立即效果估計會受前段趨勢的估計影響，所以 -2.47 這個數要當成方向可信、幅度粗略來讀。

那次下降沒有留下來。後面十幾個球季，三分出手量回升並繼續擴張。

## NCAA 2019 年把三分線推遠 43 公分，三個月內就被形容成回到常態。

美國大學籃球 2019-20 球季做了同一件事。男籃 D1 的三分線從 20 呎 9 吋推到國際距離 22 呎 1.75 吋，往外約 43 公分。規則委員會的說法很直白：拉開禁區空間，順便壓一下三分出手的比重。

2018-19 球季，全美 D1 的三分命中率 34.4%，三分出手佔全部出手的 38.7%。到 2020 年 1 月 27 日為止的 3,780 場比賽，命中率 33.3%，出手佔比 37.6%。每投 100 球，少了一顆三分。

NCAA 自家分析在那年一月下的標題是：大學籃球的三分投射差不多回到常態了。距離新規則生效不到三個月。那個球季後來因為疫情提前結束，沒有完整的終局數字，上面兩組數都是球季中的快照。

## NBA 1994 年把三分線移近，1997 年又移回去。

NBA 在 1990 年代做過反方向的版本，而且幅度更大。

1993-94 球季，NBA 的三分出手佔全部出手的 11.7%。聯盟為了拉抬得分，1994-95 起把三分線縮成全場一致的 22 呎，弧頂那段往內挪了 1 呎 9 吋，大約 53 公分，是三次改動裡位移最大的一次。

那一季出手佔比跳到 18.8%，接下來兩季是 20.0% 和 21.2%。1997-98 恢復 23 呎 9 吋，佔比掉回 15.9%。

線一動，第一季的出手量就跟著動，兩個方向都成立。

然後 15.9% 也沒有停在那裡。2006-07 球季回到 21.2%，追平縮線年代的高點，花了九年。2014-15 是 26.8%，2018-19 是 35.9%，2024-25 到 42.2%。上個球季 2025-26 是 41.5%，聯盟沒有動過那條線。

## 三個聯盟，三次移線，同一個形狀。

歐洲聯賽推遠半公尺，第一季掉 8%，幾個球季後漲回去。大學籃球推遠 43 公分，第一季掉一個百分點的出手佔比，不到三個月就被自家分析形容成回到常態。NBA 把線移近再移回，兩次都在第一季看到明顯的階梯，然後趨勢照原本的方向繼續走。

三次的立即效果都是真的，三次都沒有改變方向。移線買到的是一段重新校準期，買不到戰術演化的轉向。

Silver 那句話因此有了旁證，雖然理由跟他講的不完全一樣。把線推遠壓不住三分，是因為推遠只改變一次出手的難度，改不掉三分值三分這筆換算。球隊算完還是會投。

要讓一個聯盟少投三分，能動的是三分值幾分，或是防守方在弧頂被允許做什麼。弧線的半徑已經在三個聯盟試過三次了。
