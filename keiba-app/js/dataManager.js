// データ管理クラス
class DataManager {
    constructor() {
        this.savedDataSets = [];
        this.loadSavedData();
    }

    loadSavedData() {
        try {
            // 新しいキー名で試す
            let saved = localStorage.getItem('raceAnalyzerData');
            
            // 新しいキーにデータがない場合、古いキー名も試す
            if (!saved) {
                const oldData = localStorage.getItem('horseRaceData');
                if (oldData) {
                    console.log('🔄 古いデータ形式を検出、移行中...');
                    console.log('📦 古いデータ:', oldData.substring(0, 200) + '...');
                    
                    try {
                        const parsedOldData = JSON.parse(oldData);
                        console.log('📦 解析した古いデータ:', parsedOldData);
                        
                        // 古いデータ形式を新しい形式に変換
                        if (Array.isArray(parsedOldData)) {
                            // 古いデータが配列の場合、新しい形式に変換
                            const convertedData = parsedOldData.map((oldDataSet, index) => ({
                                id: oldDataSet.id || Date.now() + index,
                                racetrack: oldDataSet.racetrack || '不明',
                                date: oldDataSet.date || new Date().toISOString().split('T')[0],
                                races: oldDataSet.races || [],
                                createdAt: oldDataSet.createdAt || new Date().toISOString()
                            }));
                            
                            saved = JSON.stringify(convertedData);
                            console.log('✅ データ変換完了:', convertedData.length, '件');
                        } else {
                            saved = oldData;
                        }
                        
                        // 新しいキー名で保存し直す
                        localStorage.setItem('raceAnalyzerData', saved);
                        localStorage.removeItem('horseRaceData'); // 古いデータを削除
                        console.log('✅ データ移行完了');
                    } catch (error) {
                        console.error('❌ データ移行エラー:', error);
                        saved = oldData; // エラーの場合はそのまま使用
                    }
                }
            }
            
            console.log('💾 ローカルストレージから読み込み:', saved ? 'データあり' : 'データなし');
            if (saved) {
                this.savedDataSets = JSON.parse(saved);
                console.log('📦 読み込んだデータセット数:', this.savedDataSets.length);
            }
        } catch (error) {
            console.error('保存データの読み込みエラー:', error);
            this.savedDataSets = [];
        }
    }

    saveDataToStorage() {
        try {
            localStorage.setItem('raceAnalyzerData', JSON.stringify(this.savedDataSets));
        } catch (error) {
            console.error('データ保存エラー:', error);
            Utils.showError('データの保存に失敗しました');
        }
    }

    saveCurrentData(races, racetrack, date) {
        if (!races || races.length === 0) {
            Utils.showError('保存するデータがありません');
            return;
        }

        const dataSet = {
            id: Date.now(),
            racetrack: racetrack,
            date: date,
            races: races,
            createdAt: new Date().toISOString()
        };

        this.savedDataSets.push(dataSet);
        this.saveDataToStorage();
        
        Utils.showSuccess(`${racetrack}競馬場 ${Utils.formatDate(date)} のデータを保存しました`);
        return dataSet;
    }

    deleteDataSet(id) {
        const confirmed = confirm('このデータセットを削除しますか？');
        if (confirmed) {
            this.savedDataSets = this.savedDataSets.filter(ds => ds.id !== id);
            this.saveDataToStorage();
            Utils.showSuccess('データセットを削除しました');
            return true;
        }
        return false;
    }

    clearAllData() {
        const confirmed = confirm('すべてのデータを削除しますか？この操作は取り消せません。');
        if (confirmed) {
            this.savedDataSets = [];
            this.saveDataToStorage();
            Utils.showSuccess('全データを削除しました');
            return true;
        }
        return false;
    }

    exportData() {
        try {
            const exportData = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                savedDataSets: this.savedDataSets,
                metadata: {
                    totalDataSets: this.savedDataSets.length,
                    totalRaces: this.savedDataSets.reduce((total, dataSet) => total + dataSet.races.length, 0)
                }
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            link.download = `keiba-data-${dateStr}.json`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            Utils.showSuccess(`データをエクスポートしました (${exportData.metadata.totalDataSets}データセット, ${exportData.metadata.totalRaces}レース)`);
        } catch (error) {
            Utils.showError(`エクスポート中にエラーが発生しました: ${error.message}`);
        }
    }

    importData(file, shouldMerge) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importData = JSON.parse(e.target.result);
                    
                    // データ形式の検証
                    if (!importData.savedDataSets || !Array.isArray(importData.savedDataSets)) {
                        throw new Error('無効なデータ形式です');
                    }

                    if (shouldMerge) {
                        // 既存データに追加（重複チェック付き）
                        let addedCount = 0;
                        importData.savedDataSets.forEach(newDataSet => {
                            const exists = this.savedDataSets.some(existing => 
                                existing.id === newDataSet.id || 
                                (existing.racetrack === newDataSet.racetrack && existing.date === newDataSet.date)
                            );
                            
                            if (!exists) {
                                // IDが重複する場合は新しいIDを生成
                                if (this.savedDataSets.some(existing => existing.id === newDataSet.id)) {
                                    newDataSet.id = Date.now() + Math.random();
                                }
                                this.savedDataSets.push(newDataSet);
                                addedCount++;
                            }
                        });
                        
                        Utils.showSuccess(`${addedCount}件のデータセットを追加しました（重複は除外）`);
                    } else {
                        // 既存データを置き換え
                        this.savedDataSets = importData.savedDataSets;
                        Utils.showSuccess(`${importData.savedDataSets.length}件のデータセットをインポートしました（既存データを置き換え）`);
                    }

                    // データを保存
                    this.saveDataToStorage();
                    resolve(this.savedDataSets);
                    
                } catch (error) {
                    reject(error);
                }
            };

            reader.readAsText(file);
        });
    }

    getAllRaces() {
        console.log('🔍 getAllRaces 開始');
        console.log('📦 savedDataSets:', this.savedDataSets);
        console.log('📦 savedDataSets.length:', this.savedDataSets.length);
        
        if (this.savedDataSets.length > 0) {
            console.log('📦 最初のデータセット:', this.savedDataSets[0]);
            console.log('📦 最初のデータセットのraces:', this.savedDataSets[0].races);
        }
        
        const allRaces = this.savedDataSets.flatMap(dataSet => {
            console.log('📊 データセット処理:', dataSet.racetrack, dataSet.date, 'レース数:', dataSet.races?.length || 0);
            return dataSet.races || [];
        });
        
        console.log('📊 合計レース数:', allRaces.length);
        return allRaces;
    }

    getDataSets() {
        return this.savedDataSets;
    }
}