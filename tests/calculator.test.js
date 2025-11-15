// calculator.jsのテスト
const CONFIG = require('../js/config.js');
const Utils = require('../js/utils.js');
const Statistics = require('../js/statistics.js');
const Calculator = require('../js/calculator.js');

describe('Calculator', () => {
  let calculator;
  const mockRaces = [
    {
      racetrack: '東京',
      date: '2024-01-01',
      results: [
        { position: 1, popularity: 1 },
        { position: 2, popularity: 2 },
        { position: 3, popularity: 3 }
      ]
    }
  ];

  beforeEach(() => {
    calculator = new Calculator(mockRaces);
  });

  describe('parsePopularities', () => {
    test('カンマ区切りの文字列を数値配列にパース', () => {
      const result = calculator.parsePopularities('1,2,3');
      expect(result).toEqual([1, 2, 3]);
    });

    test('スペースを含む入力を正しく処理', () => {
      const result = calculator.parsePopularities('1, 2, 3');
      expect(result).toEqual([1, 2, 3]);
    });

    test('範囲外の値をフィルタリング（1-16のみ有効）', () => {
      const result = calculator.parsePopularities('0,1,16,17');
      expect(result).toEqual([1, 16]);
    });

    test('無効な値を除外', () => {
      const result = calculator.parsePopularities('1,abc,3');
      expect(result).toEqual([1, 3]);
    });

    test('空文字列の場合は空配列を返す', () => {
      const result = calculator.parsePopularities('');
      expect(result).toEqual([]);
    });

    test('nullの場合は空配列を返す', () => {
      const result = calculator.parsePopularities(null);
      expect(result).toEqual([]);
    });

    test('undefinedの場合は空配列を返す', () => {
      const result = calculator.parsePopularities(undefined);
      expect(result).toEqual([]);
    });
  });

  describe('generateCombinations', () => {
    test('2つの配列から組み合わせを生成（順不同）', () => {
      const result = calculator.generateCombinations([1, 2], [3, 4]);
      expect(result).toEqual([
        [1, 3],
        [1, 4],
        [2, 3],
        [2, 4]
      ]);
    });

    test('重複する組み合わせを除外', () => {
      const result = calculator.generateCombinations([1, 2], [2, 3]);
      expect(result).toHaveLength(3);
      expect(result).toContainEqual([1, 2]);
      expect(result).toContainEqual([1, 3]);
      expect(result).toContainEqual([2, 3]);
    });

    test('同じ人気は除外', () => {
      const result = calculator.generateCombinations([1], [1]);
      expect(result).toEqual([]);
    });

    test('順序が異なる同じ組み合わせを統合', () => {
      const result = calculator.generateCombinations([1, 3], [3, 1]);
      expect(result).toEqual([[1, 3]]);
    });

    test('空配列の場合は空の結果を返す', () => {
      const result = calculator.generateCombinations([], [1, 2]);
      expect(result).toEqual([]);
    });
  });

  describe('generatePermutations', () => {
    test('2つの配列から順列を生成（順序あり）', () => {
      const result = calculator.generatePermutations([1, 2], [3, 4]);
      expect(result).toEqual([
        [1, 3],
        [1, 4],
        [2, 3],
        [2, 4]
      ]);
    });

    test('順序が重要（順列）', () => {
      const result = calculator.generatePermutations([1], [2]);
      expect(result).toEqual([[1, 2]]);

      const result2 = calculator.generatePermutations([2], [1]);
      expect(result2).toEqual([[2, 1]]);
    });

    test('同じ人気は除外', () => {
      const result = calculator.generatePermutations([1, 2], [2, 3]);
      expect(result).toHaveLength(3);
      expect(result).toContainEqual([1, 2]);
      expect(result).toContainEqual([1, 3]);
      expect(result).toContainEqual([2, 3]);
    });

    test('空配列の場合は空の結果を返す', () => {
      const result = calculator.generatePermutations([], [1, 2]);
      expect(result).toEqual([]);
    });
  });

  describe('generateTripleCombinations', () => {
    test('3つの配列から組み合わせを生成（順不同）', () => {
      const result = calculator.generateTripleCombinations([1], [2], [3]);
      expect(result).toEqual([[1, 2, 3]]);
    });

    test('複数の組み合わせを生成', () => {
      const result = calculator.generateTripleCombinations([1], [2, 3], [4]);
      expect(result).toHaveLength(2);
      expect(result).toContainEqual([1, 2, 4]);
      expect(result).toContainEqual([1, 3, 4]);
    });

    test('重複する組み合わせを除外', () => {
      const result = calculator.generateTripleCombinations([1, 2], [2, 3], [3, 4]);
      const hasInvalidCombination = result.some(combo => {
        return combo[0] === combo[1] || combo[1] === combo[2] || combo[0] === combo[2];
      });
      expect(hasInvalidCombination).toBe(false);
    });

    test('順序が異なる同じ組み合わせを統合', () => {
      const result = calculator.generateTripleCombinations([1, 3], [2], [3, 1]);
      expect(result).toEqual([[1, 2, 3]]);
    });

    test('空配列の場合は空の結果を返す', () => {
      const result = calculator.generateTripleCombinations([], [1], [2]);
      expect(result).toEqual([]);
    });
  });

  describe('generateTriplePermutations', () => {
    test('3つの配列から順列を生成（順序あり）', () => {
      const result = calculator.generateTriplePermutations([1], [2], [3]);
      expect(result).toEqual([[1, 2, 3]]);
    });

    test('複数の順列を生成', () => {
      const result = calculator.generateTriplePermutations([1], [2, 3], [4]);
      expect(result).toHaveLength(2);
      expect(result).toContainEqual([1, 2, 4]);
      expect(result).toContainEqual([1, 3, 4]);
    });

    test('順序が重要（順列）', () => {
      const result1 = calculator.generateTriplePermutations([1], [2], [3]);
      const result2 = calculator.generateTriplePermutations([3], [2], [1]);
      expect(result1).toEqual([[1, 2, 3]]);
      expect(result2).toEqual([[3, 2, 1]]);
      expect(result1).not.toEqual(result2);
    });

    test('同じ人気を含む順列を除外', () => {
      const result = calculator.generateTriplePermutations([1, 2], [2, 3], [3, 4]);
      const hasInvalidPermutation = result.some(perm => {
        return perm[0] === perm[1] || perm[1] === perm[2] || perm[0] === perm[2];
      });
      expect(hasInvalidPermutation).toBe(false);
    });

    test('空配列の場合は空の結果を返す', () => {
      const result = calculator.generateTriplePermutations([], [1], [2]);
      expect(result).toEqual([]);
    });
  });

  describe('組み合わせと順列の違い', () => {
    test('組み合わせは[1,2]と[2,1]を同一視', () => {
      const combinations = calculator.generateCombinations([1, 2], [1, 2]);
      const hasReverse = combinations.some(combo =>
        JSON.stringify(combo) === JSON.stringify([2, 1])
      );
      expect(hasReverse).toBe(false);
    });

    test('順列は[1,2]と[2,1]を別物として扱う', () => {
      const permutations = calculator.generatePermutations([1, 2], [1, 2]);
      expect(permutations).toContainEqual([1, 2]);
      expect(permutations).toContainEqual([2, 1]);
    });
  });
});
