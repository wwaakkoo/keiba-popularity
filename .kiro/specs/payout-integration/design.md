# Design Document

## Overview

払い戻しデータを統計計算に統合し、実際の配当額に基づいた平均配当と期待値を算出する機能を実装する。DataParserで払い戻しデータを解析し、Statisticsクラスで平均配当を計算し、各タブとカスタム計算機で表示する。

## Architecture

### データフロー

```
払い戻しテキスト
    ↓
DataParser.parsePayoutData()
    ↓
レースオブジェクトに配当情報を追加
    ↓
Statistics.calculate*Stats()
    ↓
平均配当と期待値を計算
    ↓
チャート・統計サマリー・計算機に表示
```

### コンポーネント構成

```
DataParser (dataParser.js)
├── parsePayoutData(payoutText, races) ← 新規追加
│   ├── 払い戻しテキストを解析
│   ├── 各レースの各券種の配当を抽出
│   └── レースオブジェクトに配当情報を追加
└── 既存のparseRaceData()と連携

Statistics (statistics.js)
├── calculateTanshoStats(results, races) ← 修正
│   └── 払い戻しデータから平均配当を計算
├── calculateFukushoStats(results, races) ← 修正
├── calculateUmarenStats(races) ← 修正
├── calculateUmatanStats(races) ← 修正
├── calculateWideStats(races) ← 修正
├── calculateSanrenpukuStats(races) ← 修正
└── calculateSanrentanStats(races) ← 修正

AdvancedRaceAnalyzer (app.js)
├── parseData() ← 修正
│   └── 払い戻しデータも解析
└── 各update*Analysis()メソッド ← 修正
    └── racesパラメータを渡す
```

## Components and Interfaces

### 1. 払い戻しデータ構造

**レースオブジェクトに追加するプロパティ**:

```javascript
race = {
    // 既存のプロパティ
    raceNumber: 1,
    name: "2歳未勝利",
    results: [...],
    
    // 新規追加
    payouts: {
        tansho: {
            horseNumber: 7,
            popularity: 2,
            payout: 710
        },
        fukusho: [
            { horseNumber: 11, popularity: 3, payout: 160 },
            { horseNumber: 14, popularity: 1, payout: 110 },
            { horseNumber: 6, popularity: 2, payout: 160 }
        ],
        umaren: {
            combination: [7, 10],
            popularityPattern: "2-3",
            payout: 1520
        },
        umatan: {
            combination: [7, 10],
            popularityPattern: "2-3",
            payout: 2840
        },
        wide: [
            { combination: [7, 10], popularityPattern: "2-3", payout: 520 },
            { combination: [7, 8], popularityPattern: "2-6", payout: 890 },
            { combination: [10, 8], popularityPattern: "3-6", payout: 1240 }
        ],
        sanrenpuku: {
            combination: [7, 10, 8],
            popularityPattern: "2-3-6",
            payout: 8560
        },
        sanrentan: {
            combination: [7, 10, 8],
            popularityPattern: "2-3-6",
            payout: 45820
        }
    }
}
```

### 2. DataParser.parsePayoutData()

**新規メソッド**:

```javascript
parsePayoutData(payoutText, races) {
    // 払い戻しテキストを行ごとに分割
    const lines = payoutText.trim().split('\n');
    
    let currentRaceNumber = null;
    let currentTicketType = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // レース番号を検出（例: "1R", "2R"）
        if (/^\d+R$/.test(line)) {
            currentRaceNumber = parseInt(line);
            continue;
        }
        
        // 券種を検出
        if (line === '単勝') {
            currentTicketType = 'tansho';
            // 次の行から馬番、配当、人気を読み取る
        } else if (line === '複勝') {
            currentTicketType = 'fukusho';
        } else if (line === '馬連') {
            currentTicketType = 'umaren';
        } else if (line === '馬単') {
            currentTicketType = 'umatan';
        } else if (line === 'ワイド') {
            currentTicketType = 'wide';
        } else if (line === '3連複') {
            currentTicketType = 'sanrenpuku';
        } else if (line === '3連単') {
            currentTicketType = 'sanrentan';
        }
        
        // 配当データを解析して該当レースに追加
    }
    
    return races;
}
```

**解析ロジック**:
1. レース番号（1R, 2R等）を検出
2. 券種名（単勝、複勝等）を検出
3. 馬番または組み合わせを読み取る
4. 配当金額を読み取る（"710円" → 710）
5. 人気を読み取る（"②" → 2）
6. レースオブジェクトのpayoutsプロパティに追加

