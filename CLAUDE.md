# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Communication Guidelines

- **言語**: ユーザーとの会話は日本語で行うこと
- **スタイル**: 簡潔な回答を心がけ、冗長な説明は避ける
- **質問への対応**: ユーザーから質問された場合は、丁寧に詳しく解説すること

## Git Workflow

- **リポジトリ**: https://github.com/wwaakkoo/keiba-popularity
- **メインブランチ**: `master` - 常に安定した状態を保つ
- **機能開発**: 新機能開発時は必ずブランチを切って作業する
  - ブランチ命名: `feature/機能名` (例: `feature/add-win5-analysis`)
  - バグ修正: `fix/修正内容` (例: `fix/payout-calculation`)
- **コミット前**: 変更内容を確認し、適切な粒度でコミットする
- **マージとクリーンアップ**:
  - 機能完成後、masterにマージしてプッシュ
  - マージ後は必ずブランチを削除する
  ```bash
  git checkout master
  git merge feature/your-feature
  git push origin master
  git branch -d feature/your-feature        # ローカルブランチ削除
  git push origin --delete feature/your-feature  # リモートブランチ削除
  ```
  - または、マージ済みブランチを一括削除（推奨）:
  ```bash
  git cleanup  # マージ済みのローカルブランチを自動削除
  ```

## Project Overview

This is a **Japanese Horse Racing Statistical Analysis System** (競馬レース結果統計分析システム) - a Progressive Web Application for analyzing horse race results and calculating expected values for various betting types.

The application is built as a client-side only web application with no backend, using LocalStorage for data persistence. It analyzes race results by popularity rankings and calculates expected values for different betting types (単勝/Win, 複勝/Place, 馬連/Quinella, 馬単/Exacta, ワイド/Wide, 3連複/Trio, 3連単/Trifecta).

## Architecture

### Technology Stack
- **Frontend**: Pure JavaScript (ES6+), no frameworks
- **UI**: Vanilla HTML5 + CSS3
- **Charts**: Chart.js (via CDN)
- **Data Storage**: LocalStorage API
- **PWA**: Service Worker (sw.js) for offline support
- **Deployment**: Netlify (static hosting)

### Core JavaScript Modules

The application uses a **class-based architecture** with vanilla JavaScript loaded via script tags (not ES6 modules due to CORS concerns):

1. **config.js** - Global configuration and constants
2. **utils.js** - Utility functions for data extraction and formatting
3. **dataManager.js** - LocalStorage CRUD operations and data migration
4. **dataParser.js** - Parses race data, horse count data, and payout data from text input
5. **statistics.js** - Statistical calculations for all betting types
6. **calculator.js** - Multi-pattern calculator for generating combinations/permutations
7. **app.js** - Main application orchestration and UI management

**Load Order**: Scripts must be loaded in the order above as they have dependencies on each other.

### Key Data Structures

**Race Object**:
```javascript
{
  racetrack: string,        // 競馬場 (Tokyo, Kyoto, etc.)
  date: string,             // YYYY-MM-DD
  number: string,           // Race number (1R, 2R, etc.)
  name: string,             // Race name
  condition: string,        // Raw condition string
  trackType: string,        // 芝/ダート/障害
  distance: number,         // Distance in meters
  trackCondition: string,   // 良/稍重/重/不良
  weather: string,          // 晴/曇/雨
  horseCount: number|null,  // Number of horses
  results: [                // 1st, 2nd, 3rd place results
    {
      position: number,     // 1, 2, or 3
      number: number,       // Horse number
      name: string,         // Horse name
      popularity: number,   // Betting popularity (1-16)
      isTied: boolean      // Whether this is a tied finish
    }
  ],
  payouts: {               // Optional payout data
    tansho: { popularity, payout },
    fukusho: [{ popularity, payout }],
    umaren: { pattern, payout },
    // ... other bet types
  }
}
```

### Data Input Formats

The application parses **tab-separated text data** from JRA (Japan Racing Association) sources:

