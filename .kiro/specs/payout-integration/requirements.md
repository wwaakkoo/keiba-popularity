# Requirements Document

## Introduction

競馬レース結果統計分析システムにおいて、払い戻しデータを統計計算に統合し、実際の配当額に基づいた平均配当と期待値を算出・表示する機能を実装する。これにより、ユーザーは理論値ではなく実際のデータに基づいた投資判断が可能になる。

## Glossary

- **System**: 競馬レース結果統計分析システム
- **払い戻しデータ**: 各レースの各券種の配当金額と人気情報を含むデータ
- **平均配当**: 特定の人気または人気組み合わせが的中した際の配当金額の平均値
- **期待値**: 的中率 × 平均配当 ÷ 100 で算出される投資効率の指標
- **券種**: 単勝、複勝、馬連、馬単、ワイド、3連複、3連単などの馬券の種類
- **DataParser**: レースデータと払い戻しデータを解析するクラス
- **Statistics**: 統計計算を行うクラス

## Requirements

### Requirement 1: 払い戻しデータの解析と保存

**User Story:** As a ユーザー, I want 払い戻しデータを入力して保存できる, so that 実際の配当に基づいた統計分析ができる

#### Acceptance Criteria

1. WHEN ユーザーが払い戻しデータをテキストエリアに入力する, THEN THE System SHALL 各レースの各券種の配当情報を解析する
2. THE System SHALL 単勝、複勝、馬連、馬単、ワイド、3連複、3連単の7券種の払い戻しデータを解析する
3. THE System SHALL 各配当に紐づく人気情報を抽出して保存する
4. WHEN ユーザーが「データを保存」ボタンをクリックする, THEN THE System SHALL 払い戻しデータをレースデータと共に保存する
5. THE System SHALL 保存されたデータセットに払い戻し情報が含まれていることを示す

### Requirement 2: 単勝・複勝の平均配当計算

**User Story:** As a ユーザー, I want 単勝と複勝の人気別平均配当を見られる, so that どの人気が投資効率が良いかを判断できる

#### Acceptance Criteria

1. WHEN 単勝タブを表示する, THEN THE System SHALL 各人気の平均配当を払い戻しデータから計算する
2. WHEN 複勝タブを表示する, THEN THE System SHALL 各人気の平均配当を払い戻しデータから計算する
3. THE System SHALL 平均配当 = 合計配当額 ÷ 的中回数 で計算する
4. THE System SHALL 期待値 = (的中率 × 平均配当) ÷ 100 で計算する
5. WHEN 払い戻しデータが存在しない人気がある, THEN THE System SHALL デフォルト値（100円）を使用する
6. THE System SHALL チャートと統計サマリーに実際の平均配当を表示する

### Requirement 3: 馬連・馬単の平均配当計算

**User Story:** As a ユーザー, I want 馬連と馬単の人気パターン別平均配当を見られる, so that どの人気組み合わせが投資効率が良いかを判断できる

#### Acceptance Criteria

1. WHEN 馬連タブを表示する, THEN THE System SHALL 各人気パターンの平均配当を払い戻しデータから計算する
2. WHEN 馬単タブを表示する, THEN THE System SHALL 各人気パターンの平均配当を払い戻しデータから計算する
3. THE System SHALL 人気パターン（例: 1-2）と配当を紐付けて保存する
4. THE System SHALL 同じ人気パターンの配当の平均値を計算する
5. THE System SHALL 期待値 = (的中率 × 平均配当) ÷ 100 で計算する
6. THE System SHALL チャートと統計サマリーに実際の平均配当を表示する

### Requirement 4: ワイド・3連複・3連単の平均配当計算

**User Story:** As a ユーザー, I want ワイド、3連複、3連単の人気パターン別平均配当を見られる, so that 高配当券種の投資効率を判断できる

#### Acceptance Criteria

1. WHEN ワイドタブを表示する, THEN THE System SHALL 各人気パターンの平均配当を払い戻しデータから計算する
2. WHEN 3連複タブを表示する, THEN THE System SHALL 各人気パターンの平均配当を払い戻しデータから計算する
3. WHEN 3連単タブを表示する, THEN THE System SHALL 各人気パターンの平均配当を払い戻しデータから計算する
4. THE System SHALL ワイドの場合、3着以内の全ての2頭組み合わせの配当を処理する
5. THE System SHALL 期待値 = (的中率 × 平均配当) ÷ 100 で計算する
6. THE System SHALL チャートと統計サマリーに実際の平均配当を表示する

### Requirement 5: カスタム計算機での配当表示

**User Story:** As a ユーザー, I want カスタム計算機で選択した人気組み合わせの平均配当を見られる, so that 具体的な投資判断ができる

#### Acceptance Criteria

1. WHEN ユーザーがカスタム計算機で人気を選択して計算する, THEN THE System SHALL その人気組み合わせの平均配当を表示する
2. THE System SHALL 期待値の計算に実際の平均配当を使用する
3. THE System SHALL 配当データの件数を表示する
4. WHEN 配当データが存在しない, THEN THE System SHALL 「配当データなし（理論値使用）」と表示する
5. THE System SHALL 平均配当、最高配当、最低配当を表示する

### Requirement 6: データ表示の改善

**User Story:** As a ユーザー, I want 統計サマリーで配当データの有無が分かる, so that データの信頼性を判断できる

#### Acceptance Criteria

1. THE System SHALL 各統計項目に配当データ件数を表示する
2. WHEN 配当データが存在する, THEN THE System SHALL 「配当データ: N件」と表示する
3. WHEN 配当データが存在しない, THEN THE System SHALL 「配当データなし（理論値）」と表示する
4. THE System SHALL 期待値の色分けを実際の配当に基づいて行う
5. THE System SHALL チャートのツールチップに平均配当と配当データ件数を表示する

### Requirement 7: 払い戻しデータのエクスポート・インポート

**User Story:** As a ユーザー, I want 払い戻しデータを含めてエクスポート・インポートできる, so that データを他の環境でも利用できる

#### Acceptance Criteria

1. WHEN ユーザーが「データエクスポート」ボタンをクリックする, THEN THE System SHALL 払い戻しデータを含めてJSONファイルをエクスポートする
2. WHEN ユーザーがJSONファイルをインポートする, THEN THE System SHALL 払い戻しデータを含めて復元する
3. THE System SHALL エクスポートファイルに払い戻しデータの有無を示すメタデータを含める
4. THE System SHALL 古い形式のデータ（払い戻しなし）も正しくインポートする
