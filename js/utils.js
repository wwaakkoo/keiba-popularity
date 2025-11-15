// ユーティリティ関数
class Utils {
    static showMessage(message, type = 'info') {
        // 既存のメッセージを削除
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message message--${type}`;
        messageDiv.innerHTML = `
            <div class="message__content">
                ${message}
                <button class="message__close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        document.body.insertBefore(messageDiv, document.body.firstChild);

        // 5秒後に自動削除
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    static showError(message) {
        this.showMessage(message, 'error');
    }

    static showSuccess(message) {
        this.showMessage(message, 'success');
    }

    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    static extractTrackType(condition) {
        if (condition.startsWith('芝')) return '芝';
        if (condition.startsWith('ダ')) return 'ダート';
        if (condition.startsWith('障')) return '障害';
        return '';
    }

    static extractDistance(condition) {
        const match = condition.match(/(\d+)/);
        return match ? match[1] : '';
    }

    static extractTrackCondition(trackWeather) {
        const parts = trackWeather.split('・');
        const condition = parts[0] || '';
        return this.normalizeTrackCondition(condition);
    }

    static normalizeTrackCondition(condition) {
        const conditionMap = {
            '稍': '稍重',
            '稍重': '稍重',
            '良': '良',
            '重': '重',
            '不良': '不良'
        };
        return conditionMap[condition] || condition;
    }

    static extractWeather(trackWeather) {
        const parts = trackWeather.split('・');
        return parts[1] || '';
    }

    static createWidePattern(pop1, pop2) {
        const sorted = [pop1, pop2].sort((a, b) => parseInt(a) - parseInt(b));
        return `${sorted[0]}-${sorted[1]}`;
    }

    static createTriplePattern(pop1, pop2, pop3) {
        const sorted = [pop1, pop2, pop3].sort((a, b) => parseInt(a) - parseInt(b));
        return `${sorted[0]}-${sorted[1]}-${sorted[2]}`;
    }

    static parsePayoutAmount(payoutStr) {
        return parseInt(payoutStr.replace(/[^\d]/g, ''));
    }

    static parsePopularityText(popularityStr) {
        const match = popularityStr.match(/(\d+)人気/);
        return match ? parseInt(match[1]) : null;
    }
}

// Node.js環境用のエクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}