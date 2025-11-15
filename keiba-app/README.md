# 競馬レース結果統計分析システム

高度な統計分析とビジュアル化で競馬データを深く理解するWebアプリケーション

## 機能

- **データ入力・保存**: レースデータ、頭立て数、払い戻しデータの入力と保存
- **高度フィルター**: 競馬場、馬場種別、距離、馬場状態、天候、日付範囲などで絞り込み
- **統計分析**: 単勝、複勝、馬連、馬単、ワイド、3連複、3連単の期待値分析
- **複数人気選択**: カンマ区切りで複数の人気を指定し、全パターンを一覧表示
- **チャート表示**: Chart.jsによる視覚的なデータ表示
- **データ管理**: ローカルストレージでのデータ保存、エクスポート/インポート機能

## Netlifyへのデプロイ方法

### 方法1: Netlify CLI

1. Netlify CLIをインストール:
```bash
npm install -g netlify-cli
```

2. Netlifyにログイン:
```bash
netlify login
```

3. デプロイ:
```bash
cd keiba-app
netlify deploy --prod
```

### 方法2: Netlify Web UI

1. [Netlify](https://www.netlify.com/)にログイン
2. "Add new site" → "Deploy manually"を選択
3. `keiba-app`フォルダをドラッグ&ドロップ

### 方法3: Git連携

1. GitHubリポジトリを作成
2. `keiba-app`フォルダの内容をプッシュ
3. Netlifyで"Add new site" → "Import from Git"を選択
4. リポジトリを選択
5. Build settings:
   - Build command: (空欄)
   - Publish directory: `.`

## ファイル構成

```
keiba-app/
├── index.html          # メインHTML
├── style.css           # スタイルシート
├── manifest.json       # PWA設定
├── sw.js              # Service Worker
├── netlify.toml       # Netlify設定
├── icon-192.png       # アイコン (192x192)
├── icon-512.png       # アイコン (512x512)
└── js/
    ├── app.js         # メインアプリケーション
    ├── calculator.js  # 期待値計算機
    ├── statistics.js  # 統計計算
    ├── dataParser.js  # データ解析
    ├── dataManager.js # データ管理
    └── utils.js       # ユーティリティ
```

## 使い方

1. **データ入力**: レースデータ、頭立て数、払い戻しデータを入力
2. **データ解析**: 「データを解析」ボタンをクリック
3. **データ保存**: 「データを保存」ボタンで保存
4. **フィルター**: 高度フィルターで条件を絞り込み
5. **統計分析**: 各タブで期待値を確認
6. **カスタム計算**: カンマ区切りで複数の人気を指定して一括比較

## 技術スタック

- HTML5
- CSS3
- JavaScript (ES6+)
- Chart.js (グラフ表示)
- LocalStorage (データ保存)
- PWA (Progressive Web App)

## ライセンス

MIT License
