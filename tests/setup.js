// Jestのセットアップファイル
// DOMモック、グローバル変数の設定など

// LocalStorageのモック
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }

  get length() {
    return Object.keys(this.store).length;
  }

  key(index) {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

global.localStorage = new LocalStorageMock();

// Documentのモックメソッド（必要に応じて追加）
global.document.body.insertBefore = jest.fn((newNode, referenceNode) => {
  return newNode;
});

// CONFIGグローバル変数のモック
global.CONFIG = {
  popularityMap: {
    '①': 1, '②': 2, '③': 3, '④': 4, '⑤': 5, '⑥': 6, '⑦': 7, '⑧': 8,
    '⑨': 9, '⑩': 10, '⑪': 11, '⑫': 12, '⑬': 13, '⑭': 14, '⑮': 15, '⑯': 16
  },
  racetracks: [
    '東京', '京都', '中山', '阪神', '中京', '新潟',
    '札幌', '函館', '福島', '小倉'
  ],
  betTypes: {
    tansho: '単勝',
    fukusho: '複勝',
    umaren: '馬連',
    umatan: '馬単',
    wide: 'ワイド',
    sanrenpuku: '3連複',
    sanrentan: '3連単'
  }
};
