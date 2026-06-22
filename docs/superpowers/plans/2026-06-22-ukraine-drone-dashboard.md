# 烏克蘭無人機戰研究儀表板 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 skyfaring 站新增獨立儀表板 `/ukraine-review/`，以能力領域為主軸、戰爭演進時間線為敘事脊椎，整理烏克蘭團隊自 2022 開戰至今的無人機研究與技術發展（~30–40 項策展）。

**Architecture:** 策展資料寫在 `scripts/review-dashboard/ukraine-meta.json`；新生成器 `build_ukraine_intel.py` 純讀該 JSON，沿用現有 drone dashboard 的視覺語言（暗色 / IBM Plex Mono / Chart.js / 角標卡片）與延伸閱讀 id 比對，輸出靜態 `public/ukraine-review/index.html`。研究蒐集用 Workflow 多代理 fan-out + 對抗式查證。

**Tech Stack:** Python 3（標準庫，選用 pandas 非必要）、Chart.js 4（CDN）、Next.js 站（首頁卡片）、git/Cloudflare Pages 部署。

**git 慣例（沿用 drone 管線）：** 管線檔（`ukraine-meta.json`、`build_ukraine_intel.py`、`publish_ukraine_intel.py`、`ukraine-papers/`）維持**未追蹤**；只 commit `public/ukraine-review/index.html` 與 `lib/projects.ts`。

---

## File Structure

- Create: `scripts/review-dashboard/ukraine-meta.json` — 策展資料（敘事 + 項目）。本機 only，不進 git。
- Create: `scripts/review-dashboard/build_ukraine_intel.py` — 生成器。本機 only。
- Create: `scripts/review-dashboard/publish_ukraine_intel.py` — 發布包裝。本機 only。
- Create: `public/ukraine-review/index.html` — 部署成品。**進 git。**
- Modify: `lib/projects.ts` — 加首頁/頁尾卡片。**進 git。**
- Create: `ukraine-papers/*.md` — 同儕審查子集摘要存檔。本機 only。

---

## Task 1: 研究蒐集 → 產出 ukraine-meta.json

**Files:**
- Create: `scripts/review-dashboard/ukraine-meta.json`

研究用 Workflow 多代理執行（ultracode 已開）。本任務產出一份通過查證的策展資料檔。

- [ ] **Step 1: 跑研究 Workflow**

依 9 個能力領域各派搜尋代理平行 fan-out（WebSearch + WebFetch），每代理回傳該領域候選項目（含 `source_url`、宣稱數據、團隊、年份）。流程：
1. fan-out 搜尋（9 領域）
2. 每領域結構化候選
3. 對抗式查證：對易誇大聲明（USV 擊沉戰果、年產量、「首例」宣稱）派獨立查證代理求證，標 `credibility`，存疑則降級（osint）或剔除
4. 跨領域去重、挑代表性，湊 ~30–40 項
5. 撰寫 narrative / phase_notes / need_response_pairs / capability_points（遵守 CLAUDE.md 寫作規範：無破折號、無感嘆號、中英文間盤古之白）

- [ ] **Step 2: 寫成 ukraine-meta.json**

結構（鍵名固定，生成器依此讀取）：

```json
{
  "topic": "ukraine",
  "window": {"start": "2022-02", "end": "2026-06"},
  "phases": [
    {"key": "2022", "label": "2022 改裝期", "blurb": "商規 DJI 與改裝投彈"},
    {"key": "2023", "label": "2023 規模化＋海戰", "blurb": "FPV 量起、USV 擊艦"},
    {"key": "2024", "label": "2024 量產＋光纖＋電子戰", "blurb": "光纖機、EW 競賽、Brave1"},
    {"key": "2025", "label": "2025–2026 自主化", "blurb": "AI 末端導引、攔截機、drone-on-drone"}
  ],
  "narrative": {
    "capability_read": "一段：烏克蘭在哪些領域領先、戰場驅動為何重要（小樣本＋既有知識的觀察）。",
    "arc": "一段：2022→2026 能力演進主線。"
  },
  "phase_notes": {"2022": "...", "2023": "...", "2024": "...", "2025": "..."},
  "need_response_pairs": [
    {"need": "GPS／無線電干擾普遍化", "response": "光纖無人機與機器視覺末端導引，鏈路與導引去依賴 GNSS"}
  ],
  "capability_points": ["...", "...", "提醒：小樣本加既有知識的觀察。"],
  "items": [
    {
      "id": "magura-v5",
      "date": "2023-08",
      "phase": "2023",
      "theme": "海上無人載具 USV",
      "team": "GUR 國防情報總局／海軍與產業",
      "team_type": "政府/軍方",
      "credibility": "official",
      "title": "Magura V5 攻擊型無人水面艇",
      "one_line": "擊沉與擊傷多艘黑海艦隊艦艇的攻擊型 USV",
      "source_url": "https://...",
      "representative": true,
      "note": ""
    }
  ]
}
```

