// netkeiba.comのレース結果ページからデータを抽出するコンテンツスクリプト
const EXTENSION_VERSION = '1.4.0';

console.log(`🏇 netkeiba払い戻しデータ取得 v${EXTENSION_VERSION} - content.js loaded`);

// ページから払い戻しデータを抽出する関数
function extractPayoutData() {
    console.log('📊 払い戻しデータ抽出開始');

    try {
        // レース番号を取得（URLから）
        const urlParams = new URLSearchParams(window.location.search);
        const raceId = urlParams.get('race_id');
        if (!raceId || raceId.length < 12) {
            throw new Error('race_idが取得できません');
        }

        // レース番号を抽出（最後の2桁）
        const raceNumber = parseInt(raceId.slice(-2));
        console.log(`📍 レース番号: ${raceNumber}R`);

        // 払い戻しテーブルを探す
        const payoutSection = findPayoutSection();
        if (!payoutSection) {
            throw new Error('払い戻しセクションが見つかりません');
        }

        // 各券種のデータを抽出
        const payoutData = {
            raceNumber: raceNumber,
            tansho: extractTicketData(payoutSection, '単勝'),
            fukusho: extractTicketData(payoutSection, '複勝'),
            wakuren: extractTicketData(payoutSection, '枠連'),
            umaren: extractTicketData(payoutSection, '馬連'),
            wide: extractTicketData(payoutSection, 'ワイド'),
            umatan: extractTicketData(payoutSection, '馬単'),
            sanrenpuku: extractTicketData(payoutSection, '3連複'),
            sanrentan: extractTicketData(payoutSection, '3連単')
        };

        console.log('✅ データ抽出完了:', payoutData);
        return payoutData;

    } catch (error) {
        console.error('❌ データ抽出エラー:', error);
        throw error;
    }
}

// 払い戻しセクションを見つける
function findPayoutSection() {
    console.log('🔍 払い戻しセクションを検索中...');

    // アプローチ1: table要素を探す（最も一般的）
    // 複数のテーブルに分かれている可能性があるため、全て取得
    const tables = document.querySelectorAll('table');
    const payoutTables = [];

    for (const table of tables) {
        const text = table.textContent;
        // 券種が1つでも含まれているテーブルを収集
        const hasTicketType = text.includes('単勝') || text.includes('複勝') ||
                             text.includes('馬連') || text.includes('馬単') ||
                             text.includes('ワイド') || text.includes('3連複') || text.includes('3連単') ||
                             text.includes('枠連');

        if (hasTicketType) {
            console.log('📍 払い戻しテーブル候補発見:', text.substring(0, 100));
            payoutTables.push(table);
        }
    }

    // 複数のテーブルをラップする親要素を作成
    if (payoutTables.length > 0) {
        if (payoutTables.length === 1) {
            console.log('📍 払い戻しテーブル発見（単一table）');
            return payoutTables[0];
        } else {
            console.log(`📍 払い戻しテーブル発見（${payoutTables.length}個のtableを統合）`);
            // 複数テーブルを仮想的に統合
            const wrapper = document.createElement('div');
            wrapper.setAttribute('data-combined-tables', 'true');
            payoutTables.forEach(table => {
                wrapper.appendChild(table.cloneNode(true));
            });
            return wrapper;
        }
    }

    // アプローチ2: 「払い戻し」という見出しから探す
    const allElements = document.querySelectorAll('*');
    for (const el of allElements) {
        const ownText = Array.from(el.childNodes)
            .filter(node => node.nodeType === Node.TEXT_NODE)
            .map(node => node.textContent.trim())
            .join('');

        if (ownText.includes('払い戻し') || ownText.includes('ʧ���ᤷ')) {
            // 次の兄弟要素または親の次の兄弟から探す
            let section = el.nextElementSibling;
            if (!section) section = el.parentElement?.nextElementSibling;

            if (section) {
                console.log('📍 払い戻しセクション発見（見出しから）');
                return section;
            }
        }
    }

    // アプローチ3: dl要素から探す
    const dlElements = document.querySelectorAll('dl');
    for (const dl of dlElements) {
        const text = dl.textContent;
        if ((text.includes('単勝') || text.includes('ñ��')) &&
            (text.includes('複勝') || text.includes('ʣ��'))) {
            console.log('📍 払い戻しテーブル発見（dl）');
            return dl;
        }
    }

    // アプローチ4: クラス名から探す（netkeiba特有のクラス）
    const payoutClasses = [
        '.払い戻し',
        '.haramodoshi',
        '.payout',
        '[class*="払"]',
        '[class*="pay"]'
    ];

    for (const selector of payoutClasses) {
        try {
            const element = document.querySelector(selector);
            if (element) {
                console.log(`📍 払い戻しセクション発見（${selector}）`);
                return element;
            }
        } catch (e) {
            // 無効なセレクタは無視
        }
    }

    console.warn('❌ 払い戻しセクションが見つかりませんでした');
    return null;
}

