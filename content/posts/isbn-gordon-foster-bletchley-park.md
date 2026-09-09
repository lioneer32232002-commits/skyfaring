---
title: "每本書封底的 ISBN，為什麼是破解 Enigma 的密碼分析員設計的？"
author: "AI 初稿 / skyfaring 編輯校正"
date: "2026-09-08"
updated: "2026-09-08"
slug: "isbn-gordon-foster-bletchley-park"
tags:
  - 資訊史
  - 二戰
  - 密碼學
  - 標準化
  - 英國
heroImage: "/images/isbn-gordon-foster-bletchley-park-bombe.jpg"
heroAlt: "Bletchley Park 展出的 Bombe 復原機，正面成排的紅黃色轉輪特寫"
heroCredit: "mendhak, Wikimedia Commons（CC BY-SA 2.0）"
heroCreditUrl: "https://commons.wikimedia.org/wiki/File:Bombe_Machine,_Bletchley_Park.jpg"
excerpt: "設計出 ISBN 的人叫 Gordon Foster，1942 年被 MI6 招募進 Bletchley Park，做的是 Enigma 與德國海軍的 Shark。1965 年英國書商 W.H. Smith 要蓋電腦化倉庫，書業需要一組機器讀得懂的書號。他給的 9 碼 SBN 帶一個除以 11 取餘數的檢查碼，能抓到所有單碼打錯與所有相鄰對調。2007 年 ISBN 為配合條碼改成 13 碼，這項偵錯能力也跟著被換掉。"
highlight: "11 是質數，所以除以 11 取餘數的這套檢查碼，抓得到所有單碼打錯，也抓得到所有相鄰兩碼對調。2007 年 ISBN 為了跟 EAN-13 條碼相容改成除以 10，相鄰對調的偵錯率從 100% 掉到 88.9%。"
source: "Trinity College Dublin 電腦科學與統計學院校史、《愛爾蘭時報》Gordon Foster 訃聞（2011 年 2 月）、ISO 2108 沿革"
source_url: "https://www.tcd.ie/scss/about/history/gordon-foster/"
references:
  - title: "Gordon Foster, School of Computer Science and Statistics, Trinity College Dublin."
    url: "https://www.tcd.ie/scss/about/history/gordon-foster/"
  - title: "Pioneering figure in the worlds of informatics and computing, The Irish Times, 2011-02."
    url: "https://www.irishtimes.com/life-and-style/people/pioneering-figure-in-the-worlds-of-informatics-and-computing-1.583791"
  - title: "Gordon Foster, Wikipedia."
    url: "https://en.wikipedia.org/wiki/Gordon_Foster"
  - title: "ISBN, Wikipedia（含 SBN 沿革、ISO 2108、13 碼轉換）。"
    url: "https://en.wikipedia.org/wiki/ISBN"
  - title: "History, ISBN and ISSN Systems, American Library Association LibGuides."
    url: "https://libguides.ala.org/c.php?g=570259&p=9146661"
  - title: "David Whitaker (publisher), Wikipedia（ISO 工作小組、J. Whitaker & Sons 為首家 SBN 代理機構）。"
    url: "https://en.wikipedia.org/wiki/David_Whitaker_(publisher)"
  - title: "ISBN History, ISBN.org（W.H. Smith 1965 年宣布 1967 年啟用電腦化倉庫）。"
    url: "https://www.isbn.org/ISBN_history"
  - title: "Secrets of the ISBN: An Error Detection Method, R. Tervo, University of New Brunswick."
    url: "https://www.ece.unb.ca/tervo/ece4253/isbn.shtml"
category: 資訊史
---

1942 年，貝爾法斯特女王大學的數學系畢業生 Frederic Gordon Foster 收到一份不能對外說明內容的工作。地點在白金漢郡一座叫 Bletchley Park 的莊園，招募他的是 MI6。

到了那裡，他被分到一間大房間，一張拼裝的長桌。桌上是攔截下來的德軍加密電文。他和同事每天做的事，是在密文裡面找德軍發報員打錯的地方。趕時間、疲勞、每天用同一句開頭問候語，這些狀況都會在密文裡留下規律。做久了，他認得出個別發報員的手法。

他形容這份工作很例行。

二十三年後，同一個人替英國書業設計了一組 9 位數的編號。那組編號現在印在全世界每一本書的封底。

