# Design Document

## Overview

複数人気選択機能は、カスタム計算機で複数の人気を選択し、全ての組み合わせパターンの期待値を一覧表示する機能です。単勝・複勝では既に実装済みで、テキスト入力フィールドでカンマ区切りの入力を受け付けています。馬連・馬単・ワイド・3連複・3連単でも同様の機能を実装します。

## Architecture

### 既存の実装（単勝・複勝）

単勝・複勝では以下の実装が完了しています：

1. **UI**: テキスト入力フィールド（例: "1,2,3"）
2. **解析**: `parsePopularities(input)` - カンマ区切りの文字列を配列に変換
3. **計算**: 各人気の期待値を個別に計算
4. **表示**: `displayMultipleResults()` - テーブル形式で一覧表示

### 新規実装（馬連・馬単・ワイド・3連複・3連単）

馬連以降の券種では、複数の入力フィールドがあるため、以下の追加実装が必要です：

1. **UI**: 各フィールドでカンマ区切り入力を受け付ける（既存のselectタグはそのまま）
2. **組み合わせ生成**: 
   - 馬連・ワイド: `generateCombinations(pops1, pops2)` - 順不同の組み合わせ
   - 馬単: `generatePermutations(pops1, pops2)` - 順序ありの順列
   - 3連複: `generateTripleCombinations(pops1, pops2, pops3)` - 3頭の組み合わせ
   - 3連単: `generateTriplePermutations(pops1, pops2, pops3)` - 3頭の順列
3. **計算**: 生成された全パターンの期待値を計算
4. **表示**: `displayMultipleResults()` を使用（既存）

## Components and Interfaces

### Calculator Class

既存のメソッドを拡張します：

```javascript
class Calculator {
    // 既存メソッド（実装済み）
    parsePopularities(input) // カンマ区切り文字列を配列に変換
    generateCombinations(pops1, pops2) // 2頭の組み合わせ生成（順不同）
    generatePermutations(pops1, pops2) // 2頭の順列生成（順序あり）
    generateTripleCombinations(pops1, pops2, pops3) // 3頭の組み合わせ
    generateTriplePermutations(pops1, pops2, pops3) // 3頭の順列
    displayMultipleResults(resultDiv, results, ticketType) // テーブル表示
    
    // 修正が必要なメソッド
    performUmarenCalculation(pop1, pop2, resultDiv)
    performUmatanCalculation(pop1, pop2, resultDiv)
    performWideCalculation(pop1, pop2, resultDiv)
    performSanrenpukuCalculation(pop1, pop2, pop3, resultDiv)
    performSanrentanCalculation(pop1, pop2, pop3, resultDiv)
}
```

### 入力処理の変更

HTMLのselectタグはそのまま使用しますが、valueに複数の値をカンマ区切りで入力できるようにします。

**現在の実装:**
```html
<select id="umarenPopularity1">
    <option value="">選択してください</option>
    <option value="1">1番人気</option>
    ...
</select>
```

**変更後:**
selectタグはそのままですが、JavaScriptで取得した値をparsePopularities()で解析します。
ユーザーは複数選択したい場合、テキスト入力に変更するか、selectの複数選択機能を使用します。

**実装方針:**
- selectタグはそのまま維持（単一選択用）
- 各selectの下に「または」テキスト入力フィールドを追加
- テキスト入力がある場合はそちらを優先

## Data Models

### 組み合わせパターン

```javascript
{
    pattern: "1-2",           // 人気パターン（馬連・ワイド）
    pattern: "1→2",           // 人気パターン（馬単）
    expectedValue: 95.5,      // 期待値（%）
    winRate: 15.2,            // 的中率（%）
    averagePayout: 628,       // 平均配当（円）
    total: 100,               // データ数
    payoutCount: 85,          // 配当データ数
    minPayout: 200,           // 最小配当
    maxPayout: 1500           // 最大配当
}
```

## Error Handling

### 入力エラー

1. **無効な入力**: 数字以外の文字が含まれる場合
   - エラーメッセージ: "有効な人気を入力してください（1-16の数字）"

2. **範囲外の人気**: 1-16以外の数字
   - 自動的にフィルタリングして除外

3. **組み合わせ数が多すぎる**: 1000パターン以上
   - 警告メッセージ: "組み合わせ数が多すぎます（{count}パターン）。計算に時間がかかる可能性があります。"
   - 確認ダイアログで続行可否を確認

4. **データなし**: 該当するパターンのデータが存在しない
   - メッセージ: "指定された人気組み合わせのデータが見つかりませんでした"

### 計算エラー

1. **統計データ取得失敗**: Statistics.calculate*Stats()がエラー
   - エラーメッセージ: "計算中にエラーが発生しました: {error.message}"

2. **フィルタリング後のデータが空**: filteredRacesが空
   - エラーメッセージ: "分析対象のデータがありません"

## Testing Strategy

### 単体テスト

1. **parsePopularities()**: 
   - "1,2,3" → [1, 2, 3]
   - "1, 2, 3" → [1, 2, 3]（スペース除去）
   - "1,abc,3" → [1, 3]（無効値除外）

2. **generateCombinations()**:
   - [1,2], [2,3] → [[1,2], [1,3], [2,3]]
   - 重複除外: [1,2], [1,2] → [[1,2]]
   - 同一人気除外: [1,1] → []

3. **generatePermutations()**:
   - [1,2], [2,3] → [[1,2], [1,3], [2,1], [2,3]]
   - 同一人気除外: [1,1] → []

### 統合テスト

1. **馬連計算**: 
   - 入力: "1,2" × "2,3"
   - 期待: 3パターン（1-2, 1-3, 2-3）の結果表示

2. **馬単計算**:
   - 入力: "1,2" × "1,2"
   - 期待: 2パターン（1→2, 2→1）の結果表示

3. **大量パターン**:
   - 入力: "1,2,3,4,5" × "1,2,3,4,5"
   - 期待: 警告表示後、計算実行

### UIテスト

1. **テーブル表示**: 複数パターンが期待値順にソートされて表示
2. **色分け**: 期待値100%以上が緑色で表示
3. **配当情報**: payoutCountが正しく表示

## Implementation Notes

### パフォーマンス最適化

1. **組み合わせ生成の最適化**:
   - Setを使用して重複を効率的に除外
   - 早期リターンで無効なパターンをスキップ

2. **計算の最適化**:
   - 統計データは一度だけ計算（calculate*Stats()を1回だけ呼ぶ）
   - パターンマッチングはfind()で効率的に検索

3. **表示の最適化**:
   - 初期表示は50件まで
   - 「さらに表示」ボタンで追加読み込み（将来実装）

### UI/UX改善

1. **入力ヘルプ**:
   - プレースホルダーで使い方を説明
   - 例: "1,2,3 または 1"

2. **フィードバック**:
   - 組み合わせ数を事前に表示
   - 計算中はローディング表示（将来実装）

3. **結果の見やすさ**:
   - 期待値順にソート
   - 色分けで視覚的に判断しやすく
   - 配当データの有無を明示
