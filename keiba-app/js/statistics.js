// 統計計算クラス
class Statistics {
    constructor(filteredRaces) {
        this.filteredRaces = filteredRaces;
    }

    // 人気パターンを生成するヘルパーメソッド
    getPopularityPattern(race, positions, sorted = false) {
        const popularities = positions.map(pos => {
            const result = race.results.find(r => r.position === pos);
            return result ? result.popularity : null;
        }).filter(p => p !== null);
        
        if (sorted) {
            popularities.sort((a, b) => a - b);
        }
        
        return popularities.join('-');
    }

    calculateTanshoStats(results) {
        const stats = {};
        
        // 初期化
        for (let i = 1; i <= 16; i++) {
            stats[i] = {
                total: 0,
                wins: 0,
                payouts: [],
                winRate: 0,
                averagePayout: 0,
                expectedValue: 0,
                popularity: i.toString(),
                payoutCount: 0,
                minPayout: 0,
                maxPayout: 0
            };
        }
        
        // 各レースの1着結果を処理
        results.forEach(result => {
            if (result.position === 1 && result.popularity) {
                const pop = result.popularity;
                if (pop >= 1 && pop <= 16) {
                    stats[pop].wins++;
                }
            }
        });
        
        // 払い戻しデータから配当を集計
        this.filteredRaces.forEach(race => {
            if (race.payouts && race.payouts.tansho) {
                const pop = race.payouts.tansho.popularity;
                if (pop >= 1 && pop <= 16) {
                    stats[pop].payouts.push(race.payouts.tansho.payout);
                }
            }
        });
        
        // 統計値を計算
        const totalRaces = this.filteredRaces.length;
        for (let i = 1; i <= 16; i++) {
            stats[i].total = totalRaces;
            stats[i].payoutCount = stats[i].payouts.length;
            
            if (stats[i].total > 0) {
                stats[i].winRate = (stats[i].wins / stats[i].total) * 100;
                
                // 平均配当を計算
                if (stats[i].payouts.length > 0) {
                    const sum = stats[i].payouts.reduce((a, b) => a + b, 0);
                    stats[i].averagePayout = sum / stats[i].payouts.length;
                    stats[i].minPayout = Math.min(...stats[i].payouts);
                    stats[i].maxPayout = Math.max(...stats[i].payouts);
                } else {
                    stats[i].averagePayout = 100; // デフォルト値
                }
                
                // 期待値を計算
                stats[i].expectedValue = (stats[i].winRate * stats[i].averagePayout) / 100;
            }
        }
        
        return stats;
    }

    calculateFukushoStats(results) {
        const stats = {};
        
        // 初期化
        for (let i = 1; i <= 16; i++) {
            stats[i] = {
                total: 0,
                hits: 0,
                payouts: [],
                winRate: 0,
                averagePayout: 0,
                expectedValue: 0,
                popularity: i.toString(),
                payoutCount: 0,
                minPayout: 0,
                maxPayout: 0
            };
        }
        
        // 各レースの結果を処理
        this.filteredRaces.forEach(race => {
            if (race.results.length >= 3) {
                // 3着以内の人気を取得
                const top3Popularities = race.results.slice(0, 3).map(r => r.popularity).filter(p => p);
                
                // 各人気の複勝判定
                for (let pop = 1; pop <= 16; pop++) {
                    const isHit = top3Popularities.includes(pop);
                    stats[pop].total++;
                    
                    if (isHit) {
                        stats[pop].hits++;
                    }
                }
            }
            
            // 払い戻しデータから配当を集計
            if (race.payouts && race.payouts.fukusho) {
                race.payouts.fukusho.forEach(fukusho => {
                    const pop = fukusho.popularity;
                    if (pop >= 1 && pop <= 16) {
                        stats[pop].payouts.push(fukusho.payout);
                    }
                });
            }
        });
        
        // 統計値を計算
        for (let i = 1; i <= 16; i++) {
            stats[i].payoutCount = stats[i].payouts.length;
            
            if (stats[i].total > 0) {
                stats[i].winRate = (stats[i].hits / stats[i].total) * 100;
                
                // 平均配当を計算
                if (stats[i].payouts.length > 0) {
                    const sum = stats[i].payouts.reduce((a, b) => a + b, 0);
                    stats[i].averagePayout = sum / stats[i].payouts.length;
                    stats[i].minPayout = Math.min(...stats[i].payouts);
                    stats[i].maxPayout = Math.max(...stats[i].payouts);
                } else {
                    stats[i].averagePayout = 100; // デフォルト値
                }
                
                // 期待値を計算
                stats[i].expectedValue = (stats[i].winRate * stats[i].averagePayout) / 100;
            }
        }
        
        return stats;
    }

