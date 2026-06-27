# SR/NMA Protocol:無人機操作員訓練法的效果

> 定位:這是系統性回顧(SR)的 protocol,同時是 NMA 的第一步。先做 SR,用「可納入的對照研究數」決定要不要升級成 NMA。
> 工具全免費:篩選 Rayyan、文獻管理 Zotero、統計 R `metafor`(pairwise)、若升級 NMA 用 MetaInsight。
> 投稿前先把 protocol 註冊到 PROSPERO 或 OSF(免費,增加可信度,審查加分)。

---

## 1. 研究問題(PICOS)

- **P(對象)**:無人機/UAV 操作員或受訓者(新手、現役飛手;可標註軍用 RPAS 子群)。
- **I(介入)**:訓練法 — 桌機模擬器、VR/沉浸式模擬器、AR、遊戲化訓練、影片/數位教材等。
- **C(對照)**:彼此互比,或對「傳統/實機訓練」「無訓練對照」。
- **O(結果)**:
  - 主要:飛行/操作績效(完成時間、誤差/準確度、路徑偏移、落點位移)。
  - 次要:工作負荷(NASA-TLX)、技能遷移(transfer to real flight)、學習曲線、模擬器不適(cybersickness)、保留(retention)。
- **S(設計)**:實驗與類實驗的**對照研究**(RCT 優先)。NMA 需要每篇至少兩個訓練組。

一句話問句:在無人機操作員訓練中,不同訓練法(模擬器 / VR / AR / 傳統)對操作績效與工作負荷的相對效果為何?

## 2. 納入/排除

納入:
- 有量化結果的對照研究(至少兩組,或對無訓練對照)。
- 對象是「人」在學操作無人機。
- 期間不設下限,語言英文(資源允許再加中文)。

排除:
- 單臂前後測、無對照(這類可在 SR 敘述,但不進 meta-analysis)。
- 純自主飛行/演算法訓練(無人類操作員)。
- 綜述、protocol、純技術展示、會議摘要無數據。

> 註:目前初掃顯示「單臂可行性研究」占多數,真正兩臂以上的對照研究偏少。這個納入/排除會把可量化的核心子集篩出來,也直接回答「夠不夠升級 NMA」。

## 3. 資料庫與檢索

資料庫:Scopus、Web of Science、IEEE Xplore、PubMed、ACM Digital Library、ERIC、PsycINFO;Google Scholar 補灰色文獻;手檢 *Drones* (MDPI)、*Computers in Human Behavior* 等。

通用檢索式(各庫再微調語法):

```
("drone" OR "drones" OR "unmanned aerial vehicle*" OR "UAV" OR "UAS"
 OR "remotely piloted aircraft" OR "RPAS" OR "quadcopter" OR "FPV")
AND ("training" OR "pilot training" OR "skill acquisition" OR "simulator"
 OR "simulation" OR "virtual reality" OR "VR" OR "augmented reality" OR "AR"
 OR "instruction" OR "learning")
AND ("random*" OR "controlled" OR "experiment*" OR "trial" OR "comparison"
 OR "versus" OR "performance" OR "transfer of training" OR "workload" OR "NASA-TLX")
```

## 4. 篩選與流程

- 兩人獨立篩選(你 + 一位合作者,或自行雙輪 + 第三方仲裁),用 Rayyan。
- 記錄 PRISMA 2020 流程圖各階段數字(辨識 / 去重 / 篩題摘 / 全文 / 納入)。

## 5. 資料抽取欄位

作者年份、國別、設計、樣本數、對象(新手/現役/軍用)、各組訓練法與劑量(時數/次數)、對照、任務型態、結果測量、結果數值(平均、SD、n)、遷移/保留、偏誤風險。

## 6. 偏誤風險

- RCT 用 RoB 2;非隨機對照用 ROBINS-I。

## 7. 合成計畫

