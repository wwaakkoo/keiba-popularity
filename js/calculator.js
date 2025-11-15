// 期待値計算機クラス
class Calculator {
    constructor(filteredRaces) {
        this.filteredRaces = filteredRaces;
    }

    // 入力値を解析して人気の配列を取得
    parsePopularities(input) {
        if (!input) return [];
        return input.split(',')
            .map(p => parseInt(p.trim()))
            .filter(p => !isNaN(p) && p >= 1 && p <= 16);
    }

    // テキスト入力またはselectから人気を取得
    getPopularityInput(textInputId, selectId) {
        // テキスト入力を優先
        const textInput = document.getElementById(textInputId);
        if (textInput && textInput.value.trim()) {
            return textInput.value.trim();
        }
        
        // テキスト入力が空の場合はselectの値を使用
        const select = document.getElementById(selectId);
        if (select && select.value) {
            return select.value;
        }
        
        return '';
    }

    // 2頭の組み合わせを生成（順不同）
    generateCombinations(pops1, pops2) {
        const combinations = [];
        const seen = new Set();
        
        for (const p1 of pops1) {
            for (const p2 of pops2) {
                if (p1 === p2) continue; // 同じ人気は除外
                const sorted = [p1, p2].sort((a, b) => a - b);
                const key = sorted.join('-');
                if (!seen.has(key)) {
                    seen.add(key);
                    combinations.push(sorted);
                }
            }
        }
        
        return combinations;
    }

    // 2頭の順列を生成（順序あり）
    generatePermutations(pops1, pops2) {
        const permutations = [];
        
        for (const p1 of pops1) {
            for (const p2 of pops2) {
                if (p1 === p2) continue; // 同じ人気は除外
                permutations.push([p1, p2]);
            }
        }
        
        return permutations;
    }

    // 3頭の組み合わせを生成（順不同）
    generateTripleCombinations(pops1, pops2, pops3) {
        const combinations = [];
        const seen = new Set();
        
        for (const p1 of pops1) {
            for (const p2 of pops2) {
                for (const p3 of pops3) {
                    if (p1 === p2 || p2 === p3 || p1 === p3) continue;
                    const sorted = [p1, p2, p3].sort((a, b) => a - b);
                    const key = sorted.join('-');
                    if (!seen.has(key)) {
                        seen.add(key);
                        combinations.push(sorted);
                    }
                }
            }
        }
        
        return combinations;
    }

    // 3頭の順列を生成（順序あり）
    generateTriplePermutations(pops1, pops2, pops3) {
        const permutations = [];
        
        for (const p1 of pops1) {
            for (const p2 of pops2) {
                for (const p3 of pops3) {
                    if (p1 === p2 || p2 === p3 || p1 === p3) continue;
                    permutations.push([p1, p2, p3]);
                }
            }
        }
        
        return permutations;
    }

    performTanshoCalculation(popularity, resultDiv) {
        if (!popularity) {
            Utils.showError('人気を選択してください（カンマ区切りで複数指定可）');
            return;
        }

        if (!this.filteredRaces || this.filteredRaces.length === 0) {
            this.showNoDataError(resultDiv);
            return;
        }

        try {
            const popularities = this.parsePopularities(popularity);
            if (popularities.length === 0) {
                Utils.showError('有効な人気を入力してください（1-16の数字）');
                return;
            }

            const allResults = this.filteredRaces.flatMap(race => race.results);
            const statistics = new Statistics(this.filteredRaces);
            const stats = statistics.calculateTanshoStats(allResults);
            
            const results = popularities.map(pop => {
                const result = stats[pop];
                if (result && result.total > 0) {
                    return {
                        pattern: `${pop}番人気`,
                        expectedValue: result.expectedValue,
                        winRate: result.winRate,
                        averagePayout: result.averagePayout,
                        total: result.total,
                        payoutCount: result.payoutCount || 0,
                        minPayout: result.minPayout || 0,
                        maxPayout: result.maxPayout || 0
                    };
                }
                return null;
            }).filter(r => r !== null);

            if (results.length === 0) {
                this.showNoResultError(resultDiv, '指定された人気の単勝データ');
                return;
            }

            // 複数結果の場合はテーブル表示
            if (results.length > 1) {
                this.displayMultipleResults(resultDiv, results, '単勝');
            } else {
                this.displayResult(resultDiv, {
                    ...results[0],
                    description: results[0].pattern + 'の単勝'
                });
            }
        } catch (error) {
            this.showCalculationError(resultDiv, error, '単勝計算');
        }
    }