    calculateWideStats() {
        const patterns = {};
        
        this.filteredRaces.forEach(race => {
            if (race.results.length >= 3) {
                const popularities = race.results
                    .slice(0, 3)
                    .map(r => r.popularity)
                    .filter(p => p);
                
                if (popularities.length === 3) {
                    // 3着以内の全ての2頭組み合わせを生成（ワイド）
                    const combinations = [
                        [popularities[0], popularities[1]], // 1着-2着
                        [popularities[0], popularities[2]], // 1着-3着
                        [popularities[1], popularities[2]]  // 2着-3着
                    ];
                    
                    combinations.forEach(combo => {
                        // 小さい人気番号を先にしてソート
                        const sortedCombo = combo.sort((a, b) => a - b);
                        const pattern = sortedCombo.join('-');
                        
                        if (!patterns[pattern]) {
                            patterns[pattern] = { count: 0, payouts: [] };
                        }
                        patterns[pattern].count++;
                    });
                }
            }
            
            // 払い戻しデータから配当を集計
            if (race.payouts && race.payouts.wide && Array.isArray(race.payouts.wide)) {
                race.payouts.wide.forEach(wide => {
                    let pattern = wide.popularityPattern;
                    
                    // 既存データ形式: numbersから人気パターンを生成
                    if (!pattern && wide.numbers && Array.isArray(wide.numbers)) {
                        const popularities = wide.numbers.map(horseNum => {
                            const result = race.results.find(r => r.number === horseNum);
                            return result ? result.popularity : null;
                        }).filter(p => p !== null);
                        
                        if (popularities.length === 2) {
                            popularities.sort((a, b) => a - b);
                            pattern = popularities.join('-');
                        }
                    }
                    
                    if (pattern) {
                        if (!patterns[pattern]) {
                            patterns[pattern] = { count: 0, payouts: [] };
                        }
                        patterns[pattern].payouts.push(wide.payout);
                    }
                });
            }
        });

        const total = Object.values(patterns).reduce((sum, patternData) => sum + patternData.count, 0);
        const stats = Object.entries(patterns)
            .map(([pattern, data]) => {
                const percentage = (data.count / total * 100);
                
                // 平均配当を計算
                let averagePayout = 100; // デフォルト値
                let minPayout = 0;
                let maxPayout = 0;
                if (data.payouts.length > 0) {
                    const sum = data.payouts.reduce((a, b) => a + b, 0);
                    averagePayout = sum / data.payouts.length;
                    minPayout = Math.min(...data.payouts);
                    maxPayout = Math.max(...data.payouts);
                }
                
                // ワイドは3通りあるので期待値を3倍
                const expectedValue = (percentage * 3 / 100) * averagePayout;
                
                return {
                    pattern,
                    count: data.count,
                    percentage,
                    averagePayout,
                    expectedValue,
                    payoutCount: data.payouts.length,
                    minPayout,
                    maxPayout
                };
            })
            .sort((a, b) => b.expectedValue - a.expectedValue || b.count - a.count);

        return { patterns: stats, total };
    }

    calculateUmarenStats() {
        const patterns = {};
        
        this.filteredRaces.forEach(race => {
            if (race.results.length >= 2) {
                const popularities = race.results
                    .slice(0, 2)
                    .map(r => r.popularity)
                    .filter(p => p);
                
                if (popularities.length === 2) {
                    // 馬連は順序不問なのでソート
                    const sortedCombo = popularities.sort((a, b) => a - b);
                    const pattern = sortedCombo.join('-');
                    
                    if (!patterns[pattern]) {
                        patterns[pattern] = { count: 0, payouts: [] };
                    }
                    patterns[pattern].count++;
                }
            }
            
            // 払い戻しデータから配当を集計
            if (race.payouts && race.payouts.umaren) {
                // 配列形式（新形式）
                if (Array.isArray(race.payouts.umaren)) {
                    race.payouts.umaren.forEach(umaren => {
                        const pattern = umaren.popularityPattern;
                        if (pattern) {
                            if (!patterns[pattern]) {
                                patterns[pattern] = { count: 0, payouts: [] };
                            }
                            patterns[pattern].payouts.push(umaren.payout);
                        }
                    });
                } 
                // オブジェクト形式（既存形式）
                else if (race.payouts.umaren.numbers && race.payouts.umaren.payout) {
                    const horseNumbers = race.payouts.umaren.numbers;
                    const pattern = this.getPopularityPattern(race, [1, 2], true);
                    if (pattern) {
                        if (!patterns[pattern]) {
                            patterns[pattern] = { count: 0, payouts: [] };
                        }
                        patterns[pattern].payouts.push(race.payouts.umaren.payout);
                    }
                }
            }
        });

        const total = Object.values(patterns).reduce((sum, patternData) => sum + patternData.count, 0);
        const stats = Object.entries(patterns)
            .map(([pattern, data]) => {
                const percentage = (data.count / total * 100);
                
                // 平均配当を計算
                let averagePayout = 100; // デフォルト値
                let minPayout = 0;
                let maxPayout = 0;
                if (data.payouts.length > 0) {
                    const sum = data.payouts.reduce((a, b) => a + b, 0);
                    averagePayout = sum / data.payouts.length;
                    minPayout = Math.min(...data.payouts);
                    maxPayout = Math.max(...data.payouts);
                }
                
                const expectedValue = (percentage / 100) * averagePayout;
                
                return {
                    pattern,
                    count: data.count,
                    percentage,
                    averagePayout,
                    expectedValue,
                    payoutCount: data.payouts.length,
                    minPayout,
                    maxPayout
                };
            })
            .sort((a, b) => b.expectedValue - a.expectedValue || b.count - a.count);

        return { patterns: stats, total };
    }

