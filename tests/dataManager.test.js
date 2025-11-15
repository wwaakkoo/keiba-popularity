// dataManager.jsのテスト
const CONFIG = require('../js/config.js');
const Utils = require('../js/utils.js');

// Utilsをグローバルに設定（DataManagerが参照するため）
global.Utils = Utils;

const DataManager = require('../js/dataManager.js');

describe('DataManager', () => {
  let dataManager;

  beforeEach(() => {
    localStorage.clear();
    dataManager = new DataManager();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('コンストラクタ', () => {
    test('初期化時にLocalStorageからデータを読み込む', () => {
      const testData = [{
        id: 1,
        racetrack: '東京',
        date: '2024-01-01',
        races: [],
        createdAt: new Date().toISOString()
      }];

      localStorage.setItem('raceAnalyzerData', JSON.stringify(testData));

      const manager = new DataManager();
      expect(manager.savedDataSets).toEqual(testData);
    });

    test('データがない場合は空配列を設定', () => {
      const manager = new DataManager();
      expect(manager.savedDataSets).toEqual([]);
    });

    test('古いデータキー（horseRaceData）から新しいキーに移行', () => {
      const oldData = [{
        id: 1,
        racetrack: '京都',
        date: '2024-01-01',
        races: []
      }];

      localStorage.setItem('horseRaceData', JSON.stringify(oldData));

      const manager = new DataManager();
      expect(manager.savedDataSets.length).toBeGreaterThan(0);
      expect(localStorage.getItem('raceAnalyzerData')).not.toBeNull();
    });
  });

  describe('saveDataToStorage', () => {
    test('データをLocalStorageに保存', () => {
      dataManager.savedDataSets = [{
        id: 1,
        racetrack: '東京',
        date: '2024-01-01',
        races: []
      }];

      dataManager.saveDataToStorage();

      const saved = localStorage.getItem('raceAnalyzerData');
      expect(saved).not.toBeNull();
      expect(JSON.parse(saved)).toEqual(dataManager.savedDataSets);
    });

    test('空のデータを保存できる', () => {
      dataManager.savedDataSets = [];
      dataManager.saveDataToStorage();

      const saved = localStorage.getItem('raceAnalyzerData');
      expect(JSON.parse(saved)).toEqual([]);
    });
  });

  describe('saveCurrentData', () => {
    test('新規データを保存', () => {
      const mockRaces = [
        { number: '1R', name: 'テストレース' }
      ];

      global.confirm = jest.fn(() => true);

      const result = dataManager.saveCurrentData(mockRaces, '東京', '2024-01-01');

      expect(result).not.toBeNull();
      expect(result.racetrack).toBe('東京');
      expect(result.date).toBe('2024-01-01');
      expect(result.races).toEqual(mockRaces);
      expect(dataManager.savedDataSets).toHaveLength(1);
    });

    test('データがない場合はエラー', () => {
      const showErrorSpy = jest.spyOn(Utils, 'showError');

      dataManager.saveCurrentData([], '東京', '2024-01-01');

      expect(showErrorSpy).toHaveBeenCalledWith('保存するデータがありません');
    });

    test('同じ競馬場・日付のデータは確認後に上書き', () => {
      const mockRaces1 = [{ number: '1R' }];
      const mockRaces2 = [{ number: '1R' }, { number: '2R' }];

      global.confirm = jest.fn(() => true);

      dataManager.saveCurrentData(mockRaces1, '東京', '2024-01-01');
      expect(dataManager.savedDataSets).toHaveLength(1);

      dataManager.saveCurrentData(mockRaces2, '東京', '2024-01-01');

      expect(dataManager.savedDataSets).toHaveLength(1);
      expect(dataManager.savedDataSets[0].races).toHaveLength(2);
    });

    test('上書き確認でキャンセルした場合は保存しない', () => {
      const mockRaces1 = [{ number: '1R' }];
      const mockRaces2 = [{ number: '1R' }, { number: '2R' }];

      global.confirm = jest.fn(() => false);

      dataManager.saveCurrentData(mockRaces1, '東京', '2024-01-01');
      const firstCount = dataManager.savedDataSets[0].races.length;

      const result = dataManager.saveCurrentData(mockRaces2, '東京', '2024-01-01');

      expect(result).toBeNull();
      expect(dataManager.savedDataSets[0].races.length).toBe(firstCount);
    });
  });

  describe('deleteDataSet', () => {
    beforeEach(() => {
      dataManager.savedDataSets = [
        { id: 1, racetrack: '東京', date: '2024-01-01', races: [] },
        { id: 2, racetrack: '京都', date: '2024-01-02', races: [] }
      ];
    });

    test('データセットを削除', () => {
      global.confirm = jest.fn(() => true);

      const result = dataManager.deleteDataSet(1);

      expect(result).toBe(true);
      expect(dataManager.savedDataSets).toHaveLength(1);
      expect(dataManager.savedDataSets[0].id).toBe(2);
    });

    test('削除確認でキャンセルした場合は削除しない', () => {
      global.confirm = jest.fn(() => false);

      const result = dataManager.deleteDataSet(1);

      expect(result).toBe(false);
      expect(dataManager.savedDataSets).toHaveLength(2);
    });
  });

  describe('clearAllData', () => {
    beforeEach(() => {
      dataManager.savedDataSets = [
        { id: 1, racetrack: '東京', date: '2024-01-01', races: [] },
        { id: 2, racetrack: '京都', date: '2024-01-02', races: [] }
      ];
    });

    test('すべてのデータを削除', () => {
      global.confirm = jest.fn(() => true);

      const result = dataManager.clearAllData();

      expect(result).toBe(true);
      expect(dataManager.savedDataSets).toHaveLength(0);
    });

    test('削除確認でキャンセルした場合は削除しない', () => {
      global.confirm = jest.fn(() => false);

      const result = dataManager.clearAllData();

      expect(result).toBe(false);
      expect(dataManager.savedDataSets).toHaveLength(2);
    });
  });

  describe('getAllRaces', () => {
    test('すべてのデータセットからレースを取得', () => {
      dataManager.savedDataSets = [
        {
          id: 1,
          racetrack: '東京',
          date: '2024-01-01',
          races: [
            { number: '1R', name: 'レース1' },
            { number: '2R', name: 'レース2' }
          ]
        },
        {
          id: 2,
          racetrack: '京都',
          date: '2024-01-02',
          races: [
            { number: '1R', name: 'レース3' }
          ]
        }
      ];

      const allRaces = dataManager.getAllRaces();

      expect(allRaces).toHaveLength(3);
      expect(allRaces[0].name).toBe('レース1');
      expect(allRaces[2].name).toBe('レース3');
    });

    test('データがない場合は空配列を返す', () => {
      dataManager.savedDataSets = [];

      const allRaces = dataManager.getAllRaces();

      expect(allRaces).toEqual([]);
    });

    test('races プロパティがないデータセットを安全に処理', () => {
      dataManager.savedDataSets = [
        {
          id: 1,
          racetrack: '東京',
          date: '2024-01-01'
        }
      ];

      const allRaces = dataManager.getAllRaces();

      expect(allRaces).toEqual([]);
    });
  });

  describe('getDataSets', () => {
    test('保存されたデータセットを取得', () => {
      const testData = [
        { id: 1, racetrack: '東京', date: '2024-01-01', races: [] }
      ];

      dataManager.savedDataSets = testData;

      const dataSets = dataManager.getDataSets();

      expect(dataSets).toEqual(testData);
    });
  });
});
