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