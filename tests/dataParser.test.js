// dataParser.jsのテスト
const CONFIG = require('../js/config.js');
const Utils = require('../js/utils.js');
const DataParser = require('../js/dataParser.js');

describe('DataParser', () => {
  let parser;

  beforeEach(() => {
    parser = new DataParser();
  });

  describe('parseHorseInfo', () => {
    test('馬名と人気を正しく解析', () => {
      const result = parser.parseHorseInfo('サンプル馬①');
      expect(result.name).toBe('サンプル馬');
      expect(result.popularity).toBe(1);
    });

    test('人気記号がない場合はnull', () => {
      const result = parser.parseHorseInfo('サンプル馬');
      expect(result.name).toBe('サンプル馬');
      expect(result.popularity).toBeNull();
    });
  });

  describe('parseHorseCountData', () => {
    test('基本的な頭立て数データを解析', () => {
      const horseCountData = `1R
10頭
2R
12頭`;

      const { horseCounts } = parser.parseHorseCountData(horseCountData);

      expect(horseCounts['1R']).toBe(10);
      expect(horseCounts['2R']).toBe(12);
    });

    test('空のデータは空のオブジェクトを返す', () => {
      const { horseCounts, detectedRacetrack } = parser.parseHorseCountData('');

      expect(horseCounts).toEqual({});
      expect(detectedRacetrack).toBeNull();
    });
  });
});
