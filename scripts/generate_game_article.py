#!/usr/bin/env python3
"""
自動從 lioneers-web 的 processed_data.json 讀取最新比賽數據，
呼叫 Claude API 生成文章，存入 content/posts/。
"""

import json
import os
import re
import sys
from datetime import datetime, timedelta
from pathlib import Path

import anthropic
import requests

DATA_URL = "https://raw.githubusercontent.com/lioneer32232002-commits/lioneers-web/main/processed_data.json"
ALLGAME_URL = "https://raw.githubusercontent.com/lioneer32232002-commits/lioneers-web/main/data/20260402_allgame.txt"
TPBL_API_BASE = "https://api.tpbl.basketball/api"
POSTS_DIR = Path(__file__).parent.parent / "content" / "posts"
LION_TEAM_ID = 4

STYLE_PROMPT = """你是一個愛打籃球、練詠春、對數字很敏感的台灣人，在個人部落格寫了快20年的文章。

寫作風格範例（開頭）：
「在自從在疫情期間看了 Coach Fui 的籃球教學影片，實際練習並應用在打球至今，唯一的心得就是，套句我的詠春拳師傅黃英哲常講的：這真是好東西。但如果把 Coach Fui 的好東西練偏了，會讓人有幻覺。近日打球被一個蒙古來的交換生打爆，他應該是才 20歲，在他的防守下，我有機會切入都但放槍，還被抄了幾球，真幹，回來的路上我一直在想如果是 Coach Fui 會怎麼做。」

從上面範例可以看出，寫作規則如下：
- 一定用第一人稱，從一個非常具體的個人觀察或感受開場，不能是「今天攻城獅打了一場...」
- 找這場比賽裡最有趣的一個數字或現象，以它為核心，然後往裡挖，不要平均分配每個數據
- 語氣直白口語，偶爾有「真幹」「說白了」「老實說」這種語感，但不要刻意
- 偶爾用生活類比解釋籃球數據，比喻要自然不要勉強
- 偶爾自我調侃或坦誠說「我也不確定」「我猜」
- 文章是連貫的散文，800-1000字，繁體中文
- 絕對禁止：破折號（——）、「首先」「其次」「最後」、「值得注意的是」「不得不說」
- 冒號只能用在比分（如 117:100）或標題格式，不能用在中文句子中間做停頓（例如「重點是：...」「結果是：...」這種是AI味）
- 聯盟名稱一律用 TPBL，不要用 PLG
- 用台灣慣用語：「本季」（不是「本賽季」）、「教練」（不是「主教練」）、「比賽」（不是「賽事」）、「得分」（不是「積分」）
- 絕對禁止使用「街球」「半場街球」或任何非職業籃球相關的比喻來描述職業比賽"""

OPPONENT_NAME_MAP = {
    "新北中信特攻": "特攻",
    "桃園台啤永豐雲豹": "雲豹",
    "高雄鋼鐵人": "鋼鐵人",
    "臺北富邦勇士": "勇士",
    "福爾摩沙台新夢想家": "夢想家",
    "新竹街口攻城獅": "街口",
    "高雄全家海神": "海神",
}

# 用於文章 slug（純 ASCII，避免 URL 編碼問題）
OPPONENT_SLUG_MAP = {
    "新北中信特攻": "tga",
    "桃園台啤永豐雲豹": "leopards",
    "高雄鋼鐵人": "steelman",
    "臺北富邦勇士": "braves",
    "福爾摩沙台新夢想家": "dreamers",
    "新竹街口攻城獅": "jko",
    "高雄全家海神": "poseidon",
}


def fetch_data() -> dict:
    resp = requests.get(DATA_URL, timeout=30)
    resp.raise_for_status()
    return resp.json()


