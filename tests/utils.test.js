// utils.jsのテスト
const Utils = require('../js/utils.js');

describe('Utils', () => {
  describe('formatDate', () => {
    test('正しい日付フォーマットを返す', () => {
      const result = Utils.formatDate('2024-01-15');
      expect(result).toBe('2024年1月15日');
    });

    test('異なる月の日付を正しくフォーマットする', () => {
      const result = Utils.formatDate('2024-12-31');
      expect(result).toBe('2024年12月31日');
    });
  });

  describe('extractTrackType', () => {
    test('芝コースを正しく抽出', () => {
      expect(Utils.extractTrackType('芝1600')).toBe('芝');
    });

    test('ダートコースを正しく抽出', () => {
      expect(Utils.extractTrackType('ダ1800')).toBe('ダート');
    });

    test('障害コースを正しく抽出', () => {
      expect(Utils.extractTrackType('障3000')).toBe('障害');
    });

    test('不明なコースタイプは空文字を返す', () => {
      expect(Utils.extractTrackType('Unknown')).toBe('');
    });
  });

  describe('extractDistance', () => {
    test('距離を正しく抽出', () => {
      expect(Utils.extractDistance('芝1600')).toBe('1600');
    });

    test('ダートの距離を正しく抽出', () => {
      expect(Utils.extractDistance('ダ1800')).toBe('1800');
    });

    test('障害の距離を正しく抽出', () => {
      expect(Utils.extractDistance('障3000')).toBe('3000');
    });

    test('数字がない場合は空文字を返す', () => {
      expect(Utils.extractDistance('芝')).toBe('');
    });
  });

  describe('extractTrackCondition', () => {
    test('良馬場を正しく抽出', () => {
      expect(Utils.extractTrackCondition('良・晴')).toBe('良');
    });

    test('稍重馬場を正しく抽出', () => {
      expect(Utils.extractTrackCondition('稍重・曇')).toBe('稍重');
    });

    test('重馬場を正しく抽出', () => {
      expect(Utils.extractTrackCondition('重・雨')).toBe('重');
    });

    test('不良馬場を正しく抽出', () => {
      expect(Utils.extractTrackCondition('不良・雨')).toBe('不良');
    });
  });

  describe('normalizeTrackCondition', () => {
    test('稍を稍重に正規化', () => {
      expect(Utils.normalizeTrackCondition('稍')).toBe('稍重');
    });

    test('稍重はそのまま', () => {
      expect(Utils.normalizeTrackCondition('稍重')).toBe('稍重');
    });

    test('良はそのまま', () => {
      expect(Utils.normalizeTrackCondition('良')).toBe('良');
    });

    test('重はそのまま', () => {
      expect(Utils.normalizeTrackCondition('重')).toBe('重');
    });

    test('不良はそのまま', () => {
      expect(Utils.normalizeTrackCondition('不良')).toBe('不良');
    });

    test('未知の条件はそのまま返す', () => {
      expect(Utils.normalizeTrackCondition('未知')).toBe('未知');
    });
  });

  describe('extractWeather', () => {
    test('晴天を正しく抽出', () => {
      expect(Utils.extractWeather('良・晴')).toBe('晴');
    });

    test('曇天を正しく抽出', () => {
      expect(Utils.extractWeather('稍重・曇')).toBe('曇');
    });

    test('雨天を正しく抽出', () => {
      expect(Utils.extractWeather('重・雨')).toBe('雨');
    });

    test('天候情報がない場合は空文字を返す', () => {
      expect(Utils.extractWeather('良')).toBe('');
    });
  });

  describe('createWidePattern', () => {
    test('小さい順にソートされたパターンを作成', () => {
      expect(Utils.createWidePattern(3, 1)).toBe('1-3');
    });

    test('既にソート済みの場合もそのまま', () => {
      expect(Utils.createWidePattern(1, 3)).toBe('1-3');
    });

    test('同じ数値でも正しく処理', () => {
      expect(Utils.createWidePattern(5, 5)).toBe('5-5');
    });

    test('数値文字列でも正しく処理', () => {
      expect(Utils.createWidePattern('10', '2')).toBe('2-10');
    });
  });

  describe('createTriplePattern', () => {
    test('3つの数値を小さい順にソート', () => {
      expect(Utils.createTriplePattern(3, 1, 2)).toBe('1-2-3');
    });

    test('既にソート済みの場合もそのまま', () => {
      expect(Utils.createTriplePattern(1, 2, 3)).toBe('1-2-3');
    });

    test('逆順でも正しくソート', () => {
      expect(Utils.createTriplePattern(5, 3, 1)).toBe('1-3-5');
    });

    test('数値文字列でも正しく処理', () => {
      expect(Utils.createTriplePattern('10', '2', '5')).toBe('2-5-10');
    });
  });

  describe('parsePayoutAmount', () => {
    test('カンマ付き金額を正しくパース', () => {
      expect(Utils.parsePayoutAmount('1,234円')).toBe(1234);
    });

    test('円マークなしでも正しくパース', () => {
      expect(Utils.parsePayoutAmount('5000')).toBe(5000);
    });

    test('複数のカンマがあっても正しくパース', () => {
      expect(Utils.parsePayoutAmount('1,234,567円')).toBe(1234567);
    });

    test('数字のみの文字列', () => {
      expect(Utils.parsePayoutAmount('999')).toBe(999);
    });
  });

  describe('parsePopularityText', () => {
    test('人気テキストから数値を抽出', () => {
      expect(Utils.parsePopularityText('1人気')).toBe(1);
    });

    test('2桁の人気を正しく抽出', () => {
      expect(Utils.parsePopularityText('15人気')).toBe(15);
    });

    test('人気情報がない場合はnullを返す', () => {
      expect(Utils.parsePopularityText('未知')).toBeNull();
    });

    test('空文字列の場合はnullを返す', () => {
      expect(Utils.parsePopularityText('')).toBeNull();
    });
  });
});