`theme` 用這 9 類字串之一（實際以蒐集微調）：`FPV 攻擊／遊蕩彈藥`、`光纖無人機`、`自主與 AI 末端鎖定`、`反無人機與攔截`、`電子戰與抗干擾`、`海上無人載具 USV`、`地面無人載具 UGV`、`ISR 與目標管理`、`深遠程打擊與生產生態系`。
`team_type` 用：`政府/軍方`、`Brave1/國家平台`、`學術`、`產業/新創`、`志願者/民間`。
`credibility` 用：`peer`、`official`、`media`、`osint`。
`phase` 對應 phases 的 key。

- [ ] **Step 3: 健全性檢查**

確認：每項 `theme`/`team_type`/`credibility`/`phase` 都落在合法集合；`source_url` 非空；至少各 phase 與各 theme 都有項目；項目數 30–40。手動掃一遍 JSON。

Acceptance：`python -c "import json;d=json.load(open('scripts/review-dashboard/ukraine-meta.json',encoding='utf-8'));print(len(d['items']),'items')"` 印出 30–40。

- [ ] **Step 4: 不 commit**（管線檔本機 only，沿用 drone 慣例）

---

## Task 2: 生成器 build_ukraine_intel.py

**Files:**
- Create: `scripts/review-dashboard/build_ukraine_intel.py`

- [ ] **Step 1: 寫生成器（完整檔）**

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""烏克蘭無人機戰研究儀表板（單頁，能力領域主軸 + 戰爭演進時間線）。

