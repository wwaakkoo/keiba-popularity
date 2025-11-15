# Requirements Document

## Introduction

統計分析タブのカスタム計算機において、単一の人気組み合わせではなく、複数の人気を選択して全ての組み合わせパターンの期待値を一覧表示する機能を実装する。これにより、ユーザーは複数のパターンを一度に比較でき、より効率的な投資判断が可能になる。

## Glossary

- **System**: 競馬レース結果統計分析システム
- **カスタム計算機**: 各タブ内で特定の人気組み合わせの期待値を計算する機能
- **人気パターン**: 着順ごとの人気の組み合わせ（例: 1-2, 1-3, 2-3）
- **順不同券種**: 馬連、ワイド、3連複（着順が関係ない）
- **順序券種**: 馬単、3連単（着順が重要）
- **組み合わせ生成**: 選択された人気から全てのパターンを生成する処理

## Requirements

### Requirement 1: 複数人気選択UI

**User Story:** As a ユーザー, I want 各着順で複数の人気を選択できる, so that 一度に複数のパターンを比較できる

#### Acceptance Criteria

1. THE System SHALL 単一選択のドロップダウンを複数選択可能なチェックボックスリストに変更する
2. THE System SHALL 各人気に対応するチェックボックスを表示する（1番人気～16番人気）
3. WHEN ユーザーが複数の人気をチェックする, THEN THE System SHALL 選択された人気を記録する
4. THE System SHALL 選択された人気の数を視覚的に表示する
5. THE System SHALL 「すべて選択」「すべて解除」ボタンを提供する

### Requirement 2: 馬連・ワイドの組み合わせ生成

**User Story:** As a ユーザー, I want 馬連やワイドで複数の人気を選択すると全ての組み合わせが表示される, so that 効率的にパターンを比較できる

#### Acceptance Criteria

1. WHEN ユーザーが馬連で1着人気[1,2]、2着人気[1,2,3]を選択する, THEN THE System SHALL 組み合わせ[1-2, 1-3, 2-3]を生成する
2. THE System SHALL 順不同券種では重複を除外する（1-2と2-1は同じ）
3. THE System SHALL 同じ人気の組み合わせを除外する（1-1は無効）
4. THE System SHALL 生成された全てのパターンの期待値を計算する
5. THE System SHALL 結果を期待値の高い順にソートして表示する

### Requirement 3: 馬単・3連単の組み合わせ生成

**User Story:** As a ユーザー, I want 馬単や3連単で複数の人気を選択すると全ての順列が表示される, so that 着順を考慮したパターンを比較できる

#### Acceptance Criteria

1. WHEN ユーザーが馬単で1着人気[1,2]、2着人気[1,2]を選択する, THEN THE System SHALL 順列[1→2, 2→1]を生成する
2. THE System SHALL 順序券種では着順を考慮した全ての順列を生成する
3. THE System SHALL 同じ人気の組み合わせを除外する（1→1は無効）
4. THE System SHALL 生成された全てのパターンの期待値を計算する
5. THE System SHALL 結果を期待値の高い順にソートして表示する

### Requirement 4: 3連複・3連単の組み合わせ生成

**User Story:** As a ユーザー, I want 3連複や3連単で複数の人気を選択すると全ての組み合わせが表示される, so that 3頭のパターンを効率的に比較できる

#### Acceptance Criteria

1. WHEN ユーザーが3連複で1着人気[1,2]、2着人気[1,2]、3着人気[1,2]を選択する, THEN THE System SHALL 有効な組み合わせを生成する
2. THE System SHALL 3連複では順不同の組み合わせを生成する
3. THE System SHALL 3連単では着順を考慮した順列を生成する
4. THE System SHALL 同じ人気が重複する組み合わせを除外する
5. THE System SHALL 生成された全てのパターンの期待値を計算する

### Requirement 5: 結果の一覧表示

**User Story:** As a ユーザー, I want 生成された全てのパターンの結果を一覧で見られる, so that 最も期待値の高いパターンを見つけられる

#### Acceptance Criteria

1. THE System SHALL 生成された全てのパターンをテーブル形式で表示する
2. THE System SHALL 各パターンの期待値、的中率、平均配当、データ数を表示する
3. THE System SHALL 期待値の高い順にソートして表示する
4. THE System SHALL 期待値100%以上のパターンを緑色で強調表示する
5. THE System SHALL 配当データの有無を表示する
6. THE System SHALL 最大50件まで表示し、それ以上は「さらに表示」ボタンで展開する

### Requirement 6: パフォーマンス最適化

**User Story:** As a ユーザー, I want 大量の組み合わせでも高速に計算される, so that ストレスなく利用できる

#### Acceptance Criteria

1. THE System SHALL 組み合わせ数が1000を超える場合は警告を表示する
2. THE System SHALL 計算中はローディングインジケーターを表示する
3. THE System SHALL 計算を非同期で実行してUIをブロックしない
4. THE System SHALL 生成された組み合わせ数を事前に表示する
5. WHEN 組み合わせ数が多すぎる場合, THEN THE System SHALL 選択を制限するか確認を求める

### Requirement 7: 単勝・複勝の複数選択

**User Story:** As a ユーザー, I want 単勝や複勝でも複数の人気を選択できる, so that 複数の人気を一度に比較できる

#### Acceptance Criteria

1. WHEN ユーザーが単勝で人気[1,2,3]を選択する, THEN THE System SHALL 各人気の期待値を計算する
2. THE System SHALL 複勝でも同様に複数の人気を選択できる
3. THE System SHALL 結果を期待値の高い順に表示する
4. THE System SHALL 各人気の詳細情報を表示する
