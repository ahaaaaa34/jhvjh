#!/bin/zsh
# 英文法マスター ローカルサーバ起動（ダブルクリックで開始）
cd "$(dirname "$0")"
IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
echo "════════════════════════════════════════"
echo "  スマホのSafariでこのURLを開いてください"
echo ""
echo "    http://${IP:-このMacのIP}:8124"
echo ""
echo "  ※ スマホとMacが同じWi-Fiにいること"
echo "  ※ 終了するには control+C か，このウインドウを閉じる"
echo "════════════════════════════════════════"
python3 -m http.server 8124
