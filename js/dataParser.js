// データ解析クラス
class DataParser {
    constructor() {
        this.popularityMap = CONFIG.popularityMap;
    }

    parseRaceData(rawData, racetrack, date, horseCounts = {}) {
        const lines = rawData.split('\n');
        const races = [];
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const parts = line.split('\t');
            // 最低限必要なカラム数をチェック（R, レース名, 条件, 馬場・天候）
            if (parts.length < 4) continue;
            
            const raceCondition = parts[2];
            const trackWeather = parts[3];
            
            const race = {
                racetrack: racetrack,
                date: date,
                number: parts[0],
                name: parts[1],
                condition: raceCondition,
                trackWeather: trackWeather,
                trackType: Utils.extractTrackType(raceCondition),
                distance: Utils.extractDistance(raceCondition),
                trackCondition: Utils.extractTrackCondition(trackWeather),
                weather: Utils.extractWeather(trackWeather),
                horseCount: horseCounts[parts[0]] || null,
                results: []
            };

            // 1着、2着、3着の情報を解析（同着対応）
            for (let pos = 1; pos <= 3; pos++) {
                const horseNumIndex = 4 + (pos - 1) * 2;
                const horseInfoIndex = 5 + (pos - 1) * 2;
                
                if (horseNumIndex < parts.length && horseInfoIndex < parts.length) {
                    const horseNumStr = parts[horseNumIndex];
                    const horseInfoStr = parts[horseInfoIndex];
                    
                    // 中黒（・）で分割して同着を検出
                    const horseNums = horseNumStr.split('・').map(s => s.trim()).filter(s => s);
                    const horseInfos = horseInfoStr.split('・').map(s => s.trim()).filter(s => s);
                    
                    // 同着の場合、複数の馬を同じ着順で登録
                    for (let j = 0; j < Math.max(horseNums.length, horseInfos.length); j++) {
                        const horseNum = horseNums[j] || horseNums[0];
                        const horseInfo = horseInfos[j] || horseInfos[0];
                        
                        if (horseNum && horseInfo) {
                            const { name: horseName, popularity } = this.parseHorseInfo(horseInfo);
                            
                            race.results.push({
                                position: pos,
                                number: parseInt(horseNum),
                                name: horseName,
                                popularity: popularity,
                                isTied: horseNums.length > 1 // 同着フラグ
                            });
                        }
                    }
                }
            }
            
            races.push(race);
        }
        
