# reorganize.ps1 - フォルダ構成整理スクリプト
# 実行場所: tetris-game/ ディレクトリ直下
# 実行方法: powershell -ExecutionPolicy Bypass -File reorganize.ps1

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "フォルダ整理を開始します..." -ForegroundColor Cyan

# 1. ディレクトリ作成
Write-Host "`n[1/4] ディレクトリを作成中..."
New-Item -ItemType Directory -Path "games"           -Force | Out-Null
New-Item -ItemType Directory -Path "childcare-report" -Force | Out-Null
Write-Host "  OK: games/, childcare-report/" -ForegroundColor Green

# 2. ゲームファイル (git 管理) を games/ へ移動
Write-Host "`n[2/4] ゲームファイルを games/ へ移動中..."
$gameFiles = @(
    "index.html", "puyo.html",
    "tetris.js",  "puyo.js",
    "style.css",  "puyo.css",
    "sw.js",      "manifest.json"
)
foreach ($file in $gameFiles) {
    if (Test-Path $file) {
        git mv $file "games/$file"
        Write-Host "  移動: $file -> games/$file"
    }
}

# 3. 保育所レポートファイル (git 管理) を childcare-report/ へ移動
Write-Host "`n[3/4] 保育所レポートファイルを childcare-report/ へ移動中..."
$childcareFiles = @(
    "adachi_nishiarai_childcare_report.html",
    "nursery_map.html",
    "nursery_data.js",
    "report.css",
    "check_vacancies.py",
    "html_to_pdf.py"
)
foreach ($file in $childcareFiles) {
    if (Test-Path $file) {
        git mv $file "childcare-report/$file"
        Write-Host "  移動: $file -> childcare-report/$file"
    }
}

# inspect_pdf.py は未追跡ファイル → Move-Item で移動
if (Test-Path "inspect_pdf.py") {
    Move-Item "inspect_pdf.py" "childcare-report/inspect_pdf.py"
    Write-Host "  移動: inspect_pdf.py -> childcare-report/inspect_pdf.py"
}

# images/, vacancy_pdfs/ は未追跡フォルダ → Move-Item で移動
if (Test-Path "images") {
    Move-Item "images" "childcare-report/images"
    Write-Host "  移動: images/ -> childcare-report/images/"
}
if (Test-Path "vacancy_pdfs") {
    Move-Item "vacancy_pdfs" "childcare-report/vacancy_pdfs"
    Write-Host "  移動: vacancy_pdfs/ -> childcare-report/vacancy_pdfs/"
}

# 4. ファイル内のパス参照を更新
Write-Host "`n[4/4] ファイル内パス参照を更新中..."

# adachi_nishiarai_childcare_report.html:
#   href="index.html" (テトリスへ戻るリンク) → href="../games/index.html"
$reportFile = "childcare-report/adachi_nishiarai_childcare_report.html"
$content = Get-Content $reportFile -Encoding UTF8
$content = $content -replace 'href="index\.html"', 'href="../games/index.html"'
Set-Content $reportFile -Value $content -Encoding UTF8
Write-Host "  更新: $reportFile (テトリスへのリンク)"

# games/sw.js: キャッシュ対象の絶対パスを /games/ 以下に更新
$swFile = "games/sw.js"
$content = Get-Content $swFile -Encoding UTF8
$content = $content -replace "'/'",             "'/games/'"
$content = $content -replace "'/index\.html'",  "'/games/index.html'"
$content = $content -replace "'/style\.css'",   "'/games/style.css'"
$content = $content -replace "'/tetris\.js'",   "'/games/tetris.js'"
$content = $content -replace "'/manifest\.json'", "'/games/manifest.json'"
Set-Content $swFile -Value $content -Encoding UTF8
Write-Host "  更新: $swFile (PWA キャッシュパス)"

Write-Host "`n=============================="
Write-Host "フォルダ整理が完了しました！" -ForegroundColor Green
Write-Host "=============================="
Write-Host ""
Write-Host "最終構成:"
Write-Host "  games/               テトリス・ぷよぷよ"
Write-Host "  childcare-report/    保育所空き情報レポート"
Write-Host "  versant_practice/    英語練習教材"
Write-Host ""
Write-Host "git status で変更を確認してください。"
Write-Host "問題がなければ git commit でコミットしてください。"