def parse_game_date(raw: str) -> datetime:
    """支援 YYYYMMDD 和 YYYY-MM-DD 兩種格式"""
    raw = str(raw).strip()
    if len(raw) == 8 and raw.isdigit():
        return datetime.strptime(raw, "%Y%m%d")
    return datetime.strptime(raw, "%Y-%m-%d")


def normalize_date(raw: str) -> str:
    """統一轉成 YYYY-MM-DD 格式（用於文章 slug 和 frontmatter）"""
    return parse_game_date(raw).strftime("%Y-%m-%d")


def to_yyyymmdd(raw: str) -> str:
    """統一轉成 YYYYMMDD 格式（用於 data/ 檔名）"""
    return parse_game_date(raw).strftime("%Y%m%d")


def get_recent_games(data: dict, days: int = 3) -> list:
    """回傳最近 N 天內的比賽（通常是 1-2 場）"""
    games = data.get("games", [])
    cutoff = datetime.now() - timedelta(days=days)
    recent = []
    for g in games:
        try:
            gdate = parse_game_date(g["date"])
            if gdate >= cutoff:
                recent.append(g)
        except (KeyError, ValueError):
            continue
    return sorted(recent, key=lambda x: x["date"], reverse=True)


def article_exists(game_date: str, opponent: str) -> bool:
    """檢查這場比賽的文章是否已存在（game_date 為 YYYY-MM-DD）"""
    pattern = f"lioneers-{game_date}-*.md"
    existing = list(POSTS_DIR.glob(pattern))
    return len(existing) > 0


def find_game_id(game_date_raw: str) -> int | None:
    """
    從 allgame.txt 找出該日期攻城獅比賽的 game_id。
    """
    target_date = normalize_date(game_date_raw)  # YYYY-MM-DD
    try:
        resp = requests.get(ALLGAME_URL, timeout=15)
        resp.raise_for_status()
        schedule = resp.json()
    except Exception as e:
        print(f"無法取得賽程資料: {e}")
        return None

    for g in schedule:
        if g.get("game_date") != target_date:
            continue
        ht_id = g.get("home_team", {}).get("id")
        at_id = g.get("away_team", {}).get("id")
        if ht_id == LION_TEAM_ID or at_id == LION_TEAM_ID:
            return g.get("id")
    return None


def fetch_game_players(game_date_raw: str) -> dict | None:
    """
    找出 game_id → 直接呼叫 TPBL API 取得攻城獅當場出賽狀況。
    回傳 {'played': [...], 'dnp': [...]}，失敗則回傳 None。
    有 time_on_court 欄位 = 有出場；只有基本欄位 = DNP。
    """
    game_id = find_game_id(game_date_raw)
    if not game_id:
        print(f"找不到 {game_date_raw} 的比賽 game_id")
        return None

    print(f"  取得 game_id={game_id}，呼叫 TPBL API...")
    try:
        resp = requests.get(f"{TPBL_API_BASE}/games/{game_id}/stats", timeout=20)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        print(f"TPBL API 呼叫失敗（game_id={game_id}）: {e}")
        return None

    lion_side = None
    for side in ["home_team", "away_team"]:
        if data.get(side, {}).get("id") == LION_TEAM_ID:
            lion_side = data[side]
            break

    if not lion_side:
        print(f"找不到攻城獅（id={LION_TEAM_ID}）的比賽資料")
        return None

    players_total = lion_side.get("players", {}).get("total", {})
    played = []
    dnp = []

    for _, p in players_total.items():
        if not isinstance(p, dict):
            continue
        name = p.get("name", "")
        if not name:
            continue
        if "time_on_court" in p:
            played.append({
                "name": name,
                "number": p.get("number", ""),
                "score": p.get("score", 0),
                "rebounds": p.get("rebounds", 0),
                "assists": p.get("assists", 0),
                "time_on_court": p.get("time_on_court", ""),
                "is_starting": p.get("is_starting", False),
                "plus_minus": p.get("plus_minus", 0),
                "three_pointers_made": p.get("three_pointers_made", 0),
                "three_pointers_attempted": p.get("three_pointers_attempted", 0),
                "turnovers": p.get("turnovers", 0),
            })
        else:
            dnp.append({"name": name, "number": p.get("number", "")})

    played.sort(key=lambda x: x["score"], reverse=True)
    return {"played": played, "dnp": dnp}


