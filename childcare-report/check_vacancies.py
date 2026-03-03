"""Fetch Adachi City vacancy page and list PDF links.
This script can be run weekly to detect new updated vacancy documents.
It doesn't parse the numbers (they're in PDFs), but it alerts you when new PDF URLs appear.

Usage:
    python check_vacancies.py

You can extend this script with PDF parsing if desired (use PyPDF2, pdfplumber, etc.).
"""
import requests
from bs4 import BeautifulSoup
import os
import hashlib

# official vacancies page (sometimes .htm, try both)
URL = "https://www.city.adachi.tokyo.jp/kodomo-unei/bosyuuninnzuu.html"
DOWNLOAD_DIR = "vacancy_pdfs"

os.makedirs(DOWNLOAD_DIR, exist_ok=True)

res = requests.get(URL)
res.raise_for_status()

soup = BeautifulSoup(res.text, "html.parser")

pdf_links = []
for a in soup.find_all("a", href=True):
    href = a['href']
    if href.lower().endswith('.pdf'):
        full = href if href.startswith('http') else requests.compat.urljoin(URL, href)
        pdf_links.append(full)

print(f"Found {len(pdf_links)} PDF links:")
for link in pdf_links:
    print(link)
    # download if new
    fname = os.path.join(DOWNLOAD_DIR, os.path.basename(link))
    try:
        r = requests.get(link)
        r.raise_for_status()
        newhash = hashlib.md5(r.content).hexdigest()
        oldhash = None
        if os.path.exists(fname):
            with open(fname, 'rb') as f:
                oldhash = hashlib.md5(f.read()).hexdigest()
        if newhash != oldhash:
            with open(fname, 'wb') as f:
                f.write(r.content)
            print(f"  downloaded/updated {fname}")
        else:
            print(f"  unchanged {fname}")
    except Exception as e:
        print(f"  failed to download {link}: {e}")

print("Run this weekly to keep local copies and check for changes.")

# optional: parse downloaded PDFs and display text to assist manual updates
try:
    from PyPDF2 import PdfReader
except ImportError:
    PdfReader = None

if PdfReader:
    print("\nParsing downloaded PDFs (first page only):")
    # extract nursery names from JS file for auto matching
    js_names = []
    try:
        with open('nursery_data.js', 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line.startswith('{ name:') or line.startswith('  { name:'):
                    parts = line.split('"')
                    if len(parts) >= 2:
                        js_names.append(parts[1])
    except FileNotFoundError:
        pass

    for fname in os.listdir(DOWNLOAD_DIR):
        if not fname.lower().endswith('.pdf'):
            continue
        path = os.path.join(DOWNLOAD_DIR, fname)
        print("\n---", fname)
        try:
            reader = PdfReader(path)
            page = reader.pages[0]
            text = page.extract_text() or ""
            # show first portion for context
            print(text[:1000])
            if js_names:
                matches = [name for name in js_names if name and name in text]
                if matches:
                    print("\n==> matched names in this PDF:", matches)
                    # print lines where matches occur
                    lines = text.splitlines()
                    for line in lines:
                        for name in matches:
                            if name in line:
                                print("  ", line)
                                # try to extract six age numbers
                                import re
                                m = re.search(r"(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)", line)
                                if m:
                                    nums = [int(x) for x in m.groups()]
                                    print("    -> slots", nums, "(0歳〜5歳)")
                                    # output JSON snippet
                                    import json
                                    print("    JSON:", json.dumps({"name": name, "slots": nums}, ensure_ascii=False))
                                break
        except Exception as e:
            print(f"  failed to read {fname}: {e}")
else:
    print("\nPyPDF2 not installed; skipping PDF parsing.")
