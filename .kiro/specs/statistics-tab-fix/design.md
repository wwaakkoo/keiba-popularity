# Design Document

## Overview

統計分析タブの機能を完全に実装し、全ての券種で統一された動作を実現する。主な修正点は、カスタム計算機のイベントバインディング、HTMLとJavaScriptのID統一、未実装チャートの追加、エラーハンドリングの改善である。

## Architecture

### コンポーネント構成

```
AdvancedRaceAnalyzer (app.js)
├── bindEvents()
│   ├── bindCalculatorEvents() ← 修正対象
│   ├── bindFilterEvents()
│   └── bindTabEvents()
├── updateCurrentTabChart() ← 既存
├── createTanshoChart() ← 既存
├── createFukushoChart() ← 既存
├── createUmarenChart() ← 新規追加
├── createUmatanChart() ← 新規追加
├── createWideChart() ← 新規追加
├── createSanrenpukuChart() ← 新規追加
└── createSanrentanChart() ← 新規追加

Calculator (calculator.js) ← 既存、変更なし
Statistics (statistics.js) ← 既存、変更なし
```

## Components and Interfaces

### 1. イベントバインディングの修正

**修正箇所**: `app.js` の `bindEvents()` メソッド

**現在の問題**:
- HTMLのボタンID: `calculateTansho`, `calculateFukusho`, etc.
- JavaScriptで参照しているID: `calcTanshoBtn`, `calcFukushoBtn`, etc.
- IDが一致していないため、イベントリスナーが設定されない

**解決策**:
HTMLのボタンIDに合わせてJavaScriptを修正する

```javascript
bindEvents() {
    // ... 既存のコード ...
    
    // カスタム計算機のイベント（修正版）
    document.getElementById('calculateTansho')?.addEventListener('click', () => {
        const popularity = document.getElementById('tanshoPopularitySelect').value;
        const resultDiv = document.getElementById('tanshoResult');
        const calculator = new Calculator(this.filteredRaces);
        calculator.performTanshoCalculation(popularity, resultDiv);
    });
    
    document.getElementById('calculateFukusho')?.addEventListener('click', () => {
        const popularity = document.getElementById('fukushoPopularitySelect').value;
        const resultDiv = document.getElementById('fukushoResult');
        const calculator = new Calculator(this.filteredRaces);
        calculator.performFukushoCalculation(popularity, resultDiv);
    });
    
    // 馬連、馬単、ワイド、3連複、3連単も同様に追加
}
```

### 2. チャート作成関数の追加

**追加箇所**: `app.js`

**実装する関数**:
- `createUmarenChart(stats)` - 馬連チャート
- `createUmatanChart(stats)` - 馬単チャート
- `createWideChart(stats)` - ワイドチャート
- `createSanrenpukuChart(stats)` - 3連複チャート
- `createSanrentanChart(stats)` - 3連単チャート