純讀 ukraine-meta.json。沿用 drone dashboard 視覺語言與延伸閱讀 id 比對。
"""
import argparse
import json
import re
from datetime import datetime
from pathlib import Path

FM_RE = re.compile(r"^---\s*\n(.*?)\n---", re.S)
ID_ARXIV = re.compile(r"\d{4}\.\d{4,5}")
ID_DOI = re.compile(r"10\.\d{4,9}/([A-Za-z0-9.\-_/]+)")
ID_TOKEN = re.compile(r"[a-z]+\d[\w.\-]*")
URL_RE = re.compile(r"https?://[^\s\"')]+")

THEME_PALETTE = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899",
                 "#14b8a6", "#ef4444", "#6366f1", "#f97316"]
TEAM_PALETTE = ["#5b8cff", "#2dd4aa", "#f59e0b", "#e0586a", "#a78bfa"]
CRED = {"peer": ("同儕審查", "#2dd4aa"), "official": ("官方", "#5b8cff"),
        "media": ("媒體／智庫", "#f59e0b"), "osint": ("OSINT", "#e0586a")}


def esc(s):
    return (str(s).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


def _ids(*texts):
    out = set()
    for t in texts:
        if not t:
            continue
        s = str(t)
        out.update(ID_ARXIV.findall(s))
        out.update(m.lower().rstrip("/.") for m in ID_DOI.findall(s))
        out.update(ID_TOKEN.findall(s.lower()))
    return {i for i in out if i}


def load_articles(posts_dir: Path) -> dict:
    aidx = {}
    if not posts_dir.exists():
        return aidx
    for p in sorted(posts_dir.glob("*.md")):
        m = FM_RE.search(p.read_text(encoding="utf-8", errors="ignore"))
        if not m:
            continue
        block = m.group(1)
        tm = re.search(r'^title:\s*(.+)$', block, re.M)
        title = tm.group(1).strip().strip('"').strip("'") if tm else p.stem
        for i in _ids(*URL_RE.findall(block)):
            aidx.setdefault(i, (p.stem, title))
    return aidx


def match_article(source_url: str, aidx: dict):
    for i in _ids(source_url):
        if i in aidx:
            return aidx[i]
    return None


def cred_chip(c):
    label, color = CRED.get(c, ("未標", "#9ca3af"))
    return (f'<span class="chip" style="background:{color}22;color:{color};'
            f'border:1px solid {color}55">{label}</span>')


def build_data(meta):
    items = meta.get("items", [])
    phases = meta.get("phases", [])
    phase_keys = [p["key"] for p in phases]
    phase_labels = [p["label"] for p in phases]

    themes = []
    for it in items:
        if it.get("theme") and it["theme"] not in themes:
            themes.append(it["theme"])
    # 領域依總數排序
    theme_count = {t: sum(1 for it in items if it.get("theme") == t) for t in themes}
    themes.sort(key=lambda t: -theme_count[t])

    team_types = []
    for it in items:
        tt = it.get("team_type", "")
        if tt and tt not in team_types:
            team_types.append(tt)

    # 時間線：phase x theme 矩陣（stacked bar，dataset=theme）
    timeline = []
    for t in themes:
        row = [sum(1 for it in items
                   if it.get("theme") == t and it.get("phase") == pk)
               for pk in phase_keys]
        timeline.append({"label": t, "data": row})

    theme_vals = [theme_count[t] for t in themes]
    team_vals = [sum(1 for it in items if it.get("team_type") == tt) for tt in team_types]
    cred_keys = [k for k in CRED if any(it.get("credibility") == k for it in items)]
    cred_labels = [CRED[k][0] for k in cred_keys]
    cred_vals = [sum(1 for it in items if it.get("credibility") == k) for k in cred_keys]
    cred_colors = [CRED[k][1] for k in cred_keys]

    years = sorted({it["date"][:4] for it in items if it.get("date")})
    span = f"{years[0]}–{years[-1]}" if years else ""
    n_src = len({it.get("source_url", "") for it in items if it.get("source_url")})

    kpi = {"total": len(items), "themes": len(themes), "span": span,
           "teamtypes": len(team_types), "systems": sum(1 for it in items if it.get("representative")),
           "sources": n_src}

    return {
        "kpi": kpi,
        "phaseLabels": phase_labels,
        "timeline": timeline,
        "themeLabels": themes, "themeVals": theme_vals,
        "teamLabels": team_types, "teamVals": team_vals,
        "credLabels": cred_labels, "credVals": cred_vals, "credColors": cred_colors,
        "themePalette": THEME_PALETTE, "teamPalette": TEAM_PALETTE,
    }, themes


def items_table(meta, themes, aidx):
    items = meta.get("items", [])
    phase_label = {p["key"]: p["label"] for p in meta.get("phases", [])}
    rows = []
    for t in themes:
        grp = [it for it in items if it.get("theme") == t]
        grp.sort(key=lambda it: it.get("date", ""))
        for it in grp:
            link = (f'<a href="{esc(it["source_url"])}" target="_blank">來源</a>'
                    if it.get("source_url") else "")
            art = match_article(it.get("source_url", ""), aidx)
            read = f'<a class="read" href="/blog/{art[0]}/">本站導讀 ↗</a>' if art else ""
            ph = esc(phase_label.get(it.get("phase", ""), it.get("phase", "")))
            rows.append(
                f"<tr><td class='dt'>{esc(it.get('date',''))}<div class='ph'>{ph}</div></td>"
                f"<td><span class='th'>{esc(t)}</span></td>"
                f"<td><div class='ttl'>{esc(it.get('title',''))}</div>"
                f"<div class='ol'>{esc(it.get('one_line',''))}</div>{read}</td>"
                f"<td class='src'>{esc(it.get('team',''))}"
                f"<div class='tt'>{esc(it.get('team_type',''))}</div></td>"
                f"<td>{cred_chip(it.get('credibility',''))}</td>"
                f"<td>{link}</td></tr>")
    return "\n".join(rows)


def extended_reading(meta, aidx):
    seen = {}
    for it in meta.get("items", []):
        art = match_article(it.get("source_url", ""), aidx)
        if art and art[0] not in seen:
            seen[art[0]] = (art[1], it.get("title", ""))
    if not seen:
        return ""
    li = "\n".join(
        f'<li><a href="/blog/{slug}/">{esc(at)} ↗</a>'
        f'<span class="ex-src">對應項目：{esc(pt)}</span></li>'
        for slug, (at, pt) in seen.items())
    return ('<div class="card exlist"><h3>延伸閱讀 · 本站導讀 '
            '<span class="hint">部分項目有對應導讀文章</span></h3>'
            f'<ul>{li}</ul></div>')


def narr_html(meta):
    n = meta.get("narrative", {})
    pn = meta.get("phase_notes", {})
    phases = meta.get("phases", [])
    pts = meta.get("capability_points") or []
    cap = "<ul class='cap'>" + "".join("<li>%s</li>" % esc(x) for x in pts) + "</ul>" if pts \
        else "<p class='cap'>%s</p>" % esc(n.get("capability_read", ""))
    phase_blocks = "\n".join(
        f"<div class='b'><h4>{esc(p['label'])}</h4><p>{esc(pn.get(p['key'],''))}</p></div>"
        for p in phases)
    pairs = "\n".join(
        f"<tr><td class='need'>{esc(pr.get('need',''))}</td>"
        f"<td class='resp'>{esc(pr.get('response',''))}</td></tr>"
        for pr in meta.get("need_response_pairs", []))
    return f"""
      <div class="card"><h3>能力判讀 <span class="hint">小樣本＋既有知識的觀察，非精確指標</span></h3>
        {cap}
        <p class="arc">{esc(n.get('arc',''))}</p>
      </div>
      <div class="card"><h3>分期發展脈絡</h3><div class="narr phases">{phase_blocks}</div></div>
      <div class="card"><h3>戰場需求 → 烏克蘭技術回應</h3>
        <table class="cmp"><thead><tr><th>戰場需求</th><th>技術回應</th></tr></thead>
        <tbody>{pairs}</tbody></table></div>"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--meta", required=True)
    ap.add_argument("--out", required=True)
    a = ap.parse_args()

    meta = json.loads(Path(a.meta).read_text(encoding="utf-8"))
    data, themes = build_data(meta)
    aidx = load_articles(Path(__file__).resolve().parents[2] / "content" / "posts")
    k = data["kpi"]
    win = meta.get("window", {})
    gen_date = datetime.now().strftime("%Y-%m-%d")
    js = json.dumps(data, ensure_ascii=False)

    tpl = TEMPLATE
    html = (tpl.replace("__START__", esc(win.get("start", "")))
            .replace("__END__", esc(win.get("end", "")))
            .replace("__GEN__", gen_date)
            .replace("__K_TOTAL__", str(k["total"])).replace("__K_THEMES__", str(k["themes"]))
            .replace("__K_SPAN__", esc(k["span"])).replace("__K_TEAM__", str(k["teamtypes"]))
            .replace("__K_SYS__", str(k["systems"])).replace("__K_SRC__", str(k["sources"]))
            .replace("__NARR__", narr_html(meta))
            .replace("__ROWS__", items_table(meta, themes, aidx))
            .replace("__EXT__", extended_reading(meta, aidx))
            .replace("__DATA__", js))
    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    Path(a.out).write_text(html, encoding="utf-8")
    print(f"wrote {a.out}  items={k['total']} themes={k['themes']}")


