import subprocess, sys, os

os.chdir(r"C:\Users\Moriyama\tetris-game")

def run(cmd):
    print(f"\n>>> {' '.join(cmd)}")
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.stdout: print(r.stdout)
    if r.stderr: print(r.stderr)
    return r.returncode

files = [
    "childcare-report/nursery_data.js",
    "childcare-report/vacancy_dashboard.html",
    "childcare-report/adachi_nishiarai_childcare_report.html",
    "childcare-report/report.css",
    "do_git_push.py",
    "run_git_push.bat",
    "parse_vacancy_pdf.py",
    "run_parse_vacancy.bat",
]

run(["git", "status"])
for f in files:
    run(["git", "add", f])

msg = """Add interactive Leaflet map to nursery report (2026-03-20)

- Leaflet.js + OpenStreetMap で全22園をマップ上にプロット
- マーカーをランク別に色分け（金=TOP3 / 緑=4〜8位 / 青=認可 / 紫=企業型 / 赤=要注意）
- クリックでポップアップ（園名・評価・空き状況・スコア・参照リンク）
- ホバーで園名ツールチップ
- 西新井駅の参照マーカーを表示
- 各園の正確な座標を個別設定（従来の共有座標を解消）

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"""

rc = run(["git", "commit", "-m", msg])
if rc != 0:
    print("コミット失敗。上記エラーを確認してください。")
    sys.exit(1)

rc = run(["git", "push", "origin", "main"])
if rc != 0:
    print("プッシュ失敗。上記エラーを確認してください。")
    sys.exit(1)

print("\n✅ GitHubへのプッシュ完了！")
r = subprocess.run(["git", "remote", "get-url", "origin"], capture_output=True, text=True)
repo_url = r.stdout.strip().replace("git@github.com:", "https://github.com/").replace(".git", "")
print(f"リポジトリ: {repo_url}")
