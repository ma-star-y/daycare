import pdfplumber, os

files = os.listdir('vacancy_pdfs')
print('found', files)
for f in files:
    path = os.path.join('vacancy_pdfs', f)
    print('---', f)
    with pdfplumber.open(path) as pdf:
        page = pdf.pages[0]
        print(page.extract_text()[:1000])