TEMPLATE = r"""<!DOCTYPE html>
<html lang="zh-Hant"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>烏克蘭無人機戰研究儀表板 __START__~__END__</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Noto+Sans+TC:wght@400;500;700&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
<style>
:root{--panel:#0d1422;--panel2:#101a2c;--line:rgba(120,160,210,.14);--hair:rgba(120,160,210,.10);--txt:#e8eef8;--mut:#7e93b3;--dim:#566884;--accent:#5b8cff;--gold:#f5c451;--signal:#38bdf8;--mono:'IBM Plex Mono',ui-monospace,monospace;}
*{box-sizing:border-box}
body{margin:0;color:var(--txt);line-height:1.6;font-family:'Noto Sans TC','Segoe UI','Microsoft JhengHei',system-ui,sans-serif;background:radial-gradient(1100px 520px at 50% -8%,#0d1626,transparent),linear-gradient(#0a0f1c,#070b14);min-height:100vh}
.wrap{max-width:1180px;margin:0 auto;padding:24px 22px 56px}
.sys{display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-family:var(--mono);font-size:11.5px;color:var(--mut);text-transform:uppercase;letter-spacing:.18em;border-bottom:1px solid var(--line);padding-bottom:10px;margin-bottom:16px}
.sys .live{color:var(--gold)}
.sys .live::before{content:'';display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--gold);margin-right:7px;vertical-align:1px;box-shadow:0 0 9px var(--gold)}
.sys .sep{color:var(--dim)}
h1{font-size:25px;margin:8px 0 4px;letter-spacing:.01em;font-weight:700}
.sub{color:var(--mut);font-size:13px;margin-bottom:20px;font-family:var(--mono);letter-spacing:.04em}
.kpis{display:grid;grid-template-columns:repeat(6,1fr);gap:11px;margin-bottom:16px}
@media(max-width:880px){.kpis{grid-template-columns:repeat(3,1fr)}}
.kpi{position:relative;background:linear-gradient(180deg,var(--panel2),var(--panel));border:1px solid var(--line);border-top:2px solid var(--accent);border-radius:3px;padding:13px 14px}
.kpi .v{font-family:var(--mono);font-size:25px;font-weight:600;line-height:1;font-variant-numeric:tabular-nums}
.kpi .l{font-size:10px;letter-spacing:.13em;text-transform:uppercase;color:var(--mut);margin-top:8px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}
@media(max-width:880px){.grid2{grid-template-columns:1fr}}
.card{position:relative;background:linear-gradient(180deg,var(--panel2),var(--panel));border:1px solid var(--line);border-radius:3px;padding:16px 16px 14px;margin-bottom:14px}
.card::before,.card::after{content:'';position:absolute;width:11px;height:11px;border:1px solid rgba(120,160,210,.5);pointer-events:none}
.card::before{left:-1px;top:-1px;border-right:0;border-bottom:0}
.card::after{right:-1px;bottom:-1px;border-left:0;border-top:0}
.card h3{margin:0 0 12px;font-size:12px;color:#bcd0ec;font-weight:500;text-transform:uppercase;letter-spacing:.13em;display:flex;align-items:center;gap:8px}
.card h3 .hint{color:var(--dim);font-weight:400;font-size:10.5px;letter-spacing:.06em;text-transform:none}
.card h3::before{content:'';width:5px;height:5px;background:var(--signal);box-shadow:0 0 7px var(--signal);transform:rotate(45deg);flex:0 0 auto}
canvas{max-height:300px}
table{width:100%;border-collapse:collapse;font-size:13px}
th,td{text-align:left;padding:9px 8px;border-bottom:1px solid var(--hair);vertical-align:top}
th{color:var(--mut);font-size:11px;text-transform:uppercase;letter-spacing:.07em;font-weight:500}
.chip{display:inline-block;padding:1px 8px;border-radius:3px;font-size:11px;white-space:nowrap;font-family:var(--mono)}
.th{color:#bcd0ec;font-size:12px}
.ttl{color:#e8eef8} .ol{color:var(--mut);font-size:12px;margin-top:3px}
.dt{color:var(--mut);white-space:nowrap;font-family:var(--mono);font-size:12px} .dt .ph{color:var(--dim);font-size:10px;margin-top:2px}
.src{color:#b9c6da} .src .tt{color:var(--dim);font-size:11px;font-family:var(--mono);margin-top:2px}
a{color:#6ea8fe;text-decoration:none} a:hover{text-decoration:underline}
.cap{color:#dbe5f3;margin:4px 0 0;padding-left:18px} .cap li{margin-bottom:7px}
.arc{color:#d3dcec;margin:12px 0 0}
.narr.phases{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media(max-width:880px){.narr.phases{grid-template-columns:1fr}}
.narr .b{padding-left:14px;border-left:2px solid var(--accent)}
.narr h4{margin:0 0 6px;font-size:13px;color:#cdd9ec;text-transform:uppercase;letter-spacing:.05em}
.narr p{margin:0;color:#d3dcec}
.cmp th{color:var(--mut)} .cmp td.need{color:#f0b9c0;font-weight:500} .cmp td.resp{color:#cfe0ff;border-left:2px solid rgba(91,140,255,.35)}
.read{display:inline-block;margin-top:6px;font-family:var(--mono);font-size:11px;letter-spacing:.04em;color:#7fd1ff;border:1px solid rgba(56,189,248,.4);border-radius:3px;padding:1px 8px}
.read:hover{background:rgba(56,189,248,.12);text-decoration:none}
.exlist ul{list-style:none;margin:0;padding:0}
.exlist li{padding:10px 0;border-bottom:1px solid var(--hair);display:flex;flex-direction:column;gap:3px}
.exlist li:last-child{border-bottom:0}
.exlist a{color:#9dd0ff;font-size:14px} .exlist .ex-src{color:var(--dim);font-size:11px;font-family:var(--mono)}
.foot{color:var(--dim);font-size:11px;margin-top:24px;border-top:1px solid var(--line);padding-top:12px;font-family:var(--mono);letter-spacing:.04em}
</style></head>
<body><div class="wrap">
  <div class="sys"><span class="live">觀察中 · LIVE</span><span class="sep">//</span><span>INTEL · UKRAINE DRONE WAR</span><span class="sep">//</span><span>SINCE __START__ &#8594; __END__</span><span class="sep">//</span><span>GEN __GEN__</span></div>
  <h1>烏克蘭無人機戰研究 · 戰場驅動的能力演化</h1>
  <div class="sub">能力領域為主軸　／　2022 開戰至今的累積觀察</div>
  <div class="kpis">
    <div class="kpi"><div class="v">__K_TOTAL__</div><div class="l">收錄項目</div></div>
    <div class="kpi"><div class="v">__K_THEMES__</div><div class="l">能力領域</div></div>
    <div class="kpi"><div class="v">__K_SPAN__</div><div class="l">涵蓋年度</div></div>
    <div class="kpi"><div class="v">__K_TEAM__</div><div class="l">團隊類型</div></div>
    <div class="kpi"><div class="v">__K_SYS__</div><div class="l">代表項目</div></div>
    <div class="kpi"><div class="v">__K_SRC__</div><div class="l">來源</div></div>
  </div>
  <div class="card"><h3>能力演進時間線 <span class="hint">各分期 × 能力領域的項目數</span></h3><canvas id="timeline"></canvas></div>
  <div class="grid2">
    <div class="card"><h3>能力領域分布</h3><canvas id="theme"></canvas></div>
    <div class="card"><h3>團隊類型占比</h3><canvas id="team"></canvas></div>
  </div>
  <div class="card"><h3>來源可信度分層 <span class="hint">廣義來源的查證等級</span></h3><canvas id="cred"></canvas></div>
  __NARR__
  <div class="card"><h3>代表性項目 <span class="hint">依能力領域分組</span></h3>
    <table><thead><tr><th>日期</th><th>領域</th><th>項目</th><th>團隊</th><th>可信度</th><th></th></tr></thead>
    <tbody>__ROWS__</tbody></table>
  </div>
  __EXT__
  <div class="foot">硬統計（項目數、領域分布、分期）由策展資料計算。廣義來源含官方、媒體與 OSINT，已標可信度分層；戰果與產量等數字以可查證來源為準，存疑者降級或剔除。本頁為公開情報觀察整理，非官方資料。</div>
</div>
<script>
const D = __DATA__;
const mut="#7e93b3", grid="rgba(120,160,210,.08)", line="rgba(120,160,210,.14)";
Chart.defaults.color=mut; Chart.defaults.font.family="'IBM Plex Mono','Noto Sans TC',monospace"; Chart.defaults.font.size=11;
const leg={position:'bottom',labels:{usePointStyle:true,pointStyle:'rectRounded',boxWidth:9,boxHeight:9,padding:14,font:{size:11},color:mut}};
const tip={backgroundColor:'#0b1322',borderColor:line,borderWidth:1,titleColor:'#cdd9ec',bodyColor:'#e8eef8',padding:10,cornerRadius:4,boxPadding:5,titleFont:{size:11},bodyFont:{size:12}};
new Chart(document.getElementById('timeline'),{type:'bar',data:{labels:D.phaseLabels,datasets:D.timeline.map((t,i)=>({label:t.label,data:t.data,backgroundColor:D.themePalette[i%D.themePalette.length],borderRadius:3}))},
  options:{plugins:{legend:leg,tooltip:tip},scales:{x:{stacked:true,grid:{display:false}},y:{stacked:true,grid:{color:grid},border:{display:false},ticks:{precision:0}}}}});
new Chart(document.getElementById('theme'),{type:'bar',data:{labels:D.themeLabels,datasets:[{data:D.themeVals,backgroundColor:D.themeLabels.map((_,i)=>D.themePalette[i%D.themePalette.length]),borderRadius:3,barPercentage:.78}]},
  options:{indexAxis:'y',plugins:{legend:{display:false},tooltip:tip},scales:{x:{grid:{color:grid},border:{display:false},ticks:{precision:0}},y:{grid:{display:false}}}}});
new Chart(document.getElementById('team'),{type:'doughnut',data:{labels:D.teamLabels,datasets:[{data:D.teamVals,backgroundColor:D.teamLabels.map((_,i)=>D.teamPalette[i%D.teamPalette.length]),borderColor:'#0d1422',borderWidth:3}]},
  options:{cutout:'66%',plugins:{legend:leg,tooltip:tip}}});
new Chart(document.getElementById('cred'),{type:'bar',data:{labels:D.credLabels,datasets:[{data:D.credVals,backgroundColor:D.credColors,borderRadius:3,barPercentage:.6}]},
  options:{indexAxis:'y',plugins:{legend:{display:false},tooltip:tip},scales:{x:{grid:{color:grid},border:{display:false},ticks:{precision:0}},y:{grid:{display:false}}}}});
</script>
</body></html>"""


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: 不 commit**（本機 only）