    performFukushoCalculation(popularity, resultDiv) {
        if (!popularity) {
            Utils.showError('人気を選択してください（カンマ区切りで複数指定可）');
            return;
        }

        if (!this.filteredRaces || this.filteredRaces.length === 0) {
            this.showNoDataError(resultDiv);
            return;
        }

        try {
            const popularities = this.parsePopularities(popularity);
            if (popularities.length === 0) {
                Utils.showError('有効な人気を入力してください（1-16の数字）');
                return;
            }

            const allResults = this.filteredRaces.flatMap(race => race.results);
            const statistics = new Statistics(this.filteredRaces);
            const stats = statistics.calculateFukushoStats(allResults);
            
            const results = popularities.map(pop => {
                const result = stats[pop];
                if (result && result.total > 0) {
                    return {
                        pattern: `${pop}番人気`,
                        expectedValue: result.expectedValue,
                        winRate: result.winRate,
                        averagePayout: result.averagePayout,
                        total: result.total,
                        payoutCount: result.payoutCount || 0,
                        minPayout: result.minPayout || 0,
                        maxPayout: result.maxPayout || 0
                    };
                }
                return null;
            }).filter(r => r !== null);

            if (results.length === 0) {
                this.showNoResultError(resultDiv, '指定された人気の複勝データ');
                return;
            }

            // 複数結果の場合はテーブル表示
            if (results.length > 1) {
                this.displayMultipleResults(resultDiv, results, '複勝');
            } else {
                this.displayResult(resultDiv, {
                    ...results[0],
                    description: results[0].pattern + 'の複勝'
                });
            }
        } catch (error) {
            this.showCalculationError(resultDiv, error, '複勝計算');
        }
    }

    performUmarenCalculation(pop1, pop2, resultDiv) {
        if (!pop1 || !pop2) {
            Utils.showError('両方の人気を入力してください（カンマ区切りで複数指定可）');
            return;
        }

        if (!this.filteredRaces || this.filteredRaces.length === 0) {
            this.showNoDataError(resultDiv);
            return;
        }

        try {
            const pops1 = this.parsePopularities(pop1);
            const pops2 = this.parsePopularities(pop2);
            
            if (pops1.length === 0 || pops2.length === 0) {
                Utils.showError('有効な人気を入力してください（1-16の数字）');
                return;
            }

            const statistics = new Statistics(this.filteredRaces);
            const umarenData = statistics.calculateUmarenStats();
            const allStats = umarenData.patterns;
            
            // 全ての組み合わせを生成
            const combinations = this.generateCombinations(pops1, pops2);
            
            const results = combinations.map(combo => {
                const pattern = combo.join('-');
                const stat = allStats.find(s => s.pattern === pattern);
                
                if (stat) {
                    return {
                        pattern: `${pattern}番人気`,
                        expectedValue: stat.expectedValue,
                        winRate: stat.percentage,
                        averagePayout: stat.averagePayout,
                        total: stat.count,
                        payoutCount: stat.payoutCount || 0,
                        minPayout: stat.minPayout || 0,
                        maxPayout: stat.maxPayout || 0
                    };
                }
                return null;
            }).filter(r => r !== null);

            if (results.length === 0) {
                this.showNoResultError(resultDiv, '指定された人気組み合わせの馬連データ');
                return;
            }

            // 複数結果の場合はテーブル表示
            if (results.length > 1) {
                this.displayMultipleResults(resultDiv, results, '馬連');
            } else {
                this.displayResult(resultDiv, {
                    ...results[0],
                    description: results[0].pattern + 'の馬連'
                });
            }
        } catch (error) {
            this.showCalculationError(resultDiv, error, '馬連計算');
        }
    }

