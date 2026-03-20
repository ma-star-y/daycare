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

msg = """Update vacancy data for 2026-03-20

- ちゃいれっく西新井駅前: 全クラス満員に更新（公式サイト2026/2/1確認）
- 空き枠データ更新日を2026年3月20日に更新
- parse_vacancy_pdf.py: 足立区PDFから空き枠を自動抽出するスクリプトを追加
- run_parse_vacancy.bat: PDF解析スクリプトの起動バッチを追加

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