---

## Task 3: 建置並驗證輸出

**Files:**
- Create: `public/ukraine-review/index.html`

- [ ] **Step 1: 跑生成器**

Run:
```bash
cd "C:/Users/oneda/OneDrive/02_創作/14_AI TEST/skyfaring"
python scripts/review-dashboard/build_ukraine_intel.py \
  --meta scripts/review-dashboard/ukraine-meta.json \
  --out public/ukraine-review/index.html
```
Expected: `wrote public/ukraine-review/index.html  items=NN themes=9`

- [ ] **Step 2: smoke 檢查輸出含關鍵區塊**

Run:
```bash
grep -c "能力演進時間線" public/ukraine-review/index.html && \
grep -c "代表性項目" public/ukraine-review/index.html && \
grep -c "戰場需求" public/ukraine-review/index.html
```
Expected: 每行 `1`（或以上）。

- [ ] **Step 3: 用 preview 視覺驗證**

用 preview_start 起 Next dev server，preview 開 `/ukraine-review/`（注意：`public/` 下的 index.html 在 Next 是直接靜態服務，路徑為 `/ukraine-review/`）。檢查：四張圖表渲染無誤、項目表分組正確、無 console error。preview_screenshot 留證。

若圖表破版或數據異常 → 回 Task 1/2 修 meta 或生成器，重跑。

