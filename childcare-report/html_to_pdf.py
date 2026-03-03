#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HTML → PDF 変換スクリプト
足立区・西新井駅 保育園調査レポート を PDF に変換します。

使用方法:
    python html_to_pdf.py

要件:
    - weasyprint (pip install weasyprint)
    または
    - reportlab (pip install reportlab)
"""

import sys
import os
from pathlib import Path

try:
    from weasyprint import HTML, CSS
    USE_WEASYPRINT = True
except ImportError:
    USE_WEASYPRINT = False
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        from reportlab.lib.utils import ImageReader
    except ImportError:
        print("Error: weasyprint or reportlab is required.")
        print("Install with: pip install weasyprint")
        print("  or: pip install reportlab")
        sys.exit(1)

def convert_with_weasyprint():
    """weasyprint を使用して HTML → PDF 変換"""
    html_file = Path(__file__).parent / 'adachi_nishiarai_childcare_report.html'
    pdf_file = Path(__file__).parent / 'adachi_nishiarai_childcare_report.pdf'
    
    if not html_file.exists():
        print(f"Error: {html_file} が見つかりません。")
        return False
    
    try:
        # CSS の指定（印刷用）
        css_file = Path(__file__).parent / 'report.css'
        print(f"HTMLを読み込み中: {html_file}")
        
        if css_file.exists():
            doc = HTML(str(html_file))
            doc.write_pdf(str(pdf_file), stylesheets=[CSS(str(css_file))])
        else:
            HTML(str(html_file)).write_pdf(str(pdf_file))
        
        print(f"✓ PDF作成完了: {pdf_file}")
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

def convert_with_reportlab():
    """reportlab を使用して PDF 生成（簡易版）"""
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_CENTER, TA_LEFT
    from reportlab.lib import colors
    
    pdf_file = Path(__file__).parent / 'adachi_nishiarai_childcare_report.pdf'
    
    try:
        doc = SimpleDocTemplate(str(pdf_file), pagesize=A4)
        story = []
        styles = getSampleStyleSheet()
        
        # カスタムスタイル
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=20,
            textColor=colors.HexColor('#0b3d91'),
            alignment=TA_CENTER,
            spaceAfter=12
        )
        
        # タイトル
        story.append(Paragraph("足立区・西新井駅 保育園まとめレポート", title_style))
        story.append(Paragraph("認可・認可外を含むおすすめランキングと、今から0歳児を入れるためのHOW‑TO", styles['Normal']))
        story.append(Spacer(1, 12))
        
        # Contents
        story.append(Paragraph("<b>対象範囲</b>", styles['Heading2']))
        story.append(Paragraph("西新井駅から徒歩15分圏内（概ね）", styles['Normal']))
        story.append(Spacer(1, 6))
        
        story.append(Paragraph("<b>今から0歳児を入れるためのHOW‑TO</b>", styles['Heading2']))
        steps = [
            "1. 役所に電話・窓口確認：最新の「認可保育園 空き状況」と「入所手続き期限」を確認。",
            "2. 複数申込を用意：認可は第一希望〜第三希望まで登録し、認可外も同時並行で見学＆申込。",
            "3. 書類を即用意：出生予定・住民票・保護者の勤務証明など、区指定の必要書類を揃える。",
            "4. 見学で評価軸を決める：保育方針、園庭・安全、送迎利便、延長保育対応、給食方針。",
            "5. 空き待ちの戦術：キャンセル待ちを複数登録／役所に状況確認の頻度を決める（例：週1回）。",
            "6. 認可外の活用：ブリッジとして短期の認可外を使い、認可を並行で待つ。",
        ]
        for step in steps:
            story.append(Paragraph(step, styles['Normal']))
        
        story.append(Spacer(1, 12))
        story.append(Paragraph("<b>保育園候補（公開情報ベース）</b>", styles['Heading2']))
        story.append(Paragraph("詳細は HTMLレポート adachi_nishiarai_childcare_report.html をご参照ください。", styles['Normal']))
        
        story.append(Spacer(1, 12))
        story.append(Paragraph("<b>参考資料</b>", styles['Heading2']))
        story.append(Paragraph("• 足立区保育課オフィシャルサイト<br/>"
                              "• 足立区保育園一覧（電話・所在地・定員）<br/>"
                              "• childcare_research_guide.txt（調査ガイド）", styles['Normal']))
        
        doc.build(story)
        print(f"✓ PDF作成完了（簡易版）: {pdf_file}")
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == '__main__':
    print("足立区・西新井駅 保育園レポート PDF生成開始...")
    
    if USE_WEASYPRINT:
        print("weasyprint wo shiyou shimasu.")
        success = convert_with_weasyprint()
    else:
        print("reportlab wo shiyou shimasu (kanibanban).")
        success = convert_with_reportlab()
    
    if success:
        print("\nPDF file creation completed.")
        print("You can print or save as PDF from a browser and view on smartphone.")
        sys.exit(0)
    else:
        print("\nError: PDF creation failed.")
        sys.exit(1)