    performUmatanCalculation(pop1, pop2, resultDiv) {
        if (!pop1 || !pop2) {
            Utils.showError('両方の人気を入力してください（カンマ区切りで複数指定可）');
            return;
        }

        if (!this.filteredRaces || this.filteredRaces.length === 0) {
            this.showNoDataError(resultDiv);
            return;
        }

        try {
            const pops1 = this.parsePopularities(pop1);
            const pops2 = this.parsePopularities(pop2);
            
            if (pops1.length === 0 || pops2.length === 0) {
                Utils.showError('有効な人気を入力してください（1-16の数字）');
                return;
            }

            const statistics = new Statistics(this.filteredRaces);
            const umatanData = statistics.calculateUmatanStats();
            const allStats = umatanData.patterns;
            
            // 全ての順列を生成（馬単は順序重要）
            const permutations = this.generatePermutations(pops1, pops2);
            
            const results = permutations.map(perm => {
                const pattern = perm.join('-');
                const stat = allStats.find(s => s.pattern === pattern);
                
                if (stat) {
                    return {
                        pattern: `${perm[0]}→${perm[1]}番人気`,
                        expectedValue: stat.expectedValue,
                        winRate: stat.percentage,
                        averagePayout: stat.averagePayout,
                        total: stat.count,
                        payoutCount: stat.payoutCount || 0,
                        minPayout: stat.minPayout || 0,
                        maxPayout: stat.maxPayout || 0
                    };
                }
                return null;
            }).filter(r => r !== null);

            if (results.length === 0) {
                this.showNoResultError(resultDiv, '指定された人気組み合わせの馬単データ');
                return;
            }

            // 複数結果の場合はテーブル表示
            if (results.length > 1) {
                this.displayMultipleResults(resultDiv, results, '馬単');
            } else {
                this.displayResult(resultDiv, {
                    ...results[0],
                    description: results[0].pattern + 'の馬単'
                });
            }
        } catch (error) {
            this.showCalculationError(resultDiv, error, '馬単計算');
        }
    }

    performWideCalculation(pop1, pop2, resultDiv) {
        if (!pop1 || !pop2) {
            Utils.showError('両方の人気を入力してください（カンマ区切りで複数指定可）');
            return;
        }

        if (!this.filteredRaces || this.filteredRaces.length === 0) {
            this.showNoDataError(resultDiv);
            return;
        }

        try {
            const pops1 = this.parsePopularities(pop1);
            const pops2 = this.parsePopularities(pop2);
            
            if (pops1.length === 0 || pops2.length === 0) {
                Utils.showError('有効な人気を入力してください（1-16の数字）');
                return;
            }

            const statistics = new Statistics(this.filteredRaces);
            const wideData = statistics.calculateWideStats();
            const allStats = wideData.patterns;
            
            // 全ての組み合わせを生成（ワイドは順不同）
            const combinations = this.generateCombinations(pops1, pops2);
            
            const results = combinations.map(combo => {
                const pattern = combo.join('-');
                const stat = allStats.find(s => s.pattern === pattern);
                
                if (stat) {
                    return {
                        pattern: `${pattern}番人気`,
                        expectedValue: stat.expectedValue,
                        winRate: stat.percentage,
                        averagePayout: stat.averagePayout,
                        total: stat.count,
                        payoutCount: stat.payoutCount || 0,
                        minPayout: stat.minPayout || 0,
                        maxPayout: stat.maxPayout || 0
                    };
                }
                return null;
            }).filter(r => r !== null);

            if (results.length === 0) {
                this.showNoResultError(resultDiv, '指定された人気組み合わせのワイドデータ');
                return;
            }

            // 複数結果の場合はテーブル表示
            if (results.length > 1) {
                this.displayMultipleResults(resultDiv, results, 'ワイド');
            } else {
                this.displayResult(resultDiv, {
                    ...results[0],
                    description: results[0].pattern + 'のワイド'
                });
            }
        } catch (error) {
            this.showCalculationError(resultDiv, error, 'ワイド計算');
        }
    }

