// メインアプリケーションクラス
class AdvancedRaceAnalyzer {
    constructor() {
        this.rawData = '';
        this.parsedRaces = [];
        this.allRaces = []; // フィルター前の全データを保持
        this.filteredRaces = [];
        this.dataManager = new DataManager();
        this.dataParser = new DataParser();
        this.currentTab = 'tansho';
        this.expectedValueFilters = this.loadExpectedValueFilters(); // 期待値フィルター設定
        this.init();
    }

    init() {
        console.log('🚀 アプリケーション初期化開始');
        
        this.loadExtendedSampleData();
        this.bindEvents();
        this.setupFilters();
        this.setupTabs();
        this.bindExpectedValueFilterEvents(); // 期待値フィルターのイベントバインド
        
        console.log('📊 保存データ確認:', this.dataManager.getDataSets().length, '件');
        this.displaySavedData();
        this.updateDateRangeUI();
        
        // 保存データがある場合は全データ分析を有効にする
        if (this.dataManager.getDataSets().length > 0) {
            this.updateDataActionButtons();
        }
        
        console.log('✅ アプリケーション初期化完了');
    }

    loadExtendedSampleData() {
        const sampleData = `R	レース名	条件	馬場・天候	馬番	1着(人気)	馬番	2着(人気)	馬番	3着(人気)
1R	２歳未勝利	ダ1400	良・曇	7	エコロシード②	10	ヘリテージブルーム③	8	カセノアステリア⑥
2R	２歳未勝利	芝1800	良・曇	9	ラフターラインズ①	1	セキテイリノ④	6	ナハトナナレオン⑤
3R	２歳未勝利	芝1400	良・晴	4	フェーダーローター⑯	1	ヨドノティアラ④	9	カラーオブサクセス②
4R	障害未勝利	障3000	良・晴	3	プラチナトレジャー①	8	タイセイジャスパー⑤	14	ファベル②
5R	２歳新馬	芝2000	良・晴	6	ゴーイントゥスカイ②	15	ミスターライト④	13	アッパーウォーター①
6R	２歳新馬	ダ1600	良・晴	3	ゲームカレンダー⑩	13	ウインビギニング②	8	リアライズガイザー①
7R	３歳上1勝クラス	芝1400	良・晴	1	レイククレセント①	6	バンブルビー③	8	アサクサヴィーナス⑦
8R	３歳上1勝クラス	芝1800	良・曇	9	ジャサルディア①	4	ガラク③	8	カザンラク④
9R	ｔｖｋ賞	芝1400	良・曇	16	ジュドー⑯	6	メイケイバートン⑪	10	タイセイカレント⑨
10R	赤富士Ｓ	ダ1600	良・曇	13	オウギノカナメ⑧	5	ヴァンドーム⑤	7	フルオール④
11R	毎日王冠	芝1800	良・曇	9	レーベンスティール⑤	8	ホウオウビスケッツ②	10	サトノシャイニング①
12R	３歳上2勝クラス	ダ1600	良・曇	14	ファリーザ①	9	グレイスザクラウン②	2	スマートスピア④`;

        const sampleHorseCountData = `4回東京2日目
天候：曇 芝：良 ダ：良東京のレース傾向
1R
10:05	サラ系2歳未勝利
(混)[指] 馬齢
ダ1400m 16頭	
2R
10:35	サラ系2歳未勝利
(混)[指] 馬齢
芝1800m 11頭	
3R
11:05	サラ系2歳未勝利
(混)[指] 馬齢
芝1400m 17頭	
4R
11:35	障害3歳上未勝利
(混) 定量
障3000m 14頭	
5R
12:25	サラ系2歳新馬
[指] 馬齢
芝2000m 15頭	
6R
12:55	サラ系2歳新馬
(混)[指] 馬齢
ダ1600m 16頭	
7R
13:25	サラ系3歳上1勝クラス
[指] 定量
芝1400m 18頭	
8R
13:55	サラ系3歳上1勝クラス
(混)[指] 定量
芝1800m 14頭	
9R
14:30	ｔｖｋ賞
サラ系3歳上2勝クラス(混)(特) 定量
芝1400m 18頭	
10R
15:05	赤富士ステークス
サラ系3歳上3勝クラス(混)(特) 定量
ダ1600m 16頭	
11R
15:45	毎日王冠(ＧⅡ)
サラ系3歳上オープン(国)(指) 別定
芝1800m 11頭	
12R
16:25	サラ系3歳上2勝クラス
(混)[指] 定量
ダ1600m 16頭`;
        
        document.getElementById('raceData').value = sampleData;
        document.getElementById('horseCountData').value = sampleHorseCountData;
        
        // デフォルト値を設定
        document.getElementById('racetrackSelect').value = '東京';
        const today = new Date();
        document.getElementById('raceDate').value = today.toISOString().split('T')[0];
    }

    bindEvents() {
        // 基本操作
        document.getElementById('parseButton').addEventListener('click', () => this.parseData());
        document.getElementById('saveButton').addEventListener('click', () => this.saveCurrentData());
        document.getElementById('updatePayoutButton').addEventListener('click', () => this.updatePayoutDataOnly());
        document.getElementById('analyzeAllButton')?.addEventListener('click', () => this.analyzeAllData());
        document.getElementById('exportDataButton')?.addEventListener('click', () => this.dataManager.exportData());
        document.getElementById('importDataButton')?.addEventListener('click', () => this.importData());
        document.getElementById('importFileInput')?.addEventListener('change', (e) => this.handleFileImport(e));
        document.getElementById('clearAllButton')?.addEventListener('click', () => this.clearAllData());

        // 独立計算機のイベント
        this.bindCalculatorEvents();
        
        // フィルターイベント
        this.bindFilterEvents();
        
        // タブイベント
        this.bindTabEvents();

        // 馬券人気統計の馬券種別セレクター
        document.getElementById('ticketTypeSelector')?.addEventListener('change', () => {
            if (this.currentTab === 'ticket-popularity') {
                this.updateTicketPopularityAnalysis();
            }
        });
    }

    bindCalculatorEvents() {
        // 単勝カスタム計算機
        document.getElementById('calculateTansho')?.addEventListener('click', () => {
            const popularity = document.getElementById('tanshoPopularitySelect').value;
            const resultDiv = document.getElementById('tanshoResult');
            const calculator = new Calculator(this.filteredRaces);
            calculator.performTanshoCalculation(popularity, resultDiv);
        });

        // 複勝カスタム計算機
        document.getElementById('calculateFukusho')?.addEventListener('click', () => {
            const popularity = document.getElementById('fukushoPopularitySelect').value;
            const resultDiv = document.getElementById('fukushoResult');
            const calculator = new Calculator(this.filteredRaces);
            calculator.performFukushoCalculation(popularity, resultDiv);
        });

        // 馬連カスタム計算機
        document.getElementById('calculateUmaren')?.addEventListener('click', () => {
            const calculator = new Calculator(this.filteredRaces);
            const pop1 = calculator.getPopularityInput('umarenPopularity1Text', 'umarenPopularity1');
            const pop2 = calculator.getPopularityInput('umarenPopularity2Text', 'umarenPopularity2');
            const resultDiv = document.getElementById('umarenResult');
            calculator.performUmarenCalculation(pop1, pop2, resultDiv);
        });

        // 馬単カスタム計算機
        document.getElementById('calculateUmatan')?.addEventListener('click', () => {
            const calculator = new Calculator(this.filteredRaces);
            const pop1 = calculator.getPopularityInput('umatanPopularity1Text', 'umatanPopularity1');
            const pop2 = calculator.getPopularityInput('umatanPopularity2Text', 'umatanPopularity2');
            const resultDiv = document.getElementById('umatanResult');
            calculator.performUmatanCalculation(pop1, pop2, resultDiv);
        });

        // ワイドカスタム計算機
        document.getElementById('calculateWide')?.addEventListener('click', () => {
            const calculator = new Calculator(this.filteredRaces);
            const pop1 = calculator.getPopularityInput('widePopularity1Text', 'widePopularity1');
            const pop2 = calculator.getPopularityInput('widePopularity2Text', 'widePopularity2');
            const resultDiv = document.getElementById('wideResult');
            calculator.performWideCalculation(pop1, pop2, resultDiv);
        });

        // 3連複カスタム計算機
        document.getElementById('calculateSanrenpuku')?.addEventListener('click', () => {
            const calculator = new Calculator(this.filteredRaces);
            const pop1 = calculator.getPopularityInput('sanrenpukuPopularity1Text', 'sanrenpukuPopularity1');
            const pop2 = calculator.getPopularityInput('sanrenpukuPopularity2Text', 'sanrenpukuPopularity2');
            const pop3 = calculator.getPopularityInput('sanrenpukuPopularity3Text', 'sanrenpukuPopularity3');
            const resultDiv = document.getElementById('sanrenpukuResult');
            calculator.performSanrenpukuCalculation(pop1, pop2, pop3, resultDiv);
        });

        // 3連単カスタム計算機
        document.getElementById('calculateSanrentan')?.addEventListener('click', () => {
            const calculator = new Calculator(this.filteredRaces);
            const pop1 = calculator.getPopularityInput('sanrentanPopularity1Text', 'sanrentanPopularity1');
            const pop2 = calculator.getPopularityInput('sanrentanPopularity2Text', 'sanrentanPopularity2');
            const pop3 = calculator.getPopularityInput('sanrentanPopularity3Text', 'sanrentanPopularity3');
            const resultDiv = document.getElementById('sanrentanResult');
            calculator.performSanrentanCalculation(pop1, pop2, pop3, resultDiv);
        });
    }

