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

msg = """Update deadlines and vacancy data (2026-03-20)

- 申込締め切り日程を足立区公式PDF（r8-annai.pdf）に基づき全月更新
  5月:4/10, 6月:5/10, 7月:6/10, 8月:7/10, 9月:8/10, 10月:9/10, 11月:10/10, 12月:11/10, 1月:12/3
- カウントダウン表示を「直近3件＋直前1件」に自動絞り込む仕様に変更
- ちゃいれっく西新井駅前: 全クラス満員に更新（公式サイト2026/2/1確認）
- parse_vacancy_pdf.py, run_parse_vacancy.bat: PDF空き枠抽出ヘルパーを追加

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
