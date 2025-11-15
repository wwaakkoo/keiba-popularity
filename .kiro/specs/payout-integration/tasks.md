# Implementation Plan

- [x] 1. 払い戻しデータ解析機能の実装


  - [x] 1.1 DataParser.parsePayoutData()メソッドを実装


    - 払い戻しテキストを行ごとに解析
    - レース番号と券種を検出
    - 単勝・複勝の配当データを抽出


    - _Requirements: 1.1, 1.2, 1.3_

  

  - [ ] 1.2 馬連・馬単の配当データ抽出を追加
    - 2頭組み合わせと人気パターンを抽出
    - 配当金額を解析

    - _Requirements: 1.2, 1.3_
  
  - [ ] 1.3 ワイド・3連複・3連単の配当データ抽出を追加
    - 3頭組み合わせと人気パターンを抽出


    - ワイドの複数配当を処理


    - _Requirements: 1.2, 1.3_
  

  - [x] 1.4 app.jsのparseData()を修正



    - parsePayoutData()を呼び出す
    - 解析結果をレースオブジェクトに統合
    - _Requirements: 1.1, 1.4_

- [x] 2. 単勝・複勝の平均配当計算

  - [ ] 2.1 Statistics.calculateTanshoStats()を修正
    - 払い戻しデータから配当を集計
    - 平均配当を計算
    - 期待値を再計算

    - payoutCountを追加


    - _Requirements: 2.1, 2.3, 2.4_

  
  - [ ] 2.2 Statistics.calculateFukushoStats()を修正
    - 払い戻しデータから配当を集計
    - 平均配当を計算

    - 期待値を再計算



    - payoutCountを追加
    - _Requirements: 2.2, 2.3, 2.4_
  
  - [x] 2.3 単勝・複勝の表示を更新

    - displayTanshoStats()とdisplayFukushoStats()を修正
    - 平均配当と配当データ件数を表示
    - 配当データがない場合の表示を追加
    - _Requirements: 2.5, 2.6, 6.1, 6.2, 6.3_




- [ ] 3. 馬連・馬単・ワイドの平均配当計算
  - [ ] 3.1 Statistics.calculateUmarenStats()を修正
    - 人気パターン別に配当を集計
    - 平均配当を計算
    - 期待値を再計算

    - _Requirements: 3.1, 3.3, 3.4, 3.5_
  
  - [x] 3.2 Statistics.calculateUmatanStats()を修正


    - 人気パターン別に配当を集計
    - 平均配当を計算



    - 期待値を再計算
    - _Requirements: 3.2, 3.3, 3.4, 3.5_
  
  - [ ] 3.3 Statistics.calculateWideStats()を修正
    - 人気パターン別に配当を集計（複数配当対応）

    - 平均配当を計算


    - 期待値を再計算
    - _Requirements: 4.1, 4.4, 4.5_

  
  - [x] 3.4 馬連・馬単・ワイドの表示を更新

    - display*Stats()メソッドを修正
    - 平均配当と配当データ件数を表示

    - _Requirements: 3.6, 4.6, 6.1, 6.2, 6.3_


- [x] 4. 3連複・3連単の平均配当計算

  - [x] 4.1 Statistics.calculateSanrenpukuStats()を修正


    - 人気パターン別に配当を集計
    - 平均配当を計算


    - 期待値を再計算
    - _Requirements: 4.2, 4.5_
  


  - [x] 4.2 Statistics.calculateSanrentanStats()を修正


    - 人気パターン別に配当を集計
    - 平均配当を計算

    - 期待値を再計算
    - _Requirements: 4.3, 4.5_

  

  - [ ] 4.3 3連複・3連単の表示を更新
    - display*Stats()メソッドを修正
    - 平均配当と配当データ件数を表示

    - _Requirements: 4.6, 6.1, 6.2, 6.3_

- [ ] 5. カスタム計算機の更新
  - [x] 5.1 Calculator.displayResult()を修正

    - payoutCount、minPayout、maxPayoutパラメータを追加
    - 配当データ情報を表示
    - 配当データがない場合の表示を追加


    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  
  - [ ] 5.2 各perform*Calculation()メソッドを修正
    - 配当データ情報を取得
    - displayResult()に渡す

    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 6. チャート表示の更新
  - [x] 6.1 チャートのツールチップをカスタマイズ

    - 平均配当と配当データ件数を表示
    - _Requirements: 6.5_
  
  - [x] 6.2 期待値の色分けを実際の配当に基づいて更新

    - 配当データがある場合のみ色分け
    - _Requirements: 6.4_

- [ ] 7. データ保存・読み込みの更新
  - [ ] 7.1 DataManager.saveCurrentData()を確認
    - 払い戻しデータが正しく保存されることを確認
    - _Requirements: 1.4, 7.1_
  
  - [ ] 7.2 DataManager.exportData()を確認
    - 払い戻しデータが含まれることを確認
    - メタデータに払い戻しデータの有無を追加
    - _Requirements: 7.1, 7.3_
  
  - [ ] 7.3 DataManager.importData()を確認
    - 払い戻しデータを含むデータを正しくインポート
    - 古い形式のデータも正しく処理
    - _Requirements: 7.2, 7.4_

- [ ] 8. 動作確認とテスト
  - [ ] 8.1 払い戻しデータ解析のテスト
    - サンプルデータで解析が正しく動作することを確認
    - エラーケースの処理を確認
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ] 8.2 平均配当計算のテスト
    - 各券種で平均配当が正しく計算されることを確認
    - 期待値が正しく計算されることを確認
    - _Requirements: 2.1-2.6, 3.1-3.6, 4.1-4.6_
  
  - [ ] 8.3 表示のテスト
    - 各タブで平均配当と配当データ件数が表示されることを確認
    - カスタム計算機で配当情報が表示されることを確認
    - _Requirements: 5.1-5.5, 6.1-6.5_
  
  - [ ] 8.4 データ保存・読み込みのテスト
    - 払い戻しデータを含むデータの保存・読み込みを確認
    - エクスポート・インポートを確認
    - _Requirements: 7.1-7.4_