### 3. Statistics クラスの修正

**calculateTanshoStats() の修正**:

```javascript
calculateTanshoStats(results, races) {
    const stats = {};
    
    // 初期化
    for (let i = 1; i <= 16; i++) {
        stats[i] = {
            total: 0,
            wins: 0,
            payouts: [],  // 配当の配列
            winRate: 0,
            averagePayout: 0,
            expectedValue: 0,
            popularity: i.toString(),
            payoutCount: 0  // 配当データ件数
        };
    }
    
    // 的中回数をカウント
    results.forEach(result => {
        if (result.position === 1 && result.popularity) {
            const pop = result.popularity;
            if (pop >= 1 && pop <= 16) {
                stats[pop].wins++;
            }
        }
    });
    
    // 払い戻しデータから配当を集計
    races.forEach(race => {
        if (race.payouts && race.payouts.tansho) {
            const pop = race.payouts.tansho.popularity;
            if (pop >= 1 && pop <= 16) {
                stats[pop].payouts.push(race.payouts.tansho.payout);
            }
        }
    });
    
    // 統計値を計算
    const totalRaces = races.length;
    for (let i = 1; i <= 16; i++) {
        stats[i].total = totalRaces;
        stats[i].payoutCount = stats[i].payouts.length;
        
        if (stats[i].total > 0) {
            stats[i].winRate = (stats[i].wins / stats[i].total) * 100;
            
            // 平均配当を計算
            if (stats[i].payouts.length > 0) {
                const sum = stats[i].payouts.reduce((a, b) => a + b, 0);
                stats[i].averagePayout = sum / stats[i].payouts.length;
            } else {
                stats[i].averagePayout = 100; // デフォルト値
            }
            
            // 期待値を計算
            stats[i].expectedValue = (stats[i].winRate * stats[i].averagePayout) / 100;
        }
    }
    
    return stats;
}
```

**他の券種も同様のパターンで修正**:
- `calculateFukushoStats()`: 複勝の配当を集計
- `calculateUmarenStats()`: 馬連の人気パターン別配当を集計
- `calculateUmatanStats()`: 馬単の人気パターン別配当を集計
- `calculateWideStats()`: ワイドの人気パターン別配当を集計
- `calculateSanrenpukuStats()`: 3連複の人気パターン別配当を集計
- `calculateSanrentanStats()`: 3連単の人気パターン別配当を集計

### 4. 人気パターンの紐付け

**馬連・馬単・ワイド等の人気パターン抽出**:

```javascript
// レース結果から人気パターンを生成
function getPopularityPattern(race, positions, sorted = false) {
    const popularities = positions.map(pos => {
        const result = race.results.find(r => r.position === pos);
        return result ? result.popularity : null;
    }).filter(p => p !== null);
    
    if (sorted) {
        popularities.sort((a, b) => a - b);
    }
    
    return popularities.join('-');
}

// 例: 馬連の場合
const pattern = getPopularityPattern(race, [1, 2], true); // "2-3"
```

### 5. 表示の改善

**統計サマリーの表示**:

```javascript
displayTanshoStats(stats) {
    // ...
    html += `
        <div class="stat-item">
            <div class="stat-item-label">${stat.popularity}番人気</div>
            <div class="stat-item-value ${isPositive ? 'positive' : 'negative'}">
                期待値: ${stat.expectedValue.toFixed(1)}%
            </div>
            <div class="stat-item-detail">
                的中率: ${stat.winRate.toFixed(1)}% × 
                平均配当: ${stat.averagePayout.toFixed(0)}円 = 
                ${stat.expectedValue.toFixed(1)}%<br>
                実績: ${stat.wins}勝/${stat.total}戦
                ${stat.payoutCount > 0 ? 
                    `<br>配当データ: ${stat.payoutCount}件` : 
                    '<br><span class="text-warning">配当データなし（理論値）</span>'}
            </div>
        </div>
    `;
}
```

**カスタム計算機の表示**:

