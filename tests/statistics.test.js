// statistics.jsのテスト
const CONFIG = require('../js/config.js');
const Utils = require('../js/utils.js');
const Statistics = require('../js/statistics.js');

describe('Statistics', () => {
  let statistics;
  let mockRaces;

  beforeEach(() => {
    mockRaces = [
      {
        racetrack: '東京',
        date: '2024-01-01',
        number: '1R',
        results: [
          { position: 1, number: 1, popularity: 1 },
          { position: 2, number: 2, popularity: 2 },
          { position: 3, number: 3, popularity: 3 }
        ]
      },
      {
        racetrack: '東京',
        date: '2024-01-01',
        number: '2R',
        results: [
          { position: 1, number: 5, popularity: 3 },
          { position: 2, number: 1, popularity: 1 },
          { position: 3, number: 8, popularity: 5 }
        ]
      }
    ];

    statistics = new Statistics(mockRaces);
  });

  describe('calculateTanshoStats', () => {
    test('単勝統計を正しく計算', () => {
      const allResults = mockRaces.flatMap(race => race.results);
      const stats = statistics.calculateTanshoStats(allResults);

      // 1番人気が2レース中1勝
      expect(stats[1].wins).toBe(1);
      expect(stats[1].total).toBe(2);
    });

    test('全ての人気（1-16）の統計が初期化される', () => {
      const allResults = mockRaces.flatMap(race => race.results);
      const stats = statistics.calculateTanshoStats(allResults);

      for (let i = 1; i <= 16; i++) {
        expect(stats[i]).toBeDefined();
        expect(stats[i].total).toBe(2);
      }
    });
  });

  describe('calculateFukushoStats', () => {
    test('複勝統計を正しく計算', () => {
      const allResults = mockRaces.flatMap(race => race.results);
      const stats = statistics.calculateFukushoStats(allResults);

      // 1番人気は全2レースで3着以内
      expect(stats[1].hits).toBe(2);
      expect(stats[1].total).toBe(2);
      expect(stats[1].winRate).toBe(100);
    });
  });
});