// 特定の券種のデータを抽出
function extractTicketData(section, ticketType) {
    console.log(`🎫 ${ticketType}データ抽出中...`);

    try {
        // まず全テキストを取得してデバッグ
        const fullText = section.textContent;
        console.log(`  セクション全文（最初の500文字）:`, fullText.substring(0, 500));

        // table構造または統合されたtable群の場合
        if (section.tagName === 'TABLE' || section.getAttribute('data-combined-tables') === 'true') {
            return extractFromTable(section, ticketType);
        }

        // dl構造の場合
        const dtElements = section.querySelectorAll('dt');
        let targetDt = null;

        for (const dt of dtElements) {
            const dtText = dt.textContent.trim();
            if (dtText === ticketType || dtText.includes(ticketType)) {
                targetDt = dt;
                break;
            }
        }

        if (!targetDt) {
            console.log(`⚠️ ${ticketType}が見つかりません（dt要素）`);
            // テキスト全体から直接検索
            return extractFromText(fullText, ticketType);
        }

        // 対応するdd要素を取得
        let dd = targetDt.nextElementSibling;
        while (dd && dd.tagName !== 'DD') {
            dd = dd.nextElementSibling;
        }

        if (!dd) {
            console.log(`⚠️ ${ticketType}のデータ要素が見つかりません（dd要素）`);
            return null;
        }

        // ddの内容を解析
        const text = dd.textContent.trim();
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);

        console.log(`  ${ticketType}生データ:`, lines);

        // データを解析
        const result = parseTicketLines(lines, ticketType);
        console.log(`  ${ticketType}解析結果:`, result);

        return result;

    } catch (error) {
        console.error(`❌ ${ticketType}抽出エラー:`, error);
        return null;
    }
}

// table構造からデータを抽出
function extractFromTable(table, ticketType) {
    console.log(`  table構造から${ticketType}を抽出`);

    const rows = table.querySelectorAll('tr');

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.querySelectorAll('th, td');

        // 最初のセルが券種名かチェック
        if (cells.length > 0) {
            const firstCell = cells[0].textContent.trim();
            if (firstCell === ticketType || firstCell.includes(ticketType)) {
                console.log(`  ${ticketType}行を発見:`, row.textContent.trim());

                // この行からデータを抽出
                const rowText = row.textContent.trim();
                return extractFromRowText(rowText, ticketType);
            }
        }
    }

    console.log(`⚠️ ${ticketType}がtableから見つかりません`);
    return null;
}

// 行のテキストからデータを抽出
function extractFromRowText(text, ticketType) {
    console.log(`  行テキスト解析:`, text);

    // テキストを分割（タブ、スペース、改行など）
    const parts = text.split(/[\t\n]+/).map(p => p.trim()).filter(p => p && p !== ticketType);

    console.log(`  分割されたパーツ:`, parts);

    const result = {
        combinations: [],
        payouts: [],
        popularities: []
    };

    // 馬番を収集
    const horseNumbers = [];

    // パーツを解析
    for (const part of parts) {
        // 馬番のパターン（純粋な数字のみ）
        if (/^\d+$/.test(part) && !part.includes('円') && !part.includes('人気')) {
            horseNumbers.push(part);
        }
        // 払い戻し金額（複数の金額が連結している場合も対応）
        else if (part.includes('円')) {
            // "110円120円120円" や "2,290円" のような連結やカンマ付き金額を分割
            // カンマを含む数字にも対応: /[\d,]+円/g
            const amounts = part.match(/[\d,]+円/g);
            if (amounts) {
                for (const amount of amounts) {
                    const num = amount.replace(/[,円]/g, '').trim();
                    if (num && /^\d+$/.test(num)) {
                        result.payouts.push(num);
                    }
                }
            }
        }
        // 人気（複数の人気が連結している場合も対応）
        else if (part.includes('人気')) {
            // "1人気3人気2人気" のような連結を分割
            const pops = part.match(/\d+人気/g);
            if (pops) {
                for (const pop of pops) {
                    const num = pop.replace('人気', '').trim();
                    if (num && /^\d+$/.test(num)) {
                        result.popularities.push(num);
                    }
                }
            }
        }
    }

    // 馬番を適切な形式に変換
    if (horseNumbers.length > 0) {
        if (ticketType === '単勝' || ticketType === '複勝') {
            // 単勝・複勝: 各馬番を個別に
            result.combinations = horseNumbers;
        } else if (ticketType === 'ワイド' || ticketType === '3連複' || ticketType === '3連単') {
            // ワイド・3連複・3連単: 払い戻し数に応じて馬番を分割
            const horsesPerCombo = ticketType === 'ワイド' ? 2 : 3;
            const numCombos = result.payouts.length;

            if (horseNumbers.length === horsesPerCombo * numCombos) {
                // 馬番の数が払い戻し数×馬数/組と一致する場合、分割
                result.combinations = [];
                for (let i = 0; i < numCombos; i++) {
                    const combo = horseNumbers.slice(i * horsesPerCombo, (i + 1) * horsesPerCombo);
                    result.combinations.push(combo.join(' '));
                }
                console.log(`  ${ticketType}を${numCombos}組に分割しました`);
            } else {
                // 一致しない場合はフォールバック（全体を1組として）
                result.combinations = [horseNumbers.join(' ')];
                console.warn(`  ${ticketType}の馬番数が不一致（馬番:${horseNumbers.length}, 期待:${horsesPerCombo * numCombos}）`);
            }
        } else {
            // その他（馬連・馬単・枠連など）: スペース区切りで結合
            result.combinations = [horseNumbers.join(' ')];
        }
    }

    console.log(`  抽出結果:`, result);
    return result.combinations.length > 0 || result.payouts.length > 0 ? result : null;
}