def build_game_context(game: dict, data: dict, roster: dict | None) -> str:
    """把比賽數據整理成給 Claude 的資訊"""
    date = normalize_date(game.get("date", ""))
    opponent = game.get("opp", "對手")
    lions_score = game.get("lion_score", 0)
    opp_score = game.get("opp_score", 0)
    won = game.get("won", False)
    result = "勝" if won else "負"
    is_home = game.get("is_home", True)
    home_away = "主場" if is_home else "客場"

    paint_pts = game.get("paint", "?")
    fast_break = game.get("fast_break", "?")
    second_chance = game.get("second_chance", "?")
    ft_made = game.get("ft_made", "?")

    rounds = game.get("rounds", {})
    opp_rounds = game.get("opp_rounds", {})
    quarter_str = " / ".join(
        f"Q{q}: {rounds.get(str(q),'?')}-{opp_rounds.get(str(q),'?')}"
        for q in range(1, 5)
    )

    team = data.get("team_stats", {})
    wins = team.get("wins", "?")
    losses = team.get("losses", "?")
    season_ppg = team.get("avg_score", team.get("avg_pts", "?"))
    season_apg = team.get("avg_opp_score", team.get("avg_pts_allowed", "?"))

    player_avg = data.get("player_avg", {})
    if isinstance(player_avg, dict):
        players_list = [
            {"name": name, **stats}
            for name, stats in player_avg.items()
            if not stats.get("departed", False)
        ]
        top_players = sorted(players_list, key=lambda p: p.get("score", 0), reverse=True)[:5]
        player_lines = "\n".join(
            f"  - {p['name']}: {p.get('score','?')} 分 / {p.get('rebounds','?')} 籃板 / {p.get('assists','?')} 助攻（本季均值）"
            for p in top_players
        )
    else:
        player_lines = "（無球員數據）"

    vs_summary = data.get("vs_summary", {})
    vs_opp = vs_summary.get(opponent) if isinstance(vs_summary, dict) else None
    if vs_opp:
        vs_record = f"{vs_opp.get('w','?')}勝{vs_opp.get('l','?')}敗"
        vs_avg_scored = vs_opp.get("avg_lion", "?")
        vs_avg_allowed = vs_opp.get("avg_opp", "?")
    else:
        vs_record, vs_avg_scored, vs_avg_allowed = "無資料", "?", "?"

    short_opp = OPPONENT_NAME_MAP.get(opponent, opponent)

    # 出賽名單區塊
    if roster:
        played_lines = "\n".join(
            f"  - {p['name']} #{p['number']} {'先發' if p['is_starting'] else '替補'} "
            f"{p['score']}分/{p['rebounds']}籃/{p['assists']}助 "
            f"3P {p['three_pointers_made']}/{p['three_pointers_attempted']} "
            f"TO {p['turnovers']} +/- {p['plus_minus']} 上場 {p['time_on_court']}"
            for p in roster["played"]
        )
        dnp_names = "、".join(p["name"] for p in roster["dnp"]) or "無"
        roster_section = f"""
=== 本場攻城獅出賽球員（依得分排序）===
{played_lines}

本場未出賽（DNP）：{dnp_names}
"""
    else:
        roster_section = "\n（本場出賽名單無法取得，請僅根據球隊整體數據分析）\n"

    context = f"""
=== 比賽資訊 ===
日期：{date}（{home_away}）
對手：{opponent}（簡稱：{short_opp}）
比數：攻城獅 {lions_score} - {opp_score} {opponent}
結果：{result}
各節：{quarter_str}

=== 本場團隊數據 ===
禁區得分：{paint_pts}
快攻得分：{fast_break}
二次進攻得分：{second_chance}
罰球命中：{ft_made}
{roster_section}
=== 本季狀況 ===
戰績：{wins}勝{losses}敗
本季場均得分：{season_ppg}
本季場均失分：{season_apg}

=== 主要球員本季均值（前5）===
{player_lines}

=== 對{short_opp}歷史交手（本季）===
紀錄：{vs_record}
對戰場均得分：{vs_avg_scored}
對戰場均失分：{vs_avg_allowed}
"""
    return context.strip()


