# Requirements Document

## Introduction

競馬レース結果統計分析システムの統計分析タブにおいて、カスタム計算機のイベントバインディング不足や、一部券種のチャート未実装などの問題を修正する。全ての券種で統一された動作を実現し、ユーザーが期待値計算を正しく実行できるようにする。

## Glossary

- **System**: 競馬レース結果統計分析システム
- **統計分析タブ**: 単勝、複勝、馬連、馬単、ワイド、3連複、3連単の7つのタブを持つ分析セクション
- **カスタム計算機**: 各タブ内で特定の人気組み合わせの期待値を計算する機能
- **券種**: 単勝、複勝、馬連、馬単、ワイド、3連複、3連単などの馬券の種類
- **期待値**: 的中率と平均配当から算出される投資効率の指標

## Requirements

### Requirement 1: カスタム計算機のイベントバインディング修正

**User Story:** As a ユーザー, I want カスタム計算機のボタンをクリックして期待値を計算できる, so that 特定の人気組み合わせの投資効率を確認できる

#### Acceptance Criteria

1. WHEN ユーザーが単勝タブのカスタム計算機で「計算」ボタンをクリックする, THEN THE System SHALL 選択された人気の単勝期待値を計算して表示する
2. WHEN ユーザーが複勝タブのカスタム計算機で「計算」ボタンをクリックする, THEN THE System SHALL 選択された人気の複勝期待値を計算して表示する
3. WHEN ユーザーが馬連タブのカスタム計算機で「計算」ボタンをクリックする, THEN THE System SHALL 選択された2つの人気の馬連期待値を計算して表示する
4. WHEN ユーザーが馬単タブのカスタム計算機で「計算」ボタンをクリックする, THEN THE System SHALL 選択された2つの人気の馬単期待値を計算して表示する
5. WHEN ユーザーがワイドタブのカスタム計算機で「計算」ボタンをクリックする, THEN THE System SHALL 選択された2つの人気のワイド期待値を計算して表示する
6. WHEN ユーザーが3連複タブのカスタム計算機で「計算」ボタンをクリックする, THEN THE System SHALL 選択された3つの人気の3連複期待値を計算して表示する
7. WHEN ユーザーが3連単タブのカスタム計算機で「計算」ボタンをクリックする, THEN THE System SHALL 選択された3つの人気の3連単期待値を計算して表示する

### Requirement 2: HTMLとJavaScriptのID統一

**User Story:** As a 開発者, I want HTMLのボタンIDとJavaScriptのイベントリスナーが一致している, so that コードの保守性が向上し、バグを防げる

#### Acceptance Criteria

1. THE System SHALL HTMLファイル内の全てのカスタム計算機ボタンIDを統一された命名規則に従って定義する
2. THE System SHALL JavaScriptファイル内のイベントリスナーが正しいボタンIDを参照する
3. THE System SHALL 各券種のカスタム計算機が対応するCalculatorクラスのメソッドを呼び出す

### Requirement 3: 全券種のチャート実装

**User Story:** As a ユーザー, I want 全ての券種でビジュアルなチャートを見られる, so that データの傾向を視覚的に理解できる

#### Acceptance Criteria

1. WHEN ユーザーが馬連タブを表示する, THEN THE System SHALL 馬連の人気パターン別期待値を棒グラフで表示する
2. WHEN ユーザーが馬単タブを表示する, THEN THE System SHALL 馬単の人気パターン別期待値を棒グラフで表示する
3. WHEN ユーザーがワイドタブを表示する, THEN THE System SHALL ワイドの人気パターン別期待値を棒グラフで表示する
4. WHEN ユーザーが3連複タブを表示する, THEN THE System SHALL 3連複の人気パターン別期待値を棒グラフで表示する
5. WHEN ユーザーが3連単タブを表示する, THEN THE System SHALL 3連単の人気パターン別期待値を棒グラフで表示する
6. THE System SHALL 各チャートで期待値が100%以上の場合は緑色、90-110%の場合はオレンジ色、90%未満の場合は赤色で表示する

### Requirement 4: エラーハンドリングの統一

**User Story:** As a ユーザー, I want 計算エラーが発生した時に分かりやすいメッセージを見られる, so that 何が問題なのかを理解して対処できる

#### Acceptance Criteria

1. WHEN ユーザーが人気を選択せずに計算ボタンをクリックする, THEN THE System SHALL 「人気を選択してください」というエラーメッセージを表示する
2. WHEN 分析対象のデータが存在しない状態で計算を実行する, THEN THE System SHALL 「分析対象のデータがありません」というエラーメッセージを表示する
3. WHEN 選択された人気組み合わせのデータが存在しない, THEN THE System SHALL 「該当データが見つかりませんでした」というメッセージを表示する
4. THE System SHALL 全てのエラーメッセージを計算結果表示エリアに表示する

### Requirement 5: タブ切り替え時の自動更新

**User Story:** As a ユーザー, I want タブを切り替えた時に自動的にチャートと統計が更新される, so that 常に最新のフィルター条件に基づいた分析結果を見られる

#### Acceptance Criteria

1. WHEN ユーザーがタブを切り替える, THEN THE System SHALL 現在のフィルター条件に基づいて新しいタブのチャートと統計を自動的に更新する
2. WHEN フィルター条件が変更される, THEN THE System SHALL 現在表示中のタブのチャートと統計を自動的に更新する
3. THE System SHALL データが存在しない場合はチャートと統計の更新をスキップする