## 1942 年進 Bletchley Park 的 Gordon Foster，戰爭結束後才第一次見到圖靈。

Foster 1921 年 2 月 24 日生於貝爾法斯特。1939 年他進女王大學時還不知道要讀什麼，試過醫科，發現自己既不喜歡待實驗室也不喜歡解剖小動物，最後選了文學士、主修數學。1942 年畢業，人幾乎立刻就到了 Bletchley Park。他經手的是德國陸軍的 Enigma、德國海軍代號 Shark 的四轉子版本，也碰過日本海軍的密碼。

戰爭結束後，1950 年他拿到獎學金，去牛津 Magdalen College 讀博士，1952 年完成，題目是機率論裡的幾個問題。

讀博期間的 1951 年，他去聽了美國數學家 Norbert Wiener 的一場演講，這場演講很快帶來一個邀約。曼徹斯特大學的統計學教授請他過去講一場，接待的人告訴他圖靈就在校內。他在 Bletchley Park 本來就屬於圖靈領導的團隊，整場戰爭卻沒見過本人，兩人到這時才第一次碰面。圖靈帶他看了自己參與開發的 Manchester Mark I，那次見面重新點燃了他對電腦的興趣。

1950 年代他進倫敦政經學院，1964 年當上計算方法講座教授。

隔年，英國書業找上他。

## 1965 年 W.H. Smith 要蓋電腦化倉庫，缺一個機器讀得懂的書號。

W.H. Smith 是當時英國最大的單一圖書零售商。1965 年，公司宣布要在 1967 年啟用電腦化倉庫。

倉庫要電腦化，庫存系統就得能唯一指認一本書。當時的做法是靠書名、作者、出版社、版次、裝訂形式湊成一串描述，每家出版社又各有各的內部目錄編號。同一本書在不同人的帳上長得不一樣，訂貨、出貨、對帳都要靠人去比對文字。

W.H. Smith 需要的是一組短的、純數字的、能直接餵進主機的識別碼。多數記載說，1965 年委託當時在倫敦政經學院的 Foster 來設計的就是這家公司；都柏林聖三一學院（Trinity College Dublin）自己的校史則說，1966 年找 Foster 做出版社庫存編碼的是出版商 Wiley，W.H. Smith 當時另外在做自己的一套。

兩邊都記載到，英國出版商協會（Publishers Association）在 1966 年啟動了全書業統一編號的評估，最後收斂到同一套方案。

## 1967 年英國先上線 9 碼 SBN，1970 年 ISO 2108 把它變成 ISBN。

Foster 的報告《Standard Numbering in the Book Trade》由出版商協會在 1967 年出版，系統本身在 1966 年就完成，1967 年在英國書業上線，名字叫標準書號（Standard Book Numbering，SBN）。

SBN 是 9 位數：前面幾碼是出版社，中間幾碼是這家出版社的第幾本書，最後一碼是檢查碼。出版社規模不同，分到的位數也不同，大社的出版社碼短、書號位數多，小社反過來。這個設計讓已經在用自家編號的出版社可以把舊碼接進來。

接著國際標準化組織來問，這套能不能改成國際版。編號從 9 碼加到 10 碼，1970 年發布為 ISO 2108，也就是 10 碼 ISBN。照聖三一學院的記載，這一步是 ISO 回頭請 Foster 自己做的。轉換方式是在 9 碼的 SBN 前面補一個 0，那個 0 代表英語出版區。英國書業自己的 9 碼 SBN 用到 1974 年才全面換掉。

把 SBN 推成國際標準還有兩個人出力。英國的 David Whitaker 主持 ISO 第一個 ISBN 工作小組，參與起草 ISO 2108；他家族的 J. Whitaker & Sons 是全世界第一家 SBN 代理機構，他後來被稱作 ISBN 之父。美國那邊是 Emery Koltay，1968 年把這套帶進美國，後來主管美國的 ISBN 代理機構 R. R. Bowker。ISO 2108 定下來的基本結構沿用到今天，200 多個國家與地區在用。

SBN 在英國上線那年，Foster 在都柏林的職位還掛著客座。聖三一學院 1965 年設了統計學講座，要找一個夠份量的人來領這個新單位，1966 年任命他為第一任講座，也是校史上第一位統計學教授。1967 年到 1968 年初他以客座身分兼著做，1968 年才轉正式教授，1971 年獲選為學院院士。