    performSanrenpukuCalculation(pop1, pop2, pop3, resultDiv) {
        if (!pop1 || !pop2 || !pop3) {
            Utils.showError('すべての人気を入力してください（カンマ区切りで複数指定可）');
            return;
        }

        if (!this.filteredRaces || this.filteredRaces.length === 0) {
            this.showNoDataError(resultDiv);
            return;
        }

        try {
            const pops1 = this.parsePopularities(pop1);
            const pops2 = this.parsePopularities(pop2);
            const pops3 = this.parsePopularities(pop3);
            
            if (pops1.length === 0 || pops2.length === 0 || pops3.length === 0) {
                Utils.showError('有効な人気を入力してください（1-16の数字）');
                return;
            }

            const statistics = new Statistics(this.filteredRaces);
            const sanrenpukuData = statistics.calculateSanrenpukuStats();
            const allStats = sanrenpukuData.patterns;
            
            // 全ての組み合わせを生成（3連複は順不同）
            const combinations = this.generateTripleCombinations(pops1, pops2, pops3);
            
            // 組み合わせ数の警告
            if (combinations.length > 100) {
                const confirmed = confirm(`組み合わせ数が多すぎます（${combinations.length}パターン）。計算に時間がかかる可能性があります。続行しますか？`);
                if (!confirmed) {
                    return;
                }
            }
            
            const results = combinations.map(combo => {
                const pattern = combo.join('-');
                const stat = allStats.find(s => s.pattern === pattern);
                
                if (stat) {
                    return {
                        pattern: `${pattern}番人気`,
                        expectedValue: stat.expectedValue,
                        winRate: stat.percentage,
                        averagePayout: stat.averagePayout,
                        total: stat.count,
                        payoutCount: stat.payoutCount || 0,
                        minPayout: stat.minPayout || 0,
                        maxPayout: stat.maxPayout || 0
                    };
                }
                return null;
            }).filter(r => r !== null);

            if (results.length === 0) {
                this.showNoResultError(resultDiv, '指定された人気組み合わせの3連複データ');
                return;
            }

            // 複数結果の場合はテーブル表示
            if (results.length > 1) {
                this.displayMultipleResults(resultDiv, results, '3連複');
            } else {
                this.displayResult(resultDiv, {
                    ...results[0],
                    description: results[0].pattern + 'の3連複'
                });
            }
        } catch (error) {
            this.showCalculationError(resultDiv, error, '3連複計算');
        }
    }

    performSanrentanCalculation(pop1, pop2, pop3, resultDiv) {
        if (!pop1 || !pop2 || !pop3) {
            Utils.showError('すべての人気を入力してください（カンマ区切りで複数指定可）');
            return;
        }

        if (!this.filteredRaces || this.filteredRaces.length === 0) {
            this.showNoDataError(resultDiv);
            return;
        }

        try {
            const pops1 = this.parsePopularities(pop1);
            const pops2 = this.parsePopularities(pop2);
            const pops3 = this.parsePopularities(pop3);
            
            if (pops1.length === 0 || pops2.length === 0 || pops3.length === 0) {
                Utils.showError('有効な人気を入力してください（1-16の数字）');
                return;
            }

            const statistics = new Statistics(this.filteredRaces);
            const sanrentanData = statistics.calculateSanrentanStats();
            const allStats = sanrentanData.patterns;
            
            // 全ての順列を生成（3連単は順序重要）
            const permutations = this.generateTriplePermutations(pops1, pops2, pops3);
            
            // 組み合わせ数の警告
            if (permutations.length > 100) {
                const confirmed = confirm(`順列数が多すぎます（${permutations.length}パターン）。計算に時間がかかる可能性があります。続行しますか？`);
                if (!confirmed) {
                    return;
                }
            }
            
            const results = permutations.map(perm => {
                const pattern = perm.join('-');
                const stat = allStats.find(s => s.pattern === pattern);
                
                if (stat) {
                    return {
                        pattern: `${perm[0]}→${perm[1]}→${perm[2]}番人気`,
                        expectedValue: stat.expectedValue,
                        winRate: stat.percentage,
                        averagePayout: stat.averagePayout,
                        total: stat.count,
                        payoutCount: stat.payoutCount || 0,
                        minPayout: stat.minPayout || 0,
                        maxPayout: stat.maxPayout || 0
                    };
                }
                return null;
            }).filter(r => r !== null);

            if (results.length === 0) {
                this.showNoResultError(resultDiv, '指定された人気組み合わせの3連単データ');
                return;
            }

            // 複数結果の場合はテーブル表示
            if (results.length > 1) {
                this.displayMultipleResults(resultDiv, results, '3連単');
            } else {
                this.displayResult(resultDiv, {
                    ...results[0],
                    description: results[0].pattern + 'の3連単'
                });
            }
        } catch (error) {
            this.showCalculationError(resultDiv, error, '3連単計算');
        }
    }