        return races;
    }

    parseHorseInfo(horseInfo) {
        const popularitySymbols = Object.keys(this.popularityMap);
        let popularity = null;
        let name = horseInfo;
        
        for (const symbol of popularitySymbols) {
            if (horseInfo.endsWith(symbol)) {
                popularity = this.popularityMap[symbol];
                name = horseInfo.slice(0, -1);
                break;
            }
        }
        
        return { name, popularity };
    }

    parseHorseCountData(horseCountData) {
        const horseCounts = {};
        let detectedRacetrack = null;
        
        if (!horseCountData) return { horseCounts, detectedRacetrack };
        
        const lines = horseCountData.split('\n');
        let currentRacetrack = null;
        let raceNumber = 0;
        
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (!trimmedLine) return;
            
            // 競馬場情報を検出
            const racetrackMatch = trimmedLine.match(/\d+回(東京|京都|中山|阪神|中京|新潟|札幌|函館|福島|小倉)\d+日目/);
            if (racetrackMatch) {
                currentRacetrack = racetrackMatch[1];
                detectedRacetrack = currentRacetrack;
                raceNumber = 0;
                return;
            }
            
            // レース番号を検出
            const raceNumberMatch = trimmedLine.match(/^(\d+)R$/);
            if (raceNumberMatch) {
                raceNumber = parseInt(raceNumberMatch[1]);
                return;
            }
            
            // 頭立て数を検出
            const horseCountMatch = trimmedLine.match(/(\d+)頭/);
            if (horseCountMatch && raceNumber > 0) {
                const horseCount = parseInt(horseCountMatch[1]);
                const raceKey = `${raceNumber}R`;
                horseCounts[raceKey] = horseCount;
                return;
            }
            
            // シンプルな形式も対応
            const simpleMatch = trimmedLine.match(/(\d+R).*?(\d+)頭/);
            if (simpleMatch) {
                const raceKey = simpleMatch[1];
                const horseCount = parseInt(simpleMatch[2]);
                horseCounts[raceKey] = horseCount;
                return;
            }
        });
        
        return { horseCounts, detectedRacetrack };
    }

    parsePayoutData(payoutText, races) {
        if (!payoutText || !payoutText.trim()) {
            console.log('📋 払い戻しデータなし');
            return races;
        }

        console.log('💰 払い戻しデータ解析開始');
        const lines = payoutText.split('\n').map(line => line.trim()).filter(line => line);
        
        let currentRaceNumber = null;
        let currentTicketType = null;
        let lineIndex = 0;
        
        while (lineIndex < lines.length) {
            const line = lines[lineIndex];
            
            // レース番号を検出（例: "1R", "2R"）
            const raceMatch = line.match(/^(\d+)R$/);
            if (raceMatch) {
                currentRaceNumber = parseInt(raceMatch[1]);
                console.log(`📍 レース ${currentRaceNumber}R 検出`);
                lineIndex++;
                continue;
            }
            
            // 券種を検出
            if (line === '単勝') {
                currentTicketType = 'tansho';
                lineIndex = this.parseTansho(lines, lineIndex + 1, currentRaceNumber, races);
            } else if (line === '複勝') {
                currentTicketType = 'fukusho';
                lineIndex = this.parseFukusho(lines, lineIndex + 1, currentRaceNumber, races);
            } else if (line === '馬連') {
                currentTicketType = 'umaren';
                lineIndex = this.parseUmaren(lines, lineIndex + 1, currentRaceNumber, races);
            } else if (line === '馬単') {
                currentTicketType = 'umatan';
                lineIndex = this.parseUmatan(lines, lineIndex + 1, currentRaceNumber, races);
            } else if (line === 'ワイド') {
                currentTicketType = 'wide';
                lineIndex = this.parseWide(lines, lineIndex + 1, currentRaceNumber, races);
            } else if (line === '3連複') {
                currentTicketType = 'sanrenpuku';
                lineIndex = this.parseSanrenpuku(lines, lineIndex + 1, currentRaceNumber, races);
            } else if (line === '3連単') {
                currentTicketType = 'sanrentan';
                lineIndex = this.parseSanrentan(lines, lineIndex + 1, currentRaceNumber, races);
            } else {
                lineIndex++;
            }
        }
        
        console.log('✅ 払い戻しデータ解析完了');
        return races;
    }

    parseTansho(lines, startIndex, raceNumber, races) {
        const race = this.findRace(races, raceNumber);
        if (!race) return startIndex + 3;
        
        if (!race.payouts) race.payouts = {};
        
        try {
            const horseNumber = parseInt(lines[startIndex]);
            const payout = this.parsePayoutAmount(lines[startIndex + 1]);
            const popularityText = lines[startIndex + 2];
            const popularity = this.parsePopularity(popularityText);
            
            race.payouts.tansho = {
                horseNumber,
                popularity,
                payout
            };
            
            console.log(`  単勝: ${horseNumber}番 ${payout}円 (${popularity}人気)`);
        } catch (error) {
            console.warn('単勝データ解析エラー:', error);
        }
        
        return startIndex + 3;
    }

    parseFukusho(lines, startIndex, raceNumber, races) {
        const race = this.findRace(races, raceNumber);
        if (!race) return this.skipToNextTicket(lines, startIndex);
        
        if (!race.payouts) race.payouts = {};
        race.payouts.fukusho = [];
        
        try {
            // 同着対応：複勝は3頭以上の場合がある
            let index = startIndex;
            const horseNumbers = [];
            const payouts = [];
            const popularities = [];
            
            // 馬番を収集（次の券種または数字以外が来るまで）
            while (index < lines.length && /^\d+$/.test(lines[index])) {
                horseNumbers.push(parseInt(lines[index]));
                index++;
            }
            
            // 払い戻し金額を収集
            for (let i = 0; i < horseNumbers.length && index < lines.length; i++) {
                if (/^\d+[,円]/.test(lines[index]) || /^\d+$/.test(lines[index])) {
                    payouts.push(this.parsePayoutAmount(lines[index]));
                    index++;
                } else {
                    break;
                }
            }
            
            // 人気を収集
            for (let i = 0; i < horseNumbers.length && index < lines.length; i++) {
                if (/\d+人気/.test(lines[index])) {
                    popularities.push(this.parsePopularity(lines[index]));
                    index++;
                } else {
                    break;
                }
            }
            
            // データを格納
            for (let i = 0; i < horseNumbers.length; i++) {
                race.payouts.fukusho.push({
                    horseNumber: horseNumbers[i],
                    popularity: popularities[i] || null,
                    payout: payouts[i] || 0
                });
            }
            
            console.log(`  複勝: ${horseNumbers.join(',')}番 (${horseNumbers.length}頭)`);
            return index;
            
        } catch (error) {
            console.warn('複勝データ解析エラー:', error);
            return this.skipToNextTicket(lines, startIndex);
        }
    }

    parseUmaren(lines, startIndex, raceNumber, races) {
        const race = this.findRace(races, raceNumber);
        if (!race) return this.skipToNextTicket(lines, startIndex);
        
        if (!race.payouts) race.payouts = {};
        race.payouts.umaren = [];
        
        let index = startIndex;
        
        try {
            // まず組み合わせを全て収集
            const combinations = [];
            while (index < lines.length) {
                const line = lines[index];
                
                if (this.isTicketType(line) || /^\d+R$/.test(line)) {
                    break;
                }
                
                const comboMatch = line.match(/^(\d+)[\s-]+(\d+)$/);
                if (comboMatch) {
                    combinations.push([parseInt(comboMatch[1]), parseInt(comboMatch[2])]);
                    index++;
                } else {
                    break;
                }
            }
            
            // 払い戻し金額を収集
            const payouts = [];
            for (let i = 0; i < combinations.length && index < lines.length; i++) {
                if (/^\d+[,円]/.test(lines[index]) || /^\d+$/.test(lines[index])) {
                    payouts.push(this.parsePayoutAmount(lines[index]));
                    index++;
                } else {
                    break;
                }
            }
            
            // 人気を収集（オプション）
            const popularities = [];
            for (let i = 0; i < combinations.length && index < lines.length; i++) {
                if (/\d+人気/.test(lines[index])) {
                    popularities.push(this.parsePopularity(lines[index]));
                    index++;
                } else {
                    break;
                }
            }
            
            // データを格納
            for (let i = 0; i < combinations.length; i++) {
                const horseNumbers = combinations[i];
                const payout = payouts[i] || 0;
                
                // 人気パターンをレース結果から取得
                const popularityPattern = this.getPopularityPatternFromRace(race, horseNumbers, true);
                
                race.payouts.umaren.push({
                    combination: horseNumbers,
                    popularityPattern,
                    payout
                });
                
                console.log(`  馬連: ${horseNumbers.join('-')} ${payout}円 (${popularityPattern})`);
            }
        } catch (error) {
            console.warn('馬連データ解析エラー:', error);
        }
        
        return index;
    }

    parseUmatan(lines, startIndex, raceNumber, races) {
        const race = this.findRace(races, raceNumber);
        if (!race) return this.skipToNextTicket(lines, startIndex);
        
        if (!race.payouts) race.payouts = {};
        race.payouts.umatan = [];
        
        let index = startIndex;
        
        try {
            // まず組み合わせを全て収集
            const combinations = [];
            while (index < lines.length) {
                const line = lines[index];
                
                if (this.isTicketType(line) || /^\d+R$/.test(line)) {
                    break;
                }
                
                const comboMatch = line.match(/^(\d+)[\s-]+(\d+)$/);
                if (comboMatch) {
                    combinations.push([parseInt(comboMatch[1]), parseInt(comboMatch[2])]);
                    index++;
                } else {
                    break;
                }
            }
            
            // 払い戻し金額を収集
            const payouts = [];
            for (let i = 0; i < combinations.length && index < lines.length; i++) {
                if (/^\d+[,円]/.test(lines[index]) || /^\d+$/.test(lines[index])) {
                    payouts.push(this.parsePayoutAmount(lines[index]));
                    index++;
                } else {
                    break;
                }
            }
            
            // 人気を収集（オプション）
            const popularities = [];
            for (let i = 0; i < combinations.length && index < lines.length; i++) {
                if (/\d+人気/.test(lines[index])) {
                    popularities.push(this.parsePopularity(lines[index]));
                    index++;
                } else {
                    break;
                }
            }
            
            // データを格納
            for (let i = 0; i < combinations.length; i++) {
                const horseNumbers = combinations[i];
                const payout = payouts[i] || 0;
                
                // 人気パターンをレース結果から取得（馬単は順序重要なのでソートしない）
                const popularityPattern = this.getPopularityPatternFromRace(race, horseNumbers, false);
                
                race.payouts.umatan.push({
                    combination: horseNumbers,
                    popularityPattern,
                    payout
                });
                
                console.log(`  馬単: ${horseNumbers.join('→')} ${payout}円 (${popularityPattern})`);
            }
        } catch (error) {
            console.warn('馬単データ解析エラー:', error);
        }
        
        return index;
    }

    parseWide(lines, startIndex, raceNumber, races) {
        const race = this.findRace(races, raceNumber);
        if (!race) return this.skipToNextTicket(lines, startIndex);
        
        if (!race.payouts) race.payouts = {};
        race.payouts.wide = [];
        
        let index = startIndex;
        
        try {
            // まず組み合わせを全て収集
            const combinations = [];
            while (index < lines.length) {
                const line = lines[index];
                
                if (this.isTicketType(line) || /^\d+R$/.test(line)) {
                    break;
                }
                
                const comboMatch = line.match(/^(\d+)[\s-]+(\d+)$/);
                if (comboMatch) {
                    combinations.push([parseInt(comboMatch[1]), parseInt(comboMatch[2])]);
                    index++;
                } else {
                    break;
                }
            }
            
            // 払い戻し金額を収集
            const payouts = [];
            for (let i = 0; i < combinations.length && index < lines.length; i++) {
                if (/^\d+[,円]/.test(lines[index]) || /^\d+$/.test(lines[index])) {
                    payouts.push(this.parsePayoutAmount(lines[index]));
                    index++;
                } else {
                    break;
                }
            }
            
            // 人気を収集（オプション）
            const popularities = [];
            for (let i = 0; i < combinations.length && index < lines.length; i++) {
                if (/\d+人気/.test(lines[index])) {
                    popularities.push(this.parsePopularity(lines[index]));
                    index++;
                } else {
                    break;
                }
            }
            
            // データを格納
            for (let i = 0; i < combinations.length; i++) {
                const horseNumbers = combinations[i];
                const payout = payouts[i] || 0;
                
                // 人気パターンをレース結果から取得（ワイドはソート）
                const popularityPattern = this.getPopularityPatternFromRace(race, horseNumbers, true);
                
                race.payouts.wide.push({
                    combination: horseNumbers,
                    popularityPattern,
                    payout
                });
                
                console.log(`  ワイド: ${horseNumbers.join('-')} ${payout}円 (${popularityPattern})`);
            }
        } catch (error) {
            console.warn('ワイドデータ解析エラー:', error);
        }
        
        return index;
    }

    parseSanrenpuku(lines, startIndex, raceNumber, races) {
        const race = this.findRace(races, raceNumber);
        if (!race) return this.skipToNextTicket(lines, startIndex);
        
        if (!race.payouts) race.payouts = {};
        race.payouts.sanrenpuku = [];
        
        let index = startIndex;
        
        try {
            // まず組み合わせを全て収集
            const combinations = [];
            while (index < lines.length) {
                const line = lines[index];
                
                if (this.isTicketType(line) || /^\d+R$/.test(line)) {
                    break;
                }
                
                const comboMatch = line.match(/^(\d+)[\s-]+(\d+)[\s-]+(\d+)$/);
                if (comboMatch) {
                    combinations.push([parseInt(comboMatch[1]), parseInt(comboMatch[2]), parseInt(comboMatch[3])]);
                    index++;
                } else {
                    break;
                }
            }
            
            // 払い戻し金額を収集
            const payouts = [];
            for (let i = 0; i < combinations.length && index < lines.length; i++) {
                if (/^\d+[,円]/.test(lines[index]) || /^\d+$/.test(lines[index])) {
                    payouts.push(this.parsePayoutAmount(lines[index]));
                    index++;
                } else {
                    break;
                }
            }
            
            // 人気を収集（オプション）
            const popularities = [];
            for (let i = 0; i < combinations.length && index < lines.length; i++) {
                if (/\d+人気/.test(lines[index])) {
                    popularities.push(this.parsePopularity(lines[index]));
                    index++;
                } else {
                    break;
                }
            }
            
            // データを格納
            for (let i = 0; i < combinations.length; i++) {
                const horseNumbers = combinations[i];
                const payout = payouts[i] || 0;
                
                // 人気パターンをレース結果から取得（3連複はソート）
                const popularityPattern = this.getPopularityPatternFromRace(race, horseNumbers, true);
                
                race.payouts.sanrenpuku.push({
                    combination: horseNumbers,
                    popularityPattern,
                    payout
                });
                
                console.log(`  3連複: ${horseNumbers.join('-')} ${payout}円 (${popularityPattern})`);
            }
        } catch (error) {
            console.warn('3連複データ解析エラー:', error);
        }
        
        return index;
    }

    parseSanrentan(lines, startIndex, raceNumber, races) {
        const race = this.findRace(races, raceNumber);
        if (!race) return this.skipToNextTicket(lines, startIndex);
        
        if (!race.payouts) race.payouts = {};
        race.payouts.sanrentan = [];
        
        let index = startIndex;
        
        try {
            // まず組み合わせを全て収集
            const combinations = [];
            while (index < lines.length) {
                const line = lines[index];
                
                if (this.isTicketType(line) || /^\d+R$/.test(line)) {
                    break;
                }
                
                const comboMatch = line.match(/^(\d+)[\s-]+(\d+)[\s-]+(\d+)$/);
                if (comboMatch) {
                    combinations.push([parseInt(comboMatch[1]), parseInt(comboMatch[2]), parseInt(comboMatch[3])]);
                    index++;
                } else {
                    break;
                }
            }
            
            // 払い戻し金額を収集
            const payouts = [];
            for (let i = 0; i < combinations.length && index < lines.length; i++) {
                if (/^\d+[,円]/.test(lines[index]) || /^\d+$/.test(lines[index])) {
                    payouts.push(this.parsePayoutAmount(lines[index]));
                    index++;
                } else {
                    break;
                }
            }
            
            // 人気を収集（オプション）
            const popularities = [];
            for (let i = 0; i < combinations.length && index < lines.length; i++) {
                if (/\d+人気/.test(lines[index])) {
                    popularities.push(this.parsePopularity(lines[index]));
                    index++;
                } else {
                    break;
                }
            }
            
            // データを格納
            for (let i = 0; i < combinations.length; i++) {
                const horseNumbers = combinations[i];
                const payout = payouts[i] || 0;
                
                // 人気パターンをレース結果から取得（3連単は順序重要なのでソートしない）
                const popularityPattern = this.getPopularityPatternFromRace(race, horseNumbers, false);
                
                race.payouts.sanrentan.push({
                    combination: horseNumbers,
                    popularityPattern,
                    payout
                });
                
                console.log(`  3連単: ${horseNumbers.join('→')} ${payout}円 (${popularityPattern})`);
            }
        } catch (error) {
            console.warn('3連単データ解析エラー:', error);
        }
        
        return index;
    }

    // ヘルパーメソッド
    findRace(races, raceNumber) {
        return races.find(race => parseInt(race.number.replace('R', '')) === raceNumber);
    }

    getPopularityPatternFromRace(race, horseNumbers, sorted = false) {
        if (!race || !race.results) return null;
        
        const popularities = horseNumbers.map(horseNum => {
            const result = race.results.find(r => r.number === horseNum);
            return result ? result.popularity : null;
        }).filter(p => p !== null);
        
        if (popularities.length !== horseNumbers.length) {
            return null; // 全ての馬の人気が見つからない場合
        }
        
        if (sorted) {
            popularities.sort((a, b) => a - b);
        }
        
        return popularities.join('-');
    }

    parsePayoutAmount(text) {
        if (!text) return 0;
        // "710円" → 710, "1,520円" → 1520
        return parseInt(text.replace(/[,円]/g, ''));
    }

    parsePopularity(text) {
        if (!text) return null;
        // "3人気" → 3
        const match = text.match(/(\d+)人気/);
        return match ? parseInt(match[1]) : null;
    }

    parsePopularityPattern(text) {
        if (!text) return null;
        // "2-3人気" → "2-3", "28人気" → "28"
        const match = text.match(/([\d-]+)人気/);
        return match ? match[1] : null;
    }

    isTicketType(line) {
        return ['単勝', '複勝', '枠連', '馬連', '馬単', 'ワイド', '3連複', '3連単'].includes(line);
    }

    skipToNextTicket(lines, startIndex) {
        for (let i = startIndex; i < lines.length; i++) {
            if (this.isTicketType(lines[i]) || /^\d+R$/.test(lines[i])) {
                return i;
            }
        }
        return lines.length;
    }
}