def build_slug(game_date: str, opponent: str) -> str:
    opp_slug = OPPONENT_SLUG_MAP.get(opponent, re.sub(r"[^\x00-\x7F]", "", opponent)[:8] or "opp")
    return f"lioneers-{game_date}-vs-{opp_slug}"


def fix_shooting_stats(text: str) -> str:
    """修正「X投Y中」中命中數大於出手數的邏輯錯誤，自動對調。"""
    def swap_if_invalid(m):
        attempted, made = int(m.group(1)), int(m.group(2))
        if made > attempted:
            print(f"⚠️  修正投籃數字：{attempted}投{made}中 → {made}投{attempted}中")
            return f"{made}投{attempted}中"
        return m.group(0)
    return re.sub(r"(\d+)\s*投\s*(\d+)\s*中", swap_if_invalid, text)


def generate_article(context: str, game: dict, client: anthropic.Anthropic) -> str:
    opponent = game.get("opp", "對手")
    short_opp = OPPONENT_NAME_MAP.get(opponent, opponent)
    result = "勝" if game.get("won", False) else "負"

    user_prompt = f"""以下是攻城獅今天比賽的數據，請寫一篇賽後分析文章。

{context}

寫作要求：
- 不要寫標題（我會另外加）
- 開頭必須從一個具體的個人感受或觀察出發，不能是「今天攻城獅...」這種新聞稿起手式
- 找出這場比賽最有趣或最關鍵的一個數字或現象，以它為核心展開，不要平均分配每個數據
- 文章中有2到3個重要轉折句或段落主題句，這些句子獨立成行，前面加上 ## （Markdown次標）
- 對{short_opp}的評價要客觀，不要過度貶低對手
- 如果這場{result}，要能解釋「為什麼」而不只是重述比分
- 只描述有出賽的球員，未出賽（DNP）的球員完全不要出現在文章中
- 聯盟名稱一律用 TPBL，不是 PLG
- 用語要用台灣慣用語：「本季」不是「本賽季」、「教練」不是「主教練」
- 全文800-1000字，繁體中文
- 禁止使用破折號（——）
- 絕對禁止「街球」「半場街球」或任何非職業籃球的比喻
- 冒號只能用在比分（如 117:100）或標題，不能用在中文句子中間做停頓
- 禁止 AI 慣用語，例如「最讓我想多想的」「值得停留的」「值得注意的是」「不容忽視的是」「顯而易見地」「總結來說」「不得不說」
- ## 子標題如果含有逗號，句尾必須加句號，例如「## 某某現象，說明了什麼。」"""

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2000,
        system=STYLE_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
    )
    return message.content[0].text