- [ ] **Step 4: 不單獨 commit**（與 Task 7 一起發布）

---

## Task 4: 首頁卡片

**Files:**
- Modify: `lib/projects.ts`

- [ ] **Step 1: 在 PROJECTS 加入烏克蘭卡片**

在 `lib/projects.ts:39`（「無人機技術情報」卡片）之後插入：

```typescript
  {
    title: "烏克蘭無人機戰研究",
    description: "俄烏戰爭至今，烏克蘭團隊的無人機研究與戰場技術演化，依能力領域整理，含時間線與可信度分層。",
    url: `${BASE_PATH}/ukraine-review/`,
    icon: "🇺🇦",
    external: false,
  },
```

- [ ] **Step 2: 驗證 build 不壞**

Run: `npm run build`（或在 preview dev server 確認首頁卡片出現、連結正確）。
Expected: build 成功，首頁「我的專案」出現新卡片。

- [ ] **Step 3: 暫不 commit**（與 Task 7 一起）

---

## Task 5: 發布腳本 publish_ukraine_intel.py

**Files:**
- Create: `scripts/review-dashboard/publish_ukraine_intel.py`

- [ ] **Step 1: 寫發布包裝（完整檔）**

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""烏克蘭無人機戰研究儀表板：重建＋發布包裝（事件驅動，非月窗口）。

  1. 跑 build_ukraine_intel.py，輸出 public/ukraine-review/index.html。
  2. git add public/ukraine-review/index.html → commit → push（--dry-run 略過 git）。