- 先敘述性綜整。
- 對「同一比較且 ≥ 3 篇」的子集做 pairwise meta-analysis(R `metafor`)。連續且量尺不同的結果用標準化平均差(SMD / Hedges' g)。
- 異質性看 I²、τ²;檢出版偏誤用漏斗圖 + Egger。

## 8. 升級 NMA 的判準

同時滿足才升級:
1. 對照研究數約 ≥ 10,且訓練法節點透過共同對照(傳統/無訓練)**連成連通網絡**。
2. 主要結果可調和成單一可比量尺。
3. 至少有一個閉環或足夠的間接比較證據。

升級則:用 MetaInsight 跑(binary/continuous 皆可),報告依 PRISMA-NMA;檢查 transitivity 與 inconsistency(MetaInsight 不做 inconsistency model,需另用 R `netmeta` 的 net heat / node-splitting 補)。

## 9. 候選研究起步清單(開放來源,非完整,待正式檢索補全)

多數為單臂/可行性,標註用以判斷可比子集大小:

- Use of Simulation for Pre-Training of Drone Pilots, *Drones* 2024, 8(11):640. https://www.mdpi.com/2504-446X/8/11/640
- Quantitative Assessment of Drone Pilot Performance, *Drones* 2024, 8(9):482. https://www.mdpi.com/2504-446X/8/9/482
- Workload perception in drone flight training simulators, *Computers in Human Behavior* 2016. https://www.sciencedirect.com/science/article/abs/pii/S0747563216305301
- DroneSim: A VR-based Flight Training Simulator for Drone-mediated Building Inspections (2021).
- Evaluation of Participant Success in Gamified Drone Training Simulator Using Brain Signals and Key Logs. https://pmc.ncbi.nlm.nih.gov/articles/PMC8392183/
- Web AR Solution for UAV Pilot Training and Usability Testing. https://pmc.ncbi.nlm.nih.gov/articles/PMC7922183/
- Identifying Early Predictors of Learning in VR-based Drone Training (2022).
- Use of Drone Flight Simulator for Bridging Theories of UAV Systems into Practice: A Pilot Study (2023).

> 初步研判:可比的兩臂以上對照研究大概湊不到 10 篇,故終點較可能落在 SR + pairwise MA。回本機用高階模型 + 資料庫正式檢索後再定。

---

## 附錄:回本機後,給高階模型的 NMA 選題掃描

### NMA 題目要過的檢查清單

一個題目能做 NMA,要同時滿足:
1. 有 3 個以上可互比的「處置/選項」。
2. 它們透過共同對照連成連通網絡(不是各做各的)。
3. 量同一個結果、尺度可比。
4. 有足夠的對照研究(經驗上總數 ≥ 10、且能形成間接比較)。
5. 結果型態符合工具:MetaInsight 只吃 binary/continuous;診斷準確度(NMA-DTA)、存活(HR)它做不了。

把「無人機/國防」相關但仍符合上述的候選想成:介入 vs 介入、結果是連續或二元。例如訓練法、人機介面設計、操作員選訓方法對績效;這些比 C-UAS 偵測(屬診斷準確度、工具不支援)更可行。

### 可直接貼給高階模型的檢索 prompt

```
你是一位熟悉系統性回顧與網絡統合分析(NMA)的研究方法學家。
目標:在「無人機/UAV/國防安全」相關範圍內,找出『現在就做得起一篇 NMA』的具體題目。
硬條件(全部要滿足才算可行):
1) 至少 3 個可互比的介入/選項;
2) 透過共同對照連成連通網絡;
3) 共同且可比的連續或二元結果變數(排除診斷準確度、存活率,因工具 MetaInsight 不支援);
4) 估計有 ≥10 篇隨機或對照研究,且能形成間接比較。
請輸出:候選題目清單,每題附(a)介入節點、(b)共同對照、(c)主要結果變數、
(d)初估可納入研究數與代表性文獻 3 篇、(e)可行性風險。
依「可行性高到低」排序,並明確標出哪些題目資料量不足、只能做 SR 或 pairwise MA。
優先考慮:無人機操作員訓練法、人機介面/控制方式、操作員選訓。
```

回傳結果後,用上面的「檢查清單」逐題核對,任何一條不過就降級成 SR 或 pairwise。
