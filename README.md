# DOWNLOAD TYCOON

ターミナル画面だけで進む、PWA対応のクリッカー / 放置型ネットワーク育成ゲーム。

**クリックから始めて、世界、そして宇宙のデータをダウンロードせよ。**

## 🎮 PLAY

### https://ikegami-99.github.io/Download-Tycoon/

ブラウザですぐ遊べます。PWAとしてホーム画面へのインストールにも対応しています。

## ゲーム概要

最初は小さなPCと貧弱な回線だけ。

`[ DOWNLOAD ]` を押してデータを集め、モデム、SSD、光回線、サーバーラック、データセンター、IX、海底ケーブル、衛星回線、量子ルーターなどを導入してネットワークを巨大化させていきます。

設備が増えるほどAA（ASCII Art）のネットワーク表示も成長し、最終的には地球規模から宇宙規模のネットワークへ到達します。

## 主な要素

- `[ DOWNLOAD ]` をクリックして手動ダウンロード
- DOWNLOAD DAEMONなどによる自動ダウンロード
- 17種類以上のハードウェア / 自動化アップグレード
- 設備に応じて成長するAAネットワーク
- 42種類以上の日本語ファイル名
- MB → GB → TB → PB → EB → ZB → YBへ膨張するデータ量
- ランダムな回線停止イベント
- `[ RESUME DOWNLOAD ]` による手動復旧
- LINK STABILIZERで回線停止までの時間を延長
- アプリを閉じるとダウンロード停止
- KEEP-ALIVE DAEMONでバックグラウンド継続可能時間を延長
- 極低確率のダウンロード失敗 / CHECKSUM MISMATCH
- ERROR CORRECTORで失敗率を低減
- ファイル完了ボーナス
- Contract / Achievement
- Network Rank
- NETWORK REBOOT（Prestige）と恒久強化
- LocalStorageによる自動セーブ
- PWA / Service Worker対応
- GitHub Pages自動デプロイ

## 謎のダウンロード対象

ゲームを進めると、普通のファイルから徐々に様子がおかしくなります。

- `ねこ写真_最終最終.zip`
- `上司には見せない資料.pdf`
- `消したはずの履歴.db`
- `世界中の猫画像.zip`
- `全人類の未読メール.tar`
- `宇宙人の既読無視.db`
- `宇宙_これが本当に最後.tar`
- `ダウンロードしてはいけない何か.bin`

## PWA

対応ブラウザではゲーム内の `[ INSTALL PWA ]` からインストールできます。

インストール後は通常のアプリに近い形でホーム画面から起動できます。Service Workerによるキャッシュにも対応しています。

## ローカル起動

Service Workerを利用するため、`index.html` を直接開くのではなくローカルHTTPサーバーで配信してください。

```bash
python3 -m http.server 8080
```

その後、ブラウザで `http://localhost:8080` を開きます。

## GitHub Pages

`main` ブランチへの更新時に `.github/workflows/pages.yml` からGitHub Pagesへデプロイされます。

**PLAY:** https://ikegami-99.github.io/Download-Tycoon/