```javascript
displayResult(resultDiv, data) {
    const { expectedValue, winRate, averagePayout, total, description, payoutCount, minPayout, maxPayout } = data;
    const isPositive = expectedValue > 100;
    
    resultDiv.innerHTML = `
        <div class="result-summary">
            <div class="result-item">
                <div class="result-label">期待値</div>
                <div class="result-value ${isPositive ? 'positive' : 'negative'}">
                    ${expectedValue.toFixed(1)}%
                </div>
            </div>
            <div class="result-item">
                <div class="result-label">的中率</div>
                <div class="result-value">${winRate.toFixed(1)}%</div>
            </div>
            <div class="result-item">
                <div class="result-label">平均配当</div>
                <div class="result-value">${averagePayout.toFixed(0)}円</div>
            </div>
            <div class="result-item">
                <div class="result-label">データ数</div>
                <div class="result-value">${total}件</div>
            </div>
        </div>
        <div class="result-details">
            ${description} | 
            ${isPositive ? '✅ プラス期待値' : '❌ マイナス期待値'} | 
            100円投資で平均${expectedValue.toFixed(1)}円のリターン
            ${payoutCount > 0 ? `
                <br>配当データ: ${payoutCount}件 
                (最低: ${minPayout}円 / 最高: ${maxPayout}円)
            ` : '<br><span class="text-warning">配当データなし（理論値使用）</span>'}
        </div>
    `;
    resultDiv.classList.add('show');
}
```

## Data Models

### 払い戻しデータ形式（入力）

```
1R
単勝
7
710円
2人気
複勝
11
14
6
160円
110円
160円
3人気
1人気
2人気
馬連
7-10
1,520円
2-3人気
...
```

### 保存データ形式

```javascript
{
    id: 1234567890,
    racetrack: "東京",
    date: "2024-10-29",
    races: [
        {
            raceNumber: 1,
            name: "2歳未勝利",
            results: [...],
            payouts: {
                tansho: { horseNumber: 7, popularity: 2, payout: 710 },
                fukusho: [...],
                umaren: {...},
                // ...
            }
        }
    ],
    createdAt: "2024-10-29T12:00:00Z"
}
```

## Error Handling

### 払い戻しデータ解析エラー

1. **形式不正**: 払い戻しデータの形式が不正な場合
   - 処理: エラーをログに出力し、該当部分をスキップ
   - ユーザーへの通知: 「一部の払い戻しデータを解析できませんでした」

2. **レース番号不一致**: 払い戻しデータのレース番号がレースデータと一致しない
   - 処理: 該当レースの払い戻しデータをスキップ
   - ユーザーへの通知: なし（サイレントスキップ）

3. **人気情報欠落**: 払い戻しデータに人気情報がない
   - 処理: 配当のみ保存し、人気は結果データから推測
   - ユーザーへの通知: なし

### 統計計算エラー

1. **配当データなし**: 特定の人気組み合わせの配当データが存在しない
   - 処理: デフォルト値（100円）を使用
   - 表示: 「配当データなし（理論値）」と明示

2. **データ不整合**: 的中回数と配当データ件数が大きく異なる
   - 処理: 利用可能なデータで計算を続行
   - 表示: 配当データ件数を明示

## Testing Strategy

### 単体テスト（手動確認）

1. **払い戻しデータ解析**
   - 様々な形式の払い戻しデータを入力
   - 正しく解析されることを確認

2. **平均配当計算**
   - 各券種で平均配当が正しく計算されることを確認
   - 配当データがない場合のデフォルト値を確認

3. **期待値計算**
   - 期待値 = (的中率 × 平均配当) / 100 が正しく計算されることを確認

### 統合テスト（手動確認）

1. **データ入力 → 保存 → 読み込み → 分析**
   - レースデータと払い戻しデータを入力
   - 保存して再読み込み
   - 各タブで正しい平均配当と期待値が表示されることを確認

2. **フィルター適用**
   - フィルター条件を変更
   - 平均配当と期待値が正しく再計算されることを確認

3. **エクスポート・インポート**
   - 払い戻しデータを含むデータをエクスポート
   - インポートして正しく復元されることを確認

## Implementation Notes

### 払い戻しデータの解析優先度

1. まず単勝・複勝の解析を実装（シンプル）
2. 次に馬連・馬単の解析を実装（2頭組み合わせ）
3. 最後にワイド・3連複・3連単の解析を実装（複雑）

### パフォーマンス考慮

- 払い戻しデータの解析は一度だけ実行（parseData時）
- 統計計算時は既に解析済みのデータを使用
- 大量のデータでも高速に処理できるよう最適化

### 後方互換性

- 払い戻しデータがない古いデータセットも正常に動作
- payoutsプロパティの有無をチェックしてから使用
- デフォルト値（100円）で計算を続行