    calculateUmatanStats() {
        const patterns = {};
        
        this.filteredRaces.forEach(race => {
            if (race.results.length >= 2) {
                const popularities = race.results
                    .slice(0, 2)
                    .map(r => r.popularity)
                    .filter(p => p);
                
                if (popularities.length === 2) {
                    // 馬単は順序重要なのでそのまま
                    const pattern = popularities.join('-');
                    
                    if (!patterns[pattern]) {
                        patterns[pattern] = { count: 0, payouts: [] };
                    }
                    patterns[pattern].count++;
                }
            }
            
            // 払い戻しデータから配当を集計
            if (race.payouts && race.payouts.umatan) {
                // 配列形式（新形式）
                if (Array.isArray(race.payouts.umatan)) {
                    race.payouts.umatan.forEach(umatan => {
                        const pattern = umatan.popularityPattern;
                        if (pattern) {
                            if (!patterns[pattern]) {
                                patterns[pattern] = { count: 0, payouts: [] };
                            }
                            patterns[pattern].payouts.push(umatan.payout);
                        }
                    });
                }
                // オブジェクト形式（既存形式）
                else if (race.payouts.umatan.numbers && race.payouts.umatan.payout) {
                    const pattern = this.getPopularityPattern(race, [1, 2], false);
                    if (pattern) {
                        if (!patterns[pattern]) {
                            patterns[pattern] = { count: 0, payouts: [] };
                        }
                        patterns[pattern].payouts.push(race.payouts.umatan.payout);
                    }
                }
            }
        });

        const total = Object.values(patterns).reduce((sum, patternData) => sum + patternData.count, 0);
        const stats = Object.entries(patterns)
            .map(([pattern, data]) => {
                const percentage = (data.count / total * 100);
                
                // 平均配当を計算
                let averagePayout = 100; // デフォルト値
                let minPayout = 0;
                let maxPayout = 0;
                if (data.payouts.length > 0) {
                    const sum = data.payouts.reduce((a, b) => a + b, 0);
                    averagePayout = sum / data.payouts.length;
                    minPayout = Math.min(...data.payouts);
                    maxPayout = Math.max(...data.payouts);
                }
                
                const expectedValue = (percentage / 100) * averagePayout;
                
                return {
                    pattern,
                    count: data.count,
                    percentage,
                    averagePayout,
                    expectedValue,
                    payoutCount: data.payouts.length,
                    minPayout,
                    maxPayout
                };
            })
            .sort((a, b) => b.expectedValue - a.expectedValue || b.count - a.count);

        return { patterns: stats, total };
    }

