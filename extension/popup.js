// 拡張機能のポップアップUI制御とデータ変換

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 popup.js初期化');

    const extractButton = document.getElementById('extractButton');
    const extractAllButton = document.getElementById('extractAllButton');
    const copyButton = document.getElementById('copyButton');
    const statusDiv = document.getElementById('status');
    const resultTextarea = document.getElementById('result');

    // データ取得ボタン
    extractButton.addEventListener('click', async () => {
        console.log('🔘 データ取得ボタンクリック');
        statusDiv.textContent = 'データを取得中...';
        statusDiv.className = 'status info';
        extractButton.disabled = true;
        resultTextarea.value = '';
        copyButton.disabled = true;

        try {
            // アクティブなタブを取得
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            // netkeiba.comかチェック
            if (!tab.url.includes('race.netkeiba.com')) {
                throw new Error('このページはnetkeiba.comのレース結果ページではありません');
            }

            // content.jsにメッセージを送信
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractData' });

            if (!response.success) {
                throw new Error(response.error || 'データ抽出に失敗しました');
            }

            console.log('✅ データ取得成功:', response.data);

            // データを既存アプリの形式に変換
            const convertedText = convertToAppFormat(response.data);
            resultTextarea.value = convertedText;

            statusDiv.textContent = '✅ データ取得完了！下のテキストをコピーしてください';
            statusDiv.className = 'status success';
            copyButton.disabled = false;

        } catch (error) {
            console.error('❌ エラー:', error);
            statusDiv.textContent = `❌ エラー: ${error.message}`;
            statusDiv.className = 'status error';
        } finally {
            extractButton.disabled = false;
        }
    });

    // 12R一括取得ボタン
    extractAllButton.addEventListener('click', async () => {
        console.log('🔘 12R一括取得ボタンクリック');
        statusDiv.textContent = '12レース分のデータを取得中...';
        statusDiv.className = 'status info';
        statusDiv.style.display = 'block';
        extractButton.disabled = true;
        extractAllButton.disabled = true;
        resultTextarea.value = '';
        copyButton.disabled = true;

        try {
            // アクティブなタブを取得
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            // netkeiba.comかチェック
            if (!tab.url.includes('race.netkeiba.com')) {
                throw new Error('このページはnetkeiba.comのレース結果ページではありません');
            }

            // 現在のURLからrace_idを取得
            const urlParams = new URLSearchParams(new URL(tab.url).search);
            const currentRaceId = urlParams.get('race_id');

            if (!currentRaceId || currentRaceId.length < 12) {
                throw new Error('race_idが取得できません');
            }

            // race_idのベース部分（最後の2桁以外）
            const raceIdBase = currentRaceId.substring(0, 10);
            console.log(`📍 ベースrace_id: ${raceIdBase}`);

            const allResults = [];
            let successCount = 0;
            let failCount = 0;
            const createdTabs = [];

            // 1R～12Rまでループ - 各レースページを新しいタブで開く
            for (let raceNum = 1; raceNum <= 12; raceNum++) {
                const raceId = raceIdBase + raceNum.toString().padStart(2, '0');
                const url = `https://race.netkeiba.com/race/result.html?race_id=${raceId}`;

                statusDiv.textContent = `${raceNum}R目を取得中... (${successCount + failCount}/12)`;

                try {
                    // 新しいタブでレースページを開く（非アクティブ）
                    const newTab = await chrome.tabs.create({ url, active: false });
                    createdTabs.push(newTab.id);

                    // ページ読み込み完了を待つ
                    await new Promise((resolve) => {
                        const listener = (tabId, changeInfo) => {
                            if (tabId === newTab.id && changeInfo.status === 'complete') {
                                chrome.tabs.onUpdated.removeListener(listener);
                                resolve();
                            }
                        };
                        chrome.tabs.onUpdated.addListener(listener);

                        // タイムアウト（10秒）
                        setTimeout(() => {
                            chrome.tabs.onUpdated.removeListener(listener);
                            resolve();
                        }, 10000);
                    });

                    // content scriptが注入されているか確認してからメッセージ送信
                    await new Promise(resolve => setTimeout(resolve, 500));

                    // content.jsにメッセージを送信してデータ抽出
                    const response = await chrome.tabs.sendMessage(newTab.id, { action: 'extractData' });

                    if (response.success && response.data) {
                        const convertedText = convertToAppFormat(response.data);
                        allResults.push(convertedText);
                        successCount++;
                        console.log(`✅ ${raceNum}R: 成功`);
                    } else {
                        console.warn(`⚠️ ${raceNum}R: データが見つかりません`);
                        failCount++;
                    }

                    // タブを閉じる
                    await chrome.tabs.remove(newTab.id);
                    createdTabs.pop();

                    // レート制限対策: 500ms待機
                    await new Promise(resolve => setTimeout(resolve, 500));

                } catch (error) {
                    console.error(`❌ ${raceNum}R エラー:`, error);
                    failCount++;
                }
            }

            // クリーンアップ: 残っているタブを閉じる
            for (const tabId of createdTabs) {
                try {
                    await chrome.tabs.remove(tabId);
                } catch (e) {
                    // タブが既に閉じられている場合は無視
                }
            }

            if (allResults.length === 0) {
                throw new Error('データを取得できませんでした');
            }

            resultTextarea.value = allResults.join('\n\n');
            statusDiv.textContent = `✅ 完了: ${successCount}レース成功, ${failCount}レース失敗`;
            statusDiv.className = 'status success';
            copyButton.disabled = false;

        } catch (error) {
            console.error('❌ エラー:', error);
            statusDiv.textContent = `❌ エラー: ${error.message}`;
            statusDiv.className = 'status error';
        } finally {
            extractButton.disabled = false;
            extractAllButton.disabled = false;
        }
    });

    // クリップボードコピーボタン
    copyButton.addEventListener('click', () => {
        resultTextarea.select();
        document.execCommand('copy');

        const originalText = copyButton.textContent;
        copyButton.textContent = 'コピー完了！';
        copyButton.style.backgroundColor = '#10b981';

        setTimeout(() => {
            copyButton.textContent = originalText;
            copyButton.style.backgroundColor = '';
        }, 2000);
    });
});