1. **Race Data**: Tab-separated with columns: R, レース名, 条件, 馬場・天候, and alternating horse number/name+popularity for 1st-3rd place
2. **Horse Count Data**: Multi-line format with race numbers and horse counts (supports multiple formats)
3. **Payout Data**: Race-separated blocks with bet type, horse numbers/popularities, and payout amounts

### Multi-Pattern Calculator

The calculator (calculator.js) implements a key feature that generates all combinations/permutations from comma-separated popularity inputs:

- **Combinations** (順不同): For 馬連, ワイド, 3連複 - generates unique unordered sets
- **Permutations** (順序あり): For 馬単, 3連単 - generates ordered sequences
- **Deduplication**: Automatically removes invalid patterns (same popularity) and duplicates

Example: Input "1,2" for both horses in 馬連 generates: 1-2 only (not 2-1 or 1-1)

## Development Workflow

### Local Development

The application can be run directly by opening `index.html` in a browser. However, for full functionality:

```bash
# Serve locally to avoid CORS issues (optional)
python -m http.server 8000
# or
npx serve .
```

### Testing with Sample Data

The application includes hardcoded sample data in `app.js` (`loadExtendedSampleData()`) for testing without data entry.

### Data Debugging

Python utility scripts for data format validation:
- `check_data.py` - Validates race data format
- `check_data2.py` - Additional format checks
- `kitaiti.py` - Horse count data validation

## Project Management

### .kiro Directory

Contains specification documents for features (likely AI-generated or project management artifacts):
- `multi-pattern-calculator/` - Requirements for the multi-pattern calculation feature
- `payout-integration/` - Requirements for payout data integration
- `statistics-tab-fix/` - Bug fix specifications

These are **reference documents** for understanding feature requirements, not executable code.

## Common Tasks

### Adding a New Betting Type

1. Add statistical calculation method in `statistics.js` (e.g., `calculateNewBetStats()`)
2. Add calculator method in `calculator.js` if multi-pattern support needed
3. Add tab UI in `index.html`
4. Add tab event handling in `app.js` (`setupTabs()`)
5. Add chart rendering logic in `app.js`

### Modifying Data Parsing

Edit `dataParser.js`:
- `parseRaceData()` - Main race data parsing
- `parseHorseCountData()` - Horse count extraction
- `parsePayoutData()` - Payout data extraction

### Changing UI/Styling

- `style.css` - All styling (uses CSS custom properties for theming)
- `index.html` - Structure (note: very long file with inline tabs)

### Data Migration

`dataManager.js` handles LocalStorage schema migrations automatically:
- Detects old data format (`horseRaceData` key)
- Migrates to new format (`raceAnalyzerData` key)
- Preserves backward compatibility

## Deployment

### Netlify Deployment

The application is configured for Netlify deployment via `netlify.toml`:

```bash
# Using Netlify CLI
netlify deploy --prod

# Or drag-and-drop the entire directory to Netlify UI
```

**Important**: Deploy the root directory, not the `keiba-app/` subdirectory (which appears to be an older version).

### PWA Functionality

The Service Worker (`sw.js`) enables offline support. Update the cache version in `sw.js` when deploying changes.

## Important Notes

### Language and Context
- All UI text and data is in **Japanese**
- Race data follows JRA (Japan Racing Association) conventions
- Popularity rankings use circled numbers (①②③...) in source data, converted to integers by `popularityMap` in config.js

### Data Flow
1. User pastes text data → `dataParser.js` parses → creates Race objects
2. Race objects stored in `dataManager.js` → saved to LocalStorage
3. User applies filters → `filteredRaces` array updated
4. Statistics calculated on `filteredRaces` → Charts rendered
5. Custom calculator generates patterns → calculates expected values

### Browser Compatibility
- Requires modern browser with ES6 support
- LocalStorage API required (no fallback)
- Chart.js loaded from CDN (requires internet on first load)

### File Organization
- `/` - Main application (current/active version)
- `/keiba-app/` - Appears to be an older or alternative version
- `/js/` - JavaScript modules
- `/.kiro/` - Project specification documents
