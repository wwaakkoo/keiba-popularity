// データ解析クラス
class DataParser {
    constructor() {
        this.popularityMap = CONFIG.popularityMap;
    }

    parseRaceData(rawData, racetrack, date, horseCounts = {}) {
        // 入力データの検証
        if (!rawData || typeof rawData !== 'string') {
            throw new Error('レースデータが空または無効です。テキストデータを入力してください。');
        }

        if (!racetrack || !date) {
            throw new Error('競馬場と日付を選択してください。');
        }

        // 日付の妥当性検証
        this.validateDate(date);

        const lines = rawData.split('\n');
        const races = [];
        const errors = [];

        // データ行が存在するかチェック
        if (lines.length < 2) {
            throw new Error('レースデータが不足しています。ヘッダー行とデータ行を含むタブ区切りテキストを入力してください。');
        }

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const parts = line.split('\t');
            // 最低限必要なカラム数をチェック（R, レース名, 条件, 馬場・天候）
            if (parts.length < 4) {
                errors.push(`${i+1}行目: 必要なカラムが不足しています（最低4カラム必要）`);
                continue;
            }
            
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
            try {
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

                                // 馬番と人気の妥当性チェック
                                const horseNumber = parseInt(horseNum);
                                if (isNaN(horseNumber) || horseNumber < 1 || horseNumber > 18) {
                                    errors.push(`${i+1}行目 ${pos}着: 馬番が不正です（${horseNum}）`);
                                    continue;
                                }

                                if (popularity !== null && (popularity < 1 || popularity > 18)) {
                                    errors.push(`${i+1}行目 ${pos}着: 人気が不正です（${popularity}）`);
                                }

                                race.results.push({
                                    position: pos,
                                    number: horseNumber,
                                    name: horseName,
                                    popularity: popularity,
                                    isTied: horseNums.length > 1 // 同着フラグ
                                });
                            }
                        }
                    }
                }

                // レース結果が1件もない場合は警告
                if (race.results.length === 0) {
                    errors.push(`${i+1}行目: レース結果が解析できませんでした（${race.number} ${race.name}）`);
                }

                races.push(race);
            } catch (error) {
                errors.push(`${i+1}行目: データ解析中にエラーが発生しました - ${error.message}`);
            }
        }

        // パース結果の検証
        if (races.length === 0) {
            const errorMsg = errors.length > 0
                ? `レースデータを解析できませんでした。\n\n【エラー詳細】\n${errors.join('\n')}`
                : 'レースデータを解析できませんでした。データ形式を確認してください。';
            throw new Error(errorMsg);
        }

        // 警告がある場合はコンソールに表示
        if (errors.length > 0) {
            console.warn('【データ解析の警告】\n' + errors.join('\n'));
        }

        // データバリデーション
        this.validateRaces(races, errors);

        return races;
    }

    validateDate(dateStr) {
        const inputDate = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 日付の形式チェック
        if (isNaN(inputDate.getTime())) {
            throw new Error(`日付の形式が不正です: ${dateStr}`);
        }

        // 未来日チェック（警告のみ）
        if (inputDate > today) {
            const daysAhead = Math.ceil((inputDate - today) / (1000 * 60 * 60 * 24));
            console.warn(`⚠️ 選択された日付は未来日です（${daysAhead}日後）`);
        }

        // 過去すぎる日付チェック（JRAは1954年から）
        const jraStartYear = 1954;
        if (inputDate.getFullYear() < jraStartYear) {
            throw new Error(`日付が古すぎます。JRAの開催は${jraStartYear}年以降です。`);
        }

        // 1年以上前のデータの警告
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        if (inputDate < oneYearAgo) {
            const yearsAgo = today.getFullYear() - inputDate.getFullYear();
            console.warn(`⚠️ 選択された日付は${yearsAgo}年以上前のデータです`);
        }
    }

    validateRaces(races, errors) {
        // 1. レース番号の重複チェック
        const raceNumbers = races.map(r => r.number);
        const duplicates = raceNumbers.filter((num, index) => raceNumbers.indexOf(num) !== index);
        if (duplicates.length > 0) {
            errors.push(`⚠️ 重複したレース番号があります: ${[...new Set(duplicates)].join(', ')}`);
        }

        // 2. 各レースの結果の整合性チェック
        races.forEach((race, index) => {
            // 2-1. 馬番の重複チェック（同じレース内）
            const horseNumbers = race.results.map(r => r.number);
            const dupHorses = horseNumbers.filter((num, idx) => horseNumbers.indexOf(num) !== idx);
            if (dupHorses.length > 0) {
                errors.push(`⚠️ ${race.number} ${race.name}: 同じ馬番が複数回登場しています（${[...new Set(dupHorses)].join(', ')}番）`);
            }

            // 2-2. 人気の重複チェック（通常は重複しないはず）
            const popularities = race.results.map(r => r.popularity).filter(p => p !== null);
            const dupPops = popularities.filter((pop, idx) => popularities.indexOf(pop) !== idx);
            if (dupPops.length > 0) {
                errors.push(`⚠️ ${race.number} ${race.name}: 同じ人気が複数回登場しています（${[...new Set(dupPops)].join(', ')}人気） - 同着の可能性があります`);
            }

            // 2-3. 着順の連続性チェック（1着、2着、3着が揃っているか）
            const positions = race.results.map(r => r.position);
            if (!positions.includes(1)) {
                errors.push(`⚠️ ${race.number} ${race.name}: 1着のデータがありません`);
            }
            if (!positions.includes(2)) {
                errors.push(`⚠️ ${race.number} ${race.name}: 2着のデータがありません`);
            }
            if (!positions.includes(3)) {
                errors.push(`⚠️ ${race.number} ${race.name}: 3着のデータがありません`);
            }

            // 2-4. 人気が null のデータがある場合の警告
            const nullPopularities = race.results.filter(r => r.popularity === null);
            if (nullPopularities.length > 0) {
                errors.push(`⚠️ ${race.number} ${race.name}: 人気データがない馬が ${nullPopularities.length} 頭います`);
            }

            // 2-5. 馬番と頭立て数の整合性チェック
            if (race.horseCount) {
                const maxHorseNumber = Math.max(...horseNumbers);
                if (maxHorseNumber > race.horseCount) {
                    errors.push(`⚠️ ${race.number} ${race.name}: 馬番（${maxHorseNumber}番）が頭立て数（${race.horseCount}頭）を超えています`);
                }
            }

            // 2-6. 人気と頭立て数の整合性チェック
            if (race.horseCount) {
                const maxPopularity = Math.max(...popularities.filter(p => p !== null));
                if (maxPopularity > race.horseCount) {
                    errors.push(`⚠️ ${race.number} ${race.name}: 人気（${maxPopularity}人気）が頭立て数（${race.horseCount}頭）を超えています`);
                }
            }
        });

        // 警告がある場合は再度コンソールに表示
        if (errors.length > 0) {
            console.warn('【データバリデーション警告】\n' + errors.join('\n'));
        }
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

            // 出走馬情報を検出（コメント行）
            if (line.startsWith('# 出走馬:')) {
                const race = this.findRace(races, currentRaceNumber);
                if (race) {
                    const runnersText = line.replace('# 出走馬:', '').trim();
                    const runners = runnersText.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
                    race.runners = runners;
                    console.log(`  🏃 出走馬情報: ${runners.join(',')} (${runners.length}頭)`);
                }
                lineIndex++;
                continue;
            }

            // 取消馬情報を検出（コメント行）
            if (line.startsWith('# 取消馬:')) {
                const race = this.findRace(races, currentRaceNumber);
                if (race) {
                    const canceledText = line.replace('# 取消馬:', '').trim();
                    const canceled = canceledText.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
                    race.canceledHorses = canceled;
                    console.log(`  🚫 取消馬情報: ${canceled.join(',')}`);
                }
                lineIndex++;
                continue;
            }

            // 登録頭数情報を検出（コメント行）
            if (line.startsWith('# 登録頭数:')) {
                const race = this.findRace(races, currentRaceNumber);
                if (race) {
                    const countText = line.replace('# 登録頭数:', '').trim();
                    const count = parseInt(countText);
                    if (!isNaN(count)) {
                        race.horseCount = count;
                        console.log(`  📊 登録頭数: ${count}頭`);
                    }
                }
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
                const ticketPopularity = popularities[i] || null;

                // 人気パターンをレース結果から取得
                const popularityPattern = this.getPopularityPatternFromRace(race, horseNumbers, true);

                race.payouts.umaren.push({
                    combination: horseNumbers,
                    popularityPattern,
                    ticketPopularity,
                    payout
                });

                console.log(`  馬連: ${horseNumbers.join('-')} ${payout}円 (馬:${popularityPattern}, 券:${ticketPopularity}人気)`);
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
                const ticketPopularity = popularities[i] || null;

                // 人気パターンをレース結果から取得（馬単は順序重要なのでソートしない）
                const popularityPattern = this.getPopularityPatternFromRace(race, horseNumbers, false);

                race.payouts.umatan.push({
                    combination: horseNumbers,
                    popularityPattern,
                    ticketPopularity,
                    payout
                });

                console.log(`  馬単: ${horseNumbers.join('→')} ${payout}円 (馬:${popularityPattern}, 券:${ticketPopularity}人気)`);
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
                const ticketPopularity = popularities[i] || null;

                // 人気パターンをレース結果から取得（ワイドはソート）
                const popularityPattern = this.getPopularityPatternFromRace(race, horseNumbers, true);

                race.payouts.wide.push({
                    combination: horseNumbers,
                    popularityPattern,
                    ticketPopularity,
                    payout
                });

                console.log(`  ワイド: ${horseNumbers.join('-')} ${payout}円 (馬:${popularityPattern}, 券:${ticketPopularity}人気)`);
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
                const ticketPopularity = popularities[i] || null;

                // 人気パターンをレース結果から取得（3連複はソート）
                const popularityPattern = this.getPopularityPatternFromRace(race, horseNumbers, true);

                race.payouts.sanrenpuku.push({
                    combination: horseNumbers,
                    popularityPattern,
                    ticketPopularity,
                    payout
                });

                console.log(`  3連複: ${horseNumbers.join('-')} ${payout}円 (馬:${popularityPattern}, 券:${ticketPopularity}人気)`);
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
                const ticketPopularity = popularities[i] || null;

                // 人気パターンをレース結果から取得（3連単は順序重要なのでソートしない）
                const popularityPattern = this.getPopularityPatternFromRace(race, horseNumbers, false);

                race.payouts.sanrentan.push({
                    combination: horseNumbers,
                    popularityPattern,
                    ticketPopularity,
                    payout
                });

                console.log(`  3連単: ${horseNumbers.join('→')} ${payout}円 (馬:${popularityPattern}, 券:${ticketPopularity}人気)`);
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

    /**
     * 既存レースに払い戻しデータのみを上書き更新する
     * @param {string} payoutText - 払い戻しデータテキスト
     * @param {Array} existingRaces - 既存のレースデータ
     * @returns {Object} { updatedRaces, warnings, conflicts }
     */
    updatePayoutDataOnly(payoutText, existingRaces) {
        if (!payoutText || !payoutText.trim()) {
            throw new Error('払い戻しデータが空です');
        }

        if (!existingRaces || existingRaces.length === 0) {
            throw new Error('既存のレースデータがありません');
        }

        console.log('💰 払い戻しデータ上書き更新開始');

        // 既存レースのクローンを作成（元データを保持）
        const updatedRaces = JSON.parse(JSON.stringify(existingRaces));
        const warnings = [];
        const conflicts = [];

        // 新しい払い戻しデータを一時的なレース配列として解析
        const tempRaces = updatedRaces.map(race => ({
            ...race,
            payouts: {} // 払い戻しデータをリセット
        }));

        // 払い戻しデータを解析して tempRaces に格納
        this.parsePayoutData(payoutText, tempRaces);

        // レースごとに比較して上書き
        tempRaces.forEach((tempRace, index) => {
            const originalRace = existingRaces[index];
            const updatedRace = updatedRaces[index];

            // 払い戻しデータが存在するかチェック
            if (!tempRace.payouts || Object.keys(tempRace.payouts).length === 0) {
                warnings.push(`${tempRace.number} ${tempRace.name}: 払い戻しデータが見つかりませんでした`);
                return;
            }

            // レース基本情報の一致確認（競馬場、日付、レース番号）
            if (tempRace.racetrack !== originalRace.racetrack ||
                tempRace.date !== originalRace.date ||
                tempRace.number !== originalRace.number) {
                conflicts.push({
                    race: tempRace.number,
                    type: '基本情報不一致',
                    detail: `競馬場・日付・レース番号が一致しません`
                });
                return;
            }

            // 着順結果との整合性チェック
            const raceConflicts = this.validatePayoutConsistency(tempRace, originalRace);
            if (raceConflicts.length > 0) {
                conflicts.push(...raceConflicts.map(c => ({
                    race: tempRace.number,
                    name: tempRace.name,
                    ...c
                })));
            }

            // 払い戻しデータを上書き
            updatedRace.payouts = tempRace.payouts;

            // 出走馬データを上書き（存在する場合のみ）
            if (tempRace.runners && tempRace.runners.length > 0) {
                updatedRace.runners = tempRace.runners;
                console.log(`  🏇 出走馬: ${tempRace.runners.join(',')} (${tempRace.runners.length}頭)`);
            }

            // 登録頭数を上書き（存在する場合のみ）
            if (tempRace.horseCount !== undefined && tempRace.horseCount !== null) {
                updatedRace.horseCount = tempRace.horseCount;
                console.log(`  📊 登録頭数: ${tempRace.horseCount}頭`);
            }

            // 取消馬データを上書き（存在する場合のみ）
            if (tempRace.canceledHorses && tempRace.canceledHorses.length > 0) {
                updatedRace.canceledHorses = tempRace.canceledHorses;
                console.log(`  🚫 取消馬: ${tempRace.canceledHorses.join(',')}`);
            }

            console.log(`✅ ${updatedRace.number} ${updatedRace.name}: 払い戻しデータ更新`);
        });

        console.log('✅ 払い戻しデータ上書き完了');

        return {
            updatedRaces,
            warnings,
            conflicts
        };
    }

    /**
     * 払い戻しデータとレース結果の整合性をチェック
     */
    validatePayoutConsistency(tempRace, originalRace) {
        const conflicts = [];

        // 単勝の馬番チェック
        if (tempRace.payouts.tansho) {
            const tanshoHorse = tempRace.payouts.tansho.horseNumber;
            const winner = originalRace.results.find(r => r.position === 1);

            if (winner && winner.number !== tanshoHorse) {
                conflicts.push({
                    type: '単勝不一致',
                    detail: `単勝馬番${tanshoHorse}が1着馬番${winner.number}と一致しません`,
                    expected: winner.number,
                    actual: tanshoHorse
                });
            }
        }

        // 馬連の組み合わせチェック
        if (tempRace.payouts.umaren && tempRace.payouts.umaren.length > 0) {
            const first = originalRace.results.find(r => r.position === 1);
            const second = originalRace.results.find(r => r.position === 2);

            if (first && second) {
                const expectedCombination = [first.number, second.number].sort((a, b) => a - b);

                tempRace.payouts.umaren.forEach(umaren => {
                    const actualCombination = [...umaren.combination].sort((a, b) => a - b);

                    if (actualCombination[0] !== expectedCombination[0] ||
                        actualCombination[1] !== expectedCombination[1]) {
                        conflicts.push({
                            type: '馬連不一致',
                            detail: `馬連${actualCombination.join('-')}が1-2着${expectedCombination.join('-')}と一致しません`,
                            expected: expectedCombination.join('-'),
                            actual: actualCombination.join('-')
                        });
                    }
                });
            }
        }

        // 馬単の組み合わせチェック
        if (tempRace.payouts.umatan && tempRace.payouts.umatan.length > 0) {
            const first = originalRace.results.find(r => r.position === 1);
            const second = originalRace.results.find(r => r.position === 2);

            if (first && second) {
                const expectedCombination = [first.number, second.number];

                tempRace.payouts.umatan.forEach(umatan => {
                    const actualCombination = umatan.combination;

                    if (actualCombination[0] !== expectedCombination[0] ||
                        actualCombination[1] !== expectedCombination[1]) {
                        conflicts.push({
                            type: '馬単不一致',
                            detail: `馬単${actualCombination.join('→')}が1→2着${expectedCombination.join('→')}と一致しません`,
                            expected: expectedCombination.join('→'),
                            actual: actualCombination.join('→')
                        });
                    }
                });
            }
        }

        // 3連複の組み合わせチェック
        if (tempRace.payouts.sanrenpuku && tempRace.payouts.sanrenpuku.length > 0) {
            const first = originalRace.results.find(r => r.position === 1);
            const second = originalRace.results.find(r => r.position === 2);
            const third = originalRace.results.find(r => r.position === 3);

            if (first && second && third) {
                const expectedCombination = [first.number, second.number, third.number].sort((a, b) => a - b);

                tempRace.payouts.sanrenpuku.forEach(sanrenpuku => {
                    const actualCombination = [...sanrenpuku.combination].sort((a, b) => a - b);

                    if (actualCombination[0] !== expectedCombination[0] ||
                        actualCombination[1] !== expectedCombination[1] ||
                        actualCombination[2] !== expectedCombination[2]) {
                        conflicts.push({
                            type: '3連複不一致',
                            detail: `3連複${actualCombination.join('-')}が1-2-3着${expectedCombination.join('-')}と一致しません`,
                            expected: expectedCombination.join('-'),
                            actual: actualCombination.join('-')
                        });
                    }
                });
            }
        }

        // 3連単の組み合わせチェック
        if (tempRace.payouts.sanrentan && tempRace.payouts.sanrentan.length > 0) {
            const first = originalRace.results.find(r => r.position === 1);
            const second = originalRace.results.find(r => r.position === 2);
            const third = originalRace.results.find(r => r.position === 3);

            if (first && second && third) {
                const expectedCombination = [first.number, second.number, third.number];

                tempRace.payouts.sanrentan.forEach(sanrentan => {
                    const actualCombination = sanrentan.combination;

                    if (actualCombination[0] !== expectedCombination[0] ||
                        actualCombination[1] !== expectedCombination[1] ||
                        actualCombination[2] !== expectedCombination[2]) {
                        conflicts.push({
                            type: '3連単不一致',
                            detail: `3連単${actualCombination.join('→')}が1→2→3着${expectedCombination.join('→')}と一致しません`,
                            expected: expectedCombination.join('→'),
                            actual: actualCombination.join('→')
                        });
                    }
                });
            }
        }

        return conflicts;
    }
}