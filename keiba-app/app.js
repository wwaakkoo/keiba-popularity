// メインアプリケーションクラス
class AdvancedRaceAnalyzer {
    constructor() {
        this.rawData = '';
        this.parsedRaces = [];
        this.filteredRaces = [];
        this.dataManager = new DataManager();
        this.dataParser = new DataParser();
        this.currentTab = 'tansho';
        this.init();
    }

    init() {
        console.log('🚀 アプリケーション初期化開始');
        
        this.loadExtendedSampleData();
        this.bindEvents();
        this.setupFilters();
        this.setupTabs();
        
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
    }

    bindCalculatorEvents() {
        const calculatorEvents = [
            { id: 'calcTanshoBtn', method: 'calculateStandaloneTansho' },
            { id: 'calcFukushoBtn', method: 'calculateStandaloneFukusho' },
            { id: 'calcUmarenBtn', method: 'calculateStandaloneUmaren' },
            { id: 'calcUmatanBtn', method: 'calculateStandaloneUmatan' },
            { id: 'calcWideBtn', method: 'calculateStandaloneWide' },
            { id: 'calcSanrenpukuBtn', method: 'calculateStandaloneSanrenpuku' },
            { id: 'calcSanrentanBtn', method: 'calculateStandaloneSanrentan' }
        ];

        calculatorEvents.forEach(({ id, method }) => {
            document.getElementById(id)?.addEventListener('click', () => this[method]());
        });

        // 計算機タブのイベント
        document.querySelectorAll('.calculator-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.calcTab;
                this.switchCalculatorTab(tabName);
            });
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

    parseData() {
        const rawData = document.getElementById('raceData').value.trim();
        const horseCountData = document.getElementById('horseCountData').value.trim();
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
            
            this.parsedRaces = this.dataParser.parseRaceData(rawData, selectedRacetrack, selectedDate, horseCounts);
            this.filteredRaces = [...this.parsedRaces];
            this.updateDistanceFilter();
            this.showSections();
            this.applyFilters();
            
            const horseCountInfo = Object.keys(horseCounts).length > 0 ? 
                ` (頭立て数: ${Object.keys(horseCounts).length}レース分)` : '';
            
            Utils.showSuccess(`${selectedRacetrack}競馬場 ${selectedDate} の${this.parsedRaces.length}レースのデータを解析しました${horseCountInfo}`);
        } catch (error) {
            Utils.showError(`データの解析中にエラーが発生しました: ${error.message}`);
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

    // 計算機メソッド
    calculateStandaloneTansho() {
        const popularity = document.getElementById('calcTanshoPopularity').value;
        const resultDiv = document.getElementById('calcTanshoResult');
        const calculator = new Calculator(this.filteredRaces);
        calculator.performTanshoCalculation(popularity, resultDiv);
    }

    calculateStandaloneFukusho() {
        const popularity = document.getElementById('calcFukushoPopularity').value;
        const resultDiv = document.getElementById('calcFukushoResult');
        const calculator = new Calculator(this.filteredRaces);
        calculator.performFukushoCalculation(popularity, resultDiv);
    }

    calculateStandaloneUmaren() {
        const pop1 = document.getElementById('calcUmarenPopularity1').value;
        const pop2 = document.getElementById('calcUmarenPopularity2').value;
        const resultDiv = document.getElementById('calcUmarenResult');
        const calculator = new Calculator(this.filteredRaces);
        calculator.performUmarenCalculation(pop1, pop2, resultDiv);
    }

    calculateStandaloneUmatan() {
        const pop1 = document.getElementById('calcUmatanPopularity1').value;
        const pop2 = document.getElementById('calcUmatanPopularity2').value;
        const resultDiv = document.getElementById('calcUmatanResult');
        const calculator = new Calculator(this.filteredRaces);
        calculator.performUmatanCalculation(pop1, pop2, resultDiv);
    }

    calculateStandaloneWide() {
        const pop1 = document.getElementById('calcWidePopularity1').value;
        const pop2 = document.getElementById('calcWidePopularity2').value;
        const resultDiv = document.getElementById('calcWideResult');
        const calculator = new Calculator(this.filteredRaces);
        calculator.performWideCalculation(pop1, pop2, resultDiv);
    }

    calculateStandaloneSanrenpuku() {
        const pop1 = document.getElementById('calcSanrenpukuPopularity1').value;
        const pop2 = document.getElementById('calcSanrenpukuPopularity2').value;
        const pop3 = document.getElementById('calcSanrenpukuPopularity3').value;
        const resultDiv = document.getElementById('calcSanrenpukuResult');
        const calculator = new Calculator(this.filteredRaces);
        calculator.performSanrenpukuCalculation(pop1, pop2, pop3, resultDiv);
    }

    calculateStandaloneSanrentan() {
        const pop1 = document.getElementById('calcSanrentanPopularity1').value;
        const pop2 = document.getElementById('calcSanrentanPopularity2').value;
        const pop3 = document.getElementById('calcSanrentanPopularity3').value;
        const resultDiv = document.getElementById('calcSanrentanResult');
        const calculator = new Calculator(this.filteredRaces);
        calculator.performSanrentanCalculation(pop1, pop2, pop3, resultDiv);
    }

    // タブ切り替え
    switchTab(tabName) {
        this.currentTab = tabName;
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
        
        this.updateCurrentTabChart();
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
        if (!distanceSelect || !this.parsedRaces) return;
        
        const currentValue = distanceSelect.value;
        
        // 全レースから距離を抽出
        const distances = new Set();
        this.parsedRaces.forEach(race => {
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
    }

    applyFilters() {
        if (!this.parsedRaces) {
            this.filteredRaces = [];
            return;
        }

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

        // フィルターを適用
        this.filteredRaces = this.parsedRaces.filter(race => {
            // 競馬場フィルター
            if (filters.racetrack && race.racetrack !== filters.racetrack) return false;
            
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
                if (filters.dateFrom && raceDate < new Date(filters.dateFrom)) return false;
                if (filters.dateTo) {
                    const toDate = new Date(filters.dateTo);
                    toDate.setHours(23, 59, 59, 999);
                    if (raceDate > toDate) return false;
                }
            }
            
            return true;
        });

        // フィルター結果を表示
        this.updateFilterSummary();
        this.updateCurrentTabChart();
    }

    updateFilterSummary() {
        const summaryElement = document.getElementById('filterSummary');
        if (summaryElement) {
            const count = this.filteredRaces.length;
            summaryElement.innerHTML = `<span class="filter-count">${count}レースが対象</span>`;
        }
    }

    updateCurrentTabChart() {
        // 現在のタブに応じてチャートを更新
        // 実装は必要に応じて追加
        console.log(`Updating chart for tab: ${this.currentTab}`);
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
        const dataSets = this.dataManager.getDataSets();
        const dataSet = dataSets.find(ds => ds.id === id);
        
        if (!dataSet) {
            Utils.showError('データセットが見つかりません');
            return;
        }

        this.filteredRaces = dataSet.races;
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

    analyzeAllData() {
        console.log('🔍 全データ分析開始');
        const allRaces = this.dataManager.getAllRaces();
        console.log('📊 取得したレース数:', allRaces.length);
        
        if (allRaces.length === 0) {
            Utils.showError('分析するデータがありません');
            return;
        }

        this.filteredRaces = allRaces;
        console.log('✅ filteredRacesに設定:', this.filteredRaces.length);
        
        this.showSections();
        console.log('✅ セクション表示完了');
        
        this.applyFilters();
        console.log('✅ フィルター適用完了');
        
        Utils.showSuccess(`${allRaces.length}レースのデータを分析対象に設定しました`);
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