更新策略：有重大進展才跑（非自動月排程）。
"""
import argparse
import subprocess
import sys
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

SD = Path(__file__).resolve().parent
ROOT = SD.parents[1]
META = SD / "ukraine-meta.json"
BUILD = SD / "build_ukraine_intel.py"
PUBLIC = ROOT / "public" / "ukraine-review" / "index.html"


def run(cmd, **kw):
    print("$", " ".join(str(c) for c in cmd))
    return subprocess.run(cmd, check=True, **kw)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="只建置，不做 git")
    a = ap.parse_args()

    PUBLIC.parent.mkdir(parents=True, exist_ok=True)
    run([sys.executable, str(BUILD), "--meta", str(META), "--out", str(PUBLIC)])
    print(f"published -> {PUBLIC}")

    if a.dry_run:
        print("[dry-run] 不碰 git。")
        return

    run(["git", "-C", str(ROOT), "add", str(PUBLIC.relative_to(ROOT))])
    run(["git", "-C", str(ROOT), "commit", "-m", "烏克蘭無人機戰研究儀表板更新"])
    run(["git", "-C", str(ROOT), "push", "origin", "main"])
    print("pushed. Cloudflare Pages 會在數分鐘內自動部署。")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: dry-run 驗證**

Run: `python scripts/review-dashboard/publish_ukraine_intel.py --dry-run`
Expected: 重新產生 public 檔，印出 `[dry-run] 不碰 git。`

- [ ] **Step 3: 不 commit**（本機 only）

---

## Task 6: 同儕審查子集存檔

**Files:**
- Create: `ukraine-papers/*.md`（每篇 peer 項目一檔）

- [ ] **Step 1: 對 `credibility == "peer"` 的項目，各寫一份摘要 .md**

檔名 `YYYY-MM-DD-識別碼.md`，frontmatter 含 `title`、`date`、`source`/`link`、`one_line`、`theme`。內容為該論文摘要（遵守寫作規範）。

- [ ] **Step 2: 不 commit**（本機 only，沿用論文資料夾慣例）

---

## Task 7: 文章小隊審查 + 發布

發文前必跑文章小隊（CLAUDE.md 規範）。儀表板有大量敘事 + 戰場數據，格式與查核都要過。

- [ ] **Step 1: 隊員 1 格式審查員**

平行 subagent 檢查渲染後 HTML 與 meta 文字：中英文盤古之白、無破折號、無感嘆號、標題標點規則、領域/分期/可信度標籤一致、無重複標題。

- [ ] **Step 2: 隊員 2 資料查核員**

平行 subagent 對抗式複查：每個戰場數據（擊沉戰果、年產量、首例宣稱）對 `source_url` 求證；可信度標籤與來源相符；前後數字無矛盾；時效標示清楚。

- [ ] **Step 3: 隊長彙整**

有問題 → 列待修清單、回 Task 1 修 meta、重建、重審。全過 → 核准發布。

- [ ] **Step 4: 發布（commit 只含成品與 projects.ts）**

Run:
```bash
cd "C:/Users/oneda/OneDrive/02_創作/14_AI TEST/skyfaring"
git add public/ukraine-review/index.html lib/projects.ts
git commit -m "新增烏克蘭無人機戰研究儀表板 /ukraine-review/"
git push origin main
```
Expected: push 成功，Cloudflare Pages 自動部署，數分鐘後 `/ukraine-review/` 上線。

- [ ] **Step 5: 線上驗證**

部署後開線上 `/ukraine-review/` 與首頁卡片連結，確認上線無誤。

---

## Self-Review 對照 spec

- 範圍（廣義戰場驅動）→ Task 1 的 credibility 分層 + 廣義來源涵蓋 ✓
- 放置（獨立 /ukraine-review/）→ Task 3 輸出路徑 + Task 4 卡片 ✓
- 深度（30–40 項）→ Task 1 Step 3 acceptance ✓
- 主軸（能力領域）→ Task 2 build_data 依 theme 排序、項目表依 theme 分組 ✓
- 時間線敘事 → timeline 圖 + phase_notes 分期脈絡 ✓
- 可信度分層 → cred 圖 + cred_chip ✓
- 需求→回應對照 → narr_html need_response_pairs ✓
- 延伸閱讀 → match_article 沿用 ✓
- git 慣例（只 commit public + projects.ts）→ Task 7 Step 4 ✓
- 文章小隊 → Task 7 ✓
- 維護（事件驅動 publish 腳本）→ Task 5 ✓
