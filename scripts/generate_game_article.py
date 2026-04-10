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
POSTS_DIR = Path(__file__).parent.parent / "content" / "posts"

STYLE_PROMPT = """你是潘釔天（Adam Pan），一個愛打籃球、練詠春、對數字很敏感的台灣人。
你在 yi-tienpan.blogspot.com 寫了快20年的文章，風格是「散文式分析」：
- 一定用第一人稱，從一個具體的觀察或感受開場
- 不寫流水帳，而是找出這場比賽裡最值得討論的一兩個數字或現象，然後深挖
- 用類比解釋數據（比如把三分球命中率比喻成什麼日常事物）
- 語氣是跟朋友聊天，不是新聞稿，但有自己的見解
- 偶爾有自我調侃，或坦誠說「我也不確定」
- 文章長度約 800-1000 字，繁體中文
- 不要用「首先」「其次」「最後」這種條列式結構，要像一篇連貫的散文"""

OPPONENT_NAME_MAP = {
    "新北中信特攻": "特攻",
    "桃園台啤永豐雲豹": "雲豹",
    "高雄鋼鐵人": "鋼鐵人",
    "臺北富邦勇士": "勇士",
    "福爾摩沙台新夢想家": "夢想家",
    "新竹街口攻城獅": "街口",
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


def build_game_context(game: dict, data: dict) -> str:
    """把比賽數據整理成給 Claude 的資訊"""
    date = game.get("date", "")
    opponent = game.get("opponent", "對手")
    lions_score = game.get("lions_score", 0)
    opp_score = game.get("opp_score", 0)
    result = "W" if game.get("result") == "W" else "L"
    is_home = game.get("home", True)
    home_away = "主場" if is_home else "客場"

    fg_pct = game.get("fg_pct", "?")
    three_pct = game.get("three_pct", "?")
    assists = game.get("assists", "?")
    turnovers = game.get("turnovers", "?")
    paint_pts = game.get("paint_pts", "?")

    # 球隊整體狀況
    team = data.get("team_stats", {})
    record = team.get("record", "?")
    season_ppg = team.get("avg_pts", "?")
    season_apg = team.get("avg_pts_allowed", "?")

    # 球員本季均值（用來對比這場表現）
    players = data.get("player_avg", [])
    top_players = sorted(players, key=lambda p: p.get("pts", 0), reverse=True)[:5]
    player_lines = "\n".join(
        f"  - {p.get('name','')}: {p.get('pts','?')} 分 / {p.get('reb','?')} 籃板 / {p.get('ast','?')} 助攻（本季均值）"
        for p in top_players
    )

    # 對這支對手的歷史交手
    vs_summary = data.get("vs_summary", [])
    vs_opp = next((v for v in vs_summary if v.get("opponent") == opponent), None)
    vs_record = f"{vs_opp.get('wins','?')}勝{vs_opp.get('losses','?')}敗" if vs_opp else "無資料"
    vs_avg_scored = vs_opp.get("avg_scored", "?") if vs_opp else "?"
    vs_avg_allowed = vs_opp.get("avg_allowed", "?") if vs_opp else "?"

    short_opp = OPPONENT_NAME_MAP.get(opponent, opponent)

    context = f"""
=== 比賽資訊 ===
日期：{date}（{home_away}）
對手：{opponent}（簡稱：{short_opp}）
比數：攻城獅 {lions_score} - {opp_score} {opponent}
結果：{"勝" if result == "W" else "負"}

=== 本場團隊數據 ===
投籃命中率：{fg_pct}%
三分球命中率：{three_pct}%
助攻：{assists}
失誤：{turnovers}
禁區得分：{paint_pts}

=== 本季狀況 ===
戰績：{record}
本季場均得分：{season_ppg}
本季場均失分：{season_apg}

=== 主要球員本季均值 ===
{player_lines}

=== 對{short_opp}歷史交手 ===
本季紀錄：{vs_record}
對戰場均得分：{vs_avg_scored}
對戰場均失分：{vs_avg_allowed}
"""
    return context.strip()


def build_slug(game_date: str, opponent: str) -> str:
    opp_slug = re.sub(r"[^\w]", "", opponent)[:8]
    return f"lioneers-{game_date}-vs-{opp_slug}"


def generate_article(context: str, game: dict, client: anthropic.Anthropic) -> str:
    opponent = game.get("opponent", "對手")
    short_opp = OPPONENT_NAME_MAP.get(opponent, opponent)
    result = "勝" if game.get("result") == "W" else "負"
    lions_score = game.get("lions_score", 0)
    opp_score = game.get("opp_score", 0)

    user_prompt = f"""以下是攻城獅今天比賽的數據，請用你（潘釔天）的口吻和風格寫一篇賽後分析文章。

{context}

寫作要求：
- 不要寫標題（我會另外加）
- 開頭不要是「今天攻城獅...」這種新聞稿起手式
- 找出這場比賽最有趣或最關鍵的一個數字或現象，以它為核心展開
- 對{short_opp}的評價要客觀，不要過度貶低對手
- 如果這場{result}，要能解釋「為什麼」而不只是重述比分
- 全文800-1000字，繁體中文"""

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2000,
        system=STYLE_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
    )
    return message.content[0].text


def save_article(game: dict, content: str):
    date = normalize_date(game.get("date", datetime.now().strftime("%Y%m%d")))
    opponent = game.get("opponent", "對手")
    short_opp = OPPONENT_NAME_MAP.get(opponent, opponent)
    lions_score = game.get("lions_score", 0)
    opp_score = game.get("opp_score", 0)
    result = "勝" if game.get("result") == "W" else "負"
    home_away = "主場" if game.get("home", True) else "客場"

    slug = build_slug(date, opponent)
    title = f"攻城獅 vs {short_opp}：{lions_score}-{opp_score} {result}（{home_away}）"

    tags = ["攻城獅", "TPBL", "籃球", short_opp, "賽事分析"]
    tags_str = json.dumps(tags, ensure_ascii=False)

    frontmatter = f"""---
title: "{title}"
author: "潘釔天"
date: "{date}"
updated: "{date}"
slug: "{slug}"
tags: {tags_str}
heroImage: "/images/lioneers-hero.jpg"
heroAlt: "攻城獅主場比賽"
heroCredit: "New Taipei Kings / TPBL"
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
        # force_date 可能是 YYYY-MM-DD 或 YYYYMMDD，統一轉 YYYYMMDD 來比對
        try:
            fd_normalized = parse_game_date(force_date).strftime("%Y%m%d")
        except ValueError:
            fd_normalized = force_date
        games = [g for g in data.get("games", []) if str(g.get("date", "")).strip() == fd_normalized]
        if not games:
            print(f"找不到 {force_date}（搜尋格式：{fd_normalized}）的比賽紀錄")
            sys.exit(0)
    else:
        games = get_recent_games(data, days=2)

    if not games:
        print("最近2天沒有新比賽")
        sys.exit(0)

    game = games[0]
    date_normalized = normalize_date(game.get("date", ""))
    opponent = game.get("opponent", "")

    if article_exists(date_normalized, opponent):
        print(f"文章已存在（{date_normalized} vs {opponent}），略過")
        sys.exit(0)

    print(f"發現新比賽：{date_normalized} vs {opponent}")
    context = build_game_context(game, data)
    print("正在呼叫 Claude API 生成文章...")

    client = anthropic.Anthropic(api_key=api_key)
    article_text = generate_article(context, game, client)

    save_article(game, article_text)
    print("完成！")


if __name__ == "__main__":
    main()
