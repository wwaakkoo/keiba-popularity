# Implementation Plan

- [x] 1. HTMLの入力フィールド変更

  - [x] 1.1 馬連の入力フィールドにテキスト入力を追加


    - selectタグの下に補助的なテキスト入力フィールドを追加
    - プレースホルダーで使い方を説明（例: "1,2,3 または選択"）
    - _Requirements: 1.1, 1.2, 1.3_
  

  - [ ] 1.2 馬単の入力フィールドにテキスト入力を追加
    - selectタグの下に補助的なテキスト入力フィールドを追加
    - プレースホルダーで使い方を説明
    - _Requirements: 1.1, 1.2, 1.3_
  

  - [ ] 1.3 ワイドの入力フィールドにテキスト入力を追加
    - selectタグの下に補助的なテキスト入力フィールドを追加
    - プレースホルダーで使い方を説明
    - _Requirements: 1.1, 1.2, 1.3_
  

  - [ ] 1.4 3連複の入力フィールドにテキスト入力を追加
    - selectタグの下に補助的なテキスト入力フィールドを追加（3つ）
    - プレースホルダーで使い方を説明
    - _Requirements: 1.1, 1.2, 1.3_
  




  - [ ] 1.5 3連単の入力フィールドにテキスト入力を追加
    - selectタグの下に補助的なテキスト入力フィールドを追加（3つ）
    - プレースホルダーで使い方を説明
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Calculator.jsの修正

  - [ ] 2.1 performUmarenCalculation()を修正
    - テキスト入力とselectの両方から値を取得
    - parsePopularities()で複数人気を解析
    - generateCombinations()で組み合わせ生成
    - 全パターンの期待値を計算
    - displayMultipleResults()で結果表示
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  
  - [ ] 2.2 performUmatanCalculation()を修正
    - テキスト入力とselectの両方から値を取得
    - parsePopularities()で複数人気を解析
    - generatePermutations()で順列生成
    - 全パターンの期待値を計算
    - displayMultipleResults()で結果表示

    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ] 2.3 performWideCalculation()を修正
    - テキスト入力とselectの両方から値を取得
    - parsePopularities()で複数人気を解析
    - generateCombinations()で組み合わせ生成
    - 全パターンの期待値を計算

    - displayMultipleResults()で結果表示
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ] 2.4 performSanrenpukuCalculation()を修正
    - テキスト入力とselectの両方から値を取得
    - parsePopularities()で複数人気を解析
    - generateTripleCombinations()で組み合わせ生成
    - 全パターンの期待値を計算
    - displayMultipleResults()で結果表示
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ] 2.5 performSanrentanCalculation()を修正
    - テキスト入力とselectの両方から値を取得



    - parsePopularities()で複数人気を解析


    - generateTriplePermutations()で順列生成

    - 全パターンの期待値を計算
    - displayMultipleResults()で結果表示
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_



- [x] 3. 入力値の取得ロジック実装

  - [ ] 3.1 getPopularityInput()ヘルパーメソッドを追加
    - テキスト入力フィールドの値を優先的に取得
    - テキスト入力が空の場合はselectの値を取得
    - parsePopularities()で配列に変換
    - _Requirements: 1.3, 2.1, 3.1_


- [ ] 4. エラーハンドリングの追加
  - [ ] 4.1 組み合わせ数の警告を追加
    - 組み合わせ数が1000を超える場合は警告表示

    - 確認ダイアログで続行可否を確認
    - _Requirements: 6.1, 6.5_
  
  - [x] 4.2 無効な入力のエラーメッセージを追加

    - 数字以外の文字が含まれる場合のエラー
    - 範囲外の人気（1-16以外）の自動フィルタリング
    - _Requirements: 1.3, 2.3, 3.3_


- [ ] 5. 動作確認とテスト
  - [ ] 5.1 馬連の複数人気選択をテスト
    - "1,2" × "2,3" で3パターン表示を確認
    - 期待値順のソートを確認

    - 色分け表示を確認
    - _Requirements: 2.1-2.5, 5.1-5.6_
  
  - [ ] 5.2 馬単の複数人気選択をテスト
    - "1,2" × "1,2" で2パターン（1→2, 2→1）表示を確認
    - 順序が正しく表示されることを確認
    - _Requirements: 3.1-3.5, 5.1-5.6_
  
  - [ ] 5.3 ワイドの複数人気選択をテスト
    - "1,2" × "2,3" で3パターン表示を確認
    - 重複除外を確認
    - _Requirements: 2.1-2.5, 5.1-5.6_
  
  - [ ] 5.4 3連複の複数人気選択をテスト
    - "1,2" × "1,2" × "1,2" で1パターン（1-2-3は無効）表示を確認
    - 同一人気除外を確認
    - _Requirements: 4.1-4.5, 5.1-5.6_
  
  - [ ] 5.5 3連単の複数人気選択をテスト
    - "1,2" × "2,3" × "3,4" で複数パターン表示を確認
    - 順序が正しく表示されることを確認
    - _Requirements: 4.1-4.5, 5.1-5.6_
  
  - [ ] 5.6 大量パターンの警告をテスト
    - "1,2,3,4,5" × "1,2,3,4,5" で警告表示を確認
    - 確認後に計算が実行されることを確認
    - _Requirements: 6.1, 6.5_