## ISBN 的檢查碼為什麼要除以 11，不是除以 10？

ISBN 有 10 個數字，也就是 10 碼。前面 9 個是書的編號，最後一個是檢查碼，用來檢查前面 9 個有沒有抄錯。

作法是把前面 9 個數字丟進一套固定的算式，得到一個答案，寫在最後一位。之後每次有人輸入這串號碼，電腦就拿前面 9 個數字重算一次，跟最後一位對。抄錯一個數字，重算出來的答案就跟最後一位對不上，電腦知道這串號碼有問題。

那套算式的最後一步是除以 11，留下餘數。數學上把「除以某個數，只看餘數」這件事叫做取模，所以下面會看到「模 11」（mod 11）這個講法，它指的就是除以 11 取餘數。

10 碼 ISBN 的檢查碼是這樣算的：前 9 碼分別乘上 10、9、8、7、6、5、4、3、2，加總以後除以 11 取餘數，檢查碼等於 11 減掉餘數。餘數為 0 時檢查碼寫 0，需要寫 10 的時候用字母 X 代替。

拿 0-306-40615-2 來算。前 9 碼 0、3、0、6、4、0、6、1、5 乘上對應權重，得到 0、27、0、42、24、0、24、3、10，加起來 130。130 除以 11 餘 9，11 減 9 等於 2，跟印在書上的檢查碼一樣。

選 11 的理由在於它是質數。單獨改錯一碼時，那一位的加權值一定會變，餘數跟著變，錯誤跑不掉。相鄰兩碼對調時，兩碼的權重只差 1，算下來加權和的變化量剛好等於這兩碼的差，最多 9，不可能是 11 的倍數，餘數同樣會變。這兩類是人工輸入最常犯的錯，模 11 的方案把它們全部堵住。

還是拿剛才那組來看。把 0-306-40615-2 前 9 碼裡的 6 和 1 對調，順序變成 0、3、0、6、4、0、1、6、5，重算加權和是 125，除以 11 餘 4，檢查碼應該是 7，跟書上印的 2 對不上。系統當場退件。

一個從 1942 年起在 Bletchley Park 靠找人為輸入錯誤吃飯的人，替書業設計編號時，第一件在意的事是怎麼自動抓到人為輸入錯誤。

## 2007 年改成 13 碼之後，ISBN 抓錯的能力退了一步。

2005 年前後，部分類別的 10 碼 ISBN 預計會不夠用，零售端也希望書號能直接當商品條碼用。ISO 的解法是併進歐洲商品編號（EAN-13）體系：舊的 10 碼 ISBN 前面加上 978 這個「Bookland」前綴，湊成 13 碼。978 用完之後啟用 979，美國從 2020 年開始發 979 開頭的號。新制從 2007 年 1 月 1 日生效。

代價出在檢查碼。EAN-13 的檢查碼改成除以 10 取餘數，權重在 1 和 3 之間交替。相鄰兩碼對調時，加權和的變化量是兩碼差值的 2 倍；只要差值剛好是 5，變化量就是 10，除以 10 之後餘數不變，檢查碼一模一樣。0 跟 5、1 跟 6、2 跟 7、3 跟 8、4 跟 9，這五組相鄰對調全部溜過去。相鄰對調的偵錯率從 100% 掉到 88.9%。

把前面那個例子換成 13 碼版本就看得到。978-0-306-40615-7 是合法的 ISBN；把倒數第三、第四碼的 6 和 1 對調，變成 978-0-306-40165-7，用模 10 重算，檢查碼依然是 7。同一個錯誤，10 碼制擋得下來，13 碼制放行。

條碼掃描取代人工鍵入之後，相鄰對調早就不是主要的錯誤來源。換來的是書號能跟全球零售系統共用一套編碼，代價是相鄰對調的偵錯率掉 11.1 個百分點。ISO 在 2007 年的取捨站得住腳。

只是那個從 1966 年帶到 2007 年的性質，確實被換掉了。四十一年後，書業決定人打字會不會出錯這個問題，交給機器就好。

Foster 在 2010 年 12 月 20 日於都柏林過世，享年 89 歲。那時 13 碼制已經上路三年，新發的書號最後一碼，用的已經不是他當年設計的那套演算法。
