@echo off
echo 足立区 空き枠PDF 解析スクリプトを実行します...
echo.

REM pdfplumber がなければインストール
.venv\Scripts\python.exe -c "import pdfplumber" 2>nul
if %errorlevel% neq 0 (
    echo pdfplumber をインストール中...
    .venv\Scripts\pip.exe install pdfplumber
)

.venv\Scripts\python.exe parse_vacancy_pdf.py

echo.
echo 完了。vacancy_extracted.txt を確認してください。
pause