    bindFilterEvents() {
        const filterElements = [
            'racetrackFilter', 'trackTypeFilter', 'distanceFilter', 'trackConditionFilter', 
            'weatherFilter', 'raceSearch', 'horseSearch', 'dateFrom', 'dateTo'
        ];
        
        filterElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                const eventType = element.tagName === 'SELECT' ? 'change' : 'input';
                element.addEventListener(eventType, () => this.applyFilters());
            }
        });
        
        // 日付範囲フィルター専用のイベント
        document.getElementById('clearDateRange')?.addEventListener('click', () => this.clearDateRange());
        document.getElementById('setRecentMonth')?.addEventListener('click', () => this.setRecentMonth());
    }

    bindTabEvents() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    // 期待値フィルター設定の読み込み
    loadExpectedValueFilters() {
        const saved = localStorage.getItem('expectedValueFilters');
        if (saved) {
            return JSON.parse(saved);
        }
        // デフォルト設定
        return {
            tansho: { enabled: false, threshold: 100 },
            fukusho: { enabled: false, threshold: 100 },
            umaren: { enabled: false, threshold: 100 },
            umatan: { enabled: false, threshold: 100 },
            wide: { enabled: false, threshold: 100 },
            sanrenpuku: { enabled: false, threshold: 100 },
            sanrentan: { enabled: false, threshold: 100 }
        };
    }

    // 期待値フィルター設定の保存
    saveExpectedValueFilters() {
        localStorage.setItem('expectedValueFilters', JSON.stringify(this.expectedValueFilters));
    }

    // 期待値フィルターのイベントリスナーをバインド
    bindExpectedValueFilterEvents() {
        const ticketTypes = ['tansho', 'fukusho', 'umaren', 'umatan', 'wide', 'sanrenpuku', 'sanrentan'];
        
        ticketTypes.forEach(type => {
            const checkbox = document.getElementById(`${type}FilterEnabled`);
            const threshold = document.getElementById(`${type}FilterThreshold`);
            
            if (checkbox && threshold) {
                // 保存された設定を復元
                checkbox.checked = this.expectedValueFilters[type].enabled;
                threshold.value = this.expectedValueFilters[type].threshold;
                
                // チェックボックスの変更イベント
                checkbox.addEventListener('change', () => {
                    this.expectedValueFilters[type].enabled = checkbox.checked;
                    this.saveExpectedValueFilters();
                    this.updateCurrentTabChart();
                });
                
                // 閾値の変更イベント
                threshold.addEventListener('input', () => {
                    this.expectedValueFilters[type].threshold = parseFloat(threshold.value) || 100;
                    this.saveExpectedValueFilters();
                    if (checkbox.checked) {
                        this.updateCurrentTabChart();
                    }
                });
            }
        });
    }

    parseData() {
        const rawData = document.getElementById('raceData').value.trim();
        const horseCountData = document.getElementById('horseCountData').value.trim();
        const payoutData = document.getElementById('payoutData').value.trim();
        const selectedRacetrack = document.getElementById('racetrackSelect').value;
        const selectedDate = document.getElementById('raceDate').value;
        
        if (!rawData) {
            Utils.showError('レースデータが入力されていません');
            return;
        }
        
        if (!selectedDate) {
            Utils.showError('開催日を選択してください');
            return;
        }

        try {
            const { horseCounts, detectedRacetrack } = this.dataParser.parseHorseCountData(horseCountData);

            // 競馬場の不一致をチェック
            if (detectedRacetrack && detectedRacetrack !== selectedRacetrack) {
                const shouldContinue = confirm(
                    `頭立て数データから「${detectedRacetrack}」競馬場が検出されましたが、選択されているのは「${selectedRacetrack}」です。\n\n` +
                    `競馬場選択を「${detectedRacetrack}」に変更しますか？`
                );

                if (shouldContinue) {
                    document.getElementById('racetrackSelect').value = detectedRacetrack;
                }
            }

            // レースデータを解析（dataParserでエラーチェック済み）
            this.parsedRaces = this.dataParser.parseRaceData(rawData, selectedRacetrack, selectedDate, horseCounts);

            // 払い戻しデータを解析
            if (payoutData) {
                try {
                    this.parsedRaces = this.dataParser.parsePayoutData(payoutData, this.parsedRaces);
                } catch (payoutError) {
                    console.warn('払い戻しデータの解析エラー:', payoutError);
                    Utils.showError(
                        `払い戻しデータの解析に失敗しました。レースデータのみ読み込みます。\n\n` +
                        `エラー: ${payoutError.message}`
                    );
                }
            }

            // 全データを保持（フィルター前の元データ）
            this.allRaces = [...this.parsedRaces];
            this.filteredRaces = [...this.parsedRaces];
            this.updateDistanceFilter();
            this.showSections();
            this.applyFilters();

            const horseCountInfo = Object.keys(horseCounts).length > 0 ?
                ` (頭立て数: ${Object.keys(horseCounts).length}レース分)` : '';
            const payoutInfo = payoutData ? ' (払い戻しデータあり)' : '';

            Utils.showSuccess(
                `${selectedRacetrack}競馬場 ${selectedDate} の${this.parsedRaces.length}レースのデータを解析しました${horseCountInfo}${payoutInfo}\n\n` +
                `詳細はコンソール（F12）で確認できます。`
            );
        } catch (error) {
            console.error('データ解析エラー:', error);
            Utils.showError(
                `データの解析に失敗しました。\n\n` +
                `${error.message}\n\n` +
                `【確認事項】\n` +
                `・タブ区切りのテキストデータになっているか\n` +
                `・ヘッダー行が含まれているか\n` +
                `・競馬場と日付が選択されているか\n\n` +
                `詳細はコンソール（F12）で確認してください。`
            );
        }
    }

    saveCurrentData() {
        if (!this.parsedRaces || this.parsedRaces.length === 0) {
            Utils.showError('保存するデータがありません');
            return;
        }

        const racetrack = document.getElementById('racetrackSelect').value;
        const date = document.getElementById('raceDate').value;

        this.dataManager.saveCurrentData(this.parsedRaces, racetrack, date);
        this.displaySavedData();
    }

    updatePayoutDataOnly() {
        const payoutText = document.getElementById('payoutData').value.trim();

        if (!payoutText) {
            Utils.showError('払い戻しデータを入力してください');
            return;
        }

        const racetrack = document.getElementById('racetrackSelect').value;
        const date = document.getElementById('raceDate').value;

        if (!racetrack || !date) {
            Utils.showError('競馬場と日付を選択してください');
            return;
        }

        try {
            // 既存のレースデータを取得
            const existingRaces = this.dataManager.getRacesByDate(racetrack, date);

            if (!existingRaces || existingRaces.length === 0) {
                Utils.showError(
                    `${racetrack} ${date}のレースデータが見つかりませんでした。\n\n` +
                    `先に通常のデータ登録を行ってから、払い戻しデータのみ更新を実行してください。`
                );
                return;
            }

            console.log(`📍 既存レースデータ: ${existingRaces.length}件`);

            // 払い戻しデータを上書き更新
            const result = this.dataParser.updatePayoutDataOnly(payoutText, existingRaces);

            // 矛盾チェック
            if (result.conflicts.length > 0) {
                const conflictMessages = result.conflicts.map(c =>
                    `・${c.race} ${c.name || ''}: ${c.type}\n  ${c.detail}\n  期待値: ${c.expected || 'なし'}, 実際: ${c.actual || 'なし'}`
                ).join('\n\n');

                const proceed = confirm(
                    `⚠️ 以下のデータに矛盾が見つかりました:\n\n${conflictMessages}\n\n` +
                    `それでも更新を続行しますか？\n` +
                    `（レース結果と払い戻しデータが異なるレース開催の可能性があります）`
                );

                if (!proceed) {
                    console.log('❌ ユーザーによりキャンセルされました');
                    return;
                }
            }

            // 警告表示
            if (result.warnings.length > 0) {
                console.warn('⚠️ 警告:\n' + result.warnings.join('\n'));
            }

            // 更新されたデータを保存
            this.dataManager.updateRacesByDate(racetrack, date, result.updatedRaces);

            // 成功メッセージ
            let message = `✅ 払い戻しデータを更新しました\n\n`;
            message += `更新件数: ${result.updatedRaces.length}レース\n`;

            if (result.warnings.length > 0) {
                message += `\n⚠️ 警告: ${result.warnings.length}件\n`;
                message += result.warnings.slice(0, 3).join('\n');
                if (result.warnings.length > 3) {
                    message += `\n...他${result.warnings.length - 3}件`;
                }
            }

            if (result.conflicts.length > 0) {
                message += `\n\n⚠️ 矛盾: ${result.conflicts.length}件（確認の上更新しました）`;
            }

            alert(message);

            // 保存済みデータを再表示
            this.displaySavedData();

            // 情報ボックスを表示
            document.getElementById('updatePayoutInfo').style.display = 'block';

        } catch (error) {
            console.error('❌ エラー:', error);
            Utils.showError(
                `払い戻しデータ更新エラー\n\n` +
                `${error.message}\n\n` +
                `詳細はコンソール（F12）で確認してください。`
            );
        }
    }

    // タブ切り替え
    switchTab(tabName) {
        console.log('🔄 タブ切り替え:', this.currentTab, '→', tabName);
        this.currentTab = tabName;
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
        
        // データがある場合のみ分析を実行
        if (this.filteredRaces && this.filteredRaces.length > 0) {
            this.updateCurrentTabChart();
        }
    }

    switchCalculatorTab(tabName) {
        document.querySelectorAll('.calculator-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.calcTab === tabName);
        });
        
        document.querySelectorAll('.calculator-tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `calc-${tabName}-tab`);
        });
    }

    // その他のメソッドは必要に応じて追加
    setupFilters() {
        document.querySelector('.advanced-filter-section').classList.remove('visible');
        document.querySelector('.stats-analysis-section').classList.remove('visible');
        document.querySelector('.basic-stats-section').classList.remove('visible');
        document.querySelector('.results-section').classList.remove('visible');
    }

    setupTabs() {
        // タブの初期設定
    }

    showSections() {
        console.log('🎨 セクション表示開始');
        
        const sections = [
            '.advanced-filter-section',
            '.stats-analysis-section', 
            '.basic-stats-section',
            '.results-section'
        ];
        
        sections.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.classList.add('visible');
                console.log(`✅ ${selector} 表示`);
            } else {
                console.warn(`❌ ${selector} が見つかりません`);
            }
        });
    }

    updateDistanceFilter() {
        const distanceSelect = document.getElementById('distanceFilter');
        if (!distanceSelect) return;
        
        // allRaces、parsedRaces、filteredRacesの順で利用可能なデータを使用
        const sourceRaces = this.allRaces && this.allRaces.length > 0 ? this.allRaces :
                           (this.parsedRaces && this.parsedRaces.length > 0 ? this.parsedRaces : this.filteredRaces);
        
        if (!sourceRaces || sourceRaces.length === 0) {
            distanceSelect.innerHTML = '<option value="">すべて</option>';
            return;
        }
        
        const currentValue = distanceSelect.value;
        
        // 全レースから距離を抽出
        const distances = new Set();
        sourceRaces.forEach(race => {
            if (race.distance) {
                distances.add(race.distance);
            }
        });
        
        // 距離を数値でソート
        const sortedDistances = Array.from(distances).sort((a, b) => parseInt(a) - parseInt(b));
        
        // 選択肢を再生成
        distanceSelect.innerHTML = '<option value="">すべて</option>';
        sortedDistances.forEach(distance => {
            const option = document.createElement('option');
            option.value = distance;
            option.textContent = `${distance}m`;
            distanceSelect.appendChild(option);
        });
        
        // 以前の選択値を復元
        if (currentValue && sortedDistances.includes(currentValue)) {
            distanceSelect.value = currentValue;
        }
        
        console.log(`📏 距離フィルター更新: ${sortedDistances.length}種類の距離を検出`);
    }

    applyFilters() {
        console.log('🔍 applyFilters 開始');
        console.log('📊 allRaces:', this.allRaces?.length || 0);
        console.log('📊 parsedRaces:', this.parsedRaces?.length || 0);
        console.log('📊 filteredRaces (before):', this.filteredRaces?.length || 0);
        
        // フィルター対象のデータを決定（常にallRacesを使用）
        const sourceRaces = this.allRaces && this.allRaces.length > 0 ? this.allRaces : 
                           (this.parsedRaces && this.parsedRaces.length > 0 ? this.parsedRaces : this.filteredRaces);
        
        if (!sourceRaces || sourceRaces.length === 0) {
            console.log('⚠️ フィルター対象のデータが空です');
            this.filteredRaces = [];
            this.updateFilterSummary();
            return;
        }
        
        console.log('📊 フィルター対象データ:', sourceRaces.length);

        // フィルター条件を取得
        const filters = {
            racetrack: document.getElementById('racetrackFilter')?.value || '',
            trackType: document.getElementById('trackTypeFilter')?.value || '',
            distance: document.getElementById('distanceFilter')?.value || '',
            trackCondition: document.getElementById('trackConditionFilter')?.value || '',
            weather: document.getElementById('weatherFilter')?.value || '',
            raceSearch: document.getElementById('raceSearch')?.value.toLowerCase() || '',
            horseSearch: document.getElementById('horseSearch')?.value.toLowerCase() || '',
            dateFrom: document.getElementById('dateFrom')?.value || '',
            dateTo: document.getElementById('dateTo')?.value || ''
        };
        
        console.log('🔍 適用するフィルター:', filters);

        // フィルターを適用
        this.filteredRaces = sourceRaces.filter(race => {
            // 競馬場フィルター
            if (filters.racetrack && race.racetrack !== filters.racetrack) {
                console.log(`❌ 競馬場フィルター除外: ${race.racetrack} !== ${filters.racetrack}`);
                return false;
            }
            
            // 馬場種別フィルター
            if (filters.trackType && race.trackType !== filters.trackType) return false;
            
            // 距離フィルター
            if (filters.distance && race.distance !== filters.distance) return false;
            
            // 馬場状態フィルター
            if (filters.trackCondition && race.trackCondition !== filters.trackCondition) return false;
            
            // 天候フィルター
            if (filters.weather && race.weather !== filters.weather) return false;
            
            // レース名検索
            if (filters.raceSearch && !race.name.toLowerCase().includes(filters.raceSearch)) return false;
            
            // 馬名検索
            if (filters.horseSearch) {
                const hasMatchingHorse = race.results.some(result => 
                    result.name.toLowerCase().includes(filters.horseSearch)
                );
                if (!hasMatchingHorse) return false;
            }
            
            // 日付範囲フィルター
            if (filters.dateFrom || filters.dateTo) {
                const raceDate = new Date(race.date);
                if (filters.dateFrom) {
                    const fromDate = new Date(filters.dateFrom);
                    if (raceDate < fromDate) {
                        console.log('❌ 日付フィルター除外 (開始日):', race.date, '<', filters.dateFrom);
                        return false;
                    }
                }
                if (filters.dateTo) {
                    const toDate = new Date(filters.dateTo);
                    toDate.setHours(23, 59, 59, 999);
                    if (raceDate > toDate) {
                        console.log('❌ 日付フィルター除外 (終了日):', race.date, '>', filters.dateTo);
                        return false;
                    }
                }
            }
            
            return true;
        });

        console.log('📊 フィルター処理完了:', this.filteredRaces.length, '/', sourceRaces.length);
        
        // フィルター結果を表示
        this.updateFilterSummary();
        this.updateCurrentTabChart();
    }

    updateFilterSummary() {
        const summaryElement = document.getElementById('filterSummary');
        if (summaryElement) {
            const count = this.filteredRaces?.length || 0;
            console.log('📊 フィルター結果:', count, 'レース');
            summaryElement.innerHTML = `<span class="filter-count">${count}レースが対象</span>`;
        }
    }

    updateCurrentTabChart() {
        console.log(`📊 チャート更新開始: ${this.currentTab}`);
        
        if (!this.filteredRaces || this.filteredRaces.length === 0) {
            console.log('⚠️ 表示するデータがありません');
            return;
        }

        switch (this.currentTab) {
            case 'tansho':
                this.updateTanshoAnalysis();
                break;
            case 'fukusho':
                this.updateFukushoAnalysis();
                break;
            case 'umaren':
                this.updateUmarenAnalysis();
                break;
            case 'umatan':
                this.updateUmatanAnalysis();
                break;
            case 'wide':
                this.updateWideAnalysis();
                break;
            case 'sanrenpuku':
                this.updateSanrenpukuAnalysis();
                break;
            case 'sanrentan':
                this.updateSanrentanAnalysis();
                break;
            case 'ticket-popularity':
                this.updateTicketPopularityAnalysis();
                break;
            default:
                console.log('⚠️ 未知のタブ:', this.currentTab);
        }
    }

    displaySavedData() {
        console.log('📋 displaySavedData 開始');
        const container = document.getElementById('savedDataList');
        const section = document.querySelector('.saved-data-section');
        const dataSets = this.dataManager.getDataSets();

        console.log('🔍 要素確認:', {
            container: !!container,
            section: !!section,
            dataSetsCount: dataSets.length
        });

        if (dataSets.length === 0) {
            section.classList.remove('visible');
            container.innerHTML = `
                <div class="empty-saved-data">
                    <h4>📂 保存されたデータはありません</h4>
                    <p>レースデータを入力・解析後、「データを保存」ボタンで保存できます</p>
                </div>
            `;
            this.updateDataActionButtons();
            return;
        }

        section.classList.add('visible');
        
        // 日付順でソート（新しい順）
        const sortedDataSets = dataSets
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        // 直近3件とそれ以外に分ける
        const recentData = sortedDataSets.slice(0, 3);
        const olderData = sortedDataSets.slice(3);

        let html = '';

        // 直近3件を表示
        if (recentData.length > 0) {
            html += '<div class="recent-data-section">';
            html += '<h4 class="saved-data-section-title">📅 直近のデータ</h4>';
            html += recentData.map(dataSet => this.createSavedDataItem(dataSet)).join('');
            html += '</div>';
        }

        // それ以外のデータを折りたたみ表示
        if (olderData.length > 0) {
            html += '<div class="older-data-section">';
            html += `<details class="older-data-details">
                <summary class="older-data-summary">
                    📁 その他のデータ (${olderData.length}件)
                </summary>
                <div class="older-data-content">
                    ${olderData.map(dataSet => this.createSavedDataItem(dataSet)).join('')}
                </div>
            </details>`;
            html += '</div>';
        }

        container.innerHTML = html;
        
        // データの有無に応じてボタンの表示を制御
        this.updateDataActionButtons();
    }

    createSavedDataItem(dataSet) {
        const totalRaces = dataSet.races.length;
        const racetrackCounts = {};
        
        dataSet.races.forEach(race => {
            racetrackCounts[race.racetrack] = (racetrackCounts[race.racetrack] || 0) + 1;
        });

        const racetrackInfo = Object.entries(racetrackCounts)
            .map(([track, count]) => `${track}(${count})`)
            .join(', ');

        return `
            <div class="saved-data-item" data-id="${dataSet.id}">
                <div class="saved-data-header">
                    <div class="saved-data-title">
                        <span class="saved-data-date">${Utils.formatDate(dataSet.date)}</span>
                        <span class="saved-data-track">${dataSet.racetrack}競馬場</span>
                    </div>
                    <div class="saved-data-actions">
                        <button class="btn btn--sm btn--outline" onclick="analyzer.loadDataSet(${dataSet.id})">
                            📊 分析
                        </button>
                        <button class="btn btn--sm btn--outline" onclick="analyzer.deleteDataSet(${dataSet.id})">
                            🗑️ 削除
                        </button>
                    </div>
                </div>
                <div class="saved-data-info">
                    <span class="saved-data-races">${totalRaces}レース</span>
                    <span class="saved-data-tracks">${racetrackInfo}</span>
                </div>
            </div>
        `;
    }

    updateDataActionButtons() {
        const dataActionButtons = document.getElementById('dataActionButtons');
        const hasData = this.dataManager.getDataSets().length > 0;
        
        if (dataActionButtons) {
            dataActionButtons.style.display = hasData ? 'flex' : 'none';
        }
    }

    loadDataSet(id) {
        console.log('🔍 loadDataSet 開始, ID:', id);
        const dataSets = this.dataManager.getDataSets();
        console.log('📦 利用可能なデータセット数:', dataSets.length);
        
        const dataSet = dataSets.find(ds => ds.id === id);
        console.log('📊 見つかったデータセット:', dataSet);
        
        if (!dataSet) {
            Utils.showError('データセットが見つかりません');
            return;
        }

        console.log('📊 データセットのレース数:', dataSet.races?.length || 0);
        // 全データを保持（フィルター前の元データ）
        this.allRaces = dataSet.races || [];
        this.parsedRaces = [...this.allRaces];
        this.filteredRaces = [...this.allRaces];
        console.log('✅ allRaces, parsedRaces, filteredRacesに設定:', this.allRaces.length);
        
        this.updateDistanceFilter();
        this.showSections();
        this.applyFilters();
        
        Utils.showSuccess(`${dataSet.racetrack}競馬場 ${Utils.formatDate(dataSet.date)} のデータを分析対象に設定しました`);
    }

    deleteDataSet(id) {
        if (this.dataManager.deleteDataSet(id)) {
            this.displaySavedData();
        }
    }

    updateDateRangeUI() {
        // 日付範囲UIの更新
    }

    clearDateRange() {
        document.getElementById('dateFrom').value = '';
        document.getElementById('dateTo').value = '';
        this.updateDateRangeUI();
        this.applyFilters();
    }

    setRecentMonth() {
        const today = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);
        
        document.getElementById('dateFrom').value = oneMonthAgo.toISOString().split('T')[0];
        document.getElementById('dateTo').value = today.toISOString().split('T')[0];
        this.updateDateRangeUI();
        this.applyFilters();
    }

    importData() {
        document.getElementById('importFileInput').click();
    }

    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.json')) {
            Utils.showError('JSONファイルを選択してください');
            return;
        }

        const shouldMerge = confirm(
            `インポート方法を選択してください:\n\n` +
            `「OK」: 既存データに追加\n` +
            `「キャンセル」: 既存データを置き換え`
        );

        this.dataManager.importData(file, shouldMerge)
            .then(() => {
                this.displaySavedData();
            })
            .catch(error => {
                Utils.showError(`インポート中にエラーが発生しました: ${error.message}`);
            });
        
        event.target.value = '';
    }

    clearAllData() {
        if (this.dataManager.clearAllData()) {
            this.displaySavedData();
        }
    }

    // 統計分析メソッド
    updateTanshoAnalysis() {
        console.log('📊 単勝分析開始');
        const allResults = this.filteredRaces.flatMap(race => race.results);
        const statistics = new Statistics(this.filteredRaces);
        const stats = statistics.calculateTanshoStats(allResults);
        
        this.createTanshoChart(stats);
        this.displayTanshoStats(stats);
        console.log('✅ 単勝分析完了');
    }

    updateFukushoAnalysis() {
        console.log('📊 複勝分析開始');
        const allResults = this.filteredRaces.flatMap(race => race.results);
        const statistics = new Statistics(this.filteredRaces);
        const stats = statistics.calculateFukushoStats(allResults);
        
        this.createFukushoChart(stats);
        this.displayFukushoStats(stats);
        console.log('✅ 複勝分析完了');
    }

    updateUmarenAnalysis() {
        console.log('📊 馬連分析開始');
        const statistics = new Statistics(this.filteredRaces);
        const umarenData = statistics.calculateUmarenStats();
        
        this.createUmarenChart(umarenData.patterns);
        this.displayUmarenStats(umarenData.patterns);
        console.log('✅ 馬連分析完了');
    }

    updateUmatanAnalysis() {
        console.log('📊 馬単分析開始');
        const statistics = new Statistics(this.filteredRaces);
        const umatanData = statistics.calculateUmatanStats();
        
        this.createUmatanChart(umatanData.patterns);
        this.displayUmatanStats(umatanData.patterns);
        console.log('✅ 馬単分析完了');
    }

    updateWideAnalysis() {
        console.log('📊 ワイド分析開始');
        const statistics = new Statistics(this.filteredRaces);
        const wideData = statistics.calculateWideStats();
        
        this.createWideChart(wideData.patterns);
        this.displayWideStats(wideData.patterns);
        console.log('✅ ワイド分析完了');
    }

    updateSanrenpukuAnalysis() {
        console.log('📊 3連複分析開始');
        const statistics = new Statistics(this.filteredRaces);
        const sanrenpukuData = statistics.calculateSanrenpukuStats();
        
        this.createSanrenpukuChart(sanrenpukuData.patterns);
        this.displaySanrenpukuStats(sanrenpukuData.patterns);
        console.log('✅ 3連複分析完了');
    }

    updateSanrentanAnalysis() {
        console.log('📊 3連単分析開始');
        const statistics = new Statistics(this.filteredRaces);
        const sanrentanData = statistics.calculateSanrentanStats();

        this.createSanrentanChart(sanrentanData.patterns);
        this.displaySanrentanStats(sanrentanData.patterns);
        console.log('✅ 3連単分析完了');
    }

    updateTicketPopularityAnalysis() {
        console.log('🎫 馬券人気統計分析開始');
        const ticketType = document.getElementById('ticketTypeSelector').value;
        const statistics = new Statistics(this.filteredRaces);

        let result;
        let ticketTypeName;

        switch (ticketType) {
            case 'umaren':
                result = statistics.calculateUmarenTicketPopularityStats();
                ticketTypeName = '馬連';
                break;
            case 'umatan':
                result = statistics.calculateUmatanTicketPopularityStats();
                ticketTypeName = '馬単';
                break;
            case 'wide':
                result = statistics.calculateWideTicketPopularityStats();
                ticketTypeName = 'ワイド';
                break;
            case 'sanrenpuku':
                result = statistics.calculateSanrenpukuTicketPopularityStats();
                ticketTypeName = '3連複';
                break;
            case 'sanrentan':
                result = statistics.calculateSanrentanTicketPopularityStats();
                ticketTypeName = '3連単';
                break;
            default:
                result = statistics.calculateUmarenTicketPopularityStats();
                ticketTypeName = '馬連';
        }

        // タイトル更新
        document.getElementById('ticketPopularityChartTitle').textContent = `${ticketTypeName}の馬券人気別期待値`;
        document.getElementById('ticketPopularityTableTitle').textContent = `${ticketTypeName}の馬券人気別統計`;

        // データが存在する人気のみ抽出
        const validStats = [];
        Object.keys(result.stats).forEach(pop => {
            const stat = result.stats[pop];
            if (stat.wins > 0) {
                validStats.push({ ...stat, popularity: parseInt(pop) });
            }
        });

        validStats.sort((a, b) => a.popularity - b.popularity);

        if (validStats.length === 0) {
            document.getElementById('ticketPopularityTableBody').innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center;">
                        <p>⚠️ 馬券人気データがありません</p>
                        <p>払い戻しデータに馬券人気が含まれている場合のみ表示されます</p>
                    </td>
                </tr>
            `;
            return;
        }

        this.createTicketPopularityChart(validStats, ticketTypeName);
        this.displayTicketPopularityStats(validStats);
        console.log(`✅ ${ticketTypeName}馬券人気統計分析完了（${validStats.length}人気分）`);
    }

    createTicketPopularityChart(stats, ticketTypeName) {
        const canvas = document.getElementById('ticketPopularityChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        if (this.ticketPopularityChart) {
            this.ticketPopularityChart.destroy();
        }

        // 上位30人気までに制限（見やすさのため）
        const displayStats = stats.slice(0, 30);

        const data = {
            labels: displayStats.map(s => `${s.popularity}番人気`),
            datasets: [{
                label: '期待値（%）',
                data: displayStats.map(s => s.expectedValue),
                backgroundColor: displayStats.map(s =>
                    s.expectedValue > 100 ? 'rgba(75, 192, 192, 0.5)' : 'rgba(255, 99, 132, 0.5)'
                ),
                borderColor: displayStats.map(s =>
                    s.expectedValue > 100 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'
                ),
                borderWidth: 1
            }]
        };

        const config = {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: `${ticketTypeName}の馬券人気別期待値（上位30人気）`,
                        font: { size: 16 }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const stat = displayStats[context.dataIndex];
                                return [
                                    `期待値: ${stat.expectedValue.toFixed(1)}%`,
                                    `的中数: ${stat.wins}回`,
                                    `的中率: ${stat.winRate.toFixed(2)}%`,
                                    `平均配当: ${stat.averagePayout.toFixed(0)}円`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '期待値（%）'
                        },
                        ticks: {
                            callback: value => value + '%'
                        }
                    }
                }
            }
        };

        this.ticketPopularityChart = new Chart(ctx, config);
    }

    displayTicketPopularityStats(stats) {
        const tbody = document.getElementById('ticketPopularityTableBody');
        if (!tbody) return;

        let html = '';
        stats.forEach(stat => {
            const isPositive = stat.expectedValue > 100;
            html += `
                <tr class="${isPositive ? 'highlight-positive' : ''}">
                    <td>${stat.popularity}番人気</td>
                    <td>${stat.wins}回</td>
                    <td>${stat.winRate.toFixed(2)}%</td>
                    <td>${stat.averagePayout.toFixed(0)}円</td>
                    <td class="${isPositive ? 'positive' : 'negative'}">${stat.expectedValue.toFixed(1)}%</td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    // 統計表示メソッド
    displayTanshoStats(stats) {
        const container = document.getElementById('tanshoStats');
        if (!container) {
            console.warn('❌ tanshoStats要素が見つかりません');
            return;
        }

        // 期待値順にソート
        const sortedStats = [];
        for (let i = 1; i <= 16; i++) {
            const stat = stats[i];
            if (stat && stat.total > 0) {
                sortedStats.push({ ...stat, popularity: i });
            }
        }
        
        sortedStats.sort((a, b) => b.expectedValue - a.expectedValue);

        // 期待値フィルターを適用
        const filterEnabled = this.expectedValueFilters.tansho.enabled;
        const filterThreshold = this.expectedValueFilters.tansho.threshold;
        const filteredStats = filterEnabled ? 
            sortedStats.filter(stat => stat.expectedValue >= filterThreshold) : 
            sortedStats;

        let html = '';
        filteredStats.forEach(stat => {
            const isPositive = stat.expectedValue > 100;
            const payoutInfo = stat.payoutCount > 0 ? 
                `<br>配当データ: ${stat.payoutCount}件 (${stat.minPayout}円～${stat.maxPayout}円)` : 
                '<br><span class="text-warning">配当データなし（理論値）</span>';
            
            html += `
                <div class="stat-item">
                    <div class="stat-item-label">${stat.popularity}番人気</div>
                    <div class="stat-item-value ${isPositive ? 'positive' : 'negative'}">
                        期待値: ${stat.expectedValue.toFixed(1)}%
                    </div>
                    <div class="stat-item-detail">
                        的中率: ${stat.winRate.toFixed(1)}% × 平均配当: ${stat.averagePayout.toFixed(0)}円 = ${stat.expectedValue.toFixed(1)}%<br>
                        実績: ${stat.wins}勝/${stat.total}戦${payoutInfo}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html || '<p>表示するデータがありません</p>';
    }

    displayFukushoStats(stats) {
        const container = document.getElementById('fukushoStats');
        if (!container) {
            console.warn('❌ fukushoStats要素が見つかりません');
            return;
        }

        // 期待値順にソート
        const sortedStats = [];
        for (let i = 1; i <= 16; i++) {
            const stat = stats[i];
            if (stat && stat.total > 0) {
                sortedStats.push({ ...stat, popularity: i });
            }
        }
        
        sortedStats.sort((a, b) => b.expectedValue - a.expectedValue);

        // 期待値フィルターを適用
        const filterEnabled = this.expectedValueFilters.fukusho.enabled;
        const filterThreshold = this.expectedValueFilters.fukusho.threshold;
        const filteredStats = filterEnabled ? 
            sortedStats.filter(stat => stat.expectedValue >= filterThreshold) : 
            sortedStats;

        let html = '';
        filteredStats.forEach(stat => {
            const isPositive = stat.expectedValue > 100;
            const payoutInfo = stat.payoutCount > 0 ? 
                `<br>配当データ: ${stat.payoutCount}件 (${stat.minPayout}円～${stat.maxPayout}円)` : 
                '<br><span class="text-warning">配当データなし（理論値）</span>';
            
            html += `
                <div class="stat-item">
                    <div class="stat-item-label">${stat.popularity}番人気</div>
                    <div class="stat-item-value ${isPositive ? 'positive' : 'negative'}">
                        期待値: ${stat.expectedValue.toFixed(1)}%
                    </div>
                    <div class="stat-item-detail">
                        的中率: ${stat.winRate.toFixed(1)}% × 平均配当: ${stat.averagePayout.toFixed(0)}円 = ${stat.expectedValue.toFixed(1)}%<br>
                        実績: ${stat.hits}勝/${stat.total}戦${payoutInfo}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html || '<p>表示するデータがありません</p>';
    }

    displayUmarenStats(stats) {
        const container = document.getElementById('umarenStats');
        if (!container) {
            console.warn('❌ umarenStats要素が見つかりません');
            return;
        }

        // 期待値フィルターを適用
        const filterEnabled = this.expectedValueFilters.umaren.enabled;
        const filterThreshold = this.expectedValueFilters.umaren.threshold;
        const filteredStats = filterEnabled ? 
            stats.filter(stat => stat.expectedValue >= filterThreshold) : 
            stats;

        const topStats = filteredStats.slice(0, 10); // 上位10件を表示
        let html = '';
        
        topStats.forEach(stat => {
            const isPositive = stat.expectedValue > 100;
            const payoutInfo = stat.payoutCount > 0 ? 
                `<br>平均配当: ${stat.averagePayout.toFixed(0)}円 (${stat.payoutCount}件)` : 
                '<br><span class="text-warning">配当データなし（理論値）</span>';
            
            html += `
                <div class="stat-item">
                    <div class="stat-item-label">${stat.pattern}番人気</div>
                    <div class="stat-item-value ${isPositive ? 'positive' : 'negative'}">
                        期待値: ${stat.expectedValue.toFixed(1)}%
                    </div>
                    <div class="stat-item-detail">
                        的中率: ${stat.percentage.toFixed(1)}% (${stat.count}回)${payoutInfo}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html || '<p>表示するデータがありません</p>';
    }

    displayUmatanStats(stats) {
        const container = document.getElementById('umatanStats');
        if (!container) {
            console.warn('❌ umatanStats要素が見つかりません');
            return;
        }

        // 期待値フィルターを適用
        const filterEnabled = this.expectedValueFilters.umatan.enabled;
        const filterThreshold = this.expectedValueFilters.umatan.threshold;
        const filteredStats = filterEnabled ? 
            stats.filter(stat => stat.expectedValue >= filterThreshold) : 
            stats;

        const topStats = filteredStats.slice(0, 10); // 上位10件を表示
        let html = '';
        
        topStats.forEach(stat => {
            const isPositive = stat.expectedValue > 100;
            const payoutInfo = stat.payoutCount > 0 ? 
                `<br>平均配当: ${stat.averagePayout.toFixed(0)}円 (${stat.payoutCount}件)` : 
                '<br><span class="text-warning">配当データなし（理論値）</span>';
            
            html += `
                <div class="stat-item">
                    <div class="stat-item-label">${stat.pattern}番人気</div>
                    <div class="stat-item-value ${isPositive ? 'positive' : 'negative'}">
                        期待値: ${stat.expectedValue.toFixed(1)}%
                    </div>
                    <div class="stat-item-detail">
                        的中率: ${stat.percentage.toFixed(1)}% (${stat.count}回)${payoutInfo}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html || '<p>表示するデータがありません</p>';
    }

    displayWideStats(stats) {
        const container = document.getElementById('wideStats');
        if (!container) {
            console.warn('❌ wideStats要素が見つかりません');
            return;
        }

        // 期待値フィルターを適用
        const filterEnabled = this.expectedValueFilters.wide.enabled;
        const filterThreshold = this.expectedValueFilters.wide.threshold;
        const filteredStats = filterEnabled ? 
            stats.filter(stat => stat.expectedValue >= filterThreshold) : 
            stats;

        const topStats = filteredStats.slice(0, 10); // 上位10件を表示
        let html = '';
        
        topStats.forEach(stat => {
            const isPositive = stat.expectedValue > 100;
            const payoutInfo = stat.payoutCount > 0 ? 
                `<br>平均配当: ${stat.averagePayout.toFixed(0)}円 (${stat.payoutCount}件)` : 
                '<br><span class="text-warning">配当データなし（理論値）</span>';
            
            html += `
                <div class="stat-item">
                    <div class="stat-item-label">${stat.pattern}番人気</div>
                    <div class="stat-item-value ${isPositive ? 'positive' : 'negative'}">
                        期待値: ${stat.expectedValue.toFixed(1)}%
                    </div>
                    <div class="stat-item-detail">
                        的中率: ${stat.percentage.toFixed(1)}% (${stat.count}回)${payoutInfo}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html || '<p>表示するデータがありません</p>';
    }

    displaySanrenpukuStats(stats) {
        const container = document.getElementById('sanrenpukuStats');
        if (!container) {
            console.warn('❌ sanrenpukuStats要素が見つかりません');
            return;
        }

        // 期待値フィルターを適用
        const filterEnabled = this.expectedValueFilters.sanrenpuku.enabled;
        const filterThreshold = this.expectedValueFilters.sanrenpuku.threshold;
        const filteredStats = filterEnabled ? 
            stats.filter(stat => stat.expectedValue >= filterThreshold) : 
            stats;

        const topStats = filteredStats.slice(0, 10); // 上位10件を表示
        let html = '';
        
        topStats.forEach(stat => {
            const isPositive = stat.expectedValue > 100;
            const payoutInfo = stat.payoutCount > 0 ? 
                `<br>平均配当: ${stat.averagePayout.toFixed(0)}円 (${stat.payoutCount}件)` : 
                '<br><span class="text-warning">配当データなし（理論値）</span>';
            
            html += `
                <div class="stat-item">
                    <div class="stat-item-label">${stat.pattern}番人気</div>
                    <div class="stat-item-value ${isPositive ? 'positive' : 'negative'}">
                        期待値: ${stat.expectedValue.toFixed(1)}%
                    </div>
                    <div class="stat-item-detail">
                        的中率: ${stat.percentage.toFixed(1)}% (${stat.count}回)${payoutInfo}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html || '<p>表示するデータがありません</p>';
    }

    displaySanrentanStats(stats) {
        const container = document.getElementById('sanrentanStats');
        if (!container) {
            console.warn('❌ sanrentanStats要素が見つかりません');
            return;
        }

        // 期待値フィルターを適用
        const filterEnabled = this.expectedValueFilters.sanrentan.enabled;
        const filterThreshold = this.expectedValueFilters.sanrentan.threshold;
        const filteredStats = filterEnabled ? 
            stats.filter(stat => stat.expectedValue >= filterThreshold) : 
            stats;

        const topStats = filteredStats.slice(0, 10); // 上位10件を表示
        let html = '';
        
        topStats.forEach(stat => {
            const isPositive = stat.expectedValue > 100;
            const payoutInfo = stat.payoutCount > 0 ? 
                `<br>平均配当: ${stat.averagePayout.toFixed(0)}円 (${stat.payoutCount}件)` : 
                '<br><span class="text-warning">配当データなし（理論値）</span>';
            
            html += `
                <div class="stat-item">
                    <div class="stat-item-label">${stat.pattern}番人気</div>
                    <div class="stat-item-value ${isPositive ? 'positive' : 'negative'}">
                        期待値: ${stat.expectedValue.toFixed(1)}%
                    </div>
                    <div class="stat-item-detail">
                        的中率: ${stat.percentage.toFixed(1)}% (${stat.count}回)${payoutInfo}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html || '<p>表示するデータがありません</p>';
    }

    // チャート作成メソッド
    createTanshoChart(stats) {
        const ctx = document.getElementById('tanshoChart');
        if (!ctx) {
            console.warn('❌ tanshoChart要素が見つかりません');
            return;
        }

        // 既存のチャートを破棄
        if (this.charts && this.charts.tansho) {
            this.charts.tansho.destroy();
        }

        const labels = [];
        const expectedValues = [];
        const backgroundColors = [];
        
        // データを準備（期待値が存在するもののみ）
        for (let i = 1; i <= 16; i++) {
            const stat = stats[i];
            if (stat && stat.total > 0) {
                labels.push(`${i}番人気`);
                expectedValues.push(stat.expectedValue);
                
                // 期待値に応じて色を設定
                if (stat.expectedValue >= 110) {
                    backgroundColors.push('#4CAF50'); // 緑（プラス期待値）
                } else if (stat.expectedValue >= 90) {
                    backgroundColors.push('#FF9800'); // オレンジ（ほぼ100%）
                } else {
                    backgroundColors.push('#F44336'); // 赤（マイナス期待値）
                }
            }
        }

        if (!this.charts) this.charts = {};

        this.charts.tansho = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '期待値 (%)',
                    data: expectedValues,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors.map(color => color + 'CC'),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '人気別単勝期待値'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '期待値 (%)'
                        },
                        grid: {
                            color: (context) => {
                                // 100%のラインを赤い点線で強調
                                if (context.tick.value === 100) {
                                    return 'rgba(255, 0, 0, 0.5)';
                                }
                                return 'rgba(0,0,0,0.1)';
                            },
                            lineWidth: (context) => {
                                // 100%のラインを太くする
                                if (context.tick.value === 100) {
                                    return 2;
                                }
                                return 1;
                            },
                            borderDash: (context) => {
                                // 100%のラインを点線にする
                                if (context.tick.value === 100) {
                                    return [5, 5];
                                }
                                return [];
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '人気'
                        }
                    }
                },
                elements: {
                    bar: {
                        borderRadius: 4
                    }
                }
            }
        });
    }

    createFukushoChart(stats) {
        const ctx = document.getElementById('fukushoChart');
        if (!ctx) {
            console.warn('❌ fukushoChart要素が見つかりません');
            return;
        }

        // 既存のチャートを破棄
        if (this.charts && this.charts.fukusho) {
            this.charts.fukusho.destroy();
        }

        const labels = [];
        const expectedValues = [];
        const backgroundColors = [];
        
        // データを準備
        for (let i = 1; i <= 16; i++) {
            const stat = stats[i];
            if (stat && stat.total > 0) {
                labels.push(`${i}番人気`);
                expectedValues.push(stat.expectedValue);
                
                if (stat.expectedValue >= 110) {
                    backgroundColors.push('#4CAF50');
                } else if (stat.expectedValue >= 90) {
                    backgroundColors.push('#FF9800');
                } else {
                    backgroundColors.push('#F44336');
                }
            }
        }

        if (!this.charts) this.charts = {};

        this.charts.fukusho = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '期待値 (%)',
                    data: expectedValues,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors.map(color => color + 'CC'),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '人気別複勝期待値'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '期待値 (%)'
                        },
                        grid: {
                            color: (context) => {
                                // 100%のラインを赤い点線で強調
                                if (context.tick.value === 100) {
                                    return 'rgba(255, 0, 0, 0.5)';
                                }
                                return 'rgba(0,0,0,0.1)';
                            },
                            lineWidth: (context) => {
                                // 100%のラインを太くする
                                if (context.tick.value === 100) {
                                    return 2;
                                }
                                return 1;
                            },
                            borderDash: (context) => {
                                // 100%のラインを点線にする
                                if (context.tick.value === 100) {
                                    return [5, 5];
                                }
                                return [];
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '人気'
                        }
                    }
                }
            }
        });
    }

    createUmarenChart(stats) {
        const ctx = document.getElementById('umarenChart');
        if (!ctx) {
            console.warn('❌ umarenChart要素が見つかりません');
            return;
        }

        if (!stats || stats.length === 0) {
            console.warn('⚠️ 表示するデータがありません');
            return;
        }

        // 既存のチャートを破棄
        if (this.charts && this.charts.umaren) {
            this.charts.umaren.destroy();
        }

        // 上位15件を表示
        const topStats = stats.slice(0, 15);
        const labels = topStats.map(stat => `${stat.pattern}番人気`);
        const expectedValues = topStats.map(stat => stat.expectedValue);
        const backgroundColors = topStats.map(stat => {
            if (stat.expectedValue >= 110) return '#4CAF50';
            if (stat.expectedValue >= 90) return '#FF9800';
            return '#F44336';
        });

        if (!this.charts) this.charts = {};

        this.charts.umaren = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '期待値 (%)',
                    data: expectedValues,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors.map(color => color + 'CC'),
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '馬連人気パターン別期待値（上位15件）'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '期待値 (%)'
                        },
                        grid: {
                            color: (context) => {
                                if (context.tick.value === 100) return 'rgba(255, 0, 0, 0.5)';
                                return 'rgba(0,0,0,0.1)';
                            },
                            lineWidth: (context) => {
                                if (context.tick.value === 100) return 2;
                                return 1;
                            },
                            borderDash: (context) => {
                                if (context.tick.value === 100) return [5, 5];
                                return [];
                            }
                        },
                        afterBuildTicks: function(axis) {
                            const ticks = axis.ticks;
                            const hasHundred = ticks.some(tick => tick.value === 100);
                            if (!hasHundred) {
                                ticks.push({ value: 100 });
                                ticks.sort((a, b) => a.value - b.value);
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: '人気パターン'
                        }
                    }
                }
            }
        });
    }

    createUmatanChart(stats) {
        const ctx = document.getElementById('umatanChart');
        if (!ctx) {
            console.warn('❌ umatanChart要素が見つかりません');
            return;
        }

        if (!stats || stats.length === 0) {
            console.warn('⚠️ 表示するデータがありません');
            return;
        }

        // 既存のチャートを破棄
        if (this.charts && this.charts.umatan) {
            this.charts.umatan.destroy();
        }

        // 上位15件を表示
        const topStats = stats.slice(0, 15);
        const labels = topStats.map(stat => `${stat.pattern}番人気`);
        const expectedValues = topStats.map(stat => stat.expectedValue);
        const backgroundColors = topStats.map(stat => {
            if (stat.expectedValue >= 110) return '#4CAF50';
            if (stat.expectedValue >= 90) return '#FF9800';
            return '#F44336';
        });

        if (!this.charts) this.charts = {};

        this.charts.umatan = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '期待値 (%)',
                    data: expectedValues,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors.map(color => color + 'CC'),
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '馬単人気パターン別期待値（上位15件）'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '期待値 (%)'
                        },
                        grid: {
                            color: (context) => {
                                if (context.tick.value === 100) return 'rgba(255, 0, 0, 0.5)';
                                return 'rgba(0,0,0,0.1)';
                            },
                            lineWidth: (context) => {
                                if (context.tick.value === 100) return 2;
                                return 1;
                            },
                            borderDash: (context) => {
                                if (context.tick.value === 100) return [5, 5];
                                return [];
                            }
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        // 100を含むように範囲を調整
                        afterBuildTicks: function(axis) {
                            const ticks = axis.ticks;
                            const hasHundred = ticks.some(tick => tick.value === 100);
                            if (!hasHundred) {
                                ticks.push({ value: 100 });
                                ticks.sort((a, b) => a.value - b.value);
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: '人気パターン'
                        }
                    }
                }
            }
        });
    }

    createWideChart(stats) {
        const ctx = document.getElementById('wideChart');
        if (!ctx) {
            console.warn('❌ wideChart要素が見つかりません');
            return;
        }

        if (!stats || stats.length === 0) {
            console.warn('⚠️ 表示するデータがありません');
            return;
        }

        // 既存のチャートを破棄
        if (this.charts && this.charts.wide) {
            this.charts.wide.destroy();
        }

        // 上位15件を表示
        const topStats = stats.slice(0, 15);
        const labels = topStats.map(stat => `${stat.pattern}番人気`);
        const expectedValues = topStats.map(stat => stat.expectedValue);
        const backgroundColors = topStats.map(stat => {
            if (stat.expectedValue >= 110) return '#4CAF50';
            if (stat.expectedValue >= 90) return '#FF9800';
            return '#F44336';
        });

        if (!this.charts) this.charts = {};

        this.charts.wide = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '期待値 (%)',
                    data: expectedValues,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors.map(color => color + 'CC'),
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'ワイド人気パターン別期待値（上位15件）'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '期待値 (%)'
                        },
                        grid: {
                            color: (context) => {
                                if (context.tick.value === 100) return 'rgba(255, 0, 0, 0.5)';
                                return 'rgba(0,0,0,0.1)';
                            },
                            lineWidth: (context) => {
                                if (context.tick.value === 100) return 2;
                                return 1;
                            },
                            borderDash: (context) => {
                                if (context.tick.value === 100) return [5, 5];
                                return [];
                            }
                        },
                        afterBuildTicks: function(axis) {
                            const ticks = axis.ticks;
                            const hasHundred = ticks.some(tick => tick.value === 100);
                            if (!hasHundred) {
                                ticks.push({ value: 100 });
                                ticks.sort((a, b) => a.value - b.value);
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: '人気パターン'
                        }
                    }
                }
            }
        });
    }

    createSanrenpukuChart(stats) {
        const ctx = document.getElementById('sanrenpukuChart');
        if (!ctx) {
            console.warn('❌ sanrenpukuChart要素が見つかりません');
            return;
        }

        if (!stats || stats.length === 0) {
            console.warn('⚠️ 表示するデータがありません');
            return;
        }

        // 既存のチャートを破棄
        if (this.charts && this.charts.sanrenpuku) {
            this.charts.sanrenpuku.destroy();
        }

        // 上位15件を表示
        const topStats = stats.slice(0, 15);
        const labels = topStats.map(stat => `${stat.pattern}番人気`);
        const expectedValues = topStats.map(stat => stat.expectedValue);
        const backgroundColors = topStats.map(stat => {
            if (stat.expectedValue >= 110) return '#4CAF50';
            if (stat.expectedValue >= 90) return '#FF9800';
            return '#F44336';
        });

        if (!this.charts) this.charts = {};

        this.charts.sanrenpuku = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '期待値 (%)',
                    data: expectedValues,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors.map(color => color + 'CC'),
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '3連複人気パターン別期待値（上位15件）'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '期待値 (%)'
                        },
                        grid: {
                            color: (context) => {
                                if (context.tick.value === 100) return 'rgba(255, 0, 0, 0.5)';
                                return 'rgba(0,0,0,0.1)';
                            },
                            lineWidth: (context) => {
                                if (context.tick.value === 100) return 2;
                                return 1;
                            },
                            borderDash: (context) => {
                                if (context.tick.value === 100) return [5, 5];
                                return [];
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: '人気パターン'
                        }
                    }
                }
            }
        });
    }

    createSanrentanChart(stats) {
        const ctx = document.getElementById('sanrentanChart');
        if (!ctx) {
            console.warn('❌ sanrentanChart要素が見つかりません');
            return;
        }

        if (!stats || stats.length === 0) {
            console.warn('⚠️ 表示するデータがありません');
            return;
        }

        // 既存のチャートを破棄
        if (this.charts && this.charts.sanrentan) {
            this.charts.sanrentan.destroy();
        }

        // 上位15件を表示
        const topStats = stats.slice(0, 15);
        const labels = topStats.map(stat => `${stat.pattern}番人気`);
        const expectedValues = topStats.map(stat => stat.expectedValue);
        const backgroundColors = topStats.map(stat => {
            if (stat.expectedValue >= 110) return '#4CAF50';
            if (stat.expectedValue >= 90) return '#FF9800';
            return '#F44336';
        });

        if (!this.charts) this.charts = {};

        this.charts.sanrentan = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '期待値 (%)',
                    data: expectedValues,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors.map(color => color + 'CC'),
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '3連単人気パターン別期待値（上位15件）'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '期待値 (%)'
                        },
                        grid: {
                            color: (context) => {
                                if (context.tick.value === 100) return 'rgba(255, 0, 0, 0.5)';
                                return 'rgba(0,0,0,0.1)';
                            },
                            lineWidth: (context) => {
                                if (context.tick.value === 100) return 2;
                                return 1;
                            },
                            borderDash: (context) => {
                                if (context.tick.value === 100) return [5, 5];
                                return [];
                            }
                        },
                        afterBuildTicks: function(axis) {
                            const ticks = axis.ticks;
                            const hasHundred = ticks.some(tick => tick.value === 100);
                            if (!hasHundred) {
                                ticks.push({ value: 100 });
                                ticks.sort((a, b) => a.value - b.value);
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: '人気パターン'
                        }
                    }
                }
            }
        });
    }

    analyzeAllData() {
        console.log('🔍 全データ分析開始');
        const allRacesData = this.dataManager.getAllRaces();
        console.log('📊 取得したレース数:', allRacesData.length);
        
        if (allRacesData.length === 0) {
            Utils.showError('分析するデータがありません');
            return;
        }

        // 全データを保持（フィルター前の元データ）
        this.allRaces = allRacesData;
        this.parsedRaces = [...this.allRaces];
        this.filteredRaces = [...this.allRaces];
        console.log('✅ allRaces, parsedRaces, filteredRacesに設定:', this.allRaces.length);
        
        this.updateDistanceFilter();
        console.log('✅ 距離フィルター更新完了');
        
        this.showSections();
        console.log('✅ セクション表示完了');
        
        this.applyFilters();
        console.log('✅ フィルター適用完了');
        
        Utils.showSuccess(`${allRacesData.length}レースのデータを分析対象に設定しました`);
    }
}

// アプリケーション初期化
let analyzer;
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('🎯 DOM読み込み完了、アプリケーション開始');
        analyzer = new AdvancedRaceAnalyzer();
        
        // グローバルに公開（HTMLからの呼び出し用）
        window.analyzer = analyzer;
        
        // デバッグ用のグローバル関数
        window.debugStorage = function() {
            console.log('=== ローカルストレージデバッグ ===');
            console.log('raceAnalyzerData:', localStorage.getItem('raceAnalyzerData'));
            console.log('horseRaceData:', localStorage.getItem('horseRaceData'));
            console.log('horseRacingData:', localStorage.getItem('horseRacingData'));
            console.log('analyzer.dataManager.savedDataSets:', analyzer.dataManager.savedDataSets);
            console.log('analyzer.filteredRaces:', analyzer.filteredRaces);
        };
        
        window.clearFilters = function() {
            console.log('🧹 フィルターをクリア');
            document.getElementById('racetrackFilter').value = '';
            document.getElementById('trackTypeFilter').value = '';
            document.getElementById('distanceFilter').value = '';
            document.getElementById('trackConditionFilter').value = '';
            document.getElementById('weatherFilter').value = '';
            document.getElementById('raceSearch').value = '';
            document.getElementById('horseSearch').value = '';
            document.getElementById('dateFrom').value = '';
            document.getElementById('dateTo').value = '';
            analyzer.applyFilters();
        };
    } catch (error) {
        console.error('❌ アプリケーション初期化エラー:', error);
        
        // エラーメッセージを表示
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 20px;
            border-radius: 8px;
            z-index: 9999;
            font-family: monospace;
        `;
        errorDiv.innerHTML = `
            <h3>アプリケーション初期化エラー</h3>
            <p>${error.message}</p>
            <p>ブラウザのコンソールで詳細を確認してください。</p>
        `;
        document.body.appendChild(errorDiv);
    }
});