    displayMultipleResults(resultDiv, results, ticketType) {
        // 期待値順にソート
        results.sort((a, b) => b.expectedValue - a.expectedValue);
        
        let html = `
            <div class="multiple-results">
                <h4>${ticketType}期待値一覧（${results.length}パターン）</h4>
                <table class="results-table">
                    <thead>
                        <tr>
                            <th>パターン</th>
                            <th>期待値</th>
                            <th>的中率</th>
                            <th>平均配当</th>
                            <th>データ数</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        results.forEach(result => {
            const isPositive = result.expectedValue > 100;
            const rowClass = isPositive ? 'positive-row' : '';
            const payoutInfo = result.payoutCount > 0 ? 
                `${result.payoutCount}件` : 
                '<span class="text-warning">なし</span>';
            
            html += `
                <tr class="${rowClass}">
                    <td><strong>${result.pattern}</strong></td>
                    <td class="${isPositive ? 'positive' : 'negative'}">
                        <strong>${result.expectedValue.toFixed(1)}%</strong>
                    </td>
                    <td>${result.winRate.toFixed(1)}%</td>
                    <td>${result.averagePayout.toFixed(0)}円</td>
                    <td>${payoutInfo}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
        resultDiv.innerHTML = html;
        resultDiv.classList.add('show');
    }

    displayResult(resultDiv, data) {
        const { expectedValue, winRate, averagePayout, total, description, payoutCount, minPayout, maxPayout } = data;
        const isPositive = expectedValue > 100;
        
        const payoutInfo = payoutCount > 0 ? `
            <br>配当データ: ${payoutCount}件 (${minPayout}円～${maxPayout}円)
        ` : '<br><span class="text-warning">配当データなし（理論値使用）</span>';
        
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
                100円投資で平均${expectedValue.toFixed(1)}円のリターン${payoutInfo}
            </div>
        `;
        resultDiv.classList.add('show');
    }

    showNoDataError(resultDiv) {
        resultDiv.innerHTML = `
            <div class="result-summary">
                <div class="result-item">
                    <div class="result-label">エラー</div>
                    <div class="result-value negative">データなし</div>
                </div>
            </div>
            <div class="result-details">
                分析対象のデータがありません。データを追加してから再度お試しください。
            </div>
        `;
        resultDiv.classList.add('show');
    }

    showNoResultError(resultDiv, dataType) {
        resultDiv.innerHTML = `
            <div class="result-summary">
                <div class="result-item">
                    <div class="result-label">該当データ</div>
                    <div class="result-value">0件</div>
                </div>
            </div>
            <div class="result-details">
                ${dataType}が見つかりませんでした
            </div>
        `;
        resultDiv.classList.add('show');
    }

    showCalculationError(resultDiv, error, calculationType) {
        console.error(`${calculationType}エラー:`, error);
        resultDiv.innerHTML = `
            <div class="result-summary">
                <div class="result-item">
                    <div class="result-label">エラー</div>
                    <div class="result-value negative">計算失敗</div>
                </div>
            </div>
            <div class="result-details">
                計算中にエラーが発生しました: ${error.message}
            </div>
        `;
        resultDiv.classList.add('show');
    }
}

// Node.js環境用のエクスポート
if (typeof module !== "undefined" && module.exports) {
    module.exports = Calculator;
}
