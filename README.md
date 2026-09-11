# Download Tycoon

ターミナル画面だけで進む、PWA対応のクリッカー / 放置ゲーム。

## 現在の実装

- `[ DOWNLOAD ]` 連打でデータ獲得
- 5%で Critical Packet x8
- MODEM / DAEMON / FIBER / SERVER RACK / DATA CENTER / GLOBAL BACKBONE
- 自動ダウンロード
- 設備に応じてAAネットワーク表示が進化
- ファイル容量が MB → GB → PB → EB → ZB とインフレ
- LocalStorage 自動セーブ
- 最大8時間のオフライン収益
- PWA / Service Worker対応
- GitHub PagesデプロイWorkflow

## ローカル起動

Service Workerを使うため、`index.html` を直接開くのではなくローカルHTTPサーバーで配信してください。

例:

```bash
python3 -m http.server 8080
```

その後 `http://localhost:8080` を開きます。

## GitHub Pages

Repository Settings → Pages → Source を `GitHub Actions` に設定すると、`.github/workflows/pages.yml` から公開できます。
