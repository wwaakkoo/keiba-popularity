# 競馬レース結果統計分析システム

高度な統計分析とビジュアル化で競馬データを深く理解するWebアプリケーション

## 機能

- **データ入力・保存**: レースデータ、頭立て数、払い戻しデータの入力と保存
- **高度フィルター**: 競馬場、馬場種別、距離、馬場状態、天候、日付範囲などで絞り込み
- **統計分析**: 単勝、複勝、馬連、馬単、ワイド、3連複、3連単の期待値分析
- **複数人気選択**: カンマ区切りで複数の人気を指定し、全パターンを一覧表示
- **チャート表示**: Chart.jsによる視覚的なデータ表示
- **データ管理**: ローカルストレージでのデータ保存、エクスポート/インポート機能

## 技術スタック

- HTML5 / CSS3 / JavaScript (ES6+)
- Chart.js (グラフ表示)
- LocalStorage (データ保存)
- PWA (Progressive Web App)

## 使い方

### ローカルで実行

```bash
# HTTPサーバーで起動（推奨）
python -m http.server 8000
# または
npx serve .
```

ブラウザで `http://localhost:8000` を開く

### Netlifyへのデプロイ

ルートディレクトリをNetlifyにデプロイ：

```bash
netlify deploy --prod
```

または、Netlify UIでプロジェクトルートをドラッグ&ドロップ

`netlify.toml` が自動的にビルド設定を適用します。

## プロジェクト構成

- `/` - メインアプリケーション
- `/js/` - JavaScriptモジュール（config, utils, dataManager, dataParser, statistics, calculator, app）
- `/.kiro/` - プロジェクト仕様書（機能要件、設計ドキュメント）
- `/netlify.toml` - Netlifyデプロイ設定

## ライセンス

MIT License
