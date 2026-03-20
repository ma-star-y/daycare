#!/usr/bin/env python3
"""
足立区 認可保育所 空き枠PDF → nursery_data.js 更新ヘルパー
使い方: python parse_vacancy_pdf.py
"""
import urllib.request
import os
import sys
import re

PDF_URL = "https://www.city.adachi.tokyo.jp/documents/69384/r801ninka.pdf"
PDF_PATH = os.path.join(os.path.dirname(__file__), "vacancy_r801_ninka.pdf")

NISHIARAI_KEYWORDS = [
    "西新井", "関原", "梅田", "東伊興", "中央本町", "足立",
    "いづみ", "ちゃいれっく", "きらきら", "ひまわり", "ミアヘルサ",
    "たんぽぽ", "にこにこ", "のびのび", "親隣館", "梅田さくら",
    "うめだ", "島根", "バンビ", "にじいろ", "エーワン", "高和",
    "やよい", "五反野", "さくらんぼ", "子ひばり",
]

def download_pdf():
    print(f"Downloading {PDF_URL} ...")
    req = urllib.request.Request(PDF_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = resp.read()
    with open(PDF_PATH, "wb") as f:
        f.write(data)
    print(f"Saved {len(data)//1024} KB to {PDF_PATH}")

def try_pdfplumber():
    import pdfplumber
    rows = []
    with pdfplumber.open(PDF_PATH) as pdf:
        for i, page in enumerate(pdf.pages):
            # テーブル抽出を試みる
            tables = page.extract_tables()
            for table in tables:
                for row in table:
                    text = " ".join(c or "" for c in row)
                    if any(k in text for k in NISHIARAI_KEYWORDS):
                        rows.append(f"p{i+1}|table: {row}")
            # テキスト抽出
            text = page.extract_text() or ""
            for line in text.splitlines():
                if any(k in line for k in NISHIARAI_KEYWORDS):
                    rows.append(f"p{i+1}|text: {line}")
    return rows

def try_pymupdf():
    import fitz
    rows = []
    doc = fitz.open(PDF_PATH)
    for i, page in enumerate(doc):
        text = page.get_text("text")
        for line in text.splitlines():
            if any(k in line for k in NISHIARAI_KEYWORDS):
                rows.append(f"p{i+1}: {line}")
    doc.close()
    return rows

def try_pdfminer():
    from pdfminer.high_level import extract_text
    text = extract_text(PDF_PATH)
    rows = []
    for line in text.splitlines():
        if any(k in line for k in NISHIARAI_KEYWORDS):
            rows.append(line)
    return rows

def main():
    # ── ダウンロード ──
    if not os.path.exists(PDF_PATH):
        download_pdf()
    else:
        print(f"Using cached PDF: {PDF_PATH}")

    # ── テキスト抽出 ──
    rows = []
    for lib_name, func in [("pdfplumber", try_pdfplumber),
                            ("PyMuPDF",   try_pymupdf),
                            ("pdfminer",  try_pdfminer)]:
        try:
            rows = func()
            print(f"\n=== {lib_name} で抽出成功 ({len(rows)} 行) ===")
            break
        except ImportError:
            print(f"{lib_name} はインストールされていません")
        except Exception as e:
            print(f"{lib_name} エラー: {e}")

    if not rows:
        print("\nPDFライブラリが見つかりません。以下のいずれかをインストールしてください:")
        print("  pip install pdfplumber")
        print("  pip install PyMuPDF")
        print("  pip install pdfminer.six")
        sys.exit(1)

    # ── 結果を表示 ──
    out_path = os.path.join(os.path.dirname(__file__), "vacancy_extracted.txt")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(f"足立区 令和8年1月入所 募集人数 抽出結果\n")
        f.write(f"元データ: {PDF_URL}\n")
        f.write("=" * 60 + "\n")
        for row in rows:
            print(row)
            f.write(row + "\n")

    print(f"\n結果を {out_path} に保存しました。")
    print("このファイルの内容を Claude Code に貼り付けると nursery_data.js を自動更新できます。")

if __name__ == "__main__":
    main()