// テキスト全体から直接抽出（フォールバック）
function extractFromText(fullText, ticketType) {
    console.log(`  テキスト全体から${ticketType}を直接検索`);

    const ticketIndex = fullText.indexOf(ticketType);
    if (ticketIndex === -1) {
        console.log(`⚠️ ${ticketType}がテキストから見つかりません`);
        return null;
    }

    // 券種名以降のテキストを抽出（次の券種まで）
    const afterTicket = fullText.substring(ticketIndex + ticketType.length);
    const nextTickets = ['単勝', '複勝', '枠連', '馬連', 'ワイド', '馬単', '3連複', '3連単'];

    let endIndex = afterTicket.length;
    for (const nextTicket of nextTickets) {
        if (nextTicket !== ticketType) {
            const idx = afterTicket.indexOf(nextTicket);
            if (idx !== -1 && idx < endIndex) {
                endIndex = idx;
            }
        }
    }

    const ticketData = afterTicket.substring(0, endIndex).trim();
    console.log(`  ${ticketType}部分のテキスト:`, ticketData.substring(0, 200));

    return extractFromRowText(ticketData, ticketType);
}

// 券種ごとのテキストデータを解析
function parseTicketLines(lines, ticketType) {
    // 基本的なパターン: 馬番、払い戻し金額、人気が順に並ぶ
    // 複勝・ワイドなどは複数組み合わせがある

    const result = {
        combinations: [],  // 馬番の組み合わせ
        payouts: [],       // 払い戻し金額
        popularities: []   // 人気順位
    };

    // 3つのグループに分ける
    let currentGroup = 0; // 0: 馬番, 1: 払い戻し, 2: 人気

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 馬番のパターン（数字のみ、または数字と空白・ハイフン）
        if (currentGroup === 0 && /^[\d\s-]+$/.test(line)) {
            result.combinations.push(line.trim());
        }
        // 払い戻し金額のパターン（数字 + 「円」）
        else if (line.includes('円')) {
            currentGroup = 1;
            const amount = line.replace(/[,円]/g, '');
            result.payouts.push(amount);
        }
        // 人気のパターン（数字 + 「人気」）
        else if (line.includes('人気')) {
            currentGroup = 2;
            const popularity = line.replace('人気', '');
            result.popularities.push(popularity);
        }
    }

    console.log(`  解析詳細 - 組み合わせ: ${result.combinations.length}, 払い戻し: ${result.payouts.length}, 人気: ${result.popularities.length}`);

    return result;
}

// メッセージリスナー（popup.jsからのリクエストを受け取る）
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('📨 メッセージ受信:', request);

    if (request.action === 'extractData') {
        try {
            const data = extractPayoutData();
            sendResponse({ success: true, data: data });
        } catch (error) {
            sendResponse({ success: false, error: error.message });
        }
    }

    return true; // 非同期レスポンスを有効化
});

console.log('✅ content.js初期化完了 - メッセージリスナー登録済み');