    calculateSanrenpukuStats() {
        const patterns = {};
        
        this.filteredRaces.forEach(race => {
            if (race.results.length >= 3) {
                const popularities = race.results
                    .slice(0, 3)
                    .map(r => r.popularity)
                    .filter(p => p);
                
                if (popularities.length === 3) {
                    // 3連複は順序不問なのでソート
                    const sortedCombo = popularities.sort((a, b) => a - b);
                    const pattern = sortedCombo.join('-');
                    
                    if (!patterns[pattern]) {
                        patterns[pattern] = { count: 0, payouts: [] };
                    }
                    patterns[pattern].count++;
                }
            }
            
            // 払い戻しデータから配当を集計
            if (race.payouts && race.payouts.sanrenpuku) {
                // 配列形式（新形式）
                if (Array.isArray(race.payouts.sanrenpuku)) {
                    race.payouts.sanrenpuku.forEach(sanrenpuku => {
                        const pattern = sanrenpuku.popularityPattern;
                        if (pattern) {
                            if (!patterns[pattern]) {
                                patterns[pattern] = { count: 0, payouts: [] };
                            }
                            patterns[pattern].payouts.push(sanrenpuku.payout);
                        }
                    });
                }
                // オブジェクト形式（既存形式）
                else if (race.payouts.sanrenpuku.numbers && race.payouts.sanrenpuku.payout) {
                    const pattern = this.getPopularityPattern(race, [1, 2, 3], true);
                    if (pattern) {
                        if (!patterns[pattern]) {
                            patterns[pattern] = { count: 0, payouts: [] };
                        }
                        patterns[pattern].payouts.push(race.payouts.sanrenpuku.payout);
                    }
                }
            }
        });

        const total = Object.values(patterns).reduce((sum, patternData) => sum + patternData.count, 0);
        const stats = Object.entries(patterns)
            .map(([pattern, data]) => {
                const percentage = (data.count / total * 100);
                
                // 平均配当を計算
                let averagePayout = 100; // デフォルト値
                let minPayout = 0;
                let maxPayout = 0;
                if (data.payouts.length > 0) {
                    const sum = data.payouts.reduce((a, b) => a + b, 0);
                    averagePayout = sum / data.payouts.length;
                    minPayout = Math.min(...data.payouts);
                    maxPayout = Math.max(...data.payouts);
                }
                
                const expectedValue = (percentage / 100) * averagePayout;
                
                return {
                    pattern,
                    count: data.count,
                    percentage,
                    averagePayout,
                    expectedValue,
                    payoutCount: data.payouts.length,
                    minPayout,
                    maxPayout
                };
            })
            .sort((a, b) => b.expectedValue - a.expectedValue || b.count - a.count);

        return { patterns: stats, total };
    }

    calculateSanrentanStats() {
        const patterns = {};
        
        this.filteredRaces.forEach(race => {
            if (race.results.length >= 3) {
                const popularities = race.results
                    .slice(0, 3)
                    .map(r => r.popularity)
                    .filter(p => p);
                
                if (popularities.length === 3) {
                    // 3連単は順序重要なのでそのまま
                    const pattern = popularities.join('-');
                    
                    if (!patterns[pattern]) {
                        patterns[pattern] = { count: 0, payouts: [] };
                    }
                    patterns[pattern].count++;
                }
            }
            
            // 払い戻しデータから配当を集計
            if (race.payouts && race.payouts.sanrentan) {
                // 配列形式（新形式）
                if (Array.isArray(race.payouts.sanrentan)) {
                    race.payouts.sanrentan.forEach(sanrentan => {
                        const pattern = sanrentan.popularityPattern;
                        if (pattern) {
                            if (!patterns[pattern]) {
                                patterns[pattern] = { count: 0, payouts: [] };
                            }
                            patterns[pattern].payouts.push(sanrentan.payout);
                        }
                    });
                }
                // オブジェクト形式（既存形式）
                else if (race.payouts.sanrentan.numbers && race.payouts.sanrentan.payout) {
                    const pattern = this.getPopularityPattern(race, [1, 2, 3], false);
                    if (pattern) {
                        if (!patterns[pattern]) {
                            patterns[pattern] = { count: 0, payouts: [] };
                        }
                        patterns[pattern].payouts.push(race.payouts.sanrentan.payout);
                    }
                }
            }
        });

        const total = Object.values(patterns).reduce((sum, patternData) => sum + patternData.count, 0);
        const stats = Object.entries(patterns)
            .map(([pattern, data]) => {
                const percentage = (data.count / total * 100);
                
                // 平均配当を計算
                let averagePayout = 100; // デフォルト値
                let minPayout = 0;
                let maxPayout = 0;
                if (data.payouts.length > 0) {
                    const sum = data.payouts.reduce((a, b) => a + b, 0);
                    averagePayout = sum / data.payouts.length;
                    minPayout = Math.min(...data.payouts);
                    maxPayout = Math.max(...data.payouts);
                }
                
                const expectedValue = (percentage / 100) * averagePayout;
                
                return {
                    pattern,
                    count: data.count,
                    percentage,
                    averagePayout,
                    expectedValue,
                    payoutCount: data.payouts.length,
                    minPayout,
                    maxPayout
                };
            })
            .sort((a, b) => b.expectedValue - a.expectedValue || b.count - a.count);

        return { patterns: stats, total };
    }
}