**チャート仕様**:
- タイプ: 横棒グラフ（`type: 'bar'` with `indexAxis: 'y'`）
- データ: 上位10-15件の人気パターン
- 色分け:
  - 緑 (#4CAF50): 期待値 >= 110%
  - オレンジ (#FF9800): 90% <= 期待値 < 110%
  - 赤 (#F44336): 期待値 < 90%

### 3. 分析メソッドの更新

**修正箇所**: `app.js` の各 `update*Analysis()` メソッド

**現在の実装状況**:
- ✅ `updateTanshoAnalysis()` - チャート作成あり
- ✅ `updateFukushoAnalysis()` - チャート作成あり
- ❌ `updateUmarenAnalysis()` - チャート作成なし
- ❌ `updateUmatanAnalysis()` - チャート作成なし
- ❌ `updateWideAnalysis()` - チャート作成なし
- ❌ `updateSanrenpukuAnalysis()` - チャート作成なし
- ❌ `updateSanrentanAnalysis()` - チャート作成なし

**修正内容**:
各メソッドに対応するチャート作成関数の呼び出しを追加

```javascript
updateUmarenAnalysis() {
    console.log('📊 馬連分析開始');
    const statistics = new Statistics(this.filteredRaces);
    const umarenData = statistics.calculateUmarenStats();
    
    this.createUmarenChart(umarenData.patterns); // 追加
    this.displayUmarenStats(umarenData.patterns);
    console.log('✅ 馬連分析完了');
}
```

## Data Models

### チャートデータ構造

```javascript
{
    labels: ['1-2', '1-3', '2-3', ...],  // 人気パターン
    datasets: [{
        label: '期待値 (%)',
        data: [95.2, 87.3, 102.5, ...],   // 期待値
        backgroundColor: ['#F44336', '#F44336', '#4CAF50', ...],
        borderColor: [...],
        borderWidth: 1
    }]
}
```

### 統計データ構造（既存）

```javascript
{
    pattern: '1-2',           // 人気パターン
    count: 15,                // 出現回数
    percentage: 12.5,         // 出現率
    averagePayout: 100,       // 平均配当
    expectedValue: 95.2,      // 期待値
    payoutCount: 0            // 配当データ数
}
```

## Error Handling

### エラーケース

1. **人気未選択**: ユーザーが人気を選択せずに計算ボタンをクリック
   - 処理: `Utils.showError('人気を選択してください')`
   - 実装済み（Calculator クラス内）

2. **データなし**: 分析対象のレースデータが存在しない
   - 処理: `showNoDataError(resultDiv)`
   - 実装済み（Calculator クラス内）

3. **該当データなし**: 選択された人気組み合わせのデータが存在しない
   - 処理: `showNoResultError(resultDiv, dataType)`
   - 実装済み（Calculator クラス内）

4. **計算エラー**: 予期しないエラーが発生
   - 処理: `showCalculationError(resultDiv, error, calculationType)`
   - 実装済み（Calculator クラス内）

### チャート作成時のエラーハンドリング

```javascript
createUmarenChart(stats) {
    const ctx = document.getElementById('umarenChart');
    if (!ctx) {
        console.warn('❌ umarenChart要素が見つかりません');
        return;
    }
    
    if (!stats || stats.length === 0) {
        console.warn('⚠️ 表示するデータがありません');
        return;
    }
    
    // チャート作成処理
}
```

## Testing Strategy

### 単体テスト（手動確認）

1. **イベントバインディング**
   - 各タブのカスタム計算機ボタンをクリック
   - 期待値計算が実行されることを確認

2. **チャート表示**
   - 各タブに切り替え
   - チャートが正しく表示されることを確認
   - データがない場合はエラーメッセージが表示されることを確認

3. **エラーハンドリング**
   - 人気未選択で計算ボタンをクリック
   - データがない状態で計算を実行
   - 該当データがない人気組み合わせで計算を実行

### 統合テスト（手動確認）

1. **データ読み込み → フィルター → タブ切り替え → 計算**
   - サンプルデータを読み込む
   - フィルター条件を設定
   - 各タブに切り替えてチャートと統計が更新されることを確認
   - カスタム計算機で期待値を計算

2. **全データ分析**
   - 複数のデータセットを保存
   - 「全データ分析」ボタンをクリック
   - 全てのタブで正しく分析結果が表示されることを確認

## Implementation Notes

### Chart.js の使用

- バージョン: 既にCDNで読み込まれている
- チャートインスタンスの管理: `this.charts` オブジェクトに保存
- チャート破棄: タブ切り替え時に既存のチャートを破棄してから新規作成

### パフォーマンス考慮

- チャートは上位10-15件のみ表示（全データを表示すると見づらい）
- フィルター変更時は現在のタブのみ更新（全タブを更新しない）
- チャート再作成時は必ず既存のチャートを破棄（メモリリーク防止）

### コードの一貫性

- 全てのチャート作成関数は同じ構造を持つ
- エラーハンドリングは統一されたパターンを使用
- ログ出力は絵文字を使って視認性を向上
