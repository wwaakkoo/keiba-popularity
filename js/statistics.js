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
                // 3着以内の馬を取得（同着対応：position <= 3）
                const top3Horses = race.results.filter(r => r.position <= 3);
                const popularities = top3Horses
                    .map(r => r.popularity)
                    .filter(p => p);
                
                if (popularities.length >= 3) {
                    // 3着以内の全ての2頭組み合わせを生成（ワイド）
                    const combinations = [];
                    for (let i = 0; i < popularities.length; i++) {
                        for (let j = i + 1; j < popularities.length; j++) {
                            combinations.push([popularities[i], popularities[j]]);
                        }
                    }
                    
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
                    
                    // 新しいデータ形式: combinationから人気パターンを生成
                    if (!pattern && wide.combination && Array.isArray(wide.combination)) {
                        const popularities = wide.combination.map(horseNum => {
                            const result = race.results.find(r => r.number === horseNum);
                            return result ? result.popularity : null;
                        }).filter(p => p !== null);
                        
                        if (popularities.length === 2) {
                            popularities.sort((a, b) => a - b);
                            pattern = popularities.join('-');
                        }
                    }
                    
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
                        let pattern = umaren.popularityPattern;
                        
                        // combinationから人気パターンを生成
                        if (!pattern && umaren.combination && Array.isArray(umaren.combination)) {
                            const popularities = umaren.combination.map(horseNum => {
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
                        let pattern = umatan.popularityPattern;
                        
                        // combinationから人気パターンを生成（馬単は順序重要）
                        if (!pattern && umatan.combination && Array.isArray(umatan.combination)) {
                            const popularities = umatan.combination.map(horseNum => {
                                const result = race.results.find(r => r.number === horseNum);
                                return result ? result.popularity : null;
                            }).filter(p => p !== null);
                            
                            if (popularities.length === 2) {
                                pattern = popularities.join('-');
                            }
                        }
                        
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
                        let pattern = sanrenpuku.popularityPattern;
                        
                        // combinationから人気パターンを生成（3連複はソート）
                        if (!pattern && sanrenpuku.combination && Array.isArray(sanrenpuku.combination)) {
                            const popularities = sanrenpuku.combination.map(horseNum => {
                                const result = race.results.find(r => r.number === horseNum);
                                return result ? result.popularity : null;
                            }).filter(p => p !== null);
                            
                            if (popularities.length === 3) {
                                popularities.sort((a, b) => a - b);
                                pattern = popularities.join('-');
                            }
                        }
                        
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
                        let pattern = sanrentan.popularityPattern;
                        
                        // combinationから人気パターンを生成（3連単は順序重要）
                        if (!pattern && sanrentan.combination && Array.isArray(sanrentan.combination)) {
                            const popularities = sanrentan.combination.map(horseNum => {
                                const result = race.results.find(r => r.number === horseNum);
                                return result ? result.popularity : null;
                            }).filter(p => p !== null);
                            
                            if (popularities.length === 3) {
                                pattern = popularities.join('-');
                            }
                        }
                        
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

    // 馬券自体の人気による統計（馬連）
    calculateUmarenTicketPopularityStats() {
        const stats = {};
        let totalWithPopularity = 0;

        // 初期化（1-300人気まで対応）
        for (let i = 1; i <= 300; i++) {
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

        this.filteredRaces.forEach(race => {
            if (race.payouts && race.payouts.umaren && Array.isArray(race.payouts.umaren)) {
                race.payouts.umaren.forEach(umaren => {
                    const pop = umaren.ticketPopularity;
                    if (pop && pop >= 1 && pop <= 300) {
                        stats[pop].wins++;
                        stats[pop].payouts.push(umaren.payout);
                        totalWithPopularity++;
                    }
                });
            }
        });

        // 統計値を計算
        for (let i = 1; i <= 300; i++) {
            stats[i].total = totalWithPopularity;
            stats[i].payoutCount = stats[i].payouts.length;

            if (stats[i].total > 0) {
                stats[i].winRate = (stats[i].wins / stats[i].total) * 100;

                if (stats[i].payouts.length > 0) {
                    const sum = stats[i].payouts.reduce((a, b) => a + b, 0);
                    stats[i].averagePayout = sum / stats[i].payouts.length;
                    stats[i].minPayout = Math.min(...stats[i].payouts);
                    stats[i].maxPayout = Math.max(...stats[i].payouts);
                } else {
                    stats[i].averagePayout = 100;
                }

                stats[i].expectedValue = (stats[i].winRate * stats[i].averagePayout) / 100;
            }
        }

        return { stats, totalWithPopularity };
    }

    // 馬券自体の人気による統計（馬単）
    calculateUmatanTicketPopularityStats() {
        const stats = {};
        let totalWithPopularity = 0;

        for (let i = 1; i <= 300; i++) {
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

        this.filteredRaces.forEach(race => {
            if (race.payouts && race.payouts.umatan && Array.isArray(race.payouts.umatan)) {
                race.payouts.umatan.forEach(umatan => {
                    const pop = umatan.ticketPopularity;
                    if (pop && pop >= 1 && pop <= 300) {
                        stats[pop].wins++;
                        stats[pop].payouts.push(umatan.payout);
                        totalWithPopularity++;
                    }
                });
            }
        });

        for (let i = 1; i <= 300; i++) {
            stats[i].total = totalWithPopularity;
            stats[i].payoutCount = stats[i].payouts.length;

            if (stats[i].total > 0) {
                stats[i].winRate = (stats[i].wins / stats[i].total) * 100;

                if (stats[i].payouts.length > 0) {
                    const sum = stats[i].payouts.reduce((a, b) => a + b, 0);
                    stats[i].averagePayout = sum / stats[i].payouts.length;
                    stats[i].minPayout = Math.min(...stats[i].payouts);
                    stats[i].maxPayout = Math.max(...stats[i].payouts);
                } else {
                    stats[i].averagePayout = 100;
                }

                stats[i].expectedValue = (stats[i].winRate * stats[i].averagePayout) / 100;
            }
        }

        return { stats, totalWithPopularity };
    }

    // 馬券自体の人気による統計（ワイド）
    calculateWideTicketPopularityStats() {
        const stats = {};
        let totalWithPopularity = 0;

        for (let i = 1; i <= 300; i++) {
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

        this.filteredRaces.forEach(race => {
            if (race.payouts && race.payouts.wide && Array.isArray(race.payouts.wide)) {
                race.payouts.wide.forEach(wide => {
                    const pop = wide.ticketPopularity;
                    if (pop && pop >= 1 && pop <= 300) {
                        stats[pop].wins++;
                        stats[pop].payouts.push(wide.payout);
                        totalWithPopularity++;
                    }
                });
            }
        });

        for (let i = 1; i <= 300; i++) {
            stats[i].total = totalWithPopularity;
            stats[i].payoutCount = stats[i].payouts.length;

            if (stats[i].total > 0) {
                stats[i].winRate = (stats[i].wins / stats[i].total) * 100;

                if (stats[i].payouts.length > 0) {
                    const sum = stats[i].payouts.reduce((a, b) => a + b, 0);
                    stats[i].averagePayout = sum / stats[i].payouts.length;
                    stats[i].minPayout = Math.min(...stats[i].payouts);
                    stats[i].maxPayout = Math.max(...stats[i].payouts);
                } else {
                    stats[i].averagePayout = 100;
                }

                stats[i].expectedValue = (stats[i].winRate * stats[i].averagePayout) / 100;
            }
        }

        return { stats, totalWithPopularity };
    }

    // 馬券自体の人気による統計（3連複）
    calculateSanrenpukuTicketPopularityStats() {
        const stats = {};
        let totalWithPopularity = 0;

        for (let i = 1; i <= 1000; i++) {
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

        this.filteredRaces.forEach(race => {
            if (race.payouts && race.payouts.sanrenpuku && Array.isArray(race.payouts.sanrenpuku)) {
                race.payouts.sanrenpuku.forEach(sanrenpuku => {
                    const pop = sanrenpuku.ticketPopularity;
                    if (pop && pop >= 1 && pop <= 1000) {
                        stats[pop].wins++;
                        stats[pop].payouts.push(sanrenpuku.payout);
                        totalWithPopularity++;
                    }
                });
            }
        });

        for (let i = 1; i <= 1000; i++) {
            stats[i].total = totalWithPopularity;
            stats[i].payoutCount = stats[i].payouts.length;

            if (stats[i].total > 0) {
                stats[i].winRate = (stats[i].wins / stats[i].total) * 100;

                if (stats[i].payouts.length > 0) {
                    const sum = stats[i].payouts.reduce((a, b) => a + b, 0);
                    stats[i].averagePayout = sum / stats[i].payouts.length;
                    stats[i].minPayout = Math.min(...stats[i].payouts);
                    stats[i].maxPayout = Math.max(...stats[i].payouts);
                } else {
                    stats[i].averagePayout = 100;
                }

                stats[i].expectedValue = (stats[i].winRate * stats[i].averagePayout) / 100;
            }
        }

        return { stats, totalWithPopularity };
    }

    // 馬券自体の人気による統計（3連単）
    calculateSanrentanTicketPopularityStats() {
        const stats = {};
        let totalWithPopularity = 0;

        for (let i = 1; i <= 2000; i++) {
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

        this.filteredRaces.forEach(race => {
            if (race.payouts && race.payouts.sanrentan && Array.isArray(race.payouts.sanrentan)) {
                race.payouts.sanrentan.forEach(sanrentan => {
                    const pop = sanrentan.ticketPopularity;
                    if (pop && pop >= 1 && pop <= 2000) {
                        stats[pop].wins++;
                        stats[pop].payouts.push(sanrentan.payout);
                        totalWithPopularity++;
                    }
                });
            }
        });

        for (let i = 1; i <= 2000; i++) {
            stats[i].total = totalWithPopularity;
            stats[i].payoutCount = stats[i].payouts.length;

            if (stats[i].total > 0) {
                stats[i].winRate = (stats[i].wins / stats[i].total) * 100;

                if (stats[i].payouts.length > 0) {
                    const sum = stats[i].payouts.reduce((a, b) => a + b, 0);
                    stats[i].averagePayout = sum / stats[i].payouts.length;
                    stats[i].minPayout = Math.min(...stats[i].payouts);
                    stats[i].maxPayout = Math.max(...stats[i].payouts);
                } else {
                    stats[i].averagePayout = 100;
                }

                stats[i].expectedValue = (stats[i].winRate * stats[i].averagePayout) / 100;
            }
        }

        return { stats, totalWithPopularity };
    }

    // 馬券人気統計の時系列分析（移動平均）
    calculateRollingTicketPopularityStats(ticketType, windowDays, stepDays) {
        // レースを日付順にソート
        const sortedRaces = [...this.filteredRaces].sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        );

        if (sortedRaces.length === 0) {
            return { windows: [], error: 'データがありません' };
        }

        const startDate = new Date(sortedRaces[0].date);
        const endDate = new Date(sortedRaces[sortedRaces.length - 1].date);

        const windows = [];
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const windowStart = new Date(currentDate);
            const windowEnd = new Date(currentDate);
            windowEnd.setDate(windowEnd.getDate() + windowDays);

            // ウィンドウ内のレースを抽出
            const windowRaces = sortedRaces.filter(race => {
                const raceDate = new Date(race.date);
                return raceDate >= windowStart && raceDate < windowEnd;
            });

            // ウィンドウ内のレースが十分にある場合のみ計算
            if (windowRaces.length >= 5) {
                // ウィンドウ内のレースで統計計算
                const tempStats = new Statistics(windowRaces);
                let result;

                switch(ticketType) {
                    case 'umaren':
                        result = tempStats.calculateUmarenTicketPopularityStats();
                        break;
                    case 'umatan':
                        result = tempStats.calculateUmatanTicketPopularityStats();
                        break;
                    case 'wide':
                        result = tempStats.calculateWideTicketPopularityStats();
                        break;
                    case 'sanrenpuku':
                        result = tempStats.calculateSanrenpukuTicketPopularityStats();
                        break;
                    case 'sanrentan':
                        result = tempStats.calculateSanrentanTicketPopularityStats();
                        break;
                    default:
                        return { windows: [], error: '不明な馬券種別' };
                }

                windows.push({
                    startDate: windowStart.toISOString().split('T')[0],
                    endDate: windowEnd.toISOString().split('T')[0],
                    raceCount: windowRaces.length,
                    stats: result.stats
                });
            }

            // ステップサイズ分日付を進める
            currentDate.setDate(currentDate.getDate() + stepDays);
        }

        if (windows.length === 0) {
            return { windows: [], error: 'ウィンドウサイズとステップサイズに対してデータが不足しています' };
        }

        return { windows };
    }

    // 直近レース vs 全期間比較分析
    calculateRecentVsAllComparison(ticketType, recentRaceCount) {
        // レースを日付順にソート
        const sortedRaces = [...this.filteredRaces].sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        );

        if (sortedRaces.length === 0) {
            return { error: 'データがありません' };
        }

        if (sortedRaces.length < recentRaceCount) {
            return { error: `データ不足: 全${sortedRaces.length}レース（${recentRaceCount}レース以上必要）` };
        }

        // 全期間の統計を計算
        const allPeriodStats = new Statistics(sortedRaces);
        let allPeriodResult;

        switch(ticketType) {
            case 'umaren':
                allPeriodResult = allPeriodStats.calculateUmarenTicketPopularityStats();
                break;
            case 'umatan':
                allPeriodResult = allPeriodStats.calculateUmatanTicketPopularityStats();
                break;
            case 'wide':
                allPeriodResult = allPeriodStats.calculateWideTicketPopularityStats();
                break;
            case 'sanrenpuku':
                allPeriodResult = allPeriodStats.calculateSanrenpukuTicketPopularityStats();
                break;
            case 'sanrentan':
                allPeriodResult = allPeriodStats.calculateSanrentanTicketPopularityStats();
                break;
            default:
                return { error: '不明な馬券種別' };
        }

        // 直近レースの統計を計算
        const recentRaces = sortedRaces.slice(-recentRaceCount);
        const recentStats = new Statistics(recentRaces);
        let recentResult;

        switch(ticketType) {
            case 'umaren':
                recentResult = recentStats.calculateUmarenTicketPopularityStats();
                break;
            case 'umatan':
                recentResult = recentStats.calculateUmatanTicketPopularityStats();
                break;
            case 'wide':
                recentResult = recentStats.calculateWideTicketPopularityStats();
                break;
            case 'sanrenpuku':
                recentResult = recentStats.calculateSanrenpukuTicketPopularityStats();
                break;
            case 'sanrentan':
                recentResult = recentStats.calculateSanrentanTicketPopularityStats();
                break;
        }

        // 比較データを作成
        const comparisons = [];
        const allStats = allPeriodResult.stats;
        const recStats = recentResult.stats;

        Object.keys(allStats).forEach(pop => {
            const allStat = allStats[pop];
            const recentStat = recStats[pop];

            // 両方にデータがある場合のみ比較
            if (allStat && recentStat && allStat.wins > 0 && recentStat.wins > 0) {
                const delta = recentStat.expectedValue - allStat.expectedValue;
                const deltaPercent = allStat.expectedValue > 0 ?
                    (delta / allStat.expectedValue) * 100 : 0;

                comparisons.push({
                    popularity: parseInt(pop),
                    allPeriod: {
                        expectedValue: allStat.expectedValue,
                        wins: allStat.wins,
                        winRate: allStat.winRate,
                        averagePayout: allStat.averagePayout
                    },
                    recent: {
                        expectedValue: recentStat.expectedValue,
                        wins: recentStat.wins,
                        winRate: recentStat.winRate,
                        averagePayout: recentStat.averagePayout
                    },
                    delta: delta,
                    deltaPercent: deltaPercent,
                    trend: Math.abs(delta) < 5 ? 'stable' : (delta > 0 ? 'improving' : 'declining'),
                    sampleSizeRecent: recentStat.wins,
                    sampleSizeAll: allStat.wins
                });
            }
        });

        return {
            comparisons: comparisons,
            totalRaces: sortedRaces.length,
            recentRaceCount: recentRaceCount,
            recentDateRange: {
                start: recentRaces[0].date,
                end: recentRaces[recentRaces.length - 1].date
            }
        };
    }

    // 人気別期待値の直近 vs 全期間比較（単勝・複勝用）
    calculatePopularityComparison(ticketType, recentRaceCount) {
        const sortedRaces = [...this.filteredRaces].sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        );

        if (sortedRaces.length === 0) {
            return { error: 'データがありません' };
        }

        if (sortedRaces.length < recentRaceCount) {
            return { error: `データ不足: 全${sortedRaces.length}レース（${recentRaceCount}レース以上必要）` };
        }

        // 全期間の統計
        const allPeriodStats = new Statistics(sortedRaces);
        const allResults = sortedRaces.flatMap(r => r.results);
        const allPeriodData = ticketType === 'tansho' ?
            allPeriodStats.calculateTanshoStats(allResults) :
            allPeriodStats.calculateFukushoStats(allResults);

        // 直近レースの統計
        const recentRaces = sortedRaces.slice(-recentRaceCount);
        const recentStats = new Statistics(recentRaces);
        const recentResults = recentRaces.flatMap(r => r.results);
        const recentData = ticketType === 'tansho' ?
            recentStats.calculateTanshoStats(recentResults) :
            recentStats.calculateFukushoStats(recentResults);

        // 比較データ作成
        const comparisons = [];
        for (let pop = 1; pop <= 16; pop++) {
            const allStat = allPeriodData[pop];
            const recentStat = recentData[pop];

            if (allStat && recentStat && allStat.total > 0 && recentStat.total > 0) {
                const delta = recentStat.expectedValue - allStat.expectedValue;
                const deltaPercent = allStat.expectedValue > 0 ?
                    (delta / allStat.expectedValue) * 100 : 0;

                comparisons.push({
                    popularity: pop,
                    allPeriod: {
                        expectedValue: allStat.expectedValue,
                        wins: ticketType === 'tansho' ? allStat.wins : allStat.hits,
                        winRate: allStat.winRate,
                        averagePayout: allStat.averagePayout
                    },
                    recent: {
                        expectedValue: recentStat.expectedValue,
                        wins: ticketType === 'tansho' ? recentStat.wins : recentStat.hits,
                        winRate: recentStat.winRate,
                        averagePayout: recentStat.averagePayout
                    },
                    delta: delta,
                    deltaPercent: deltaPercent,
                    trend: Math.abs(delta) < 5 ? 'stable' : (delta > 0 ? 'improving' : 'declining'),
                    sampleSizeRecent: ticketType === 'tansho' ? recentStat.wins : recentStat.hits,
                    sampleSizeAll: ticketType === 'tansho' ? allStat.wins : allStat.hits
                });
            }
        }

        return {
            comparisons: comparisons,
            totalRaces: sortedRaces.length,
            recentRaceCount: recentRaceCount,
            recentDateRange: {
                start: recentRaces[0].date,
                end: recentRaces[recentRaces.length - 1].date
            }
        };
    }

    // パターン別期待値の直近 vs 全期間比較（馬連・馬単・ワイド・3連複・3連単用）
    calculatePatternComparison(ticketType, recentRaceCount) {
        const sortedRaces = [...this.filteredRaces].sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        );

        if (sortedRaces.length === 0) {
            return { error: 'データがありません' };
        }

        if (sortedRaces.length < recentRaceCount) {
            return { error: `データ不足: 全${sortedRaces.length}レース（${recentRaceCount}レース以上必要）` };
        }

        // 統計計算関数を選択
        const calculateFunc = {
            'umaren': (stats) => stats.calculateUmarenStats(),
            'umatan': (stats) => stats.calculateUmatanStats(),
            'wide': (stats) => stats.calculateWideStats(),
            'sanrenpuku': (stats) => stats.calculateSanrenpukuStats(),
            'sanrentan': (stats) => stats.calculateSanrentanStats()
        }[ticketType];

        if (!calculateFunc) {
            return { error: '不明な馬券種別' };
        }

        // 全期間の統計
        const allPeriodStats = new Statistics(sortedRaces);
        const allPeriodData = calculateFunc(allPeriodStats);

        // 直近レースの統計
        const recentRaces = sortedRaces.slice(-recentRaceCount);
        const recentStats = new Statistics(recentRaces);
        const recentData = calculateFunc(recentStats);

        // パターンをマップに変換
        const allPatternMap = {};
        allPeriodData.patterns.forEach(p => {
            allPatternMap[p.pattern] = p;
        });

        const recentPatternMap = {};
        recentData.patterns.forEach(p => {
            recentPatternMap[p.pattern] = p;
        });

        // 比較データ作成
        const comparisons = [];
        Object.keys(allPatternMap).forEach(pattern => {
            const allStat = allPatternMap[pattern];
            const recentStat = recentPatternMap[pattern];

            if (allStat && recentStat && allStat.count > 0 && recentStat.count > 0) {
                const delta = recentStat.expectedValue - allStat.expectedValue;
                const deltaPercent = allStat.expectedValue > 0 ?
                    (delta / allStat.expectedValue) * 100 : 0;

                comparisons.push({
                    pattern: pattern,
                    allPeriod: {
                        expectedValue: allStat.expectedValue,
                        count: allStat.count,
                        percentage: allStat.percentage,
                        averagePayout: allStat.averagePayout
                    },
                    recent: {
                        expectedValue: recentStat.expectedValue,
                        count: recentStat.count,
                        percentage: recentStat.percentage,
                        averagePayout: recentStat.averagePayout
                    },
                    delta: delta,
                    deltaPercent: deltaPercent,
                    trend: Math.abs(delta) < 5 ? 'stable' : (delta > 0 ? 'improving' : 'declining'),
                    sampleSizeRecent: recentStat.count,
                    sampleSizeAll: allStat.count
                });
            }
        });

        return {
            comparisons: comparisons,
            totalRaces: sortedRaces.length,
            recentRaceCount: recentRaceCount,
            recentDateRange: {
                start: recentRaces[0].date,
                end: recentRaces[recentRaces.length - 1].date
            }
        };
    }
}