def save_article(game: dict, content: str):
    date = normalize_date(game.get("date", datetime.now().strftime("%Y%m%d")))
    opponent = game.get("opp", "對手")
    short_opp = OPPONENT_NAME_MAP.get(opponent, opponent)
    lions_score = game.get("lion_score", 0)
    opp_score = game.get("opp_score", 0)
    result = "勝" if game.get("won", False) else "負"
    home_away = "主場" if game.get("is_home", True) else "客場"

    slug = build_slug(date, opponent)
    title = f"攻城獅 {lions_score}-{opp_score} {home_away}{result}{short_opp}"
    tags = ["攻城獅", "TPBL", "籃球", short_opp, "賽事分析"]
    tags_str = json.dumps(tags, ensure_ascii=False)

    # 依勝負選擇 hero 圖，同勝/敗各有多張輪替，用日期 hash 決定，確保每篇不同
    WIN_HEROES = [
        {"image": "/images/lioneers-win.jpg",  "alt": "球員扣籃",     "creditUrl": "https://unsplash.com/photos/1577471488278-16eec37ffcc2"},
        {"image": "/images/lioneers-win2.jpg", "alt": "球員扣籃特寫", "creditUrl": "https://unsplash.com/photos/1608245449230-4ac19066d2d0"},
    ]
    LOSS_HEROES = [
        {"image": "/images/lioneers-hero.jpg", "alt": "籃球場內景", "creditUrl": "https://unsplash.com/photos/people-inside-a-basketball-gym-J_tbkGWxCH0"},
    ]
    pool = WIN_HEROES if game.get("won", False) else LOSS_HEROES
    # 用比賽日期字串的 hash 值選圖，同一場永遠選同一張
    idx = hash(date) % len(pool)
    chosen = pool[idx]
    hero_image = chosen["image"]
    hero_alt = chosen["alt"]
    hero_credit = "Unsplash"
    hero_credit_url = chosen["creditUrl"]

    frontmatter = f"""---
title: "{title}"
author: "Skyfaring"
date: "{date}"
updated: "{date}"
slug: "{slug}"
tags: {tags_str}
heroImage: "{hero_image}"
heroAlt: "{hero_alt}"
heroCredit: "{hero_credit}"
heroCreditUrl: "{hero_credit_url}"
excerpt: "攻城獅 {date} {home_away}對上{short_opp}，{lions_score}-{opp_score} {result}。數據背後的故事。"
---

"""

    filepath = POSTS_DIR / f"{slug}.md"
    filepath.write_text(frontmatter + content, encoding="utf-8")
    print(f"✓ 文章已儲存：{filepath}")
    return filepath


def main():
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("錯誤：未設定 ANTHROPIC_API_KEY", file=sys.stderr)
        sys.exit(1)

    force_date = os.environ.get("FORCE_DATE", "").strip()

    print("正在抓取 lioneers-web 數據...")
    data = fetch_data()

    if force_date:
        try:
            fd_normalized = parse_game_date(force_date).strftime("%Y%m%d")
        except ValueError:
            fd_normalized = force_date
        games = [g for g in data.get("games", []) if str(g.get("date", "")).strip() == fd_normalized]
        if not games:
            print(f"找不到 {force_date}（搜尋格式：{fd_normalized}）的比賽紀錄")
            sys.exit(0)
    else:
        games = get_recent_games(data, days=3)

    if not games:
        print("最近3天沒有新比賽")
        sys.exit(0)

    game = games[0]
    date_normalized = normalize_date(game.get("date", ""))
    opponent = game.get("opp", "")

    if article_exists(date_normalized, opponent):
        print(f"文章已存在（{date_normalized} vs {opponent}），略過")
        sys.exit(0)

    print(f"發現新比賽：{date_normalized} vs {opponent}")

    print("正在取得本場出賽名單...")
    roster = fetch_game_players(game.get("date", ""))
    if roster:
        print(f"  出賽：{len(roster['played'])} 人 / DNP：{len(roster['dnp'])} 人")
        dnp_names = [p["name"] for p in roster["dnp"]]
        if dnp_names:
            print(f"  DNP：{', '.join(dnp_names)}")
    else:
        print("  出賽名單無法取得，將僅使用球隊整體數據")

    context = build_game_context(game, data, roster)
    print("正在呼叫 Claude API 生成文章...")

    client = anthropic.Anthropic(api_key=api_key)
    article_text = generate_article(context, game, client)

    article_text = fix_shooting_stats(article_text)
    save_article(game, article_text)
    print("完成！")


if __name__ == "__main__":
    main()