// 抽出データを既存アプリの形式に変換
function convertToAppFormat(data) {
    console.log('🔄 データ変換開始');

    const lines = [];

    // レース番号
    lines.push(`${data.raceNumber}R`);

    // 各券種を変換
    if (data.tansho) {
        lines.push(...convertTicket('単勝', data.tansho));
    }

    if (data.fukusho) {
        lines.push(...convertTicket('複勝', data.fukusho));
    }

    if (data.wakuren) {
        lines.push(...convertTicket('枠連', data.wakuren));
    }

    if (data.umaren) {
        lines.push(...convertTicket('馬連', data.umaren));
    }

    if (data.wide) {
        lines.push(...convertTicket('ワイド', data.wide));
    }

    if (data.umatan) {
        lines.push(...convertTicket('馬単', data.umatan));
    }

    if (data.sanrenpuku) {
        lines.push(...convertTicket('3連複', data.sanrenpuku));
    }

    if (data.sanrentan) {
        lines.push(...convertTicket('3連単', data.sanrentan));
    }

    const result = lines.join('\n');
    console.log('✅ 変換完了:\n', result);
    return result;
}

// 個別券種のデータを変換
function convertTicket(ticketName, ticketData) {
    const lines = [ticketName];

    // 馬番の組み合わせ
    if (ticketData.combinations && ticketData.combinations.length > 0) {
        // 複数行の馬番を1行ずつ追加
        ticketData.combinations.forEach(combo => {
            // スペースを適切な区切り文字に変換
            const formatted = formatCombination(combo, ticketName);
            lines.push(formatted);
        });
    }

    // 払い戻し金額
    if (ticketData.payouts && ticketData.payouts.length > 0) {
        ticketData.payouts.forEach(payout => {
            lines.push(payout);
        });
    }

    // 人気
    if (ticketData.popularities && ticketData.popularities.length > 0) {
        ticketData.popularities.forEach(popularity => {
            lines.push(`${popularity}人気`);
        });
    }

    return lines;
}

// 馬番の組み合わせを適切な形式にフォーマット
function formatCombination(combo, ticketName) {
    // 既に適切な区切り文字がある場合はそのまま
    if (combo.includes('-') || combo.includes('→')) {
        return combo;
    }

    // スペース区切りの数字を適切な区切り文字に変換
    const numbers = combo.split(/\s+/).filter(n => n);

    // 券種によって区切り文字を変える
    if (ticketName === '馬単' || ticketName === '3連単') {
        // 順序あり: → で結合
        return numbers.join(' ');
    } else if (ticketName === '馬連' || ticketName === 'ワイド' || ticketName === '3連複') {
        // 順序なし: - で結合（または複数行の場合はスペース）
        if (numbers.length === 1) {
            return numbers[0];
        }
        return numbers.join(' ');
    } else {
        // 単勝、複勝など: 単一の数字
        return numbers.join('\n');
    }
}
