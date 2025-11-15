module.exports = {
  // テスト環境をJSDOMに設定（ブラウザAPI互換）
  testEnvironment: 'jsdom',

  // テストファイルのパターン
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js'
  ],

  // カバレッジ収集対象
  collectCoverageFrom: [
    'js/**/*.js',
    '!js/app.js', // app.jsはDOM依存が大きいため除外
    '!**/node_modules/**'
  ],

  // カバレッジレポートの形式
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],

  // カバレッジのしきい値（プロジェクト開始時は低めに設定）
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 15,
      lines: 15,
      statements: 15
    }
  },

  // セットアップファイル
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // モジュール変換
  transform: {
    '^.+\\.js$': 'babel-jest'
  },

  // モジュールパス
  moduleDirectories: ['node_modules', 'js'],

  // テストタイムアウト
  testTimeout: 10000,

  // 詳細出力
  verbose: true
};
